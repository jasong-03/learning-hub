# Kubernetes — Giai đoạn 2: Networking & Security

Intermediate → Advanced

6 chủ đề · Architecture · YAML · Troubleshooting · Hands-on

Ở Giai đoạn 1, bạn đã học cách triển khai ứng dụng có ConfigMap, Secret, Health Probes, PVC và StatefulSet.

Giai đoạn 2 sẽ trả lời hai câu hỏi lớn:

- Networking: Request đi từ Internet đến container bằng cách nào? Làm sao các service tìm thấy và giao tiếp với nhau?
- Security: Ai được phép truy cập Kubernetes API? Pod nào được phép giao tiếp với Pod nào?

## Lộ trình học

Learning Checklist

0/6

1\. Ingress & Ingress Controller

Expose HTTP/HTTPS, hostname, path, TLS

2\. Gateway API

Định tuyến hiện đại với GatewayClass, Gateway, HTTPRoute

3\. CoreDNS & Kubernetes Networking

DNS, Service discovery, EndpointSlice, CNI

4\. RBAC

Role, ClusterRole, RoleBinding, ClusterRoleBinding

5\. ServiceAccount

Định danh của workload và quyền truy cập API

6\. NetworkPolicy

Kiểm soát lưu lượng Ingress và Egress của Pod

Các nội dung liên quan trực tiếp đến bộ tài liệu 46 Labs bạn gửi gồm Lab 14 (Service Networking), Lab 15 (Ingress), Lab 16 (NetworkPolicy), Lab 17 (502 Bad Gateway) và Lab 22 (RBAC/ServiceAccount). Phần Gateway API và một số kiến thức security production là nội dung mở rộng.

# Phần 1 — Ingress & Ingress Controller

## 1. Vì sao cần Ingress?

Giả sử bạn có ba ứng dụng:

```
frontend  → port 3000
backend   → port 8000
admin     → port 8080
```

Nếu expose từng ứng dụng bằng Service `LoadBalancer`, bạn có thể phải quản lý nhiều load balancer riêng.

Ingress cho phép định tuyến HTTP/HTTPS tới nhiều Service bằng hostname hoặc URL path.

Internet / Client

app.example.com · api.example.com

Ingress Controller

HTTP host/path routing · TLS termination

frontend-svc

Service → Frontend Pods

backend-svc

Service → Backend Pods

### Ingress khác Service thế nào?

| Resource             | Vai trò                                  |
| -------------------- | ---------------------------------------- |
| ClusterIP Service    | Điểm truy cập ổn định trong cluster      |
| NodePort Service     | Expose qua IP và port của Node           |
| LoadBalancer Service | Expose bằng load balancer do hạ tầng cấp |
| Ingress              | Khai báo quy tắc HTTP/HTTPS routing      |
| Ingress Controller   | Thành phần thực hiện những quy tắc đó    |

Ingress chỉ là cấu hình. Nếu không có Ingress Controller phù hợp đang chạy, tạo Ingress YAML thường không làm request tự động được route.

## 2. Ingress Manifest

Giả sử đã có:

- Service `frontend-svc` port 80.
- Service `backend-svc` port 80.
- Ingress Controller đã cài đặt và hỗ trợ class `nginx`.

```

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: production
spec:
  ingressClassName: nginx
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-svc
                port:
                  number: 80

    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: backend-svc
                port:
                  number: 80

```

Khi DNS và ingress controller được cấu hình đúng:

```
app.example.com → frontend-svc
api.example.com → backend-svc
```

### Các field phải nhớ

| Field                  | Ý nghĩa                               |
| ---------------------- | ------------------------------------- |
| `ingressClassName`     | Controller được chọn để xử lý Ingress |
| `rules.host`           | Hostname cần khớp                     |
| `paths.path`           | Đường dẫn HTTP                        |
| `pathType`             | Cách so khớp URL path                 |
| `backend.service.name` | Service đích                          |
| `backend.service.port` | Port của Service đích                 |

## 3. TLS/HTTPS với Ingress

Ví dụ:

```
spec:
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls
```

Secret `api-tls` phải chứa chứng chỉ và private key tương ứng.

Tạo từ certificate files:

```
kubectl create secret tls api-tls \
  --cert=tls.crt \
  --key=tls.key \
  -n production
```

