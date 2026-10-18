# Kubernetes — Giai đoạn 3: Scaling & Operations

*Intermediate → Advanced · 7 chủ đề · Scaling · Scheduling · Reliability · Troubleshooting*

Sau Giai đoạn 1 (Application Deployment) và Giai đoạn 2 (Networking & Security), đây là giai đoạn bạn học cách Kubernetes tự động mở rộng ứng dụng, phân phối workload và vận hành hệ thống khi xảy ra sự cố.

Mục tiêu là bạn trả lời được những câu hỏi thực tế:

- Traffic tăng gấp 5 lần, Kubernetes tăng Pod thế nào?
- Vì sao Node còn CPU/RAM mà Pod vẫn Pending?
- Làm sao chạy một task duy nhất hoặc task định kỳ?
- Khi xóa Pod, làm sao ứng dụng hoàn thành request đang xử lý?
- Node bị lỗi hoặc cần bảo trì thì xử lý thế nào?

## Lộ trình Giai đoạn 3

1. **HPA — Horizontal Pod Autoscaler** — Auto scale theo CPU, memory và metrics.
2. **Job & CronJob** — Batch processing, migration, scheduled tasks.
3. **DaemonSet** — Chạy node agents.
4. **Advanced Scheduling** — NodeSelector, Affinity, Taints, Tolerations.
5. **Pod Lifecycle & Graceful Shutdown** — SIGTERM, preStop, `terminationGracePeriodSeconds`.
6. **Reliability & Node Operations** — PDB, cordon, drain, cluster capacity.
7. **Production Troubleshooting** — Pending, CrashLoopBackOff, OOMKilled, HPA, rollout.

Trong bộ 46 Labs, các bài liên quan nhất là Lab 3–5 (Scheduling), Lab 9 (DaemonSet), Lab 10 (Job/CronJob), Lab 36 (HPA) và các bài về Node Operations. Phần graceful shutdown và production runbook bên dưới có bổ sung kiến thức vận hành để bạn ứng dụng thực tế.

# Phần 1 — HPA: Horizontal Pod Autoscaler

## 1. HPA là gì?

HPA tự động điều chỉnh số lượng replicas của một workload dựa trên metrics.

Ví dụ một Deployment có 3 Pods, CPU usage tăng quá mức mục tiêu thì HPA có thể tăng replicas lên 4, 5 hoặc nhiều hơn, trong giới hạn đã cấu hình.

```text
Metrics API          (CPU, memory, custom/external metrics)
     │
     ▼
HPA Controller       (tính số replicas mong muốn)
     │
     ▼
Deployment → ReplicaSet → Pods
```

| Mức traffic  | Replicas |
| ------------ | -------- |
| Low traffic  | 2        |
| Normal       | 3        |
| High traffic | 6        |

> Đây chỉ là ví dụ minh họa; HPA không luôn tăng replicas theo ba mức cố định.

### HPA khác việc scale thủ công thế nào?

```bash
kubectl scale deployment backend --replicas=5
```

Đây là manual scaling.

Còn HPA tự tính replicas dựa trên CPU, memory hoặc metrics khác.

## 2. HPA tính số replicas như thế nào?

Công thức gần đúng:

\\[ \text{Desired Replicas}=\left\lceil \text{Current Replicas}\times\frac{\text{Current Metric}}{\text{Target Metric}}\right\rceil \\]

Ví dụ:

- Current replicas: 3
- Current CPU utilization: 90%
- Target CPU utilization: 60%

\\[ \left\lceil 3\times\frac{90}{60}\right\rceil=5 \\]

HPA có thể đề xuất tăng từ 3 lên 5 Pods, trước khi xét thêm các điều kiện như tolerance, missing metrics, stabilization và scaling policies.

### Tự thử tính HPA

Ví dụ tính toán từng bước:

| Thông số                | Giá trị |
| ----------------------- | ------- |
| Current replicas        | 3       |
| Current CPU utilization | 90%     |
| Target CPU utilization  | 60%     |
| Giới hạn replicas       | 1–10    |

1. Nhân số replicas hiện tại với tỷ lệ metric: 3 × 90% / 60% = 4,5.
2. Làm tròn lên (ceil): 4,5 → 5.
3. Kiểm tra giới hạn 1–10: 5 nằm trong khoảng nên giữ nguyên.

Kết quả: **Desired replicas = 5**.

