# Kubernetes — Giai đoạn 4: Production Platform

*Advanced · Helm · Observability · CI/CD · GitOps · Security · Hands-on*

Giai đoạn 1–3 giúp bạn hiểu cách Kubernetes chạy ứng dụng, quản lý network, scale và xử lý sự cố.

Giai đoạn 4 là bước chuyển từ quản lý Kubernetes bằng các lệnh riêng lẻ sang xây dựng một nền tảng triển khai, giám sát và vận hành ứng dụng có thể lặp lại, kiểm soát và khôi phục.

Bạn sẽ học 7 nhóm kiến thức (Production Platform Learning Checklist):

1. **Helm** — Đóng gói Kubernetes manifests thành ứng dụng có thể cài đặt và nâng cấp.
2. **Prometheus & Grafana** — Metrics, dashboards, alerting.
3. **Loki & Centralized Logging** — Thu thập và truy vấn logs tập trung.
4. **CI/CD với GitHub Actions** — Build, test, scan, push container image.
5. **ArgoCD & GitOps** — Git là nguồn khai báo trạng thái triển khai.
6. **Argo Rollouts** — Canary, Blue/Green và rollback.
7. **Security Hardening** — Bảo vệ workloads và software supply chain.

Trong bộ Kubernetes 46 Labs, phần này chủ yếu tương ứng với Lab 27–32, Lab 40, cùng Lab 23 về security contexts. Những nội dung như OpenTelemetry, image signing, alert runbooks và supply-chain security là phần mình bổ sung để bạn hiểu cách vận hành production hiện đại.

# Phần 1 — Helm: Kubernetes Package Manager

## 1. Tại sao cần Helm?

Giả sử một ứng dụng có 10 Kubernetes manifests:

```text
namespace.yaml
configmap.yaml
secret.yaml
deployment.yaml
service.yaml
ingress.yaml
hpa.yaml
pdb.yaml
serviceaccount.yaml
networkpolicy.yaml
```

Nếu triển khai nhiều môi trường `dev`, `staging`, `production`, bạn sẽ cần thay đổi replicas, domain, image tag, resources và secrets theo từng nơi.

Thay vì copy YAML nhiều lần, Helm dùng templates và values để tạo ra Kubernetes manifests phù hợp với từng môi trường.

```text
Chart Templates                    Values
(Deployment, Service, HPA...)      (Image, replicas, resources...)
              \                    /
               v                  v
               Helm Template Engine
                        |
                        v
              Rendered Kubernetes YAML
                        |
                        v
     Được gửi đến Kubernetes API Server
```

## 2. Cấu trúc một Helm Chart

```text
backend-chart/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-prod.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── configmap.yaml
    ├── hpa.yaml
    └── _helpers.tpl
```

| Thành phần         | Ý nghĩa                             |
| ------------------ | ----------------------------------- |
| `Chart.yaml`       | Metadata của Chart                  |
| `values.yaml`      | Configuration mặc định              |
| `templates/`       | Templates để render Kubernetes YAML |
| `_helpers.tpl`     | Các helper template tái sử dụng     |
| `values-prod.yaml` | Values override cho production      |

### Ví dụ values.yaml

```yaml
replicaCount: 2

image:
  repository: nginx
  tag: "1.27-alpine"

service:
  port: 80

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### Template Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-backend
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}-backend
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-backend
    spec:
      containers:
        - name: backend
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

Trong đó:

- `.Values.replicaCount` lấy giá trị từ values.
- `.Release.Name` là tên release khi Helm cài ứng dụng.
- `toYaml` chuyển object thành YAML.
- `nindent` hỗ trợ indent đúng.

### Những lệnh Helm phải thuộc

```bash
# Tạo Chart
helm create backend-chart

# Kiểm tra Chart
helm lint ./backend-chart

# Render YAML để xem trước
helm template backend ./backend-chart

# Cài đặt hoặc nâng cấp
helm upgrade --install backend ./backend-chart \
  -n development --create-namespace

# Xem releases
helm list -n development

# Xem lịch sử
helm history backend -n development

# Rollback
helm rollback backend 1 -n development

