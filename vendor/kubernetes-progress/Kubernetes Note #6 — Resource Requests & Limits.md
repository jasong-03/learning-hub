# Kubernetes Resource Requests & Limits — Tổng ôn kiến thức A–Z

Sau khi học Pod, Deployment, Service và Namespace, phần Resource Requests & Limits giúp bạn hiểu Kubernetes phân bổ CPU/RAM như thế nào, tại sao Pod bị `Pending`, `OOMKilled`, hoặc ứng dụng chạy chậm dù vẫn `Running`.

## 1. Resource Requests & Limits là gì?

Hãy nhớ hai câu:

- **Requests** — Pod cần ít nhất bao nhiêu tài nguyên để Kubernetes lên kế hoạch đặt Pod vào Node?
- **Limits** — Container được phép sử dụng tối đa bao nhiêu tài nguyên?

|           | Requests                                                        | Limits                                |
| --------- | --------------------------------------------------------------- | ------------------------------------- |
| Mục đích  | Scheduling và bảo đảm phần tài nguyên được yêu cầu              | Giới hạn sử dụng                      |
| CPU       | Scheduler xét CPU request                                       | CPU có thể bị throttling              |
| Memory    | Scheduler xét memory request                                    | Vượt giới hạn có thể bị OOMKilled     |
| Ảnh hưởng | Pod có thể Pending nếu Node không đủ tài nguyên có thể cấp phát | Container có thể bị chậm hoặc bị kill |

Ví dụ: Container `backend`

| Resource | Request / Limit | Ý nghĩa                         |
| -------- | --------------- | ------------------------------- |
| CPU      | `250m / 500m`   | 0.25 CPU request, 0.5 CPU limit |
| Memory   | `128Mi / 256Mi` | 128 MiB request, 256 MiB limit  |

Các con số này thể hiện tỷ lệ request/limit trong cấu hình, không phải mức tài nguyên đang sử dụng.

> **Lưu ý:** Request không có nghĩa Kubernetes luôn cấp cố định lượng CPU/RAM đó cho container. CPU có thể được chia sẻ, còn memory request chủ yếu được dùng cho scheduling và quyết định khi Node chịu áp lực bộ nhớ.

## 2. CPU và Memory được tính thế nào?

### CPU

| Giá trị | Ý nghĩa  |
| ------- | -------- |
| `100m`  | 0.1 CPU  |
| `250m`  | 0.25 CPU |
| `500m`  | 0.5 CPU  |
| `1000m` | 1 CPU    |
| `2`     | 2 CPUs   |

Chữ `m` nghĩa là millicore, với 1000m = 1 CPU.

### Memory

| Giá trị | Ý nghĩa  |
| ------- | -------- |
| `128Mi` | 128 MiB  |
| `256Mi` | 256 MiB  |
| `512Mi` | 512 MiB  |
| `1Gi`   | 1024 MiB |
| `2Gi`   | 2048 MiB |

Memory là dung lượng bộ nhớ, không giống CPU được tính theo thời gian xử lý.

## 3. Khai báo Requests & Limits trong Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
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
          image: nginx:alpine
          resources:
            requests:
              cpu: "250m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
```

Mỗi Pod có một container với:

- CPU request 250m, limit 500m.
- Memory request 128Mi, limit 256Mi.

Vì Deployment có `replicas: 3`, tổng request là:

| Resource       | Mỗi Pod | 3 Pods |
| -------------- | ------- | ------ |
| CPU request    | 250m    | 750m   |
| Memory request | 128Mi   | 384Mi  |
| CPU limit      | 500m    | 1500m  |
| Memory limit   | 256Mi   | 768Mi  |

Các tổng này giả định mỗi Pod chỉ có đúng container trên, không có init-container overhead hoặc cấu hình tài nguyên bổ sung.

## 4. Scheduler quyết định Pod chạy trên Node nào?

Giả sử có hai Node với tài nguyên CPU còn có thể phân bổ dựa trên requests:

```text
Node A: 500m CPU còn allocatable
Node B: 1000m CPU còn allocatable

Pod mới: request 750m CPU
```

Kết quả:

- Node A không đủ request để schedule Pod.
- Node B đáp ứng yêu cầu về CPU và có thể được chọn nếu các điều kiện khác cũng thỏa mãn.

### Thử tự schedule một Pod

CPU request của Pod: **750m**

| Node   | CPU available | Kết quả                 |
| ------ | ------------- | ----------------------- |
| Node A | 500m          | Không đủ CPU request    |
| Node B | 1000m         | Đủ CPU để xét schedule  |

Mô phỏng này chỉ xét CPU requests. Scheduler thực tế còn xét memory, taints, affinity và các ràng buộc khác.

Nếu không Node nào đáp ứng được yêu cầu, Pod có thể ở trạng thái `Pending` và Events báo `Insufficient cpu` hoặc `Insufficient memory`.

## 5. CPU Throttling và Memory OOMKilled

Phân biệt hai trường hợp này rất quan trọng.

### CPU vượt limit → Throttling

Ví dụ:

```yaml
resources:
  requests:
    cpu: "250m"
  limits:
    cpu: "500m"