Trong production, thường kết hợp với certificate management như cert-manager hoặc TLS termination tại cloud load balancer, tùy kiến trúc.

## 4. Troubleshooting Ingress

```
kubectl get ingress -n production

kubectl describe ingress app-ingress -n production

kubectl get svc -n production

kubectl get endpointslice -n production

kubectl get pods -n production -o wide
```

Các lỗi thường gặp:

| Lỗi                     | Có thể do                                           |
| ----------------------- | --------------------------------------------------- |
| 404                     | Host/path không khớp hoặc app trả 404               |
| 502                     | Proxy không nhận response hợp lệ từ upstream        |
| 503                     | Không có backend khả dụng hoặc upstream unavailable |
| 504                     | Upstream timeout                                    |
| TLS error               | Certificate, hostname hoặc TLS config sai           |
| Ingress không hoạt động | Controller hoặc IngressClass thiếu/sai              |

Không nên chỉ dựa vào HTTP status để kết luận nguyên nhân. Luôn kiểm tra logs của đúng thành phần trả lỗi.

# Phần 2 — Gateway API

## 5. Gateway API là gì?

Gateway API là nhóm Kubernetes API hỗ trợ khai báo networking và routing theo mô hình có thể phân quyền rõ hơn giữa người quản trị hạ tầng và người phát triển ứng dụng.

Gateway API cung cấp các resource như:

| Resource         | Vai trò                                    |
| ---------------- | ------------------------------------------ |
| `GatewayClass`   | Chọn implementation/controller             |
| `Gateway`        | Khai báo listener, hostname, port, TLS     |
| `HTTPRoute`      | Quy tắc route HTTP đến Service             |
| `GRPCRoute`      | Route gRPC                                 |
| `ReferenceGrant` | Cho phép một số tham chiếu giữa namespaces |

So với Ingress truyền thống, Gateway API thể hiện trực tiếp hơn sự phân chia trách nhiệm giữa platform team và application team.

GatewayClass

Controller implementation

Gateway

Listeners: HTTP :80 / HTTPS :443

HTTPRoute

/api → backend-svc

Backend Service → Pods

## 6. Gateway API Manifest

Ví dụ sau yêu cầu Gateway API CRDs và một controller có hỗ trợ `GatewayClass` tương ứng, ở đây giả định class `example-gateway` đã tồn tại. Nó không tự chạy trên Kind thuần.

### Gateway

```

apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: app-gateway
  namespace: production
spec:
  gatewayClassName: example-gateway
  listeners:
    - name: http
      protocol: HTTP
      port: 80
      allowedRoutes:
        namespaces:
          from: Same

```

### HTTPRoute

```

apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: backend-route
  namespace: production
spec:
  parentRefs:
    - name: app-gateway
  hostnames:
    - api.example.com
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /api
      backendRefs:
        - name: backend-svc
          port: 80

```

Request:

```
GET http://api.example.com/api/users
```

được HTTPRoute match và chuyển đến `backend-svc`, nếu controller và backend hoạt động đúng.

## 7. Ingress vs Gateway API

|                            | Ingress                                 | Gateway API                           |
| -------------------------- | --------------------------------------- | ------------------------------------- |
| API structure              | Một Ingress mô tả nhiều quy tắc routing | Tách Gateway và Route                 |
| HTTP routing               | Có                                      | Có                                    |
| Cross-namespace delegation | Hạn chế                                 | Thiết kế rõ hơn                       |
| Các giao thức khác         | Hạn chế theo API Ingress                | Có các Route types chuyên biệt        |
| Controller required        | Có                                      | Có                                    |
| Production-ready           | Có, tùy controller                      | Có, tùy controller và loại API hỗ trợ |

Khi nào học cái nào? Bạn nên hiểu Ingress trước để nắm nguyên lý host/path routing, sau đó học Gateway API để hiểu các hệ thống mới hơn.

# Phần 3 — CoreDNS & Kubernetes Networking

## 8. Kubernetes DNS hoạt động thế nào?

Một Pod không nên hardcode IP của Pod khác vì Pod IP có thể thay đổi.

Kubernetes thường cung cấp DNS cho Services thông qua CoreDNS.

Ví dụ:

