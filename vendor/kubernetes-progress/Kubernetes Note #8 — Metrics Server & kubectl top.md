# Kubernetes Note #8 — Metrics Server & kubectl top

![Kubernetes Note #8 — Metrics Server & kubectl top](image/Kubernetes%20Note%20%238%20%E2%80%94%20Metrics%20Server%20%26%20kubectl%20top.png)

## 1. Metrics Server để làm gì?

Thu thập resource metrics:

```text
CPU
Memory
```

cho Pod/Node, và expose qua **Metrics API** (`metrics.k8s.io`).

Ai dùng Metrics API:

```text
kubectl top
HorizontalPodAutoscaler (HPA)
VerticalPodAutoscaler (VPA)
```

Flow:

```text
kubelet (cAdvisor) trên mỗi Node
        ↓
Metrics Server
        ↓
kube-apiserver (metrics.k8s.io)
        ↓
kubectl top / HPA
```

> **Quan trọng:** Metrics Server chỉ giữ số liệu **mới nhất trong memory**, không lưu lịch sử. Nó **không** phải monitoring system. Muốn dashboard, lịch sử, alert → dùng Prometheus/Grafana (Observability module).

---

## 2. Cài đặt

### Minikube

Check addons:

```bash
minikube addons list
```

Enable:

```bash
minikube addons enable metrics-server
```

Check:

```bash
kubectl get pods -n kube-system
kubectl get deployment metrics-server -n kube-system
```

### Cluster khác

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

EKS/GKE/AKS: nhiều nơi đã cài sẵn hoặc có add-on.

> Sau khi cài cần chờ khoảng 1 phút để có số liệu. Nếu gặp:
>
> ```text
> error: Metrics API not available
> ```
>
> thì Metrics Server chưa chạy xong hoặc chưa được cài.

---

## 3. kubectl top

Pods:

```bash
kubectl top pods
```

Nodes:

```bash
kubectl top nodes
```

Output thật:

```text
NAME    CPU(cores)   MEMORY(bytes)
app1    35m          40Mi
```

```text
NAME       CPU(cores)   CPU(%)   MEMORY(bytes)   MEMORY(%)
minikube   250m         12%      1100Mi          28%
```

Option hữu ích:

```bash
kubectl top pods -A
kubectl top pods -n dev
kubectl top pods --containers
kubectl top pods --sort-by=cpu
kubectl top pods --sort-by=memory
```

---

## 4. Request != usage

Rất quan trọng.

Bạn có thể request:

```text
1 CPU
1 Gi RAM
```

nhưng actual usage chỉ:

```text
35m CPU
40 Mi RAM
```

| Câu hỏi | Lệnh |
|---|---|
| Container đã **đặt trước** bao nhiêu? | `kubectl describe pod` / `kubectl describe node` (Allocated resources) |
| Container đang **dùng thực tế** bao nhiêu? | `kubectl top pods` |

Request quá cao so với usage → lãng phí capacity, Node "đầy" dù CPU thực tế rảnh.

Request quá thấp → Pod bị nhồi lên Node quá nhiều, dễ tranh chấp resource/bị evict.

`kubectl top` là dữ liệu đầu vào để tune requests/limits. Với production, tune dựa trên số liệu lịch sử (Prometheus) theo peak, không chỉ một lần `kubectl top`.