# Gỡ release
helm uninstall backend -n development
```

> **Lưu ý:** Helm rollback khôi phục release revision được Helm lưu, khác với `kubectl rollout undo` của Deployment. Helm revision và Kubernetes Deployment revision không phải cùng một hệ thống.

## 3. Helm trong production

Các nguyên tắc nên áp dụng:

- Validate bằng `helm lint` và `helm template`.
- Dùng chart và image versions cố định.
- Không lưu plaintext secrets trong Git.
- Sử dụng `helm upgrade --install --wait --timeout` để kiểm soát trạng thái rollout.
- Kiểm tra `helm diff` trước thay đổi lớn nếu có plugin.
- Hiểu `--atomic` hoặc cơ chế rollback của phiên bản Helm đang dùng; đừng giả định tất cả resources đều được khôi phục hoàn toàn như database data.

**Khi nào dùng Helm?** Khi bạn cần tái sử dụng manifests, quản lý cấu hình nhiều môi trường, cài các nền tảng như Prometheus và ArgoCD, hoặc quản lý ứng dụng theo release.

# Phần 2 — Prometheus & Grafana

## 4. Observability là gì?

Monitoring trả lời: *Hệ thống có đang gặp vấn đề không?*

Observability giúp trả lời sâu hơn: *Vì sao hệ thống gặp vấn đề?*

Ba nguồn dữ liệu cốt lõi:

| Nguồn   | Nội dung                       |
| ------- | ------------------------------ |
| Metrics | CPU, RPS, latency, errors      |
| Logs    | Events, errors, messages       |
| Traces  | Luồng request qua các services |

## 5. Prometheus hoạt động thế nào?

Prometheus là hệ thống thu thập và truy vấn time-series metrics.

```text
App /metrics        Node / Kubelet
        \              /
         v            v
          Prometheus
   (Scrape · Store · PromQL)
         /            \
        v              v
   Grafana          Alertmanager
 (Dashboards)       (Route alerts)
```

Trong Kubernetes, bộ `kube-prometheus-stack` thường cung cấp Prometheus Operator, Prometheus, Alertmanager, exporters và Grafana theo cấu hình Chart.

### Các loại metrics

| Type      | Ý nghĩa                          | Ví dụ              |
| --------- | -------------------------------- | ------------------ |
| Counter   | Giá trị tích lũy, thường tăng    | HTTP request total |
| Gauge     | Có thể tăng hoặc giảm            | Memory usage       |
| Histogram | Phân phối giá trị trong buckets  | Request duration   |
| Summary   | Quantiles và thống kê tại client | Duration summary   |

## 6. PromQL cần biết

### CPU container usage

```text
rate(container_cpu_usage_seconds_total{
  namespace="production",
  container!="",
  container!="POD"
}[5m])
```

### Memory usage

```text
container_memory_working_set_bytes{
  namespace="production",
  container!="",
  container!="POD"
}
```

### CPU throttling ratio

```text
rate(container_cpu_cfs_throttled_periods_total{
  namespace="production"
}[5m])
/
rate(container_cpu_cfs_periods_total{
  namespace="production"
}[5m])
```

Tỷ lệ này thể hiện phần trăm CFS periods có throttling, không phải chính xác phần trăm thời gian CPU bị mất.

### HTTP 5xx error ratio

```text
sum(rate(http_requests_total{
  status=~"5.."
}[5m]))
/
sum(rate(http_requests_total[5m]))
```

Tên metric và labels phụ thuộc instrumentation của ứng dụng; không phải mọi app đều có metric `http_requests_total` hay label `status`.

### p95 latency từ Histogram

```text
histogram_quantile(
  0.95,
  sum by (le) (
    rate(http_request_duration_seconds_bucket[5m])
  )
)
```

Đây là ví dụ với classic histogram. Nếu hệ thống sử dụng native histogram hoặc metric names khác, query cần điều chỉnh.

## 7. RED & USE Method

Đây là hai mô hình monitoring rất nên nhớ.

| RED — Application     | USE — Infrastructure                    |
| --------------------- | --------------------------------------- |
| Rate: Requests/second | Utilization: CPU/RAM usage              |
| Errors: Error rate    | Saturation: Throttling, queue, pressure |
| Duration: Latency     | Errors: Hardware/system errors          |

Ví dụ backend API:

- RPS = 500.
- 5xx error rate = 3%.
- p95 latency = 1.8s.

Bạn cần xác định CPU throttling, database latency hoặc upstream timeout có tương quan với thời điểm lỗi không.

## 8. Alerting

Một alert không chỉ nên nói “CPU cao”.

Alert tốt cần thể hiện tình trạng ảnh hưởng hoặc nguy cơ có hành động cụ thể.

Ví dụ rule minh họa:

```yaml
groups:
  - name: backend-alerts
    rules:
      - alert: BackendHighErrorRate
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[5m]))
            /
            sum(rate(http_requests_total[5m]))
          ) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Backend 5xx ratio above 5%"