> Đây là mô hình để học công thức cơ bản. HPA thực tế áp dụng thêm các điều kiện và chính sách điều chỉnh.

## 3. HPA Manifest

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend

  minReplicas: 2
  maxReplicas: 10

  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60

  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

Giải thích:

| Field                        | Ý nghĩa                                                  |
| ---------------------------- | -------------------------------------------------------- |
| `scaleTargetRef`             | Workload cần scale                                       |
| `minReplicas`                | Số replicas thấp nhất                                    |
| `maxReplicas`                | Số replicas cao nhất                                     |
| `averageUtilization`         | Mục tiêu CPU trung bình theo tỷ lệ CPU requests          |
| `stabilizationWindowSeconds` | Ổn định quyết định scale trong khoảng thời gian cấu hình |

Rất quan trọng: CPU utilization của HPA tính theo `requests.cpu`, không phải `limits.cpu`.

Ví dụ CPU request 200m và thực tế dùng 160m thì utilization khoảng 80%.

## 4. HPA cần những gì?

Đối với CPU HPA:

1. Metrics Server hoạt động.
2. Pod container có `resources.requests.cpu` phù hợp.
3. Deployment có thể scale được.
4. Cluster có đủ Node capacity để chạy thêm Pods.

```bash
kubectl get hpa -n production
kubectl describe hpa backend-hpa -n production
kubectl top pods -n production
kubectl get apiservice v1beta1.metrics.k8s.io
```

### Những lỗi HPA thường gặp

| Triệu chứng                              | Nguyên nhân khả dĩ                               |
| ---------------------------------------- | ------------------------------------------------ |
| CPU `<unknown>`                          | Metrics API lỗi hoặc thiếu CPU requests          |
| Desired replicas tăng nhưng Pods Pending | Thiếu Node capacity/scheduling constraints       |
| Scale up/down liên tục                   | Metric biến động, cấu hình behavior chưa phù hợp |
| CPU thấp nhưng latency cao               | Bottleneck không nằm ở CPU                       |
| HPA scale không như dự kiến              | Stabilization, tolerance, missing metrics        |

HPA không thay thế việc tăng số Nodes. Nếu cluster không đủ tài nguyên, HPA có thể yêu cầu thêm Pods nhưng không thể bảo đảm chúng chạy được.

# Phần 2 — Job & CronJob

## 5. Khi nào dùng Deployment, Job hay CronJob?

| Resource   | Phù hợp                          |
| ---------- | -------------------------------- |
| Deployment | Backend API, worker chạy lâu dài |
| Job        | Tác vụ chạy một lần rồi hoàn tất |
| CronJob    | Tác vụ chạy định kỳ theo lịch    |

Ví dụ:

- FastAPI server → Deployment.
- Import 1 triệu records → Job.
- Backup database mỗi ngày → CronJob.

## 6. Job hoạt động thế nào?

Job quản lý một hoặc nhiều Pods thực hiện công việc cho đến khi đạt điều kiện hoàn thành.

```text
Job: import-data

Attempt 1 → Failed
Attempt 2 → Succeeded
Job       → Complete
```

> Đây là một ví dụ retry; cách retry thực tế phụ thuộc `restartPolicy` và cấu hình Job.

### Job Manifest

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: data-import
spec:
  completions: 1
  parallelism: 1
  backoffLimit: 3
  ttlSecondsAfterFinished: 3600

  template:
    spec:
      restartPolicy: Never
      containers:
        - name: importer
          image: busybox:1.36
          command: ["/bin/sh", "-c"]
          args:
            - |
              echo "Import started"
              sleep 3
              echo "Import completed"
```

Các cấu hình quan trọng:

- `completions`: Số lần hoàn thành cần đạt.
- `parallelism`: Số Pods được chạy đồng thời tối đa theo mục tiêu.
- `backoffLimit`: Giới hạn retry trước khi Job bị đánh dấu Failed.
- `ttlSecondsAfterFinished`: Tự động dọn Job sau khi hoàn thành/thất bại và đủ thời gian.
- `restartPolicy: Never`: Container lỗi thì không tự restart trong cùng Pod; Job có thể tạo attempt mới.

### Debug Job

```bash
kubectl get jobs
kubectl describe job data-import
kubectl get pods -l job-name=data-import
kubectl logs job/data-import
```

## 7. CronJob

CronJob tạo Job theo lịch.

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-cleanup
spec:
  schedule: "0 2 * * *"
  timeZone: "Asia/Ho_Chi_Minh"
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1

  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: cleanup
              image: busybox:1.36
              command: ["/bin/sh", "-c"]
              args: ["date; echo cleanup-completed"]
```

