# Kubernetes Namespace — Tổng ôn kiến thức từ A–Z

Sau khi hiểu Pod, Deployment và Service, bạn cần nắm chắc Namespace, vì đây là cách Kubernetes tổ chức và quản lý tài nguyên trong cùng một Cluster.

## 1. Namespace là gì?

Namespace là một không gian logic bên trong Kubernetes Cluster, dùng để phân chia và quản lý các resource theo nhóm.

Ví dụ, công ty có ba môi trường Development, Staging và Production: một cluster, nhiều namespaces.

```text
Kubernetes Cluster (một cluster, nhiều namespaces)
│
├── development
│   ├── Deployment
│   ├── Service
│   └── Pods
│
├── staging
│   ├── Deployment
│   ├── Service
│   └── Pods
│
└── production
    ├── Deployment
    ├── Service
    └── Pods
```

Ví dụ trong cùng một Cluster:

```text
Cluster: kind-lab
│
├── Namespace: development
│   ├── Deployment: backend
│   └── Service: backend-svc
│
├── Namespace: staging
│   ├── Deployment: backend
│   └── Service: backend-svc
│
└── Namespace: production
    ├── Deployment: backend
    └── Service: backend-svc
```

Cả ba namespace đều có thể có Deployment tên `backend` mà không bị trùng, vì tên resource chỉ cần duy nhất trong phạm vi namespace của nó (đối với resource thuộc namespace).

## 2. Namespace giải quyết vấn đề gì?

| Vấn đề                                    | Giải pháp                           |
| ----------------------------------------- | ----------------------------------- |
| Nhiều team dùng chung Cluster             | Chia namespace theo team            |
| Development và Production cùng cluster    | Phân chia resource theo môi trường  |
| Trùng tên Deployment                      | Cho phép trùng tên ở namespace khác |
| Team dùng quá nhiều CPU/RAM               | ResourceQuota                       |
| Không muốn team A quản lý resource team B | RBAC                                |
| Muốn hạn chế kết nối mạng                 | NetworkPolicy                       |

> **Lưu ý cực kỳ quan trọng:** Namespace không phải máy ảo hay cluster riêng. Các namespace vẫn dùng chung hạ tầng Node và control plane. Namespace cũng không tự động cô lập network hoặc bảo mật.

## 3. Các Namespace mặc định

Khi tạo Kubernetes Cluster, bạn thường thấy:

```bash
kubectl get namespaces
```

| Namespace         | Vai trò                                                 |
| ----------------- | ------------------------------------------------------- |
| `default`         | Namespace mặc định cho resource chưa chỉ định namespace |
| `kube-system`     | Thành phần hệ thống Kubernetes như CoreDNS              |
| `kube-public`     | Một số thông tin cluster có thể được công khai          |
| `kube-node-lease` | Chứa Lease objects hỗ trợ theo dõi trạng thái Node      |

Khi thực hành, bạn nên tạo namespace riêng thay vì tạo mọi resource trong `default`.

## 4. Namespace và Context khác nhau thế nào?

Đây là điểm dễ nhầm nhất.

- **Cluster** — Hệ thống Kubernetes bạn đang kết nối.
- **Namespace** — Không gian quản lý resource bên trong cluster.
- **Context** — Cấu hình kubectl xác định cluster, user và namespace mặc định.

Ví dụ terminal của bạn hiển thị:

```text
(ctx:kind-lab)
```

Có nghĩa là bạn đang sử dụng context `kind-lab`, không có nghĩa namespace của bạn là `kind-lab`.

Bạn có thể dùng context `kind-lab` nhưng thao tác trên namespace `deployment-lab`.

```bash
kubectl config current-context

kubectl config view --minify \
  -o jsonpath='{..namespace}{"\n"}'
```

Muốn thay đổi namespace mặc định trong context hiện tại:

```bash
kubectl config set-context --current \
  --namespace=development
```

Hoặc tốt hơn khi làm lab, chỉ định namespace trong từng lệnh:

```bash
kubectl get pods -n development
kubectl get pods -n production
```

Cách thứ hai giúp giảm khả năng thao tác nhầm môi trường.

## 5. Namespace Manifest

Tạo namespace bằng YAML:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: team-alpha
  labels:
    environment: development
    team: alpha
```

Apply:

```bash
kubectl apply -f namespace.yaml
```

Hoặc tạo nhanh:

```bash
kubectl create namespace team-alpha
```

Tạo Deployment trong namespace:

```yaml
metadata:
  name: backend
  namespace: team-alpha
```

Nếu không khai báo `metadata.namespace`, Kubernetes sẽ dùng namespace mặc định của context hoặc namespace chỉ định qua `-n`.

## 6. ResourceQuota — Giới hạn tài nguyên Namespace

Trong Lab 2 của bộ 46 Labs, phần quan trọng nhất là tạo ResourceQuota rồi thử vượt giới hạn CPU/RAM.

Ví dụ:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: team-alpha
spec:
  hard:
    requests.cpu: "1"
    requests.memory: 1Gi
    limits.cpu: "2"
    limits.memory: 2Gi
```