```

Production cần scope theo service/environment, đủ traffic tối thiểu và tránh chia cho zero. Đây là mẫu học cú pháp, chưa phải alert hoàn thiện.

Prometheus đánh giá rules; Alertmanager nhóm, định tuyến và gửi notifications theo cấu hình.

# Phần 3 — Loki & Centralized Logging

## 9. Tại sao cần Centralized Logging?

Giả sử Deployment có 10 Pods trên 4 Nodes. Một Pod crash rồi được tạo lại.

Nếu chỉ dùng:

```bash
kubectl logs <pod-name>
```

bạn có thể gặp các vấn đề:

- Pod cũ đã bị xóa.
- Logs nằm trên nhiều Nodes.
- Không thể tìm kiếm dễ dàng toàn bộ requests lỗi.
- Khó tương quan logs giữa nhiều services.

Centralized Logging tập trung logs về một hệ thống để lưu trữ, tìm kiếm và phân tích.

## 10. Loki hoạt động như thế nào?

```text
Kubernetes Pods
  (Container stdout/stderr logs)
        |
        v
Log Collector
  (Grafana Alloy / Fluent Bit / các collector tương thích)
        |
        v
Loki
  (Ingest · Index labels · Store logs)
        |
        v
Grafana Explore
  (LogQL queries)
```

Tài liệu gốc Lab 28 sử dụng Loki + Promtail. Đó là stack được dạy trong giáo trình. Với triển khai mới, cần lưu ý Promtail đã kết thúc vòng đời hỗ trợ; nên cân nhắc Grafana Alloy hoặc log collector được hỗ trợ khác thay vì bắt đầu hệ thống production mới bằng Promtail.

## 11. LogQL

LogQL là ngôn ngữ truy vấn logs của Loki.

### Tìm logs của backend

```text
{namespace="production", app="backend"}
```

### Tìm lỗi

```text
{namespace="production", app="backend"} |= "ERROR"
```

### Tìm 502

```text
{namespace="production"} |= "502"
```

### Đếm lỗi trong 5 phút

```text
sum(
  count_over_time(
    {namespace="production", app="backend"} |= "ERROR" [5m]
  )
)
```

Các labels trong ví dụ phụ thuộc cấu hình log collector.

## 12. Structured Logging

Thay vì:

```text
Something went wrong
```

Hãy ưu tiên structured logs:

```json
{
  "level": "error",
  "service": "backend",
  "event": "database_timeout",
  "request_id": "req-123",
  "duration_ms": 5000
}
```

Lợi ích:

- Tìm kiếm theo service và event.
- Liên kết request với logs.
- Phân biệt application error và infrastructure error.
- Điều tra incident nhanh hơn.

### Logs vs Metrics vs Traces

Ví dụ khách hàng báo API chậm:

| Nguồn               | Bạn tìm được gì?                           |
| ------------------- | ------------------------------------------ |
| Grafana Metrics     | p95 latency tăng từ 100ms lên 2s           |
| Loki Logs           | Nhiều lỗi `database_timeout`               |
| Distributed Tracing | 1.8s trong 2s request nằm ở database query |

Tracing thường được xây dựng bằng OpenTelemetry và backend như Tempo hoặc Jaeger.

> **Production lưu ý:** Đừng log API keys, access tokens, passwords hoặc thông tin cá nhân không cần thiết. Với Loki, tránh đưa `user_id`, `request_id` hay giá trị có cardinality rất cao thành indexed labels.

# Phần 4 — CI/CD với GitHub Actions

## 13. CI/CD là gì?

- **CI (Continuous Integration):** Tự động build, test và kiểm tra code.
- **CD (Continuous Delivery/Deployment):** Đưa phiên bản đã kiểm tra đến môi trường triển khai, bằng phê duyệt thủ công hoặc tự động tùy chính sách.

Quy trình tham khảo:

```text
Git Push              Developer tạo commit
   |
   v
CI Pipeline           Lint · Unit Tests · Integration Tests
   |
   v
Security Checks       Dependency / Image Scan
   |
   v
Build & Push Image    Registry: ECR / GHCR
   |
   v
Update GitOps Repo    Image digest hoặc version
   |
   v
ArgoCD Sync           Kubernetes rollout
```

## 14. GitHub Actions Workflow

Ví dụ đơn giản để validate Helm Chart khi có Pull Request:

```yaml
name: Helm CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: azure/setup-helm@v4
        with:
          version: v3.17.0

      - name: Helm Lint
        run: helm lint ./charts/backend

      - name: Render Templates
        run: |
          helm template backend ./charts/backend \
            --values ./charts/backend/values.yaml \
            > /tmp/backend-rendered.yaml