### Cú pháp Cron

```text
┌──────────── Minute (0–59)
│ ┌────────── Hour (0–23)
│ │ ┌──────── Day of month
│ │ │ ┌────── Month
│ │ │ │ ┌──── Day of week
│ │ │ │ │
0 2 * * *
```

Ví dụ `0 2 * * *` = 02:00 mỗi ngày theo timezone cấu hình.

### `concurrencyPolicy`

| Giá trị   | Ý nghĩa                         |
| --------- | ------------------------------- |
| `Allow`   | Cho phép Jobs chạy chồng nhau   |
| `Forbid`  | Bỏ lượt mới khi Job cũ còn chạy |
| `Replace` | Thay Job đang chạy bằng Job mới |

Production note: CronJob không bảo đảm chính xác một lần thực thi trong mọi tình huống. Công việc phải idempotent nếu chạy lại có thể gây side effects như gửi email, charge tiền hoặc cập nhật database.

# Phần 3 — DaemonSet

## 8. DaemonSet là gì?

Deployment duy trì số replicas mong muốn.

DaemonSet đảm bảo một Pod của DaemonSet chạy trên mỗi Node đủ điều kiện.

Ví dụ cluster có 4 Nodes thì một DaemonSet log collector thông thường sẽ tạo 4 Pods, nếu cả 4 Node đều phù hợp và có thể schedule.

```text
DaemonSet: Node Monitoring Agent

┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│  Node 1   │ │  Node 2   │ │  Node 3   │ │  Node 4   │
│ Agent Pod │ │ Agent Pod │ │ Agent Pod │ │ Agent Pod │
└───────────┘ └───────────┘ └───────────┘ └───────────┘
```

### Use cases

- Fluent Bit: Thu thập logs.
- Prometheus Node Exporter: Thu thập Node metrics.
- Network agents: CNI.
- Security agents: Runtime monitoring.

## 9. DaemonSet Manifest

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-agent
spec:
  selector:
    matchLabels:
      app: node-agent
  template:
    metadata:
      labels:
        app: node-agent
    spec:
      containers:
        - name: agent
          image: busybox:1.36
          command: ["/bin/sh", "-c"]
          args:
            - |
              echo "Agent started on $NODE_NAME"
              sleep 3600
          env:
            - name: NODE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
          resources:
            requests:
              cpu: "20m"
              memory: "32Mi"
            limits:
              cpu: "100m"
              memory: "128Mi"
```

`NODE_NAME` được inject từ Downward API.

### Kiểm tra

```bash
kubectl get daemonsets
kubectl get pods -o wide
kubectl describe daemonset node-agent
```

### DaemonSet khác Deployment

| Deployment                     | DaemonSet                                 |
| ------------------------------ | ----------------------------------------- |
| Scale theo replicas            | Chạy trên các Node phù hợp                |
| Dùng cho app/service           | Dùng cho node-level agents                |
| HPA có thể điều chỉnh replicas | Không scale bằng HPA theo kiểu Deployment |
| Scheduler phân phối Pods       | DaemonSet controller tạo Pods theo Node   |

Nếu một Node được thêm vào cluster, DaemonSet controller sẽ cố gắng tạo Pod trên Node đó nếu Node đáp ứng điều kiện.

# Phần 4 — Advanced Scheduling

## 10. Kubernetes Scheduler chọn Node như thế nào?

Khi một Pod được tạo, Scheduler tìm Node phù hợp dựa trên:

- CPU/Memory requests và allocatable capacity.
- Node labels.
- Node affinity / anti-affinity.
- Taints và tolerations.
- Pod affinity / anti-affinity.
- Topology spread constraints.
- Storage topology.
- Pod scheduling constraints khác.

Pod `Pending` không nhất thiết do thiếu CPU/RAM. Có thể Node bị taint, yêu cầu affinity quá chặt hoặc PVC không thể bind.

## 11. NodeSelector

Đơn giản nhất: yêu cầu Pod chạy trên Node có label cụ thể.

Gắn label Node:

```bash
kubectl label node <node-name> workload=backend
```

Trong Pod:

```yaml
spec:
  nodeSelector:
    workload: backend
