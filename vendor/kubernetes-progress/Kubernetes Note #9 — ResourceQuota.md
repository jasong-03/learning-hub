# Kubernetes Note #9 — ResourceQuota

![Kubernetes Note #9 — ResourceQuota](image/Kubernetes%20Note%20%239%20%E2%80%94%20ResourceQuota.png)

## 1. ResourceQuota là gì?

ResourceQuota giới hạn **tổng** resource consumption trong **một Namespace**.

Ví dụ:

```text
Namespace: team-a

maximum:
CPU request    = 4
Memory request = 8Gi
CPU limit      = 8
Memory limit   = 16Gi
```

Use case SaaS/multi-tenant: mỗi team/customer/tier có một namespace với quota khác nhau.

> **Lưu ý:** quota tính trên **requests/limits đã khai báo**, không phải usage thực tế.

---

## 2. Namespace-level

ResourceQuota là namespaced resource.

```text
Namespace A
   ↓
ResourceQuota A
```

Namespace B có quota riêng.

Quota được kiểm tra **lúc tạo/update resource** (admission). Tạo quota mới không làm ảnh hưởng Pod đang chạy, kể cả khi tổng đang vượt quota.

---

## 3. Ví dụ manifest

```yaml
apiVersion: v1
kind: ResourceQuota

metadata:
  name: compute-quota
  namespace: team-a

spec:
  hard:
    requests.cpu: "2"
    requests.memory: 2Gi
    limits.cpu: "4"
    limits.memory: 4Gi
```

---

## 4. Check

```bash
kubectl get resourcequota -A
```

shortcut:

```bash
kubectl get quota -A
```

Describe:

```bash
kubectl describe resourcequota compute-quota -n team-a
```

Output:

```text
Resource         Used   Hard
--------         ----   ----
limits.cpu       500m   4
limits.memory    512Mi  4Gi
requests.cpu     250m   2
requests.memory  256Mi  2Gi
```

---

## 5. Quota ngoài CPU/RAM

Có thể quota số lượng object và storage:

```yaml
spec:
  hard:
    pods: "20"
    services: "10"
    services.loadbalancers: "2"
    services.nodeports: "0"
    secrets: "30"
    configmaps: "30"
    persistentvolumeclaims: "10"
    requests.storage: 100Gi
    count/deployments.apps: "10"
```

`count/<resource>.<group>` dùng được cho hầu hết resource type.

---

## 6. ResourceQuota và Pod

Nếu quota có giới hạn compute resource, ví dụ:

```text
limits.cpu
limits.memory
```

thì **mọi** Pod mới trong namespace **bắt buộc** khai báo resource tương ứng. Pod thiếu sẽ bị reject:

```text
Error from server (Forbidden): pods "app" is forbidden:
failed quota: compute-quota: must specify limits.cpu for: app; limits.memory for: app
```

Pod khai báo đủ nhưng làm tổng vượt `hard` cũng bị reject:

```text
Error from server (Forbidden): ... exceeded quota: compute-quota,
requested: requests.cpu=1, used: requests.cpu=1500m, limited: requests.cpu=2
```

> **Bẫy với Deployment:** khi Pod bị quota reject, `kubectl apply` Deployment vẫn **thành công**. Lỗi nằm ở ReplicaSet, Pod đơn giản là không xuất hiện. Phải xem:
>
> ```bash
> kubectl describe rs <replicaset> -n team-a
> kubectl get events -n team-a
> ```

Vì phải khai báo resource cho từng container rất bất tiện, ta dùng **LimitRange** để đặt giá trị mặc định (Note #10).
