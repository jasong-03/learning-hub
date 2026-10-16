# Kubernetes Note #10 — LimitRange

![Kubernetes Note #10 — LimitRange](image/Kubernetes%20Note%20%2310%20%E2%80%94%20LimitRange.png)

## 1. Vấn đề của ResourceQuota

Khi namespace có quota compute, **mọi** container phải khai báo:

```yaml
requests:
limits:
```

Hàng trăm Pod mà phải tự viết thì bất tiện, và chỉ cần một Pod quên là bị reject.

LimitRange đưa ra cho từng container/Pod trong Namespace:

```text
default request
default limit
min
max
```

LimitRange được áp dụng **lúc tạo Pod** (admission). Sửa LimitRange không thay đổi Pod đang chạy.

---

## 2. LimitRange là namespaced

```yaml
metadata:
  namespace: demo
```

Chỉ tác động resource trong Namespace đó.

`type` có thể là:

```text
Container
Pod
PersistentVolumeClaim
```

---

## 3. Ví dụ

```yaml
apiVersion: v1
kind: LimitRange

metadata:
  name: container-limits
  namespace: demo

spec:
  limits:
    - type: Container

      defaultRequest:
        cpu: 500m

      default:
        cpu: 800m

      min:
        cpu: 100m

      max:
        cpu: "1"
```

Ý nghĩa:

| Field | Ý nghĩa |
|---|---|
| `defaultRequest` | request mặc định nếu container không khai báo |
| `default` | **limit** mặc định nếu container không khai báo |
| `min` | request/limit tối thiểu |
| `max` | limit tối đa |
| `maxLimitRequestRatio` | tỷ lệ limit/request tối đa (optional) |

> Tên dễ nhầm: `default` là **limit** mặc định, không phải request.
>
> Ràng buộc hợp lệ: `min <= defaultRequest <= default <= max`.

Check:

```bash
kubectl get limitrange -n demo
kubectl describe limitrange container-limits -n demo
```

---

## 4. Không specify resource

Pod:

```yaml
containers:
  - name: app
    image: nginx
```

Với LimitRange trên, container được gán:

```text
request 500m
limit   800m
```

Xem kết quả:

```bash
kubectl get pod <pod> -n demo -o jsonpath='{.spec.containers[0].resources}'
```

### Specify một phần

| Container khai báo | Kết quả |
|---|---|
| Không gì cả | request = `defaultRequest`, limit = `default` |
| Chỉ request | limit = `default` (nếu request > `default` → bị reject) |
| Chỉ limit | request = **chính limit đó** (không dùng `defaultRequest`) |
| Cả hai | giữ nguyên, chỉ kiểm tra min/max |

---

## 5. Specify trong range

LimitRange:

```text
min = 100m
max = 1000m
```

Pod:

```text
request = 300m
limit   = 900m
```

=> hợp lệ.

---

## 6. Vượt max / dưới min

Nếu:

```text
limit = 1001m
max   = 1000m
```

=> Kubernetes reject Pod:

```text
Error from server (Forbidden): pods "app" is forbidden:
maximum cpu usage per Container is 1, but limit is 1001m
```

Tương tự request dưới `min` cũng bị reject.

---

## 7. ResourceQuota vs LimitRange

Câu rất hay gặp khi interview.

### ResourceQuota

Giới hạn **tổng resource của Namespace**.

```text
Namespace
├── Pod A
├── Pod B
├── Pod C
└── TOTAL <= quota
```

### LimitRange

Default + min/max cho **từng Pod/container**.

```text
Container A
request/limit within range

Container B
request/limit within range
```

| | ResourceQuota | LimitRange |
|---|---|---|
| Phạm vi | tổng cả Namespace | từng container/Pod/PVC |
| Gán giá trị mặc định | Không | Có |
| Giới hạn số lượng object | Có | Không |
| Chặn tại | admission | admission |

Tóm gọn:

```text
ResourceQuota = giới hạn tổng toàn Namespace
LimitRange    = default + giới hạn từng workload
```

Chúng thường đi cùng nhau: LimitRange tự điền requests/limits nên Pod không bị ResourceQuota reject vì thiếu khai báo.

---

# Tổng kết Notes #4–#10

## Bức tranh tổng hợp

Từ Kubernetes basic sang **production resource management**:

```text
Cluster
│
├── Namespace: dev
│   │
│   ├── ResourceQuota
│   │
│   ├── LimitRange
│   │
│   ├── Deployment
│   │     ↓
│   │   ReplicaSet
│   │     ↓
│   │    Pods
│   │
│   └── Service
│
└── Namespace: prod
      ...
```

Mỗi Pod:

```text
Pod
└── Container
     ├── command / args
     ├── CPU request
     ├── memory request
     ├── CPU limit
     └── memory limit
```

Monitoring:

```text
kubelet (cAdvisor)
   ↓
Metrics Server
   ↓
Metrics API (kube-apiserver)
   ↓
kubectl top / HPA
```

Networking:

```text
Client
 ↓
Service
 ↓
Pods (Ready, match selector)
```

Cross namespace:

```text
<service>.<namespace>.svc.cluster.local
```

---

## Lab tổng hợp

Với deadline 1 tuần, làm **4 lab** này là đủ.

### Lab A — Service

```bash
kubectl create deployment nginx --image=nginx:1.27 --replicas=3
kubectl expose deployment nginx --port=80 --target-port=80
```

Sau đó:

```bash
kubectl get svc
kubectl describe svc nginx
kubectl get pods -o wide
```

So sánh IP trong `Endpoints` với Pod IP. Gọi Service từ trong cluster:

```bash
kubectl run tmp --rm -it --image=busybox:1.36 --restart=Never -- wget -qO- nginx
```

---

### Lab B — Namespace

```bash
kubectl create namespace dev
kubectl create namespace prod

kubectl create deployment nginx --image=nginx:1.27 -n dev
kubectl create deployment nginx --image=nginx:1.27 -n prod
```

Verify:

```bash
kubectl get deploy -n dev
kubectl get deploy -n prod
kubectl get deploy -A
```

Thêm: expose `nginx` trong `prod`, rồi từ Pod trong `dev` gọi `nginx.prod` để thấy namespace không chặn network.

---

### Lab C — Resources + Metrics

Deployment:

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi

  limits:
    memory: 256Mi
```

Sau đó:

```bash
kubectl top pods
kubectl top nodes
kubectl get pod <pod> -o jsonpath='{.status.qosClass}'
```

So sánh:

```text
request
vs
actual usage
```

QoS mong đợi: `Burstable`.

---

### Lab D — ResourceQuota + LimitRange

```bash
kubectl create namespace lab
```

Apply ResourceQuota (Note #9) và LimitRange (Note #10) vào namespace `lab`.

1. Tạo Pod không khai báo resource → được LimitRange điền default. Kiểm tra bằng `kubectl get pod -o yaml`.
2. Tạo Pod có `limits.cpu: 2` → vượt `max`.
3. Tạo Deployment nhiều replicas vượt quota → Pod không xuất hiện, tìm lý do bằng `kubectl describe rs` và `kubectl get events`.

Mục tiêu là thấy:

```text
Forbidden
```

rồi tự giải thích được nguyên nhân.

---

## Câu hỏi tự kiểm tra

1. **ClusterIP, NodePort và LoadBalancer khác nhau thế nào?**
2. **Tại sao application không nên gọi Pod IP trực tiếp?**
3. **Namespace có tự chặn network giữa dev và prod không?**
4. **`service.namespace.svc.cluster.local` nghĩa là gì?**
5. **Request và Limit khác nhau thế nào?**
6. **CPU vượt limit và memory vượt limit có hành vi khác nhau thế nào?**
7. **`kubectl top` lấy dữ liệu từ đâu và dùng để làm gì?**
8. **ResourceQuota khác LimitRange thế nào?**
9. **`command` và `args` của Kubernetes tương ứng gì trong Docker?**
10. **Container chạy `ls` khi nào thành `Completed`, khi nào thành `CrashLoopBackOff`?**

Trả lời được **8/10** → phần này đạt khá tốt.

---

## Tracker cập nhật

```text
KUBERNETES — 7 DAY TRACKER

FOUNDATION
✅ Pod
✅ YAML / Manifest
✅ kubectl logs / exec
✅ Imperative vs Declarative

WORKLOAD
✅ ReplicaSet
✅ Deployment
✅ Scaling
✅ Rolling Update
✅ Rollback
✅ Deployment Strategy

NETWORKING
✅ Service fundamentals
✅ ClusterIP
✅ NodePort
✅ LoadBalancer concept
✅ ExternalName concept
🟡 Service labs
⬜ Ingress

MULTI-TENANCY / ORGANIZATION
✅ Namespace
✅ Cross-namespace DNS
🟡 Namespace labs

RESOURCE MANAGEMENT
✅ CPU / Memory Requests
✅ CPU / Memory Limits
✅ QoS class
✅ ResourceQuota
✅ LimitRange
🟡 Resource labs

OBSERVABILITY
✅ Metrics Server concept
✅ kubectl top
🟡 Metrics lab

CONTAINER RUNTIME
✅ command
✅ args

NEXT PRIORITY
➡️ ConfigMap / Secret
➡️ Probes
⬜ Storage / PV / PVC
⬜ RBAC
⬜ Helm
⬜ Troubleshooting
```

Ưu tiên cao nhất trong phần này: **Service → Namespace → Requests/Limits → Metrics**. `ResourceQuota`, `LimitRange`, `command/args` cần hiểu nhưng chưa cần học sâu bằng 4 phần kia.