```

Nếu không Node nào có label `workload=backend`, Pod sẽ không được schedule.

### `nodeSelector` vs `nodeName`

- `nodeSelector`: Scheduler chọn Node thỏa điều kiện.
- `nodeName`: Chỉ định trực tiếp Node, bỏ qua việc chọn Node của scheduler thông thường.

Production thường ưu tiên scheduling constraints thay vì hardcode `nodeName`.

## 12. Node Affinity

Node Affinity linh hoạt hơn NodeSelector.

### Required — Bắt buộc

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
        - matchExpressions:
            - key: workload
              operator: In
              values: ["backend"]
```

Không có Node phù hợp → Pod Pending.

### Preferred — Ưu tiên

```yaml
affinity:
  nodeAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
            - key: workload
              operator: In
              values: ["backend"]
```

Scheduler ưu tiên Node có label phù hợp nhưng vẫn có thể chọn Node khác.

### `IgnoredDuringExecution`

Điều này có nghĩa Kubernetes không tự evict một Pod đã chạy chỉ vì label Node sau đó không còn thỏa affinity rule. Các cơ chế khác vẫn có thể dẫn đến Pod bị evict.

## 13. Taints & Tolerations

Đây là phần thường được dùng trong production để dành Node cho workloads nhất định.

Hãy nhớ:

- Taint: Node nói “không nhận Pod không phù hợp”.
- Toleration: Pod nói “tôi có thể chịu được taint này”.

Ví dụ gắn taint:

```bash
kubectl taint nodes <node-name> \
  dedicated=backend:NoSchedule
```

Pod muốn schedule lên Node có taint này cần có toleration:

```yaml
tolerations:
  - key: dedicated
    operator: Equal
    value: backend
    effect: NoSchedule
```

### Ba Taint Effects

| Effect             | Hành vi                                            |
| ------------------ | -------------------------------------------------- |
| `NoSchedule`       | Không schedule Pod mới nếu không toleration        |
| `PreferNoSchedule` | Cố tránh schedule nhưng không bắt buộc             |
| `NoExecute`        | Có thể evict Pod đang chạy nếu không được tolerate |

Rất quan trọng: Toleration chỉ cho phép Pod chạy trên Node có taint. Nó không bắt buộc Pod phải chọn Node đó.

Muốn dành một nhóm Nodes cho workload, thường kết hợp Taint + Toleration + Node Affinity.

## 14. Pod Anti-Affinity và Topology Spread

Giả sử Deployment có 3 replicas nhưng Scheduler đặt cả 3 trên cùng Node.

Nếu Node đó lỗi, toàn bộ replicas có thể mất đồng thời.

Bạn có thể dùng `podAntiAffinity` hoặc `topologySpreadConstraints` để phân phối Pods.

Ví dụ topology spread:

```yaml
topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: kubernetes.io/hostname
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app: backend
```

Ý nghĩa: Scheduler cố giữ số Pods thuộc `app=backend` phân phối tương đối đều giữa những topology domains đủ điều kiện.

Nếu ràng buộc quá chặt, các Pod mới có thể Pending. Trong production, cần đánh đổi giữa availability và khả năng scheduling.

# Phần 5 — Pod Lifecycle & Graceful Shutdown

## 15. Pod Lifecycle

Pod có các phase chính:

| Phase     | Ý nghĩa                                                                       |
| --------- | ----------------------------------------------------------------------------- |
| Pending   | Đã được API chấp nhận nhưng chưa sẵn sàng chạy tất cả container               |
| Running   | Đã bind vào Node, ít nhất một container đang chạy hoặc đang khởi động/restart |
| Succeeded | Tất cả containers đã kết thúc thành công                                      |
| Failed    | Có container kết thúc lỗi và Pod không được restart                           |
| Unknown   | Không xác định trạng thái Pod                                                 |

Phân biệt: `CrashLoopBackOff`, `ImagePullBackOff`, `ContainerCreating` là các trạng thái/lý do thường xuất hiện trong hiển thị của kubectl, không phải Pod phase độc lập.

## 16. Điều gì xảy ra khi xóa Pod?

Khi Pod được yêu cầu terminate theo quy trình bình thường:

1. Kubernetes bắt đầu thời gian graceful termination.
2. Các endpoint liên quan được cập nhật để traffic mới có thể tránh Pod đang terminate.
3. Kubelet chạy `preStop` hook nếu có và còn thời gian.
4. Runtime gửi signal dừng cho tiến trình chính, thông thường là SIGTERM.
5. Ứng dụng xử lý request dở dang và đóng connections.
6. Hết thời gian grace, tiến trình còn lại có thể bị SIGKILL.