```
Namespace: production
Service: backend-svc
```

Tên DNS đầy đủ:

```
backend-svc.production.svc.cluster.local
```

Trong đó:

| Thành phần      | Ý nghĩa                                                     |
| --------------- | ----------------------------------------------------------- |
| `backend-svc`   | Service name                                                |
| `production`    | Namespace                                                   |
| `svc`           | Service DNS domain                                          |
| `cluster.local` | Cluster domain mặc định phổ biến, có thể được cấu hình khác |

Nếu Pod client và Service cùng namespace, thường có thể gọi bằng tên ngắn:

```
curl http://backend-svc:8000
```

Nếu khác namespace:

```
curl http://backend-svc.production.svc.cluster.local:8000
```

## 9. Luồng request trong cluster

Frontend Pod

GET [http://backend-svc:8000](http://backend-svc:8000)

CoreDNS

Phân giải Service name → ClusterIP

Service Virtual IP

ClusterIP + Service port

Service Dataplane

Chọn endpoint và chuyển kết nối

Backend Pod :8000

Cần phân biệt:

- CoreDNS trả lời DNS queries.
- Service cung cấp stable virtual endpoint.
- EndpointSlice lưu thông tin các backend endpoints.
- kube-proxy hoặc dataplane tương đương thực hiện Service routing.
- CNI hỗ trợ mạng Pod, kết nối Pod với hệ thống mạng cluster.

Một số CNI/eBPF dataplane có thể thay thế chức năng Service routing truyền thống của kube-proxy.

## 10. EndpointSlice quan trọng thế nào?

Giả sử Service:

```
spec:
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 8000
```

Kubernetes tìm những Pod có label `app=backend`, sau đó EndpointSlice controller theo dõi các endpoints của Service.

Nếu label không khớp:

```
Service selector: app=backend
Pod label:        app=api
```

Service sẽ không tìm thấy backend Pod tương ứng.

Lỗi này là một trong những nguyên nhân phổ biến khiến application không truy cập được Service.

### Debug từ DNS đến Pod

```
# Kiểm tra CoreDNS
kubectl get pods -n kube-system

# Xem Service
kubectl get svc -n production

# Xem EndpointSlices
kubectl get endpointslices -n production

# Xem labels
kubectl get pods -n production --show-labels

# Xem Service chi tiết
kubectl describe svc backend-svc -n production
```

Test DNS bằng một debug Pod tạm thời:

```
kubectl run dns-debug \
  -n production \
  --image=busybox:1.36 \
  --restart=Never \
  --command -- sleep 3600

kubectl exec -n production dns-debug -- \
  nslookup backend-svc.production.svc.cluster.local
```

Sau khi test:

```
kubectl delete pod dns-debug -n production
```

Nếu DNS resolve được nhưng curl đến Service thất bại, cần xem tiếp Service port, EndpointSlice, Pod readiness, NetworkPolicy và ứng dụng đích.

## 11. Phân biệt các loại lỗi Networking

| Lỗi                       | Hướng điều tra                                       |
| ------------------------- | ---------------------------------------------------- |
| `NXDOMAIN`                | Service name, namespace, DNS                         |
| `Connection refused`      | App không listen hoặc port sai                       |
| `Connection timed out`    | NetworkPolicy, routing, firewall, Network            |
| `No endpoints`            | Selector, labels, Pod readiness                      |
| `502 Bad Gateway`         | Ingress proxy tới upstream gặp lỗi                   |
| `503 Service Unavailable` | Backend không khả dụng, có thể thiếu ready endpoints |

Quy trình trace cần thuộc:

```
Client
  ↓
DNS
  ↓
Ingress / Gateway
  ↓
Service
  ↓
EndpointSlice
  ↓
Pod IP : targetPort
  ↓
Application
```

Khi gặp incident, trace từng hop và xác định chính xác kết nối hỏng ở đâu.

# Phần 4 — RBAC

## 12. RBAC là gì?

RBAC (Role-Based Access Control) là cơ chế Kubernetes dùng để quyết định ai được phép thực hiện hành động gì trên Kubernetes API.

Ví dụ:

- Developer được xem Pods và logs.
- DevOps được triển khai Deployments.
- CI/CD được update một số workloads.
- Monitoring chỉ được đọc các resources cần thiết.

RBAC không phải cơ chế kiểm soát HTTP traffic giữa các Pod. Nó kiểm soát quyền truy cập Kubernetes API.

## 13. Bốn Resource RBAC

Role

Quyền trong một namespace

ClusterRole

Bộ quyền có thể dùng cluster-wide hoặc bind trong namespace

RoleBinding

Gán Role hoặc ClusterRole trong namespace

ClusterRoleBinding

Gán ClusterRole ở phạm vi cluster

### Ví dụ Role chỉ được đọc Pods

```

apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: development
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]

```

Giải thích:

- `apiGroups: [""]`: Core API group.
- `resources`: Pods và subresource logs.
- `verbs`: Các thao tác được phép.

### Gán quyền cho ServiceAccount

```
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader-binding
  namespace: development
subjects:
  - kind: ServiceAccount
    name: app-reader
    namespace: development
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

Lúc này, ServiceAccount `app-reader` được gán quyền đọc Pods/logs trong namespace `development`.

## 14. RBAC Troubleshooting

Lệnh quan trọng nhất:

```
kubectl auth can-i
```

Ví dụ:

```
kubectl auth can-i get pods -n development

kubectl auth can-i delete pods -n production
```

Để kiểm tra quyền của ServiceAccount (khi danh tính hiện tại có quyền impersonate):

```
kubectl auth can-i list pods \
  --as=system:serviceaccount:development:app-reader \
  -n development
```

Expected: `yes` nếu Role và RoleBinding đã được tạo đúng.

### Các lỗi RBAC thường gặp

| Lỗi                                     | Nguyên nhân           |
| --------------------------------------- | --------------------- |
| `Forbidden`                             | Thiếu quyền           |
| Có Role nhưng vẫn Forbidden             | Thiếu/sai RoleBinding |
| Đọc được Pods nhưng không đọc được logs | Thiếu `pods/log`      |
| Đọc được namespace A nhưng không được B | Namespace scope       |
| `get` được nhưng `list` không được      | Verbs khác nhau       |

Nguyên tắc bảo mật: Least Privilege — chỉ cấp đúng quyền cần thiết.

Không cấp `cluster-admin` cho ứng dụng chỉ vì muốn giải quyết nhanh lỗi `Forbidden`.

# Phần 5 — ServiceAccount

## 15. ServiceAccount là gì?

ServiceAccount là identity mà workload trong Kubernetes có thể sử dụng để xác thực với Kubernetes API hoặc kết hợp với các hệ thống identity khác.

Phân biệt:

| Identity       | Dành cho                              |
| -------------- | ------------------------------------- |
| User / Group   | Con người hoặc identity ngoài cluster |
| ServiceAccount | Workload, automation, Pod             |

Ví dụ một controller cần gọi Kubernetes API để đọc Pods. Thay vì dùng credentials quản trị viên, bạn tạo ServiceAccount riêng và cấp đúng RBAC permissions.

Application Pod

serviceAccountName: app-reader

ServiceAccount Identity

RBAC Authorization

Role + RoleBinding

Kubernetes API Server

## 16. Tạo ServiceAccount

```
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-reader
  namespace: development
```

Sử dụng trong Pod:

```
spec:
  serviceAccountName: app-reader
  containers:
    - name: app
      image: nginx:alpine
```

ServiceAccount không tự có quyền đọc mọi tài nguyên. Bạn phải gán RBAC phù hợp.

### automountServiceAccountToken

```
spec:
  automountServiceAccountToken: false
```

Cấu hình này giúp ngăn tự động mount API token vào Pod nếu ứng dụng không cần nó.

Đây là một hardening practice quan trọng cho các workload thông thường như web frontend hoặc API không cần gọi Kubernetes API.

### ServiceAccount trên AWS EKS

Ngoài Kubernetes RBAC, bạn có thể dùng cơ chế như EKS Pod Identity hoặc IAM Roles for Service Accounts (IRSA) để workload nhận quyền truy cập AWS services.

Cần phân biệt:

- Kubernetes RBAC → Ai được thao tác Kubernetes API?
- AWS IAM → Ai được thao tác AWS API như S3, SQS hay Secrets Manager?

Đây là hai lớp authorization riêng.

# Phần 6 — NetworkPolicy

## 17. NetworkPolicy là gì?

Nếu RBAC kiểm soát quyền truy cập Kubernetes API, thì NetworkPolicy kiểm soát những kết nối mạng nào được phép đến hoặc đi từ Pod.

Ví dụ:

- Frontend được gọi Backend.
- Backend được gọi PostgreSQL.
- Frontend không được kết nối trực tiếp PostgreSQL.
- Backend chỉ được kết nối ra ngoài tới những destination cần thiết.

Ví dụ: Network Segmentation

Frontend

Backend

Database

Frontend → Backend

Backend → DB

Frontend → DB bị chặn

Đây là chính sách mục tiêu. Muốn thực thi cần cấu hình NetworkPolicy và một network plugin hỗ trợ nó.

### Ingress và Egress trong NetworkPolicy

| Direction | Ý nghĩa                |
| --------- | ---------------------- |
| `Ingress` | Traffic đi vào Pod     |
| `Egress`  | Traffic đi ra khỏi Pod |

Đừng nhầm Ingress resource (HTTP routing) với `Ingress` trong NetworkPolicy (chiều traffic đi vào).

## 18. NetworkPolicy mặc định hoạt động thế nào?

Khi chưa có NetworkPolicy chọn một Pod, Kubernetes networking thông thường cho phép traffic đi vào/ra Pod, trừ khi có kiểm soát khác.

Khi một policy chọn Pod và áp dụng cho `Ingress`, chỉ những ingress connections được phép bởi tập hợp policy mới được chấp nhận.

### Default Deny Ingress

```

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress

```

Ý nghĩa:

- `podSelector: {}` → Chọn tất cả Pods trong namespace.
- `policyTypes: [Ingress]` → Áp dụng cho traffic đi vào.
- Không có rules `ingress` → Không cho ingress traffic theo policy.

Policy này không tự chặn Egress.

### Default Deny All

```
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

Cấu hình này chặn ingress và egress connections không được các policy khác cho phép, bao gồm cả DNS queries qua mạng nếu không được mở riêng.

Cảnh báo: Trên production, áp dụng Default Deny Egress mà không có chính sách DNS/dependency phù hợp có thể khiến ứng dụng mất kết nối ngay lập tức.

## 19. Cho phép Frontend gọi Backend

Giả sử Frontend Pod có label `app: frontend`, Backend Pod có label `app: backend` cùng namespace.

```

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend

  policyTypes:
    - Ingress

  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8000

```

Ý nghĩa: Backend Pods được phép nhận TCP connections tới port 8000 từ các Frontend Pods cùng namespace.

Lưu ý: NetworkPolicies là additive. Nếu đã có một policy khác cho phép nguồn rộng hơn, policy này không tự phủ định quyền đã cho phép.

## 20. NamespaceSelector và PodSelector

Bạn có thể cho phép traffic từ Pods thuộc namespace khác.

Ví dụ yêu cầu cả namespace label và pod label:

```
ingress:
  - from:
      - namespaceSelector:
          matchLabels:
            team: frontend
        podSelector:
          matchLabels:
            app: web
```

Hai selector trong cùng một phần tử `from` mang ý nghĩa AND:

```
Namespace phải có team=frontend
            AND
Pod phải có app=web
```

Nếu viết chúng thành hai phần tử `from` riêng, chúng có nghĩa OR.

Đây là chi tiết YAML rất dễ cấu hình sai, dẫn đến quyền truy cập rộng hơn dự kiến.

## 21. NetworkPolicy không làm được gì?

NetworkPolicy chuẩn chủ yếu kiểm soát kết nối dựa trên IP/Pod/Namespace selector, protocol và port.

Nó không phải là giải pháp đầy đủ cho:

- Authentication người dùng.
- HTTP path authorization.
- JWT validation.
- Encryption TLS.
- Kubernetes API permissions.
- Lọc FQDN hoặc Layer 7 nâng cao theo cách portable trên mọi CNI.

Những yêu cầu đó thường cần kết hợp application security, Gateway, service mesh hoặc network policy extensions của CNI.

# Phần 7 — Security & Networking Troubleshooting

## 22. Quy trình trace khi API bị 502

Giả sử:

```
Client → Ingress → backend-svc → backend Pod
```

Bạn nhận alert 502.

Thực hiện theo thứ tự:

```
# 1. Xem Ingress
kubectl get ingress -n production
kubectl describe ingress -n production

# 2. Xem Service và endpoint
kubectl get svc -n production
kubectl get endpointslice -n production

# 3. Xem Pod
kubectl get pods -n production -o wide
kubectl describe pod <backend-pod> -n production

# 4. Xem logs ứng dụng
kubectl logs <backend-pod> -n production

# 5. Kiểm tra policy
kubectl get networkpolicy -n production
```

Sau đó kiểm tra logs của Ingress Controller để biết request lỗi do upstream connection refused, timeout hay vấn đề khác.

### Decision table

| Phát hiện                                      | Khả năng vấn đề                           |
| ---------------------------------------------- | ----------------------------------------- |
| DNS không resolve                              | CoreDNS, tên Service, namespace           |
| EndpointSlice không có backend phù hợp         | Selector, Pod readiness                   |
| Service port đúng nhưng targetPort sai         | Service misconfiguration                  |
| Pod có Ready endpoint nhưng không kết nối được | NetworkPolicy, app listener, dataplane    |
| Ingress route đúng nhưng upstream trả lỗi      | Backend ứng dụng hoặc kết nối upstream    |
| API trả 403 Kubernetes Forbidden               | RBAC hoặc authorization khác              |
| Pod không truy cập được S3                     | AWS IAM, networking, DNS hoặc credentials |

Nguyên tắc: HTTP 403 từ ứng dụng và Kubernetes API `Forbidden` là hai lỗi khác nhau. Không nên mặc định mọi lỗi 403 đều do RBAC.

# Phần 8 — Mini Lab trên Kind

Bài lab này giúp bạn thực hành DNS, Service, RBAC, ServiceAccount và NetworkPolicy trước. Phần Ingress/Gateway cần controller cài đặt riêng.

## 23. Setup

Giữ nguyên cluster `kind-lab`, tạo namespace riêng.

```
kubectl config current-context
kubectl get nodes

kubectl create namespace networking-lab \
  --dry-run=client -o yaml | kubectl apply -f -

mkdir -p ~/work/networking-lab
cd ~/work/networking-lab
```

Đảm bảo context hiện tại là `kind-lab`.

## 24. Tạo Backend, Frontend và Service

Lưu thành `apps.yaml`:

```

apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: networking-lab
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: nginx
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80
          readinessProbe:
            httpGet:
              path: /
              port: 80
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-svc
  namespace: networking-lab
spec:
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 80
---
apiVersion: v1
kind: Pod
metadata:
  name: frontend
  namespace: networking-lab
  labels:
    app: frontend
spec:
  containers:
    - name: client
      image: busybox:1.36
      command: ["sleep", "3600"]
---
apiVersion: v1
kind: Pod
metadata:
  name: unauthorized-client
  namespace: networking-lab
  labels:
    app: other
spec:
  containers:
    - name: client
      image: busybox:1.36
      command: ["sleep", "3600"]

```

Apply:

```
kubectl apply -f apps.yaml

kubectl rollout status deploy/backend \
  -n networking-lab --timeout=180s

kubectl wait --for=condition=Ready \
  pod/frontend pod/unauthorized-client \
  -n networking-lab --timeout=180s

kubectl get pods,svc,endpointslice -n networking-lab
```

### Test DNS + Service

```
kubectl exec frontend -n networking-lab -- \
  nslookup backend-svc.networking-lab.svc.cluster.local

kubectl exec frontend -n networking-lab -- \
  wget -qO- -T 5 http://backend-svc
```

Expected: DNS resolve và Nginx trả HTML.

## 25. NetworkPolicy — Allow Frontend Only

Trước khi test, xác minh CNI của cluster có thực thi NetworkPolicy. Không phải mọi Kind cluster đều có khả năng này ngay từ đầu.

Tạo `policy.yaml`:

```

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-allow-frontend
  namespace: networking-lab
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 80

```

Apply:

```
kubectl apply -f policy.yaml
```

Test từ Frontend:

```
kubectl exec frontend -n networking-lab -- \
  wget -qO- -T 5 http://backend-svc
```

Expected: Thành công.

Test từ client không được phép:

```
kubectl exec unauthorized-client -n networking-lab -- \
  wget -qO- -T 5 http://backend-svc
```

Expected khi NetworkPolicy được thực thi đúng: Kết nối bị chặn, thường timeout.

Nếu cả hai client đều truy cập được, đừng kết luận NetworkPolicy không hoạt động về mặt YAML. Hãy kiểm tra plugin mạng và khả năng enforcement của cluster.

## 26. RBAC + ServiceAccount

Lưu thành `rbac.yaml`:

```

apiVersion: v1
kind: ServiceAccount
metadata:
  name: pod-reader
  namespace: networking-lab
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: read-pods
  namespace: networking-lab
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods-binding
  namespace: networking-lab
subjects:
  - kind: ServiceAccount
    name: pod-reader
    namespace: networking-lab
roleRef:
  kind: Role
  name: read-pods
  apiGroup: rbac.authorization.k8s.io

```

Apply:

```
kubectl apply -f rbac.yaml
```

Kiểm tra quyền (cần quyền impersonation ở context hiện tại):

```
# Được phép
kubectl auth can-i list pods \
  --as=system:serviceaccount:networking-lab:pod-reader \
  -n networking-lab

# Không được phép
kubectl auth can-i delete pods \
  --as=system:serviceaccount:networking-lab:pod-reader \
  -n networking-lab
```

Expected:

```
yes
no
```

Lệnh trên kiểm tra authorization, không tự tạo Pod sử dụng ServiceAccount. Nếu muốn workload thực sự dùng identity này, cần thêm `serviceAccountName: pod-reader` vào Pod spec.

## 27. Cleanup

```
kubectl delete namespace networking-lab
```

Chỉ xóa resources trong namespace lab. Không xóa cluster `kind-lab`.

# Phần 9 — Mini Assessment

Networking & Security Test

0/6 câu

1\. Ingress YAML đã apply nhưng không route được traffic. Nguyên nhân nền tảng có thể là gì?

Chưa có Ingress Controller phù hợp

Chưa tạo StatefulSet

Thiếu PVC

2\. Pod A gọi backend-svc ở namespace production. DNS đầy đủ phổ biến là gì?

backend-svc.local

backend-svc.production.svc.cluster.local

production.backend-svc

3\. Service không có backend endpoints. Kiểm tra gì đầu tiên?

Pod labels, Service selector, readiness

CPU limits

Helm version

4\. Muốn ứng dụng chỉ đọc Pods trong namespace development, dùng gì?

ClusterRoleBinding cluster-admin

Role + RoleBinding

NetworkPolicy

5\. NetworkPolicy Default Deny Egress có thể ảnh hưởng DNS không?

Có

Không

6\. ServiceAccount có RBAC quyền đọc Pods thì tự động có quyền đọc AWS S3 không?

Có

Không, AWS IAM là lớp quyền riêng

## Tổng kết Giai đoạn 2 — Những gì phải thuộc

| Chủ đề             | Kiến thức cốt lõi                               |
| ------------------ | ----------------------------------------------- |
| Ingress            | Route HTTP/HTTPS theo host/path, cần controller |
| Gateway API        | GatewayClass → Gateway → HTTPRoute              |
| CoreDNS            | Service discovery qua DNS                       |
| Service Networking | ClusterIP → EndpointSlice → Pod                 |
| RBAC               | Ai được phép làm gì với Kubernetes API          |
| ServiceAccount     | Identity của workload                           |
| NetworkPolicy      | Pod nào được phép giao tiếp với Pod nào         |

Điểm quan trọng nhất của cả giai đoạn: Bạn cần tự trace được request từ Client → Ingress/Gateway → Service → EndpointSlice → Pod, đồng thời phân biệt lỗi mạng với lỗi quyền truy cập.

Sau khi hoàn thành phần lý thuyết và mini lab này, bạn có thể tiếp tục các bài trong bộ 46 Labs như Lab 14–17 và Lab 22 để luyện từng kỹ năng sâu hơn.

Giai đoạn tiếp theo là Giai đoạn 3 — Scaling & Operations: HPA, Job, CronJob, DaemonSet, Scheduling, graceful shutdown và troubleshooting Node/Pod.