```

App muốn dùng 1 CPU nhưng chỉ được cấu hình limit 0.5 CPU.

Linux cgroups có thể điều tiết thời gian CPU mà container sử dụng.

Hậu quả: Ứng dụng chạy chậm hơn, latency tăng, nhưng không bị kill chỉ vì vượt CPU limit.

### Memory vượt limit → OOMKilled

Ví dụ:

```yaml
resources:
  requests:
    memory: "128Mi"
  limits:
    memory: "256Mi"
```

Nếu container sử dụng vượt memory limit và kernel không thể giải quyết áp lực bộ nhớ, tiến trình có thể bị kill.

Kubernetes báo:

```text
Last State: Terminated
Reason: OOMKilled
Exit Code: 137
```

`137` thường tương ứng với tiến trình bị SIGKILL (`128 + 9`), nhưng không phải mọi exit code 137 đều chứng minh do OOM. Phải kiểm tra thêm `Reason`.

### Tóm tắt

| Trường hợp               | Hậu quả                                                        |
| ------------------------ | -------------------------------------------------------------- |
| CPU limit vượt ngưỡng    | Throttling → ứng dụng có thể chạy chậm, không bị kill chỉ vì vượt CPU |
| Memory limit vượt ngưỡng | Có thể OOMKilled → container bị terminate, thường có exit code 137 |

## 6. QoS Classes — Kubernetes ưu tiên Pod thế nào?

Kubernetes chia Pod thành 3 nhóm QoS (Quality of Service) theo cấu hình tài nguyên.

| QoS Class  | Điều kiện                                                         | Khi Node thiếu memory     |
| ---------- | ----------------------------------------------------------------- | ------------------------- |
| Guaranteed | Mỗi container có CPU và memory request = limit, đều được khai báo | Được bảo vệ tương đối tốt |
| Burstable  | Có request/limit nhưng không đủ điều kiện Guaranteed              | Có thể bị eviction        |
| BestEffort | Không khai báo request/limit CPU hoặc memory                      | Thường bị eviction trước  |

Ví dụ:

### Guaranteed (QoS cao)

```yaml
resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

### Burstable

```yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

### BestEffort

```yaml
resources: {}
```

> **Điểm cần nhớ:** QoS ảnh hưởng đến việc eviction khi Node chịu áp lực tài nguyên. Guaranteed không có nghĩa Pod không bao giờ bị OOMKilled nếu tự vượt memory limit.

Ngoài ra, khi Node chịu memory pressure, kubelet xét nhiều yếu tố như mức sử dụng vượt request và Pod Priority, không chỉ mỗi QoS.

## 7. Resource Requests & Limits khác ResourceQuota thế nào?

Bạn vừa học Namespace, nên cần phân biệt:

| Khái niệm     | Phạm vi   | Mục đích                                           |
| ------------- | --------- | -------------------------------------------------- |
| Requests      | Container | Tài nguyên yêu cầu để schedule                     |
| Limits        | Container | Giới hạn sử dụng                                   |
| ResourceQuota | Namespace | Giới hạn tổng request/limit và số lượng resource   |
| LimitRange    | Namespace | Đặt mặc định, tối thiểu hoặc tối đa cho tài nguyên |

Ví dụ ResourceQuota:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-quota
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 4Gi
    limits.cpu: "4"
    limits.memory: 8Gi
```

Nếu các Pod trong namespace yêu cầu tổng CPU lớn hơn 2 cores, API Server có thể từ chối tạo thêm Pod.

## 8. Lab 21 — Resource Management & OOMKiller

Trong bộ 46 Labs, Lab 21 yêu cầu thực hành ba nội dung: tạo OOMKilled, quan sát CPU throttling và kiểm tra QoS Classes.

Đây là bản rút gọn để bạn thực hiện trên `kind-lab`, không xóa cluster.

### Setup

```bash
kubectl config current-context
kubectl create namespace resource-lab \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Test A — OOMKilled

Tạo `memory-hog.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: memory-hog
  namespace: resource-lab
spec:
  containers:
    - name: app
      image: polinux/stress
      resources:
        requests:
          memory: "50Mi"
        limits:
          memory: "100Mi"
      command: ["stress"]
      args:
        - "--vm"
        - "1"
        - "--vm-bytes"
        - "250M"
        - "--vm-hang"
        - "1"
```

```bash
kubectl apply -f memory-hog.yaml
kubectl get pod memory-hog -n resource-lab -w
```

Ở terminal khác:

```bash
kubectl describe pod memory-hog -n resource-lab
```

Tìm:

```text
Reason: OOMKilled
Exit Code: 137
```

Nếu không xuất hiện, cần kiểm tra image, logs và trạng thái Pod thực tế; hành vi phân bổ memory của công cụ stress có thể phụ thuộc môi trường.

### Test B — CPU Throttling

Tạo `cpu-hog.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: cpu-hog
  namespace: resource-lab
