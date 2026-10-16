# Kubernetes Note #2 — ReplicaSet

![Kubernetes Note #2 — ReplicaSet — Phần 1/3](image/Kubernetes%20Note%20%232%20%E2%80%94%20ReplicaSet%201-3.png)

## 1. ReplicaSet là gì?

**ReplicaSet đảm bảo luôn có đúng số lượng Pod mong muốn đang chạy.**

Ví dụ:

```text
replicas: 3
```

thì ReplicaSet sẽ cố giữ:

```text
3 Pods running
```

Nếu 1 Pod chết:

```text
3 → 2
```

ReplicaSet tạo Pod mới:

```text
2 → 3
```

Đây là cơ chế **self-healing** cơ bản.

---

## 2. Vì sao cần ReplicaSet?

Nếu chỉ chạy Pod trực tiếp:

```text
Pod
```

mà Pod chết:

```text
Pod ❌
```

thì Kubernetes không tự biết bạn vẫn muốn ứng dụng đó tồn tại, trừ khi Pod đang được một controller quản lý.

ReplicaSet giải quyết bằng cách giữ desired state:

```text
Desired = 3 Pods
Actual = 2 Pods

ReplicaSet
    ↓
create 1 Pod

Actual = 3 Pods
```

---

# 3. ReplicaSet không quản lý Pod bằng tên

Điểm cực kỳ quan trọng:

> ReplicaSet quản lý Pod dựa trên **labels + selector**.

Ví dụ:

```yaml
selector:
  matchLabels:
    app: app3
```

ReplicaSet sẽ tìm các Pod có:

```yaml
labels:
  app: app3
```

---

# 4. Labels là gì?

Label là metadata dạng key-value để phân loại resource.

Ví dụ:

```yaml
labels:
  app: app3
  environment: production
  project: demo
```

Bạn có thể dùng label cho:

```text
Pod
ReplicaSet
Deployment
Service
Node
...
```

Ví dụ:

```text
app=frontend
environment=prod
version=v3
```

---

# 5. Selector là gì?

Selector dùng để **chọn resource dựa trên label**.

Ví dụ:

```yaml
selector:
  matchLabels:
    app: app3
```

nghĩa là:

> Chọn tất cả Pod có `app=app3`.

Flow:

```text
ReplicaSet
selector: app=app3
        ↓
   ┌────┼────┐
   ↓    ↓    ↓
 Pod  Pod  Pod
app3 app3 app3
```

---

# 6. Cấu trúc ReplicaSet manifest

Ví dụ:

```yaml
apiVersion: apps/v1
kind: ReplicaSet

metadata:
  name: rs3

spec:
  replicas: 3

  selector:
    matchLabels:
      app: app3

  template:
    metadata:
      labels:
        app: app3
        project: demo

    spec:
      containers:
        - name: simple-app
          image: myapp:v3
          ports:
            - containerPort: 8080
```

Có 3 phần bạn phải hiểu rõ:

```text
replicas
selector
template
```

---

# 7. `replicas`

```yaml
replicas: 3
```

Desired count:

```text
3 Pods
```

ReplicaSet liên tục reconcile:

```text
Actual < Desired
→ create Pod

Actual > Desired
→ delete Pod

Actual = Desired
→ no action
```

---

# 8. `selector`

```yaml
selector:
  matchLabels:
    app: app3
```

Nó quyết định:

> Pod nào thuộc ReplicaSet này?

Đây là phần cực quan trọng.

---

# 9. `template`

```yaml
template:
  metadata:
    labels:
      app: app3

  spec:
    containers:
      ...
```

Đây chính là **Pod template**.

Nói cách khác:

```text
ReplicaSet
   ↓
Pod Template
   ↓
create Pod
```

Pod tạo từ ReplicaSet sẽ dùng template này.

---

# 10. Selector phải match template labels

Ví dụ đúng:

```yaml
selector:
  matchLabels:
    app: app3

template:
  metadata:
    labels:
      app: app3
```

Nếu selector và template không match thì ReplicaSet manifest sẽ không hợp lệ hoặc hoạt động không đúng ý.

Rule nhớ:

```text
selector ⊆ template.labels
```

---

![Kubernetes Note #2 — ReplicaSet — Phần 2/3](image/Kubernetes%20Note%20%232%20%E2%80%94%20ReplicaSet%202-3.png)

# 11. ReplicaSet có thể “adopt” Pod có sẵn

Đây là đoạn rất quan trọng trong transcript.

Giả sử ReplicaSet:

```yaml
replicas: 3

selector:
  matchLabels:
    app: app3
```

Trước khi tạo ReplicaSet, đã có một Pod:

```yaml
labels:
  app: app3
```

thì ReplicaSet thấy:

```text
Desired = 3
Existing matching Pods = 1
```

nên chỉ tạo:

```text
2 Pods mới
```

Kết quả:

```text
1 existing
+
2 new
=
3 total
```

---

# 12. Vì sao chuyện này nguy hiểm?

Giả sử Pod cũ:

```text
app=app3
image=v2
```

ReplicaSet template:

```text
app=app3
image=v3
```

ReplicaSet chỉ nhìn selector:

```text
app=app3
```

nên nó vẫn có thể tính Pod `v2` là thành viên.

Kết quả:

```text
Pod 1 → v2
Pod 2 → v3
Pod 3 → v3
```

Service phía trước có thể route traffic tới cả ba.

User đôi lúc nhận:

```text
v2
```

đôi lúc:

```text
v3
```

=> bug rất khó chịu.

---

# 13. Best practice cho labels

Đừng selector quá chung chung kiểu:

```yaml
app: app3
```

nếu hệ thống phức tạp.

Có thể dùng:

```yaml
labels:
  app: payment
  environment: production
  version: v3
```

và selector đủ cụ thể.

Ví dụ:

```yaml
selector:
  matchLabels:
    app: payment
    environment: production
```

Tuy nhiên `version` thường được quản lý cẩn thận trong Deployment strategy; không phải lúc nào cũng nên đưa vào Service selector.

---

# 14. Tạo ReplicaSet

ReplicaSet thường được quản lý declaratively:

```bash
kubectl apply -f rs.yaml
```

Check:

```bash
kubectl get replicasets
```

Shortcut:

```bash
kubectl get rs
```

Ví dụ output:

```text
NAME   DESIRED   CURRENT   READY
rs3    3         3         3
```

Ý nghĩa:

### DESIRED

Muốn có:

```text
3
```

### CURRENT

Hiện controller đang quản lý:

```text
3
```

### READY

Pod thực sự ready:

```text
3
```

---

# 15. Check Pods của ReplicaSet

```bash
kubectl get pods
```

Tên Pod thường dạng:

```text
rs3-abcde
rs3-fghij
rs3-klmno
```

ReplicaSet tạo suffix ngẫu nhiên.

---

# 16. Test self-healing

Delete một Pod:

```bash
kubectl delete pod <pod-name>
```

Sau đó:

```bash
kubectl get pods -w
```

Bạn sẽ thấy:

```text
old Pod → Terminating
new Pod → ContainerCreating
new Pod → Running
```

ReplicaSet đưa hệ thống từ:

```text
2 Pods
```

về:

```text
3 Pods
```

---

# 17. Scale ReplicaSet

Có thể edit:

```bash
kubectl edit rs rs3
```

đổi:

```yaml
replicas: 3
```

thành:

```yaml
replicas: 4
```

ReplicaSet sẽ tạo thêm 1 Pod.

Nhưng thực tế nên sửa manifest rồi:

```bash
kubectl apply -f rs.yaml
```

để giữ source of truth.

---

![Kubernetes Note #2 — ReplicaSet — Phần 3/3](image/Kubernetes%20Note%20%232%20%E2%80%94%20ReplicaSet%203-3.png)

# 18. Expose ReplicaSet bằng Service

Có thể imperative:

```bash
kubectl expose replicaset rs3 \
  --name=service3 \
  --type=NodePort \
  --port=8080
```

Nhưng bản chất Service không thực sự “gọi ReplicaSet”.

Service route tới Pod dựa trên **selector**.

Đây là nuance rất quan trọng.

Flow thật:

```text
Service
 selector
    ↓
matching Pods
```

không phải:

```text
Service
   ↓
ReplicaSet
   ↓
Pods
```

---

# 19. Service selector

Ví dụ:

```yaml
apiVersion: v1
kind: Service

metadata:
  name: service3

spec:
  type: NodePort

  selector:
    app: app3

  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 31988
```

Flow:

```text
Client
  ↓
NodePort :31988
  ↓
Service :8080
  ↓
selector app=app3
  ↓
Pods :8080
```

---

# 20. ReplicaSet + Service

Bức tranh đúng:

```text
                User
                  ↓
               Service
            selector app=app3
                  ↓
       ┌──────────┼──────────┐
       ↓          ↓          ↓
      Pod        Pod        Pod
   app=app3   app=app3   app=app3
       ↑          ↑          ↑
       └──── ReplicaSet ─────┘
          desired replicas=3
```

Service và ReplicaSet đều dùng labels, nhưng làm việc khác nhau:

### ReplicaSet

```text
maintain number of Pods
```

### Service

```text
route traffic to Pods
```

---

# 21. Declarative Service

Ví dụ:

```yaml
apiVersion: v1
kind: Service

metadata:
  name: service3

spec:
  type: NodePort

  selector:
    app: app3

  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 31988
```

Apply:

```bash
kubectl apply -f nodeport.yaml
```

Check:

```bash
kubectl get svc
kubectl describe svc service3
```

---

# 22. NodePort range

Default:

```text
30000–32767
```

Ví dụ hợp lệ:

```text
31988
```

Ngoài range mặc định thì fail, trừ khi cluster config range khác.

---

# 23. ReplicaSet và rolling update

Đây là điểm hạn chế rất quan trọng.

Giả sử ReplicaSet đang chạy:

```text
image=v3
```

Bạn sửa template thành:

```text
image=v4
```

Điều gì xảy ra?

**Các Pod đang chạy không tự động được replace chỉ vì template đổi.**

Pod cũ vẫn:

```text
v3
```

ReplicaSet chỉ dùng template mới khi cần tạo Pod mới.

Ví dụ:

```text
Pod v3
Pod v3
Pod v3
```

update template:

```text
v4
```

vẫn:

```text
Pod v3
Pod v3
Pod v3
```

Nếu delete một Pod:

```text
Pod v3 ❌
```

ReplicaSet tạo replacement:

```text
Pod v4
```

lúc này có thể thành:

```text
v3
v3
v4
```

---

# 24. Vì sao ReplicaSet không đủ cho deployment thực tế?

ReplicaSet giỏi về:

```text
availability
replica count
self-healing
```

nhưng không giỏi:

```text
rolling update
rollback
release history
controlled rollout
```

Do đó thực tế:

> **Bạn hiếm khi tạo ReplicaSet trực tiếp.**

Thay vào đó dùng:

```text
Deployment
   ↓
ReplicaSet
   ↓
Pods
```

---

# 25. Deployment là layer phía trên ReplicaSet

Đây chính là bridge sang bài tiếp theo.

```text
Deployment
   ↓
ReplicaSet v1
   ↓
Pods v1
```

Khi update:

```text
Deployment
   ├── ReplicaSet v1
   │      ↓
   │    old Pods
   │
   └── ReplicaSet v2
          ↓
        new Pods
```

Deployment có thể từ từ:

```text
scale down v1
scale up v2
```

=> rolling update.

Và nếu lỗi:

```text
rollback
```

---

# 26. Những command cần nhớ

```bash
kubectl get rs
```

```bash
kubectl describe rs rs3
```

```bash
kubectl apply -f rs.yaml
```

```bash
kubectl edit rs rs3
```

```bash
kubectl delete rs rs3
```

```bash
kubectl get pods --show-labels
```

Cái cuối rất hữu ích:

```bash
kubectl get pods --show-labels
```

để kiểm tra Pod nào đang match selector.

Bạn cũng nên biết:

```bash
kubectl get pods -l app=app3
```

`-l` = label selector.

Ví dụ:

```bash
kubectl get pods -l app=app3,environment=production
```

---

# 27. Lab bắt buộc — ReplicaSet

## Lab 1 — tạo ReplicaSet

Tạo:

```yaml
apiVersion: apps/v1
kind: ReplicaSet

metadata:
  name: nginx-rs

spec:
  replicas: 3

  selector:
    matchLabels:
      app: nginx

  template:
    metadata:
      labels:
        app: nginx

    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          ports:
            - containerPort: 80
```

Apply:

```bash
kubectl apply -f rs.yaml
```

Check:

```bash
kubectl get rs
kubectl get pods --show-labels
```

---

## Lab 2 — self-healing

```bash
kubectl delete pod <one-pod>
```

Ngay lập tức:

```bash
kubectl get pods -w
```

Bạn phải quan sát được Pod mới tạo.

---

## Lab 3 — scale

Sửa:

```yaml
replicas: 5
```

Apply:

```bash
kubectl apply -f rs.yaml
```

Check:

```bash
kubectl get rs
kubectl get pods
```

Expected:

```text
5 Pods
```

Sau đó scale xuống:

```yaml
replicas: 2
```

---

## Lab 4 — test selector/adoption

Xóa ReplicaSet trước:

```bash
kubectl delete rs nginx-rs
```

Tạo một Pod thủ công có:

```yaml
labels:
  app: nginx
```

Sau đó tạo ReplicaSet:

```yaml
replicas: 3
selector:
  matchLabels:
    app: nginx
```

Quan sát:

```text
existing = 1
new = 2
total = 3
```

Đây là lab rất đáng làm vì nó giúp bạn hiểu selector thật sự.

---

## Lab 5 — update image limitation

ReplicaSet đang:

```yaml
image: nginx:1.27
```

Sửa thành:

```yaml
image: nginx:1.28
```

Apply.

Sau đó:

```bash
kubectl get pods
```

Bạn sẽ thấy Pod cũ **không tự replace**.

Delete một Pod:

```bash
kubectl delete pod <pod>
```

Describe Pod mới:

```bash
kubectl describe pod <new-pod>
```

Bạn sẽ thấy Pod mới dùng image mới.

Lab này chính là lý do để sang Deployment.

---

# 28. 7 câu tự kiểm tra

Bạn nên trả lời được:

**1. ReplicaSet giải quyết vấn đề gì?**

**2. ReplicaSet biết Pod nào thuộc về nó bằng cách nào?**

**3. `selector` khác `template.metadata.labels` thế nào?**

**4. Nếu đã có 1 Pod match selector và replicas=3, ReplicaSet tạo thêm bao nhiêu Pod?**

**5. Nếu xóa một Pod được ReplicaSet quản lý thì chuyện gì xảy ra?**

**6. Tại sao sửa image trong ReplicaSet không phải rolling update?**

**7. Vì sao production thường dùng Deployment thay vì ReplicaSet trực tiếp?**

Nếu bạn trả lời được **6/7 trở lên + làm lab 1, 2, 4, 5**, phần ReplicaSet có thể coi là **✅ MASTERED**.

# Tracker hiện tại

```text
KUBERNETES — 7 DAY TRACKER

FOUNDATION
✅ Pod
✅ Service fundamentals
✅ NodePort
✅ kubectl logs / exec
✅ Imperative vs Declarative
✅ YAML / Manifest

WORKLOAD CONTROLLERS
✅ ReplicaSet concept
🟡 ReplicaSet labs
➡️ Deployment
⬜ Rolling Update / Rollback

CONFIGURATION
⬜ ConfigMap / Secret

RELIABILITY
⬜ Probes
⬜ Requests / Limits

STORAGE
⬜ Volume / PV / PVC

NETWORK
⬜ Ingress

SECURITY
⬜ ServiceAccount / RBAC

OPS
⬜ Helm
⬜ Troubleshooting
```