Các bước được điều phối bất đồng bộ; không có bảo đảm mọi client, load balancer hoặc proxy ngừng gửi traffic tức thì.

### Graceful Shutdown Timeline

1. **Termination requested** — Pod bắt đầu quá trình shutdown.
2. **Endpoint draining + preStop** — Cập nhật routing, chạy hook trước khi dừng.
3. **SIGTERM** — Ứng dụng ngừng nhận việc mới và hoàn tất việc đang xử lý.
4. **SIGKILL nếu quá hạn** — Kubelet buộc dừng sau khi hết thời gian grace.

## 17. Manifest Graceful Shutdown

```yaml
spec:
  terminationGracePeriodSeconds: 60
  containers:
    - name: backend
      image: example/backend:v1
      lifecycle:
        preStop:
          exec:
            command:
              - /bin/sh
              - -c
              - sleep 5
```

Đây là ví dụ mô phỏng delay, không phải cấu hình production tối ưu trong mọi trường hợp.

`preStop` nằm trong tổng thời gian grace, không cộng thêm 5 giây sau `terminationGracePeriodSeconds`.

Điều quan trọng hơn là ứng dụng xử lý SIGTERM đúng cách.

Ví dụ Python:

```python
import signal
import time

running = True

def shutdown(signum, frame):
    global running
    running = False
    print("Shutdown requested")

signal.signal(signal.SIGTERM, shutdown)

while running:
    time.sleep(1)

print("Cleanup completed")
```

Ứng dụng thực tế còn phải dừng nhận requests mới, hoàn thành requests đang chạy, đóng pool/database connections và flush logs nếu cần.

## 18. Vì sao Production thường bị 502 khi rollout?

Một kịch bản phổ biến:

- Pod cũ bắt đầu terminate.
- Load balancer hoặc proxy chưa cập nhật trạng thái backend kịp.
- Ứng dụng cũ đã ngừng accept connections.
- Request vẫn được chuyển đến Pod đó.
- Client có thể gặp 502 hoặc kết nối bị reset.

Giải pháp không chỉ là tăng `terminationGracePeriodSeconds`.

Cần kết hợp:

- Readiness và endpoint draining.
- Graceful SIGTERM handling.
- Ingress/load balancer deregistration.
- Deployment rolling update settings.
- Theo dõi active requests, latency và 5xx khi rollout.

# Phần 6 — Reliability & Node Operations

## 19. Cordon và Drain khác nhau thế nào?

Khi cần bảo trì Node, bạn phải biết hai lệnh:

```bash
kubectl cordon <node-name>
```

`cordon` đánh dấu Node không thể nhận Pod mới qua scheduling thông thường. Các Pod đang chạy vẫn tiếp tục chạy.

```bash
kubectl drain <node-name> \
  --ignore-daemonsets
```

`drain` cố gắng evict các Pods phù hợp để Node có thể bảo trì. Lệnh có thể bị chặn bởi PDB hoặc một số loại Pod/storage; không được coi là an toàn tuyệt đối.

| Lệnh   | Tác dụng                                       |
| ------ | ---------------------------------------------- |
| Cordon | Không schedule Pod mới. Pods cũ vẫn chạy.      |
| Drain  | Evict workload Pods để chuẩn bị bảo trì Node.  |

Sau bảo trì:

```bash
kubectl uncordon <node-name>
```

Không thử `drain` trên cluster production hoặc Kind cluster đang có bài lab quan trọng nếu chưa biết tác động.

## 20. PodDisruptionBudget (PDB)

PDB giúp hạn chế số Pod bị gián đoạn bởi voluntary disruptions như Eviction API khi drain Node.

Ví dụ Deployment có 3 replicas và bạn muốn duy trì ít nhất 2 Pods Available trong các eviction có kiểm soát.

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: backend-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: backend
```

PDB không ngăn được mọi sự cố bất ngờ, như Node mất điện, và không phải cơ chế bảo vệ chung cho mọi cách xóa Pod hoặc mọi hành vi Deployment rollout.

## 21. Node Troubleshooting

Những Node conditions cần nhận biết:

| Condition          | Ý nghĩa                                          |
| ------------------ | ------------------------------------------------ |
| Ready              | Node có khả năng phục vụ Pods                    |
| MemoryPressure     | Node thiếu hoặc chịu áp lực memory               |
| DiskPressure       | Node chịu áp lực disk                            |
| PIDPressure        | Node thiếu process IDs                           |
| NetworkUnavailable | Network Node chưa được cấu hình phù hợp, tùy CNI |

Các lệnh:

```bash
kubectl get nodes -o wide