spec:
  containers:
    - name: app
      image: polinux/stress
      command: ["stress"]
      args: ["--cpu", "2"]
      resources:
        requests:
          cpu: "100m"
        limits:
          cpu: "200m"
```

```bash
kubectl apply -f cpu-hog.yaml
kubectl top pod cpu-hog -n resource-lab
```

Nếu Metrics Server hoạt động, CPU sử dụng thường ở gần mức giới hạn 200m khi workload liên tục tiêu thụ CPU. `kubectl top` chỉ cho thấy usage; muốn xác nhận throttling thực sự cần xem thêm cgroup statistics hoặc metrics throttling.

### Test C — QoS

Kiểm tra:

```bash
kubectl get pod memory-hog -n resource-lab \
  -o jsonpath='{.status.qosClass}{"\n"}'

kubectl get pod cpu-hog -n resource-lab \
  -o jsonpath='{.status.qosClass}{"\n"}'
```

Expected:

```text
Burstable
Burstable
```

### Cleanup

```bash
kubectl delete namespace resource-lab
```

Không ảnh hưởng cluster `kind-lab` hay các namespace của Lab trước.

## 9. Các lệnh troubleshooting quan trọng

```bash
# Xem resource được khai báo
kubectl describe pod <pod-name> -n <namespace>

# Xem CPU/RAM đang sử dụng (cần Metrics Server)
kubectl top pods -n <namespace>

# Xem CPU/RAM của Nodes
kubectl top nodes

# Xem tình trạng tài nguyên Node
kubectl describe node <node-name>

# Xem lý do container chết
kubectl get pod <pod-name> -n <namespace> \
  -o jsonpath='{.status.containerStatuses[*].lastState}'

# Xem logs container trước khi restart
kubectl logs <pod-name> -n <namespace> --previous

# Xem các Events
kubectl get events -n <namespace> \
  --sort-by=.metadata.creationTimestamp
```

## 10. Knowledge Test — Resource Management

Resource Requests & Limits Test — 5 câu.

**1. Pod request 500m CPU, limit 1000m CPU. Container có thể sử dụng 800m không?**

- A. Có, nếu có CPU khả dụng
- B. Không, request là giới hạn cứng

> **Đáp án:** A — Request là mức tối thiểu để schedule; container có thể dùng tới limit 1000m nếu Node còn CPU rảnh.

**2. Container vượt CPU limit. Điều gì thường xảy ra?**

- A. OOMKilled
- B. CPU throttling
- C. Pod bị xóa

> **Đáp án:** B — Vượt CPU limit dẫn tới throttling, không bị kill chỉ vì vượt CPU.

**3. Container vượt memory limit. Điều gì có thể xảy ra?**

- A. OOMKilled
- B. CPU throttling
- C. Service bị xóa

> **Đáp án:** A — Vượt memory limit có thể khiến container bị OOMKilled (thường exit code 137).

**4. Pod có `requests.cpu=limits.cpu` và `requests.memory=limits.memory` cho mọi container. QoS là gì?**

- A. Burstable
- B. BestEffort
- C. Guaranteed

> **Đáp án:** C — Mọi container có CPU và memory request bằng limit là điều kiện của Guaranteed.

**5. Pod `Pending` và Events báo `Insufficient cpu`. Bạn nên kiểm tra gì?**

- A. Node allocatable và CPU requests
- B. Service ClusterIP
- C. Ingress DNS

> **Đáp án:** A — Scheduler không tìm được Node có đủ CPU allocatable cho CPU request của Pod.

## 11. Chốt kiến thức — 5 điều quan trọng nhất

1. Requests giúp Kubernetes schedule Pod dựa vào tài nguyên đã được yêu cầu, không phải mức CPU/RAM sử dụng hiện tại.
2. CPU limit → Throttling, khiến ứng dụng có thể chậm khi tiêu thụ quá nhiều CPU.
3. Memory limit → Có thể OOMKilled, thường có `Reason: OOMKilled`, `Exit Code: 137`.
4. QoS có ba loại: Guaranteed, Burstable, BestEffort; ảnh hưởng đến ưu tiên eviction khi Node chịu áp lực.
5. ResourceQuota quản lý tổng tài nguyên của Namespace, khác với Requests & Limits khai báo cho container.

> **Tình huống production cần nhớ:** Một backend bị OOMKilled không có nghĩa giải pháp luôn là tăng memory limit. DevOps cần kiểm tra memory usage, application logs, memory leak, traffic, memory request/limit và khả năng cấp phát của Node trước khi quyết định.

Đó là kiến thức cốt lõi của Resource Requests & Limits. Bài tiếp theo liên quan trực tiếp là HPA — Horizontal Pod Autoscaler, nơi Kubernetes dùng metrics để tự điều chỉnh số replicas của Deployment.
