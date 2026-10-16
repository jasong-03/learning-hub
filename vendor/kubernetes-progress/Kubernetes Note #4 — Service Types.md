# Kubernetes Note #4 — Service Types

![Kubernetes Note #4 — Service Types](image/Kubernetes%20Note%20%234%20%E2%80%94%20Service%20Types.png)

## 1. Vì sao Kubernetes cần Service?

Pod có IP riêng:

```text
Pod A → 10.10.1.5
Pod B → 10.10.1.6
Pod C → 10.10.1.7
```

Nhưng Pod có thể:

```text
die
recreate
scale up
scale down
move Node
```

=> Pod IP không phải endpoint ổn định.

Kubernetes Service tạo một endpoint ổn định (tên DNS + ClusterIP) phía trước nhóm Pod:

```text
Client
   ↓
Service
   ↓
Pod A
Pod B
Pod C
```

Service cũng load balance traffic giữa các backend Pod được selector chọn.

---

## 2. Container trong cùng Pod

Ví dụ:

```text
Pod IP: 10.10.1.5

├── Container A :8080
└── Container B :8081
```

Chúng giao tiếp qua:

```text
localhost:8081
```

hoặc ngược lại:

```text
localhost:8080
```

Vì chúng chia sẻ network namespace của Pod.

---

## 3. Pod khác Pod

Nếu:

```text
Pod A → 10.10.1.5
Pod B → 10.10.1.6
```

thì Pod A có thể gọi trực tiếp:

```text
10.10.1.6:8080
```

Kubernetes networking model cho phép mọi Pod gọi nhau trực tiếp bằng Pod IP (không cần NAT), kể cả khác Node.

Nhưng đây **không phải cách nên dùng cho application lâu dài** vì Pod IP thay đổi.

=> dùng Service.

---

## 4. CoreDNS

Service có:

```text
Service Name
+
ClusterIP
```

Ví dụ:

```text
Service: backend
ClusterIP: 10.96.10.8
```

Ứng dụng gọi Service bằng tên thay vì hard-code IP.

CoreDNS (chạy trong `kube-system`) resolve:

```text
backend
   ↓
10.96.10.8
```

> **Bổ sung:** tên ngắn `backend` chỉ resolve được khi client nằm **cùng namespace** với Service. Khác namespace phải dùng `backend.<namespace>` hoặc FQDN `backend.<namespace>.svc.cluster.local` (xem Note #5).

---

## 5. 4 Service types cần biết

```text
ClusterIP
NodePort
LoadBalancer
ExternalName
```

Ba loại đầu route traffic tới Pod trong cluster; `ExternalName` chỉ ánh xạ tên Service sang một tên DNS bên ngoài.

> **Bổ sung:** ba loại đầu xếp chồng lên nhau:
>
> ```text
> LoadBalancer ⊃ NodePort ⊃ ClusterIP
> ```
>
> - NodePort Service vẫn có ClusterIP.
> - LoadBalancer Service (thông thường) vẫn có NodePort + ClusterIP; cloud LB gửi traffic vào NodePort.

---

## 6. ClusterIP

Default Service type.

```yaml
type: ClusterIP
```

Nếu không khai báo `type`:

```yaml
spec:
  selector:
    app: backend
```

thì Kubernetes mặc định tạo ClusterIP.

Use case:

```text
Frontend
   ↓
backend-service
   ↓
Backend Pods
```

Chỉ truy cập được từ trong cluster, không expose ra ngoài.

Ví dụ database internal:

```text
App Pods
   ↓
db-service
   ↓
DB Pods
```

---

## 7. ClusterIP manifest

```yaml
apiVersion: v1
kind: Service

metadata:
  name: backend-service

spec:
  selector:
    app: backend

  ports:
    - protocol: TCP
      port: 8081
      targetPort: 8080
```

Flow:

```text
backend-service:8081
        ↓
Pods matching app=backend
        ↓
container :8080
```

> **Bổ sung:** nếu bỏ `targetPort`, mặc định `targetPort = port`.

---

## 8. Service tự cập nhật Endpoints

Giả sử Service selector:

```yaml
selector:
  app: app1
```

Ban đầu:

```text
Pod 1 → app=app1
```

Service có:

```text
Endpoint → Pod 1
```

Tạo thêm:

```text
Pod 2 → app=app1
```

Service tự thêm backend.

Xóa Pod 2:

```text
Endpoint Pod 2 removed
```

Đây là lý do label/selector cực kỳ quan trọng.

> **Bổ sung:**
>
> - Chỉ Pod **Ready** mới được đưa vào endpoints nhận traffic. Đây là chỗ Readiness Probe phát huy tác dụng.
> - Kubernetes hiện dùng **EndpointSlice** để lưu danh sách endpoint.
>
> ```bash
> kubectl get endpointslices -l kubernetes.io/service-name=backend-service
> ```
>
> - Service có `Endpoints: <none>` → gần như chắc chắn selector không match label của Pod, hoặc Pod chưa Ready.

---

## 9. NodePort

```yaml
type: NodePort
```

Expose trên port của **mọi** Node:

```text
<NodeIP>:<NodePort>
```

Default range:

```text
30000–32767
```

Ví dụ:

```text
10.0.1.5:30500
```

Có thể gọi qua IP của bất kỳ Node nào; Pod không nhất thiết phải nằm trên Node đó, kube-proxy sẽ chuyển traffic tới Pod phù hợp.

Nếu không chỉ định `nodePort`, Kubernetes tự cấp một port trong range.

---

## 10. NodePort flow

```text
Outside
   ↓
NodeIP:30500
   ↓
Service
   ↓
Pod:8080
```

Nhớ:

```text
nodePort
   ↓
service port
   ↓
targetPort
```

---

## 11. LoadBalancer

```yaml
spec:
  type: LoadBalancer
```

Ý tưởng:

```text
Internet
   ↓
Cloud Load Balancer
   ↓
Kubernetes Service
   ↓
Pods
```

Cloud provider cấp external endpoint (IP hoặc DNS name).

Khi học AWS, phần này nối với AWS Load Balancer (thường qua AWS Load Balancer Controller trên EKS).

Minikube không có cloud provider nên `EXTERNAL-IP` sẽ ở trạng thái:

```text
<pending>
```

> **Bổ sung:** trên Minikube, chạy ở terminal riêng:
>
> ```bash
> minikube tunnel
> ```
>
> thì Service LoadBalancer sẽ nhận external IP.

---

## 12. ExternalName

Dùng khi application trong cluster muốn truy cập service bên ngoài thông qua một tên Service nội bộ.

Ví dụ:

```text
my-database
      ↓
database.example.com
```

Manifest:

```yaml
apiVersion: v1
kind: Service

metadata:
  name: my-database

spec:
  type: ExternalName
  externalName: database.example.com
```

> **Bổ sung:**
>
> - ExternalName chỉ tạo **DNS CNAME record**: `my-database.<ns>.svc.cluster.local` → `database.example.com`.
> - Không có selector, không có ClusterIP, không proxy/load balance.
> - Lợi ích: đổi địa chỉ external dependency chỉ cần sửa Service, không sửa app.
> - Hạn chế: HTTP Host header và TLS certificate vẫn phải hợp lệ với tên bên ngoài.

---

## Service checklist

| Type | Có ClusterIP | Truy cập từ ngoài cluster | Cơ chế | Use case |
|---|---|---|---|---|
| ClusterIP | Có | Không | kube-proxy route tới Pod | service-to-service |
| NodePort | Có | Có, qua `NodeIP:NodePort` | mở port trên mọi Node | dev/test, phía sau LB tự quản |
| LoadBalancer | Có | Có, qua cloud LB | cloud LB → NodePort → Pod | expose production trên cloud |
| ExternalName | Không | Không áp dụng | DNS CNAME | trỏ tới dependency bên ngoài |

---

## Commands

```bash
kubectl get svc
kubectl describe svc <service>
kubectl get endpointslices
kubectl expose deployment <name> --port=<port> --target-port=<port>
kubectl expose deployment <name> --type=NodePort --port=<port>
minikube service <service> --url
minikube tunnel
```

Test DNS/Service từ trong cluster:

```bash
kubectl run tmp --rm -it --image=busybox:1.36 --restart=Never -- sh
nslookup backend-service
wget -qO- backend-service:8081
```