kubectl describe node <node-name>

kubectl top nodes

kubectl get pods -A -o wide
```

Nếu Pods Pending, xem đặc biệt:

```text
Allocated resources
Taints
Conditions
Events
```

# Phần 7 — Production Troubleshooting Runbook

## 22. Quy trình trace khi có sự cố

```text
Service degraded / Pods unhealthy
        │
        ▼
Pod state                (Pending / Crash / OOM)
        │
        ▼
Node state               (Ready / Pressure / Capacity)
        │
        ▼
Events + Logs + Metrics
        │
        ▼
Root Cause → Fix → Verify
```

### Bảng tra nhanh

| Triệu chứng        | Ưu tiên kiểm tra                              | Giải pháp theo nguyên nhân       |
| ------------------ | --------------------------------------------- | -------------------------------- |
| `Pending`          | Scheduling Events, requests, taints, affinity | Capacity hoặc constraints        |
| `CrashLoopBackOff` | Logs `--previous`, exit code, probes          | Application/config/startup       |
| `OOMKilled`        | Memory usage, limit, Node pressure            | Profiling, batch, limit/capacity |
| `ImagePullBackOff` | Image tag, registry auth, DNS                 | Image/credentials/network        |
| `Not Ready`        | Readiness endpoint, dependencies              | Probe hoặc app health            |
| HPA không scale    | Metrics API, requests, HPA status             | Metrics/configuration            |
| Node `NotReady`    | Kubelet, CNI, runtime, conditions             | Node troubleshooting             |
| 502 khi rollout    | Ingress logs, endpoints, shutdown             | Readiness/draining/grace         |
| Job Failed         | Pod logs, Events, backoffLimit                | Fix task và retry behavior       |
| PVC Pending        | StorageClass, CSI, topology                   | Provisioning/capacity            |

### 10 lệnh nên thuộc lòng

```bash
kubectl get pods -A -o wide

kubectl get nodes -o wide

kubectl describe pod <pod-name> -n <namespace>

kubectl logs <pod-name> -n <namespace> --previous

kubectl get events -n <namespace> \
  --sort-by=.metadata.creationTimestamp

kubectl top pods -n <namespace> --containers

kubectl top nodes

kubectl describe deployment <name> -n <namespace>

kubectl describe hpa <name> -n <namespace>

kubectl describe node <node-name>
```

Góc nhìn production: Đừng khắc phục bằng cách `restart` tất cả Pod hoặc tăng CPU/RAM ngay. Trước hết cần xác định bottleneck, mức ảnh hưởng, khả năng rollback và chứng cứ từ Events/Logs/Metrics.

# Phần 8 — Lab tổng hợp Giai đoạn 3 trên `kind-lab`

Lab này dùng một namespace riêng, không xóa cluster, không cordon/drain Nodes và không thay đổi cấu hình hệ thống.

Bạn sẽ tạo:

- Deployment phục vụ HTTP.
- HPA tự scale khi CPU tăng.
- Job chạy một lần.
- CronJob chạy mỗi phút.
- DaemonSet chạy node agent.
- Pod bị scheduling Pending để xem Events.

## 23. Setup

```bash
kubectl config current-context
kubectl get nodes
kubectl top nodes

kubectl create namespace operations-lab \
  --dry-run=client -o yaml | kubectl apply -f -

mkdir -p ~/work/operations-lab
cd ~/work/operations-lab
```

Nếu `kubectl top nodes` lỗi `Metrics API not available`, phần HPA CPU-based cần Metrics Server hoạt động trước khi test.

## 24. Deployment + HPA

Tạo `hpa-demo.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cpu-demo
  namespace: operations-lab
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cpu-demo
  template:
    metadata:
      labels:
        app: cpu-demo
    spec:
      containers:
        - name: server
          image: registry.k8s.io/hpa-example
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 100m
              memory: 32Mi
            limits:
              cpu: 500m
              memory: 128Mi
---
apiVersion: v1
kind: Service
metadata:
  name: cpu-demo
  namespace: operations-lab
