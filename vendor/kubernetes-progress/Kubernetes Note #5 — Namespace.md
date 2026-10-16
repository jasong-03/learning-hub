# Kubernetes Note #5 — Namespace

![Kubernetes Note #5 — Namespace](image/Kubernetes%20Note%20%235%20%E2%80%94%20Namespace.png)

- Namespace là cách tổ chức các resource logic bên trong một Kubernetes Cluster.
- Context xác định cluster, user và namespace mặc định cho kubectl.
- ResourceQuota giới hạn tổng tài nguyên được yêu cầu trong namespace.
- Namespace không tự động cô lập network hay bảo mật. Cần kết hợp RBAC, NetworkPolicy.
- Xóa namespace sẽ xóa các resource bên trong. Luôn kiểm tra trước khi xóa.

## 1. Namespace là gì?

Namespace là cơ chế **logical grouping/isolation** resource trong một cluster.

```text
Kubernetes Cluster
│
├── Namespace: dev
│   ├── Pods
│   ├── Services
│   └── Deployments
│
└── Namespace: production
    ├── Pods
    ├── Services
    └── Deployments
```

Namespace là phạm vi (scope) cho:

```text
tên resource
RBAC permission
ResourceQuota
LimitRange
NetworkPolicy
```

---

## 2. Cluster vs Namespace

Đây là điểm phải hiểu rất rõ.

### Cluster

Physical/infrastructure boundary:

```text
Control Plane
Nodes
CPU
RAM
Storage
Networking
```

### Namespace

Logical boundary:

```text
dev
staging
prod
team-a
team-b
customer-a
customer-b
```

Namespace **không gắn cố định với một Node**. Resource trong cùng Namespace có thể chạy trên nhiều Node, và một Node chạy Pod của nhiều Namespace.

---

## 3. Cùng tên resource ở namespace khác nhau

Có thể:

```text
dev/app1
prod/app1
```

Nhưng không thể có:

```text
dev/app1
dev/app1
```

Hai resource **cùng loại + cùng namespace** không thể trùng tên.

(Khác loại thì được: Deployment `app1` và Service `app1` trong cùng namespace là bình thường.)

---

## 4. Default Namespace

Nếu không specify:

```bash
kubectl get pods
```

hoặc manifest không có:

```yaml
metadata:
  namespace:
```

thì resource đi vào namespace hiện tại của kubeconfig context, mặc định là:

```text
default
```

> **Bổ sung:** đổi namespace mặc định cho context hiện tại để khỏi gõ `-n` liên tục:
>
> ```bash
> kubectl config set-context --current --namespace=dev
> kubectl config view --minify | grep namespace
> ```

---

## 5. Các Namespace hệ thống

```text
default
kube-system
kube-public
kube-node-lease
```

### `default`

Nơi resource rơi vào nếu không chỉ định namespace.

### `kube-system`

Chứa Kubernetes system components.

Ví dụ:

```text
CoreDNS
kube-proxy
metrics-server
scheduler / controller-manager / apiserver / etcd
```

> **Lưu ý:** scheduler, controller-manager, apiserver, etcd chỉ thấy trong `kube-system` khi bạn tự chạy control plane (Minikube, kubeadm, kind). Trên managed cluster như EKS/GKE, control plane do cloud quản lý nên **không** thấy các Pod này.

### `kube-public`

Đọc được bởi mọi người, kể cả client chưa xác thực. Chủ yếu chứa ConfigMap `cluster-info` dùng cho bootstrap.

### `kube-node-lease`

Chứa Lease object của mỗi Node, dùng làm heartbeat để control plane biết Node còn sống.

---

## 6. Commands

```bash
kubectl get namespaces
```

shortcut:

```bash
kubectl get ns
```

Tạo:

```bash
kubectl create namespace dev
```

Check Pod trong Namespace:

```bash
kubectl get pods -n dev
```

Tất cả namespace:

```bash
kubectl get pods -A
```

(`-A` = `--all-namespaces`)

Apply manifest vào namespace cụ thể:

```bash
kubectl apply -f deployment.yaml -n dev
```

---

## 7. Namespace manifest

```yaml
apiVersion: v1
kind: Namespace

metadata:
  name: dev
```

Apply:

```bash
kubectl apply -f namespace.yaml
```

Resource đặt namespace trong manifest:

```yaml
metadata:
  name: app1
  namespace: dev
```

---

## 8. Resource namespaced hay cluster-scoped?

Command cực hữu ích:

```bash
kubectl api-resources
```

Cột `NAMESPACED` cho biết `true/false`.

Lọc nhanh:

```bash
kubectl api-resources --namespaced=true
kubectl api-resources --namespaced=false
```

Ví dụ:

| Namespaced | Cluster-scoped |
|---|---|
| Pod | Node |
| Service | Namespace |
| Deployment / ReplicaSet | PersistentVolume (PV) |
| ConfigMap / Secret | StorageClass |
| PersistentVolumeClaim (PVC) | ClusterRole / ClusterRoleBinding |
| ResourceQuota / LimitRange | CustomResourceDefinition |

---

## 9. Namespace không tự chặn networking

Cực kỳ quan trọng:

> Namespace mặc định **không phải network security boundary**.

Ví dụ:

```text
Pod in dev
    ↓
Pod/Service in prod
```

vẫn giao tiếp được.

Muốn chặn phải dùng **NetworkPolicy**, và CNI plugin phải hỗ trợ NetworkPolicy (ví dụ Calico, Cilium). Trên CNI không hỗ trợ, NetworkPolicy được tạo nhưng không có tác dụng.

---

## 10. Cross-namespace DNS

Service FQDN:

```text
<service>.<namespace>.svc.cluster.local
```

Ví dụ:

```text
backend.dev.svc.cluster.local
```

| Client ở đâu | Có thể gọi |
|---|---|
| Cùng namespace `dev` | `backend` |
| Namespace khác | `backend.dev` |
| Bất kỳ đâu trong cluster | `backend.dev.svc.cluster.local` |

> **Bổ sung:** tên ngắn hoạt động nhờ `search` domains trong `/etc/resolv.conf` của Pod (`dev.svc.cluster.local svc.cluster.local cluster.local`). `cluster.local` là cluster domain mặc định, có thể được cấu hình khác.
>
> ```bash
> kubectl exec -it <pod> -- cat /etc/resolv.conf
> ```

---

## 11. Delete Namespace

```bash
kubectl delete namespace dev
```

Lệnh này xóa **toàn bộ** resource namespaced trong namespace đó (Deployment, Pod, Service, Secret, PVC...).

=> phải cực kỳ cẩn thận với production.

> **Bổ sung:** namespace có thể bị kẹt ở trạng thái `Terminating` nếu còn resource có finalizer chưa xử lý xong. Kiểm tra bằng:
>
> ```bash
> kubectl get namespace dev -o yaml
> ```
>
> và xem phần `status.conditions`.
