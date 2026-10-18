# Kubernetes Deployment — Tổng ôn kiến thức từ A–Z

![Kubernetes Note #3 — Deployment](image/Kubernetes%20Note%20%233%20%E2%80%94%20Deployment.png)

## 1. Deployment là gì?

Deployment là Kubernetes resource dùng để quản lý và cập nhật các ứng dụng stateless thông qua ReplicaSet và Pod.

Nó giải quyết 4 vấn đề chính:

- Duy trì số lượng Pod mong muốn.
- Tự thay thế Pod bị mất.
- Scale ứng dụng lên hoặc xuống.
- Cập nhật phiên bản và rollback.

```text
Deployment            (Quản lý rollout và ReplicaSets)
  └── ReplicaSet      (Duy trì số lượng Pod)
        ├── Pod 1
        │     └── Container
        ├── Pod 2
        │     └── Container
        └── Pod 3
              └── Container
```

| Resource   | Trách nhiệm                             |
| ---------- | --------------------------------------- |
| Container  | Chạy ứng dụng                           |
| Pod        | Đơn vị triển khai nhỏ nhất              |
| ReplicaSet | Duy trì số lượng Pod                    |
| Deployment | Quản lý ReplicaSet, rollout và rollback |

> **Ghi nhớ:** Deployment không trực tiếp tạo container. Deployment quản lý ReplicaSet → ReplicaSet quản lý Pod → Pod chứa container.

## 2. Deployment Manifest

Đây là cấu trúc YAML bạn phải hiểu:

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: backend
  namespace: production

spec:
  replicas: 3

  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1

  selector:
    matchLabels:
      app: backend

  template:
    metadata:
      labels:
        app: backend

    spec:
      containers:
        - name: backend
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80

          readinessProbe:
            httpGet:
              path: /
              port: 80
            periodSeconds: 5
```

### Những field bắt buộc phải nhớ

| Field                      | Ý nghĩa                               |
| -------------------------- | ------------------------------------- |
| `replicas`                 | Số Pod mong muốn                      |
| `selector.matchLabels`     | Deployment chọn Pod theo labels       |
| `template.metadata.labels` | Labels của Pod được tạo               |
| `template.spec.containers` | Container chạy trong Pod              |
| `image`                    | Image của ứng dụng                    |
| `strategy`                 | Cách Deployment cập nhật Pod          |
| `readinessProbe`           | Kiểm tra Pod đã sẵn sàng nhận traffic |

`selector` phải khớp với labels trong `template`. Selector của Deployment cũng không thể tùy tiện thay đổi sau khi tạo.

## 3. Deployment Reconciliation & Self-healing

Kubernetes vận hành theo nguyên tắc:

```text
Desired State ──> Actual State
```

Ví dụ:

- Desired: 3 Pods.
- Actual: 2 Pods.
- ReplicaSet tạo thêm 1 Pod để quay về 3.

```bash
kubectl delete pod <pod-name> -n production
```

Nếu Pod thuộc Deployment, Kubernetes sẽ tạo Pod thay thế.

> **Lưu ý:** Self-healing không có nghĩa ứng dụng sẽ không bao giờ downtime. Nếu Node lỗi, thiếu tài nguyên hoặc image không pull được, Pod mới có thể không chạy thành công.

## 4. Scaling

Scaling có hai kiểu:

| Kiểu               | Ý nghĩa                                        |
| ------------------ | ---------------------------------------------- |
| Horizontal Scaling | Tăng hoặc giảm số Pod                          |
| Vertical Scaling   | Tăng hoặc giảm tài nguyên CPU/RAM của workload |

Ví dụ Horizontal Scaling:

```bash
kubectl scale deployment backend --replicas=5 -n production
```

Kubernetes điều chỉnh ReplicaSet từ 3 lên 5 Pods.

Kiểm tra:

```bash
kubectl get deploy,rs,pods -n production
```

Nếu YAML vẫn ghi `replicas: 3`, việc apply lại YAML có thể đưa Deployment về 3 replicas.

## 5. Rolling Update

Rolling Update là cập nhật ứng dụng từng phần thay vì xóa toàn bộ Pod cũ.

Ví dụ:

```bash
kubectl set image deployment/backend \
  backend=nginx:1.28-alpine -n production
```

Kubernetes sẽ:

1. Tạo ReplicaSet mới.
2. Tăng số Pod phiên bản mới.
3. Chờ các Pod mới Available.
4. Giảm dần Pod phiên bản cũ.
5. Hoàn tất rollout khi đạt trạng thái mong muốn.

### Ví dụ Rolling Update — 4 Replicas

Các trạng thái minh họa: **Bắt đầu → Đang update → Hoàn tất**.

Trạng thái **Bắt đầu**:

```text
[v1] [v1] [v1] [v1]
```

4 Pods v1 đang phục vụ. Đây là các trạng thái minh họa, không phải toàn bộ các bước của rollout.

### maxSurge vs maxUnavailable

Giả sử có 4 replicas:

| Cấu hình            | Ý nghĩa                                                               |
| ------------------- | --------------------------------------------------------------------- |
| `maxSurge: 1`       | Tối đa 5 Pods trong rollout                                           |
| `maxUnavailable: 1` | Phải giữ ít nhất 3 Pods Available                                     |
| `maxSurge: 0`       | Không tạo Pod vượt số replicas                                        |
| `maxUnavailable: 0` | Không chủ động giảm số Pod Available dưới mức mong muốn trong rollout |

> **Lưu ý:** Các giới hạn này thuộc chiến lược rollout, không bảo đảm số Pod khỏe trong mọi tình huống như Node failure.

## 6. Rollout, Rollback và Restart

Ba lệnh này rất dễ nhầm:

| Thao tác          | Mục đích                                 |
| ----------------- | ---------------------------------------- |
| `rollout status`  | Kiểm tra tiến trình rollout              |
| `rollout history` | Xem lịch sử revision                     |
| `rollout undo`    | Khôi phục Pod template phiên bản trước   |
| `rollout restart` | Khởi động lại Pods thông qua rollout mới |

```bash
# Kiểm tra trạng thái
kubectl rollout status deploy/backend -n production

# Xem revision
kubectl rollout history deploy/backend -n production

# Rollback
kubectl rollout undo deploy/backend -n production

# Restart tất cả Pods theo chiến lược Deployment
kubectl rollout restart deploy/backend -n production
```

> **Quan trọng:** Rollback không tự động xảy ra chỉ vì Deployment bị lỗi. Kubernetes thường giữ lại những Pod khỏe theo chiến lược rollout, nhưng bạn cần thao tác rollback hoặc có hệ thống tự động hóa riêng.

## 7. Readiness, Liveness và Startup Probe

Đây là phần quan trọng khi vận hành production.

| Probe     | Kiểm tra                      | Khi thất bại                                                                                                         |
| --------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Readiness | App đã sẵn sàng nhận traffic? | Pod bị loại khỏi danh sách endpoint sẵn sàng của Service                                                             |
| Liveness  | App có còn hoạt động đúng?    | Container bị restart khi vượt ngưỡng lỗi                                                                             |
| Startup   | App đã khởi động xong?        | Trì hoãn readiness/liveness đến khi startup thành công; có thể restart container nếu startup probe liên tục thất bại |

Một Pod có thể ở trạng thái `Running` nhưng chưa `Ready`.

Vì thế, khi Deployment rollout, cần quan tâm đến READY và AVAILABLE, không chỉ đếm Pod đang Running.

## 8. Troubleshooting Deployment

Các lỗi nên nhận diện ngay:

| Status / Error             | Nguyên nhân thường gặp      | Cách kiểm tra             |
| -------------------------- | --------------------------- | ------------------------- |
| `Pending`                  | Thiếu CPU/RAM, scheduling   | `kubectl describe pod`    |
| `ImagePullBackOff`         | Image/tag sai, registry lỗi | Pod Events                |
| `CrashLoopBackOff`         | App crash liên tục          | `kubectl logs --previous` |
| `OOMKilled`                | Container vượt memory limit | `kubectl describe pod`    |
| `Running` nhưng `0/1`      | Container chưa Ready        | Probe và logs             |
| `ProgressDeadlineExceeded` | Rollout không đạt tiến độ   | `kubectl describe deploy` |

Quy trình debug nên nhớ:

```bash
kubectl get deploy,rs,pods -n production

kubectl describe deployment backend -n production

kubectl describe pod <pod-name> -n production

kubectl logs <pod-name> -n production

kubectl logs <pod-name> --previous -n production

kubectl get events -n production \
  --sort-by=.metadata.creationTimestamp
```

## 9. Những hiểu lầm thường gặp

- Deployment không đồng nghĩa với Service. Deployment quản lý workload, Service tạo điểm truy cập ổn định và định tuyến tới Pods.
- Running không đồng nghĩa với Ready.
- Rolling Update không bảo đảm zero downtime tuyệt đối. Phụ thuộc probes, tài nguyên, thời gian khởi động và ứng dụng.
- Rollback không khôi phục dữ liệu database. Nó chủ yếu khôi phục Pod template của Deployment.
- Deployment phù hợp nhất với ứng dụng stateless. Database cần tính ổn định về identity/storage thường sử dụng StatefulSet.

## 10. Mini Assessment — Kiểm tra bạn đã cứng Deployment chưa

### Deployment Knowledge Test

Gồm 6 câu hỏi.

**1. Deployment có 3 replicas. Bạn xóa một Pod. Ai chịu trách nhiệm tạo Pod thay thế?**

- A. Service
- B. ReplicaSet
- C. Kube-proxy

> **Đáp án:** B — ReplicaSet duy trì số lượng Pod mong muốn nên tạo Pod thay thế.

**2. Bạn update image và thấy 2 ReplicaSets. Điều này có bình thường?**

- A. Có, Deployment sử dụng ReplicaSet mới khi Pod template thay đổi
- B. Không, cluster đang lỗi

> **Đáp án:** A — Rolling Update tạo ReplicaSet mới cho Pod template mới và giảm dần ReplicaSet cũ.

**3. Ứng dụng có 4 replicas, maxSurge=1. Tối đa bao nhiêu Pods được phép tồn tại trong rollout?**

- A. 3
- B. 4
- C. 5

> **Đáp án:** C — 4 replicas + maxSurge 1 = tối đa 5 Pods trong rollout.

**4. Pod Running nhưng readinessProbe thất bại. Điều gì xảy ra?**

- A. Pod luôn bị xóa ngay
- B. Pod không được coi là Ready để nhận traffic qua Service
- C. Deployment tự rollback

> **Đáp án:** B — Readiness thất bại khiến Pod bị loại khỏi danh sách endpoint sẵn sàng của Service, không bị xóa hay restart.

**5. Developer deploy nhầm `nginx:invalid-tag`. Kubernetes có tự rollback không?**

- A. Có
- B. Không

> **Đáp án:** B — Rollback không tự động xảy ra; bạn cần chạy `rollout undo` hoặc có hệ thống tự động hóa riêng.

**6. Sự khác nhau giữa rollout restart và rollout undo?**

- A. Restart khởi động lại Pods, undo khôi phục revision trước
- B. Hai lệnh giống nhau

> **Đáp án:** A — `rollout restart` tạo rollout mới để khởi động lại Pods; `rollout undo` khôi phục Pod template của revision trước.

### Chốt lại: 5 điều bạn phải nhớ khi đi làm

1. Deployment quản lý ReplicaSet, ReplicaSet quản lý Pod. Bạn khai báo desired state, Kubernetes liên tục reconcile để tiến tới trạng thái đó.
2. Rolling Update thay thế Pod từ từ, còn rollback khôi phục phiên bản trước. `maxSurge` kiểm soát Pod tạo thêm, `maxUnavailable` kiểm soát mức giảm availability trong rollout.
3. Khi Deployment gặp lỗi, đừng vội restart. Hãy kiểm tra Deployment → ReplicaSet → Pod → Events → Logs để tìm nguyên nhân.
4. Nếu bạn có thể tự viết Deployment YAML, thực hiện scale, cập nhật image, giải thích rolling update và tự debug `ImagePullBackOff` mà không nhìn tài liệu, thì bạn đã khá vững Deployment ở mức nền tảng đến trung cấp.
5. Bước học tiếp theo trong giáo trình là Lab 8 — StatefulSet, giúp bạn hiểu cách Kubernetes vận hành database và các ứng dụng cần giữ dữ liệu.