spec:
  selector:
    app: cpu-demo
  ports:
    - port: 80
      targetPort: 80
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cpu-demo
  namespace: operations-lab
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cpu-demo
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
```

Apply:

```bash
kubectl apply -f hpa-demo.yaml

kubectl rollout status deployment/cpu-demo \
  -n operations-lab --timeout=180s

kubectl get hpa -n operations-lab
```

Tạo traffic từ client Pod:

```bash
kubectl run load-generator \
  -n operations-lab \
  --image=busybox:1.36 \
  --restart=Never \
  --command -- /bin/sh -c \
  'while true; do wget -q -O /dev/null http://cpu-demo; done'
```

Quan sát:

```bash
kubectl get hpa -n operations-lab -w
```

Terminal khác:

```bash
kubectl get pods -n operations-lab -w
```

Expected: Nếu metrics hoạt động và workload đủ tải, HPA có thể scale từ 2 lên tối đa 5 replicas. Thời gian scale không tức thì.

Khi đã quan sát xong:

```bash
kubectl delete pod load-generator -n operations-lab
```

HPA sẽ đánh giá scale down theo chu kỳ và các chính sách ổn định của nó. Không nhất thiết giảm ngay về 2 Pods.

## 25. Job + CronJob

Tạo `batch.yaml`:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: hello-job
  namespace: operations-lab
spec:
  backoffLimit: 2
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: task
          image: busybox:1.36
          command: ["/bin/sh", "-c"]
          args:
            - "echo Running Job; sleep 3; echo Completed"
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello-cron
  namespace: operations-lab
spec:
  schedule: "* * * * *"
  timeZone: "Asia/Ho_Chi_Minh"
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: task
              image: busybox:1.36
              command: ["/bin/sh", "-c"]
              args:
                - "date; echo CronJob executed"
```

Chạy:

```bash
kubectl apply -f batch.yaml

kubectl wait --for=condition=complete \
  job/hello-job -n operations-lab --timeout=180s

kubectl logs job/hello-job -n operations-lab

kubectl get jobs,cronjobs -n operations-lab
```

Đợi ít nhất một lịch chạy của CronJob, sau đó:

```bash
kubectl get jobs -n operations-lab

kubectl get pods -n operations-lab
```

CronJob có thể không chạy đúng ngay giây đầu mỗi phút vì controller reconciliation có độ trễ.

## 26. DaemonSet

Tạo `daemonset.yaml`:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-observer
  namespace: operations-lab
spec:
  selector:
    matchLabels:
      app: node-observer
  template:
    metadata:
      labels:
        app: node-observer
    spec:
      containers:
        - name: observer
          image: busybox:1.36
          command: ["/bin/sh", "-c"]
          args:
            - |
              echo "Running on $NODE_NAME"
              sleep 3600
          env:
            - name: NODE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
          resources:
            requests:
              cpu: 10m
              memory: 16Mi
            limits:
              cpu: 100m
              memory: 64Mi
```

Chạy:

```bash
kubectl apply -f daemonset.yaml

kubectl get daemonset -n operations-lab

kubectl get pods -n operations-lab -o wide \
  -l app=node-observer
```

Expected: Một DaemonSet Pod trên mỗi Node đủ điều kiện.

## 27. Simulate Scheduling Pending

Tạo `pending-pod.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pending-demo
  namespace: operations-lab
spec:
  nodeSelector:
    nonexistent-label: impossible-value
  containers:
    - name: app
      image: nginx:alpine
```

Chạy:

```bash
kubectl apply -f pending-pod.yaml

kubectl get pod pending-demo -n operations-lab