```

Đây là pipeline validation; nó chưa build hoặc deploy ứng dụng.

Với production, nên pin GitHub Actions bằng commit SHA đã kiểm tra, thay vì chỉ dùng major tags như `@v4`, để giảm rủi ro thay đổi không mong muốn.

### Pipeline đầy đủ nên có

| Stage    | Kiểm tra                                |
| -------- | --------------------------------------- |
| Lint     | Code style, formatting                  |
| Test     | Unit/integration tests                  |
| Security | Dependency, secrets và container scan   |
| Build    | Docker image                            |
| Publish  | Push registry, ưu tiên immutable digest |
| Delivery | Update GitOps desired state             |
| Deploy   | ArgoCD reconcile                        |
| Verify   | Readiness, metrics, smoke tests         |

## 15. Image Tags và Immutability

Không nên dựa vào:

```yaml
image: myapp:latest
```

Vì `latest` là mutable tag, có thể thay đổi mà không thể hiện rõ trong Git.

Tốt hơn:

```yaml
image: myapp:v1.2.3
```

Và chặt chẽ hơn:

```yaml
image: myapp@sha256:<verified-image-digest>
```

Digest cố định chính xác image artifact.

> **Production rule:** Code cần được kiểm tra, image cần có provenance phù hợp và deployment cần truy vết được commit → image → release.

# Phần 5 — ArgoCD & GitOps

## 16. GitOps là gì?

GitOps là mô hình vận hành trong đó desired state được quản lý trong Git và một controller liên tục reconcile cluster theo trạng thái đó.

Ví dụ:

```text
Git: replicas = 3
Cluster: replicas = 5
```

Nếu ứng dụng ArgoCD được cấu hình self-heal, controller có thể đưa cluster quay về `replicas: 3`.

Đó gọi là drift correction.

## 17. GitOps Workflow

```text
Git Repository
  (Desired state: manifests / Helm values)
        |
        v
ArgoCD
  (Compare desired vs live state)
        |
        v
Kubernetes Cluster
  (Sync · Health · Rollout)
```

### Ví dụ repository

```text
gitops/
├── apps/
│   └── backend/
│       ├── deployment.yaml
│       ├── service.yaml
│       └── hpa.yaml
└── environments/
    ├── dev/
    ├── staging/
    └── production/
```

Một tổ chức có thể dùng Kustomize hoặc Helm để tránh duplication.

## 18. ArgoCD Application Manifest

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: backend
  namespace: argocd
spec:
  project: default

  source:
    repoURL: https://github.com/example/k8s-gitops.git
    targetRevision: main
    path: environments/development

  destination:
    server: https://kubernetes.default.svc
    namespace: development

  syncPolicy:
    automated:
      prune: false
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

Ví dụ này yêu cầu ArgoCD đã được cài và CRD `Application` có sẵn. Repository là địa chỉ minh họa.

### Các trạng thái ArgoCD

| Status      | Ý nghĩa                                            |
| ----------- | -------------------------------------------------- |
| Synced      | Desired và live state khớp theo so sánh của ArgoCD |
| OutOfSync   | Có drift                                           |
| Healthy     | Resources đạt health criteria                      |
| Progressing | Đang triển khai/chưa hoàn tất                      |
| Degraded    | Có resource báo lỗi                                |

Synced không đồng nghĩa Healthy. YAML có thể được apply đúng nhưng Pod vẫn `CrashLoopBackOff`.

## 19. SelfHeal và Prune

- `selfHeal: true`: ArgoCD cố sửa drift do live cluster thay đổi.
- `prune: true`: ArgoCD có thể xóa resources được quản lý nhưng không còn trong desired state.

Phải hết sức cẩn thận khi bật `prune`, nhất là với storage resources và các workloads có dữ liệu.

### Tại sao không nên chỉnh production bằng kubectl edit?

Nếu GitOps đang quản lý resource:

```bash
kubectl edit deployment backend -n production
```

thì thay đổi có thể bị ArgoCD ghi đè trong một lần reconcile.

Giải pháp đúng về lâu dài là sửa GitOps manifests, review PR, merge và để ArgoCD sync.

Trong incident khẩn cấp, có thể cần quy trình break-glass, nhưng phải ghi lại và đồng bộ lại Git sau đó.

# Phần 6 — Argo Rollouts: Progressive Delivery

## 20. Tại sao cần Argo Rollouts?

Deployment `RollingUpdate` cho phép thay Pod từng phần, nhưng không cung cấp sẵn các bước phân tích metrics hoặc điều khiển traffic canary nâng cao.

Argo Rollouts mở rộng cách triển khai ứng dụng bằng các chiến lược như Canary và Blue/Green, có thể kết hợp metrics để quyết định tiếp tục hoặc hủy rollout.

## 21. Canary Deployment

Ví dụ phát hành version v2:

```text
Canary — Phân phối traffic theo giai đoạn

