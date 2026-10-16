# Kubernetes Note #6 — Resource Requests & Limits

![Kubernetes Note #6 — Resource Requests & Limits](image/Kubernetes%20Note%20%236%20%E2%80%94%20Resource%20Requests%20%26%20Limits.png)

Đây là phần **rất quan trọng cho production**.

## 1. Hai khái niệm

Mỗi container có thể khai báo:

```yaml
resources:
  requests:
  limits:
```

Ví dụ:

```yaml
resources:
  requests:
    cpu: 250m
    memory: 128Mi

  limits:
    cpu: 500m
    memory: 256Mi
```

Requests/limits kiểm soát CPU/memory của **từng container** và giúp scheduler quyết định đặt Pod lên Node nào.

---

## 2. Request là gì?

> Lượng resource được **đặt trước (reserve)** cho container. Scheduler dùng con số này để chọn Node.

Ví dụ:

```yaml
requests:
  cpu: 500m
  memory: 512Mi
```

Scheduler tìm Node có:

```text
Node allocatable - tổng requests của Pod đang chạy >= request của Pod mới
```

> **Lưu ý:**
>
> - Scheduler chỉ nhìn **requests**, không nhìn usage thực tế.
> - Container **được phép dùng nhiều hơn request** nếu Node còn dư (cho tới limit).
> - CPU request còn quyết định tỷ lệ chia CPU khi Node bị tranh chấp CPU.

---

## 3. Limit là gì?

Mức tối đa container được dùng, do kernel (cgroups) enforce.

Ví dụ:

```yaml
limits:
  cpu: "1"
  memory: 1Gi
```

> **Bổ sung:** nếu chỉ khai báo `limits` mà không khai báo `requests`, Kubernetes tự đặt **request = limit**.

---

## 4. CPU units

```text
1 CPU = 1000m
```

`m` = millicore.

```text
100m  = 0.1 CPU
250m  = 0.25 CPU
500m  = 0.5 CPU
1000m = 1 CPU
```

1 CPU = 1 vCPU/core (AWS vCPU, hyperthread trên bare-metal).

---

## 5. Memory units

| Hậu tố | Loại | Giá trị |
|---|---|---|
| `Ki`, `Mi`, `Gi` | binary | 1Mi = 2^20 = 1,048,576 bytes |
| `K`, `M`, `G` | decimal | 1M = 10^6 = 1,000,000 bytes |

Thường dùng:

```text
128Mi
256Mi
512Mi
1Gi
```

> **Lỗi rất hay gặp:** `memory: 128m` nghĩa là 0.128 **byte** (`m` = milli), không phải 128 MB. Memory luôn dùng `Mi`/`Gi`.

---

## 6. CPU vượt limit

```text
CPU usage > CPU limit
```

=> container bị **CPU throttling**.

Application chạy chậm đi (latency tăng), **không bị kill** vì CPU.

CPU là resource **compressible**: có thể bóp lại mà không làm chết process.

---

## 7. Memory vượt limit

```text
memory usage > memory limit
```

=> kernel kill process:

```text
OOMKilled
exit code 137
```

Memory là resource **incompressible**: không thể "bóp" bớt memory đang dùng, chỉ có thể kill.

Sau khi bị kill, container được restart theo `restartPolicy` (Deployment Pod luôn là `Always`). Bị OOMKilled lặp lại → `CrashLoopBackOff`.

Kiểm tra:

```bash
kubectl describe pod <pod>
```

Tìm:

```text
Last State:  Terminated
Reason:      OOMKilled
Exit Code:   137
```

---

## 8. Scheduler và requests

Giả sử Node allocatable:

```text
4 CPU
8 Gi RAM
```

Tổng requests đang có:

```text
3 CPU
6 Gi
```

Pod mới request:

```text
2 CPU
4 Gi
```

3 + 2 = 5 CPU > 4 CPU → Node không đủ.

Nếu không Node nào đủ, Pod ở trạng thái:

```text
Pending
```

`kubectl describe pod` sẽ có event:

```text
FailedScheduling ... Insufficient cpu
```

> **Lưu ý:** scheduler so với **allocatable**, không phải tổng capacity của Node. Allocatable = capacity trừ phần dành cho OS, kubelet, system daemons.
>
> ```bash
> kubectl describe node <node>
> ```
>
> xem `Capacity`, `Allocatable`, `Allocated resources`.

---

## 9. Course recommendation

Recommendation của course:

```text
CPU
→ luôn đặt request
→ tránh đặt CPU limit (để tránh throttling không cần thiết)

Memory
→ đặt limit
→ request gần bằng / bằng limit
```

và phải **monitor workload thực tế rồi tune lại**, không thể đoán chính xác từ ngày đầu.

Đây là **recommendation của course** (và khá phổ biến trong cộng đồng), không phải universal rule. Một số tổ chức vẫn bắt buộc CPU limit, ví dụ do ResourceQuota yêu cầu `limits.cpu` hoặc để workload có hành vi dễ dự đoán.

---

## 10. QoS class và eviction

Kubernetes tự gán **QoS class** cho Pod dựa trên requests/limits:

| QoS class | Điều kiện | Khi Node thiếu memory |
|---|---|---|
| Guaranteed | Mọi container có CPU **và** memory request = limit | Bị evict sau cùng |
| Burstable | Có ít nhất một request/limit nhưng không đạt Guaranteed | Ở giữa |
| BestEffort | Không container nào có request/limit | Bị evict đầu tiên |

Xem QoS:

```bash
kubectl get pod <pod> -o jsonpath='{.status.qosClass}'
```

Khi Node thiếu memory/disk, kubelet **evict** Pod theo thứ tự trên (kết hợp với mức vượt request và Pod priority).

Keywords để học sâu sau:

```text
QoS
eviction
PriorityClass
preemption
```