kubectl describe pod pending-demo -n operations-lab
```

Expected: Pod Pending vì không Node nào có label `nonexistent-label=impossible-value`, với điều kiện lab không có Node được gắn label đó.

Trong Events, bạn sẽ thấy thông tin scheduling failure, ví dụ về node affinity/selector mismatch.

Xóa Pod test:

```bash
kubectl delete pod pending-demo -n operations-lab
```

## 28. Cleanup an toàn

```bash
kubectl delete namespace operations-lab
```

Chỉ xóa namespace lab và tài nguyên bên trong. Cluster `kind-lab` và các namespace khác được giữ nguyên.

# Phần 9 — Knowledge Test

*Scaling & Operations Test · 8 câu*

**1. Deployment có 3 replicas, CPU utilization 90%, target 60%. Theo công thức cơ bản, HPA đề xuất bao nhiêu replicas?**

- A. 4
- B. 5
- C. 6

> **Đáp án:** B — ceil(3 × 90 / 60) = ceil(4,5) = 5.

**2. HPA báo CPU `<unknown>`. Bạn kiểm tra gì?**

- A. Metrics Server và CPU requests
- B. Ingress Controller
- C. PV reclaimPolicy

> **Đáp án:** A — `<unknown>` thường do Metrics API lỗi hoặc container thiếu `resources.requests.cpu`.

**3. Muốn chạy migration một lần rồi hoàn thành, dùng resource nào?**

- A. DaemonSet
- B. Deployment
- C. Job

> **Đáp án:** C — Job dành cho tác vụ chạy một lần rồi hoàn tất.

**4. CronJob `concurrencyPolicy: Forbid` nghĩa là gì?**

- A. Không cho Job mới chạy chồng Job cũ
- B. Cho chạy vô hạn
- C. Không bao giờ retry

> **Đáp án:** A — `Forbid` bỏ lượt mới khi Job cũ còn đang chạy.

**5. Toleration có bắt buộc Pod phải được schedule trên Node có taint không?**

- A. Có
- B. Không

> **Đáp án:** B — Toleration chỉ cho phép Pod chạy trên Node có taint, không bắt buộc Pod chọn Node đó; muốn dành Node cần kết hợp thêm Node Affinity.

**6. Node còn CPU/RAM nhưng Pod Pending. Nguyên nhân có thể là gì?**

- A. NodeSelector hoặc affinity không khớp
- B. Chắc chắn Docker image lỗi

> **Đáp án:** A — Pending là vấn đề scheduling; lỗi image thường biểu hiện là `ImagePullBackOff` sau khi Pod đã được schedule.

**7. Cordon và Drain khác gì?**

- A. Cordon ngừng nhận Pods mới; Drain evict Pods phù hợp
- B. Hai lệnh giống nhau

> **Đáp án:** A — `cordon` chỉ chặn scheduling mới, `drain` evict các Pods phù hợp để bảo trì Node.

**8. Khi Pod terminate, ứng dụng nên làm gì khi nhận SIGTERM?**

- A. Ngừng nhận việc mới và hoàn thành công việc đang xử lý
- B. Luôn bỏ qua signal

> **Đáp án:** A — Đây là graceful shutdown; bỏ qua SIGTERM sẽ dẫn đến bị SIGKILL khi hết thời gian grace.

## Tổng kết Giai đoạn 3 — Những gì cần thuộc

| Chủ đề                | Kiến thức cốt lõi                                                     |
| --------------------- | --------------------------------------------------------------------- |
| HPA                   | Tự scale replicas theo metrics; CPU utilization dựa trên requests     |
| Job                   | Chạy task hữu hạn, hỗ trợ retry và parallelism                        |
| CronJob               | Tạo Jobs theo lịch, cần kiểm soát concurrency và idempotency          |
| DaemonSet             | Duy trì một agent Pod trên mỗi Node đủ điều kiện                      |
| Scheduling            | Chọn Node dựa trên requests, taints, affinity và topology             |
| Graceful Shutdown     | Xử lý SIGTERM, drain traffic, hoàn tất request trước khi dừng         |
| PDB / Node Operations | Giảm gián đoạn khi bảo trì Node                                       |
| Troubleshooting       | Xác định lỗi qua trạng thái, Events, Logs, Metrics và Node conditions |

### Khi nào có thể nói đã vững Giai đoạn 3?

Bạn cần tự làm được bốn tình huống:

1. API tăng traffic → HPA scale Pods → giải thích vì sao Pods có thể Pending khi thiếu Node capacity.
2. Batch Job thất bại → trace logs/Events → hiểu retry và tránh xử lý trùng.
3. Deployment rollout gây 502 → xác định nguyên nhân từ readiness, endpoints đến SIGTERM/draining.
4. Pod không schedule được → phân biệt thiếu tài nguyên với taints, affinity và storage constraints.

Nếu làm được mà không cần làm theo từng bước có sẵn, bạn đã có nền tảng vận hành Kubernetes tương đối chắc.

Giai đoạn tiếp theo: Giai đoạn 4 — Production Platform, gồm Helm, Prometheus, Grafana, Loki, CI/CD, ArgoCD, Argo Rollouts và Kubernetes Security Hardening. Đây là bước chuyển từ quản lý từng resource sang quản lý cả quy trình triển khai và vận hành nền tảng.