Giai đoạn:  10%  ->  25%  ->  50%  ->  100%

Ví dụ ở giai đoạn 10%:
  Stable v1  : 90% traffic
  Canary v2  : 10% traffic
```

Minh họa weighted traffic. Để kiểm soát tỷ lệ traffic chính xác cần traffic-routing provider hỗ trợ; không có provider thì weight có thể được mô phỏng bằng tỷ lệ replicas.

Quy trình:

1. Deploy v2 cho một phần traffic.
2. Theo dõi 5xx, latency và business metrics.
3. Nếu tốt, tăng tỷ trọng v2.
4. Nếu lỗi, abort và khôi phục traffic về stable version.
5. Nếu tất cả checks đạt, promote v2.

### Canary vs Blue/Green

| Canary                                  | Blue/Green                          |
| --------------------------------------- | ----------------------------------- |
| Phát hành dần cho một phần traffic      | Có hai môi trường/version song song |
| Theo dõi metrics từng giai đoạn         | Chuyển traffic giữa blue và green   |
| Giảm blast radius khi thử phiên bản mới | Có thể chuyển đổi nhanh             |
| Cần quản lý phân phối traffic/replicas  | Cần capacity cho hai phiên bản      |

## 22. Argo Rollouts Manifest

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: backend
spec:
  replicas: 4

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

  strategy:
    canary:
      steps:
        - setWeight: 25
        - pause:
            duration: 60s
        - setWeight: 50
        - pause:
            duration: 60s
```

Đây là mẫu Rollout cơ bản. Nó yêu cầu Argo Rollouts Controller và CRDs. Chưa có analysis metrics, nên không tự quyết định rollback dựa trên 5xx.

### AnalysisTemplate

Để tự đánh giá canary, bạn có thể cấu hình AnalysisTemplate với Prometheus provider.

Ví dụ logic:

```text
Canary v2
  ↓
Query Prometheus
  ↓
5xx rate < threshold?
  ├── Yes → Continue rollout
  └── No  → Abort rollout
```

Threshold nên dựa trên SLO, traffic volume và chất lượng metrics, không chọn tùy tiện.

### Argo Rollouts và ArgoCD khác nhau

ArgoCD quản lý desired state và reconciliation theo Git.

Argo Rollouts quản lý chiến lược đưa phiên bản mới vào phục vụ traffic.

Chúng thường được dùng cùng nhau, nhưng không thay thế cho nhau.

# Phần 7 — Kubernetes Security Hardening

## 23. Các lớp bảo mật cần quan tâm

Bảo mật Kubernetes không chỉ là tạo Secret và RBAC.

| Lớp               | Nội dung                                              |
| ----------------- | ----------------------------------------------------- |
| Source & CI       | Code review, dependency scanning, secret scanning     |
| Container Image   | Minimal image, vulnerability scanning, provenance     |
| Pod Security      | Non-root, capabilities, seccomp, read-only filesystem |
| Kubernetes API    | RBAC, ServiceAccount, audit logs                      |
| Networking        | NetworkPolicy, TLS, restricted exposure               |
| Secrets & Storage | Encryption, access controls, rotation, backup         |

## 24. SecurityContext

Ví dụ hardening một container:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hardened-app
spec:
  automountServiceAccountToken: false

  securityContext:
    runAsNonRoot: true
    runAsUser: 10001
    runAsGroup: 10001
    seccompProfile:
      type: RuntimeDefault

  containers:
    - name: app
      image: example/app:1.0.0

      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL

      resources:
        requests:
          cpu: "100m"
          memory: "128Mi"
        limits:
          cpu: "500m"
          memory: "512Mi"