Ý nghĩa:

| Field                  | Giới hạn                         |
| ---------------------- | -------------------------------- |
| `requests.cpu: "1"`    | Tổng CPU request tối đa 1 core   |
| `requests.memory: 1Gi` | Tổng memory request tối đa 1 GiB |
| `limits.cpu: "2"`      | Tổng CPU limit tối đa 2 cores    |
| `limits.memory: 2Gi`   | Tổng memory limit tối đa 2 GiB   |

Ví dụ:

```text
Namespace: team-alpha
CPU requests quota: 1000m

Pod A request: 500m → Accepted
Pod B request: 1000m → Rejected
```

Pod B bị từ chối vì tổng CPU request khi đó là `1500m`, vượt quota `1000m`.

Khi đó Kubernetes có thể trả về:

```text
Error from server (Forbidden):
exceeded quota
```

ResourceQuota kiểm soát tổng tài nguyên được khai báo/request trong namespace, không phải cơ chế trực tiếp giới hạn CPU/RAM sử dụng thực tế của toàn namespace.

## 7. Namespace có cô lập hoàn toàn không?

Không. Đây là điểm rất hay gặp trong phỏng vấn.

| Thành phần                   | Namespace có tự cô lập?         |
| ---------------------------- | ------------------------------- |
| Tên Pod, Deployment, Service | Có                              |
| RBAC permissions             | Cần cấu hình                    |
| CPU/RAM quota                | Cần ResourceQuota               |
| Network traffic              | Cần NetworkPolicy và CNI hỗ trợ |
| Worker Nodes                 | Không                           |
| Cluster control plane        | Không                           |

Ví dụ, Pod ở namespace `frontend` vẫn có thể gọi Service ở namespace `backend` thông qua:

```text
backend-svc.backend.svc.cluster.local
```

miễn là DNS, networking và các chính sách liên quan cho phép.

## 8. Kubectl Namespace Cheat Sheet

```bash
# Xem namespaces
kubectl get ns

# Tạo namespace
kubectl create ns demo

# Xem Pods trong namespace
kubectl get pods -n demo

# Xem Pods trong tất cả namespaces
kubectl get pods -A

# Xem chi tiết namespace
kubectl describe ns demo

# Xem quota
kubectl get resourcequota -n demo

# Xem namespace mặc định hiện tại
kubectl config view --minify \
  -o jsonpath='{..namespace}{"\n"}'

# Xóa namespace (xóa cả resources bên trong)
kubectl delete ns demo
```

> **Cẩn thận với `kubectl delete ns`:** lệnh này xóa toàn bộ resource thuộc namespace đó, không chỉ xóa tên namespace.

## 9. Kiểm tra kiến thức Namespace

Namespace Knowledge Test — 5 câu.

**1. Trong cùng một cluster, hai namespace có thể có Deployment cùng tên `backend` không?**

- A. Có
- B. Không

> **Đáp án:** A — Tên resource chỉ cần duy nhất trong phạm vi namespace của nó.

**2. Context `kind-lab` nghĩa là gì?**

- A. Namespace tên `kind-lab`
- B. Một cấu hình kết nối Kubernetes
- C. Một Pod

> **Đáp án:** B — Context là cấu hình kubectl xác định cluster, user và namespace mặc định.

**3. Namespace có mặc định ngăn mọi kết nối giữa các Pod thuộc namespace khác nhau không?**

- A. Có
- B. Không

> **Đáp án:** B — Namespace không tự cô lập network; cần NetworkPolicy và CNI hỗ trợ.

**4. Khi ResourceQuota bị vượt, Kubernetes có thể từ chối request ở đâu?**

- A. API Server admission
- B. Sau khi container đã chạy
- C. Trong DNS

> **Đáp án:** A — ResourceQuota được kiểm tra ở bước admission của API Server, nên request bị từ chối với lỗi `exceeded quota` trước khi Pod được tạo.

**5. Xóa namespace thì điều gì xảy ra?**

- A. Chỉ xóa tên namespace
- B. Xóa các tài nguyên thuộc namespace
- C. Xóa toàn bộ cluster

> **Đáp án:** B — `kubectl delete ns` xóa toàn bộ resource thuộc namespace đó.

## 10. Chốt kiến thức — 5 điều cần nhớ

1. Namespace là cách tổ chức các resource logic bên trong một Kubernetes Cluster.
2. Context xác định cluster, user và namespace mặc định cho kubectl.
3. ResourceQuota giới hạn tổng tài nguyên được yêu cầu trong namespace.
4. Namespace không tự động cô lập network hay bảo mật. Cần kết hợp RBAC, NetworkPolicy.
5. Xóa namespace sẽ xóa các resource bên trong. Luôn kiểm tra trước khi xóa.

Nếu bạn hiểu được 5 điểm trên, tự tạo Namespace, triển khai Deployment vào đúng namespace và debug lỗi `exceeded quota`, thì kiến thức Namespace nền tảng đã khá chắc.

Bài tương ứng là Lab 2 — Namespaces and Contexts, thời gian khoảng 15 phút.