```

Đây là mẫu chính sách, không phải Pod có thể chạy được ngay: image là placeholder, ứng dụng phải hỗ trợ chạy non-root và filesystem read-only. Có thể cần mount `emptyDir` cho các đường dẫn phải ghi.

### Những cấu hình nên biết

| Setting                               | Mục đích                                  |
| ------------------------------------- | ----------------------------------------- |
| `runAsNonRoot`                        | Ngăn container chạy với root user         |
| `allowPrivilegeEscalation: false`     | Hạn chế tăng quyền                        |
| `capabilities.drop: ALL`              | Loại bỏ Linux capabilities mặc định       |
| `readOnlyRootFilesystem: true`        | Ngăn ghi vào root filesystem              |
| `seccompProfile: RuntimeDefault`      | Dùng seccomp profile mặc định của runtime |
| `automountServiceAccountToken: false` | Không tự mount API token khi không cần    |

## 25. Pod Security Admission

Kubernetes hỗ trợ ba Pod Security Standards:

| Profile    | Mục đích                                   |
| ---------- | ------------------------------------------ |
| Privileged | Hạn chế rất ít                             |
| Baseline   | Ngăn một số cấu hình đặc quyền nguy hiểm   |
| Restricted | Áp dụng nhiều hạn chế bảo mật chặt chẽ hơn |

Có thể cấu hình enforcement theo namespace labels:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: restricted-apps
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

Không nên bật enforcement `restricted` lên tất cả namespaces production ngay lập tức nếu chưa kiểm thử compatibility của workloads và system agents.

## 26. Security Production Checklist

- Workload không chạy privileged trừ trường hợp thực sự cần.
- ServiceAccount có quyền tối thiểu.
- Credentials không nằm trong Git.
- Secret data được mã hóa và quyền truy cập được giới hạn.
- Images được kiểm tra vulnerability.
- Images có tag/digest xác định và nguồn đáng tin cậy.
- NetworkPolicy giới hạn traffic phù hợp.
- Kubernetes API access có audit trail.
- Có quy trình rotation, backup, restore và incident response.

> **Quan trọng:** Security hardening phải đi cùng kiểm chứng chức năng. Một container an toàn về cấu hình nhưng không startup được không phải kết quả deploy tốt.

# Phần 8 — Lab tích hợp trên `kind-lab`

Đây là lab thực hành nhẹ để củng cố Helm, CI validation, security và quy trình GitOps. Mình không tự cài Prometheus, Loki, ArgoCD hoặc Argo Rollouts vào cluster hiện tại vì các stack đó cần chuẩn bị tài nguyên, controller và cấu hình riêng.

## 27. Kiến trúc bài thực hành

```text
Helm Chart
  (Templates + values.yaml)
        |
        v
Validate
  (helm lint + helm template)
        |
        v
Kind Cluster
  (Deployment + Service + Helm Release)
```

## 28. Setup

```bash
kubectl config current-context
kubectl get nodes
helm version

kubectl create namespace platform-lab \
  --dry-run=client -o yaml | kubectl apply -f -

mkdir -p ~/work/platform-lab
cd ~/work/platform-lab
```

Context phải là `kind-lab`.

## 29. Tạo Helm Chart

```bash
helm create platform-demo
```

Helm tạo sẵn cấu trúc Chart cùng các templates mẫu.

Xem:

```bash
find platform-demo -maxdepth 2 -type f
```

Kiểm tra file `platform-demo/values.yaml`, tìm các cấu hình image, replicaCount, service và resources. Các tên field chính xác có thể thay đổi tùy phiên bản Helm.

### Validate

```bash
helm lint ./platform-demo

helm template demo ./platform-demo \
  -n platform-lab > rendered.yaml
```

Xem các resource sẽ được tạo:

```bash
grep -E "^kind:|^  name:" rendered.yaml
```

### Install

```bash
helm upgrade --install demo ./platform-demo \
  -n platform-lab \
  --wait --timeout 3m
```

Kiểm tra:

```bash
helm list -n platform-lab

kubectl get deploy,pods,svc -n platform-lab
```

Tùy templates mặc định, release có thể sử dụng ServiceAccount hoặc resources khác.

Nếu image mặc định bị lỗi pull, bạn cần kiểm tra image repository/tag thực tế trong `values.yaml`, thay vì giả định mọi phiên bản scaffold dùng cùng một image.

## 30. Upgrade & Rollback

Sửa giá trị `replicaCount` trong `values.yaml`, ví dụ từ 1 sang 3.

Upgrade:

```bash
helm upgrade demo ./platform-demo \
  -n platform-lab \
  --wait --timeout 3m
```

Kiểm tra:

```bash
helm history demo -n platform-lab

kubectl get deploy,pods -n platform-lab
```

Rollback về revision 1:

```bash
helm rollback demo 1 \
  -n platform-lab \
  --wait --timeout 3m
```

Kiểm tra lại:

```bash
helm history demo -n platform-lab

kubectl get deploy,pods -n platform-lab
```

**Expected:** Chart cài đặt thành công, thay đổi số replicas theo cấu hình rồi rollback về manifest của revision 1.

## 31. Mô phỏng Configuration Drift

Chỉ thực hiện trong namespace lab.

Đầu tiên kiểm tra Deployment mà Chart đã tạo:

```bash
kubectl get deployments -n platform-lab
```

Giả sử tên Deployment là `demo-platform-demo`.

Thay đổi thủ công:

```bash
kubectl scale deployment/demo-platform-demo \
  --replicas=4 -n platform-lab
```

Quan sát:

```bash
kubectl get deploy -n platform-lab
```

Đây là configuration drift so với values trong Git/Chart.

Trong lab này chưa có ArgoCD nên sẽ không có controller tự động sửa drift dựa trên Git. Helm cũng không liên tục reconcile cluster như ArgoCD.

Có thể đưa về desired replicas bằng lệnh scale tương ứng, hoặc chạy lại Helm upgrade theo một quy trình release có kiểm soát và xác minh live state sau đó.

## 32. CI Validation

Tạo file `.github/workflows/helm-ci.yaml` trong repository của bạn:

```yaml
name: Helm Validation

on:
  pull_request:

permissions:
  contents: read

jobs:
  helm-lint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: azure/setup-helm@v4
        with:
          version: v3.17.0

      - run: helm lint ./platform-demo

      - run: |
          helm template demo ./platform-demo \
            -n platform-lab > /tmp/rendered.yaml
```

Đây là bản CI học tập; trong repository production nên pin Actions bằng verified commit SHAs và thêm kiểm tra Kubernetes schema, security cũng như các test cần thiết khác.

Khi tạo Pull Request trên GitHub, workflow kiểm tra Chart mà không cần truy cập cluster production.

## 33. Cleanup

```bash
helm uninstall demo -n platform-lab

kubectl delete namespace platform-lab
```

Không xóa `kind-lab`.

# Phần 9 — Troubleshooting Production Platform

## 34. Runbook theo từng lớp

| Lớp           | Triệu chứng             | Kiểm tra                                     |
| ------------- | ----------------------- | -------------------------------------------- |
| CI            | Pipeline failed         | GitHub Actions logs, test reports            |
| Registry      | ImagePullBackOff        | Image digest, auth, networking               |
| Helm          | Template/install failed | `helm lint`, `helm template`, release status |
| ArgoCD        | OutOfSync               | Desired vs live diff, sync errors            |
| Argo Rollouts | Canary paused/aborted   | AnalysisRuns, rollout status, metrics        |
| Kubernetes    | Pods NotReady           | Events, probes, scheduling, logs             |
| Prometheus    | Metrics missing         | Targets, ServiceMonitor, scrape errors       |
| Loki          | Logs missing            | Collector status, labels, ingest errors      |
| Application   | 5xx hoặc latency        | Logs, metrics, traces, dependencies          |

### Những lệnh cần nhớ

```bash
# Helm
helm list -A
helm history <release> -n <namespace>
helm status <release> -n <namespace>

# Kubernetes
kubectl get pods -A
kubectl get events -A --sort-by=.metadata.creationTimestamp
kubectl describe pod <pod> -n <namespace>
kubectl logs <pod> -n <namespace> --previous

# ArgoCD (khi đã cài và có CLI)
argocd app list
argocd app get <app>
argocd app diff <app>

# Argo Rollouts (khi đã cài kubectl plugin)
kubectl argo rollouts get rollout <name> -n <namespace>
```

## 35. Một tình huống production hoàn chỉnh

Giả sử sau khi merge code:

1. GitHub Actions build thành công.
2. Docker image được push lên registry.
3. GitOps repository được cập nhật.
4. ArgoCD hiển thị `Synced`.
5. Nhưng API trả 502.

Bạn phải biết Synced không đồng nghĩa ứng dụng hoạt động.

Quy trình:

```text
CI success
   ↓
Image đúng digest?
   ↓
ArgoCD Synced?
   ↓
Deployment / Rollout Healthy?
   ↓
Pod Ready?
   ↓
Service có ready endpoints?
   ↓
Ingress / Gateway kết nối được?
   ↓
App logs / metrics / traces
```

Nếu Pods Ready nhưng Service không có endpoints, kiểm tra Service selector và EndpointSlices. Nếu endpoints đầy đủ nhưng Ingress trả 502, xem ingress logs, targetPort, kết nối tới app và graceful shutdown.

> **Đây là tư duy production:** Không dừng ở trạng thái của một tool; phải trace xuyên suốt cả delivery pipeline và request path.

# Phần 10 — Kiểm tra kiến thức Giai đoạn 4

*Production Platform Knowledge Test · 7 câu*

**1. Helm và ArgoCD khác nhau ở điểm cốt lõi nào?**

- A. Helm package/render release, ArgoCD reconcile desired state từ Git
- B. Hai tool luôn làm cùng một việc

> **Đáp án:** A — Helm đóng gói và render release; ArgoCD liên tục reconcile cluster theo desired state trong Git.

**2. ArgoCD hiện Synced nhưng backend trả 502. Điều này có thể xảy ra không?**

- A. Không
- B. Có, Synced không chứng minh request path hoạt động

> **Đáp án:** B — Synced chỉ cho biết desired và live state khớp; Pod, Service endpoints hay Ingress vẫn có thể lỗi.

**3. Prometheus dùng gì để tính request rate?**

- A. `rate()` trên Counter
- B. `sum()` trên Gauge bất kỳ

> **Đáp án:** A — Request total là Counter tích lũy; `rate()` tính tốc độ tăng mỗi giây trong khoảng thời gian.

**4. Muốn tìm logs chứa ERROR trên Loki, thường dùng toán tử nào?**

- A. `|= "ERROR"`
- B. `kubectl top`

> **Đáp án:** A — `|=` là line filter của LogQL; `kubectl top` chỉ hiển thị CPU/memory usage.

**5. Canary deployment giúp ích gì?**

- A. Đưa phiên bản mới cho một phần traffic trước khi mở rộng
- B. Tự sửa mọi application bug

> **Đáp án:** A — Canary giảm blast radius khi thử phiên bản mới; nó không sửa bug.

**6. Pod SecurityContext có `readOnlyRootFilesystem: true`, app cần ghi file tạm. Giải pháp phù hợp?**

- A. Bỏ mọi chính sách security
- B. Mount writable volume đúng phạm vi cần thiết

> **Đáp án:** B — Ví dụ mount `emptyDir` cho đường dẫn cần ghi, vẫn giữ root filesystem read-only.

**7. Trong GitOps, engineer dùng `kubectl edit` thay đổi replicas nhưng ArgoCD bật selfHeal. Điều gì có thể xảy ra?**

- A. ArgoCD đưa live state về desired state trong Git
- B. ArgoCD tự ghi thay đổi về Git

> **Đáp án:** A — selfHeal sửa drift trên cluster theo Git; ArgoCD không ghi thay đổi thủ công ngược về Git.

## Tổng kết — Những điều cần thuộc

| Chủ đề             | Một câu ghi nhớ                                                        |
| ------------------ | ---------------------------------------------------------------------- |
| Helm               | Đóng gói, render, install, upgrade và rollback Kubernetes releases     |
| Prometheus         | Thu thập metrics và truy vấn bằng PromQL                               |
| Grafana            | Trực quan hóa dữ liệu, dashboards và alerts                            |
| Loki               | Thu thập, lưu trữ và truy vấn logs bằng LogQL                          |
| CI/CD              | Tự động kiểm tra, build, phát hành và triển khai                       |
| ArgoCD             | Git quản lý desired state, controller reconcile cluster                |
| Argo Rollouts      | Phát hành có kiểm soát bằng Canary/Blue-Green                          |
| Security Hardening | Least privilege, non-root, restricted workloads và bảo vệ supply chain |

### Khi nào bạn thực sự vững Giai đoạn 4?

Bạn cần tự làm được:

1. Tạo Helm Chart cho một backend và cấu hình `dev`/`production`.
2. Viết GitHub Actions pipeline để kiểm tra, build và phát hành image.
3. Dùng ArgoCD deploy từ Git và phát hiện configuration drift.
4. Tạo Grafana dashboard với RPS, error rate, latency, CPU và memory.
5. Truy vấn Loki để tìm logs tương ứng với request lỗi.
6. Triển khai Canary và biết cách dừng/rollback phiên bản lỗi.
7. Áp dụng Pod Security và RBAC mà vẫn bảo đảm ứng dụng chạy đúng.

Hoàn thành các mục đó sẽ đưa bạn từ mức biết Kubernetes resources sang có khả năng xây dựng và vận hành một nền tảng ứng dụng thực tế.

Bước tiếp theo là Giai đoạn 5 — AWS EKS Production: VPC, IAM, EKS, ECR, EBS CSI, AWS Load Balancer Controller, Karpenter và Terraform. Đây là phần kết hợp toàn bộ kiến thức Kubernetes đã học với hạ tầng AWS để tạo capstone end-to-end.