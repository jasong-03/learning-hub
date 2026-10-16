# Kubernetes Note #3 — Deployment

![Kubernetes Note #3 — Deployment](image/Kubernetes%20Note%20%233%20%E2%80%94%20Deployment.png)

## 1. Deployment là gì?

**Deployment quản lý ReplicaSet, và ReplicaSet quản lý Pod.**

Flow:

```text
Deployment
    ↓
ReplicaSet
    ↓
Pods
```

Ví dụ:

```text
Deployment: app1
    ↓
ReplicaSet
    ↓
Pod
Pod
Pod
```

Điểm quan trọng:

> Trong phần lớn ứng dụng stateless thông thường, bạn sẽ tạo **Deployment**, không tạo ReplicaSet trực tiếp.

Deployment bổ sung các khả năng mà ReplicaSet không làm tốt:

```text
Rolling Update
Rollback
Revision history
Pause / Resume
Restart
Deployment strategies
```

Transcript nhấn mạnh rằng Deployment tạo ReplicaSet bên dưới và dùng ReplicaSet để duy trì Pod. :chatgpt-content-reference{index="1"}

---

# 2. Tạo Deployment bằng imperative

Ví dụ:

```bash
kubectl create deployment app1-deploy \
  --image=myapp:v1
```

Có thể chỉ định replicas:

```bash
kubectl create deployment app1-deploy \
  --image=myapp:v1 \
  --replicas=3
```

Sau đó check:

```bash
kubectl get deployment
```

shortcut:

```bash
kubectl get deploy
```

Check ReplicaSet:

```bash
kubectl get rs
```

Check Pod:

```bash
kubectl get pods
```

Bạn sẽ thấy:

```text
Deployment
   ↓
ReplicaSet auto-created
   ↓
Pod auto-created
```

---

# 3. Deployment manifest

Ví dụ cơ bản:

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: app2-deploy

spec:
  replicas: 3

  selector:
    matchLabels:
      app: app2

  template:
    metadata:
      labels:
        app: app2

    spec:
      containers:
        - name: simple-app
          image: myapp:v2
          ports:
            - containerPort: 8080
```

Apply:

```bash
kubectl apply -f deployment.yaml
```

---

# 4. Cấu trúc Deployment

Có 4 phần bạn cần nhớ:

```text
metadata
replicas
selector
template
```

`template` chính là Pod template:

```text
Deployment
  │
  ├── replicas
  ├── selector
  │
  └── template
        ↓
       Pod
```

---

# 5. Selector và labels

Cũng giống ReplicaSet:

```yaml
selector:
  matchLabels:
    app: app2
```

phải match:

```yaml
template:
  metadata:
    labels:
      app: app2
```

Tức là:

```text
selector
   ↓
app=app2
   ↓
Pods có label app=app2
```

---

# 6. Scale Deployment

Imperative:

```bash
kubectl scale deployment app1-deploy \
  --replicas=2
```

Scale xuống:

```bash
kubectl scale deployment app1-deploy \
  --replicas=1
```

Check:

```bash
kubectl get deploy
kubectl get rs
kubectl get pods
```

Transcript demo rằng scale Deployment sẽ thay đổi số Pod trong cùng ReplicaSet hiện tại. :chatgpt-content-reference{index="2"}

---

# 7. Declarative scaling

Trong thực tế nên sửa manifest:

```yaml
spec:
  replicas: 5
```

rồi:

```bash
kubectl apply -f deployment.yaml
```

Thay vì chỉ:

```bash
kubectl scale ...
```

Lý do:

```text
Git / YAML
=
source of truth
```

---

# 8. Expose Deployment bằng Service

Ví dụ:

```bash
kubectl expose deployment app1-deploy \
  --name=svc-app1 \
  --type=NodePort \
  --port=8080
```

Check:

```bash
kubectl get svc
```

Nếu không specify:

```text
--type=NodePort
```

thì mặc định là:

```text
ClusterIP
```

Transcript có demo cả ClusterIP và NodePort. :chatgpt-content-reference{index="3"}

---

# 9. Quan hệ thực sự giữa Service và Deployment

Cần nhớ lại từ bài ReplicaSet:

Service không route:

```text
Service
  ↓
Deployment
```

mà thực tế:

```text
Service
  ↓
label selector
  ↓
Pods
```

Trong khi Deployment:

```text
Deployment
  ↓
ReplicaSet
  ↓
Pods
```

Hai controller cùng gặp nhau ở Pod thông qua labels.

---

# 10. Update image

Đây là một trong những điểm mạnh nhất của Deployment.

Ví dụ đang chạy:

```text
v1
```

update sang:

```text
v2
```

Command:

```bash
kubectl set image deployment/app1-deploy \
  simple-app=myapp:v2
```

Syntax:

```text
kubectl set image deployment/<deployment>
container-name=new-image
```

Điểm rất quan trọng:

```text
simple-app
```

là **container name**, không phải Deployment name.

Transcript demo update image và cho thấy Kubernetes tạo ReplicaSet mới thay vì sửa ReplicaSet cũ trực tiếp. :chatgpt-content-reference{index="4"}

---

# 11. Khi update image thì chuyện gì xảy ra?

Giả sử:

```text
Deployment
  ↓
ReplicaSet A
  ↓
Pods v1
```

Update:

```text
v1 → v2
```

Deployment tạo:

```text
Deployment
 ├── ReplicaSet A
 │      ↓
 │    Pods v1
 │
 └── ReplicaSet B
        ↓
      Pods v2
```

Sau đó:

```text
scale up ReplicaSet B
scale down ReplicaSet A
```

ReplicaSet cũ thường vẫn được giữ lại để phục vụ rollback.

---

# 12. Đây chính là lý do Deployment hơn ReplicaSet

ReplicaSet:

```text
change template image
```

không tự replace toàn bộ Pod cũ.

Deployment:

```text
change Pod template
     ↓
new ReplicaSet
     ↓
new Pods
```

=> rollout có kiểm soát.

---

# 13. Rollout

`rollout` là quá trình đưa revision mới ra.

Các command quan trọng:

```bash
kubectl rollout status deployment/app1-deploy
```

History:

```bash
kubectl rollout history deployment/app1-deploy
```

Transcript demo các revision tương ứng với các lần thay đổi image/version. :chatgpt-content-reference{index="5"}

---

# 14. Revision

Ví dụ:

```text
Revision 1 → v1
Revision 2 → v2
Revision 3 → v3
```

Check:

```bash
kubectl rollout history deployment/app1-deploy
```

Check cụ thể revision:

```bash
kubectl rollout history deployment/app1-deploy \
  --revision=2
```

Bạn có thể dùng revision để biết:

```text
version nào
image nào
template nào
```

---

# 15. Rolling Update

Default strategy của Deployment là:

```text
RollingUpdate
```

Flow:

```text
Old Pods
↓
Create some New Pods
↓
Wait New Pods ready
↓
Terminate some Old Pods
↓
Repeat
```

Ví dụ:

```text
v2 v2
```

transition:

```text
v2 v2 v3
```

rồi:

```text
v2 v3
```

rồi:

```text
v3 v3
```

Transcript mô tả rõ rằng Pod mới được tạo và chạy trước khi Pod cũ bị terminate trong rolling update. :chatgpt-content-reference{index="6"}

---

# 16. Tại sao RollingUpdate quan trọng?

Giúp hạn chế downtime.

Nếu app đang có:

```text
10 Pods
```

không cần:

```text
delete all 10
```

rồi mới tạo mới.

Thay vào đó:

```text
old + new coexist temporarily
```

---

# 17. Rollback

Nếu release mới lỗi:

```text
v3 ❌
```

có thể rollback.

Rollback về revision trước:

```bash
kubectl rollout undo deployment/app1-deploy
```

Rollback revision cụ thể:

```bash
kubectl rollout undo deployment/app1-deploy \
  --to-revision=2
```

Transcript demo cả rollback về previous version và rollback về một revision cụ thể. :chatgpt-content-reference{index="7"}

---

# 18. Rollback hoạt động thế nào?

Giả sử:

```text
RS-v1
RS-v2
RS-v3 ← current
```

Rollback về v2:

```text
scale RS-v2 up
scale RS-v3 down
```

Kubernetes có thể reuse ReplicaSet cũ thay vì tạo lại mọi thứ từ đầu.

---

# 19. Revision sau rollback

Điểm hơi dễ nhầm:

Rollback không có nghĩa history trở thành:

```text
1 → 2 → 3 → 2
```

theo cách bạn nghĩ đơn giản.

Kubernetes xem rollback là **một deployment change mới**.

Ví dụ có thể thành:

```text
Revision 1 → v1
Revision 2 → v2
Revision 3 → v3
Revision 4 → template của v2
```

Nên revision tăng tiếp.

Transcript có demo behaviour này. :chatgpt-content-reference{index="8"}

---

# 20. Pause Deployment

Khi muốn thay đổi nhiều thứ nhưng **chưa rollout ngay**:

```bash
kubectl rollout pause deployment/app1-deploy
```

Sau đó có thể thay đổi:

```text
image
CPU
RAM
other Pod template properties
```

Ví dụ:

```bash
kubectl set image deployment/app1-deploy \
  simple-app=myapp:v4
```

và resource:

```bash
kubectl set resources deployment app1-deploy \
  -c simple-app \
  --requests=cpu=200m,memory=512Mi \
  --limits=cpu=200m,memory=512Mi
```

---

# 21. Resume

Sau khi thay đổi xong:

```bash
kubectl rollout resume deployment/app1-deploy
```

Kubernetes mới rollout các thay đổi.

Flow:

```text
pause
 ↓
change image
 ↓
change CPU/RAM
 ↓
resume
 ↓
one rollout
```

Transcript dùng pause/resume để gom nhiều thay đổi trước khi rollout. :chatgpt-content-reference{index="9"}

---

# 22. CPU đơn vị `m`

Ví dụ:

```text
1000m = 1 CPU
500m = 0.5 CPU
200m = 0.2 CPU
```

Ví dụ:

```yaml
resources:
  requests:
    cpu: 200m
    memory: 512Mi

  limits:
    cpu: 200m
    memory: 512Mi
```

Phần resources chúng ta sẽ note kỹ hơn trong bài riêng.

---

# 23. Annotation và change-cause

Transcript giới thiệu annotation để thêm mô tả cho rollout history.

Ví dụ:

```bash
kubectl annotate deployment app1-deploy \
  kubernetes.io/change-cause="Update image to v4"
```

Annotation là metadata bổ sung.

Ví dụ:

```yaml
metadata:
  annotations:
    kubernetes.io/change-cause: "Update image to v4"
```

Khi check history:

```bash
kubectl rollout history deployment/app1-deploy
```

sẽ dễ biết revision đó thay đổi gì. :chatgpt-content-reference{index="10"}

### Lưu ý thực tế

Bạn nên ưu tiên:

```text
Git commit
PR
CI/CD deployment record
image tag / digest
```

làm audit trail chính.

Annotation rất hữu ích, nhưng không nên là nơi duy nhất để tracking production releases.

---

# 24. Deployment Strategy

Transcript giới thiệu 2 strategy:

```text
RollingUpdate
Recreate
```

Deployment mặc định:

```yaml
strategy:
  type: RollingUpdate
```

:chatgpt-content-reference{index="11"}

---

# 25. Recreate

```yaml
strategy:
  type: Recreate
```

Flow:

```text
Old Pods
   ↓
DELETE ALL
   ↓
New Pods
```

Ví dụ:

```text
v4 v4 v4 v4

↓ terminate all

nothing running

↓ create

v5 v5 v5 v5
```

---

# 26. Recreate ưu nhược điểm

### Advantage

Không cần giữ extra capacity để old/new Pod coexist.

```text
resource efficient
simple
```

### Disadvantage

```text
downtime
```

Do đó phù hợp hơn khi:

```text
dev
test
non-critical system
```

hoặc app thực sự không cho phép hai version cùng chạy.

Không nên coi nó là strategy mặc định cho production.

---

# 27. RollingUpdate configuration

Ví dụ:

```yaml
strategy:
  type: RollingUpdate

  rollingUpdate:
    maxUnavailable: 1
    maxSurge: 2
```

Hai parameter cực kỳ quan trọng:

```text
maxUnavailable
maxSurge
```

---

# 28. maxUnavailable

Số Pod tối đa được phép unavailable trong rollout.

Ví dụ:

```yaml
maxUnavailable: 1
```

Với desired:

```text
10 Pods
```

thì về nguyên tắc rollout phải giữ ít nhất khoảng:

```text
9 available
```

Có thể dùng percentage:

```yaml
maxUnavailable: 25%
```

---

# 29. maxSurge

Số Pod vượt quá desired replicas được phép tạo tạm thời.

Ví dụ:

```yaml
replicas: 10

maxSurge: 2
```

Trong rollout có thể tạm thời có:

```text
12 Pods
```

Flow:

```text
10 old
↓
+2 new
↓
new ready
↓
remove old
↓
repeat
```

---

# 30. maxSurge vs maxUnavailable

Đây là trade-off giữa:

```text
Speed
Availability
Resources
```

Ví dụ cực an toàn:

```yaml
maxUnavailable: 0
maxSurge: 1
```

=> ít risk nhưng rollout chậm.

Nhanh hơn:

```yaml
maxUnavailable: 20%
maxSurge: 20%
```

=> rollout nhanh nhưng nhiều thay đổi cùng lúc.

---

# 31. Visualize RollingUpdate

Giả sử:

```text
replicas = 4
maxUnavailable = 1
maxSurge = 1
```

Initial:

```text
v1 v1 v1 v1
```

Step 1:

```text
v1 v1 v1 v1 v2
```

Step 2:

```text
v1 v1 v1 v2
```

Step 3:

```text
v1 v1 v1 v2 v2
```

...

Final:

```text
v2 v2 v2 v2
```

---

# 32. Mixed versions trong rollout

Một điểm rất quan trọng:

Trong rolling deployment có thời điểm:

```text
User A → v1
User B → v2
```

Vì Service có thể route tới cả old và new Pods.

Do đó API/database changes nên backward-compatible trong quá trình rollout.

Ví dụ release nguy hiểm:

```text
v2 removes DB column
```

trong khi:

```text
v1 still needs column
```

=> có thể lỗi trong thời gian rolling update.

Đây là vấn đề production rất thực tế.

---

# 33. Progress Deadline

Deployment có:

```yaml
progressDeadlineSeconds:
```

Ví dụ:

```yaml
spec:
  progressDeadlineSeconds: 200
```

Nếu rollout không progress trong khoảng đó, Deployment sẽ báo lỗi progress deadline.

Transcript demo bằng cách deploy một image version không tồn tại, khiến Pod không tạo thành công. :chatgpt-content-reference{index="12"}

---

# 34. Ví dụ rollout lỗi

Giả sử:

```text
image: myapp:v10
```

nhưng image không tồn tại.

Pod có thể rơi vào:

```text
ImagePullBackOff
```

Deployment cũ vẫn còn:

```text
10 healthy Pods
```

trong khi:

```text
new Pods fail
```

RollingUpdate sẽ không ngay lập tức giết hết healthy old Pods.

Điều này giúp application tiếp tục phục vụ traffic.

---

# 35. Check rollout failure

```bash
kubectl rollout status deployment/app1-deploy
```

Check:

```bash
kubectl describe deployment app1-deploy
```

Xem:

```text
Conditions
Progressing
Available
Events
```

---

# 36. Restart Deployment

Restart:

```bash
kubectl rollout restart deployment/app1-deploy
```

Điều này trigger một rollout mới của Pods.

Check:

```bash
kubectl get pods -w
```

Transcript cho thấy restart tạo ra Pod mới và ReplicaSet/revision mới tương ứng với thay đổi Pod template. :chatgpt-content-reference{index="13"}

Use cases:

```text
restart app
reload mounted config scenario
recover from strange state
force Pods recreation
```

---

# 37. Delete Deployment

```bash
kubectl delete deployment app1-deploy
```

Thông thường Kubernetes sẽ garbage-collect:

```text
Deployment
↓
ReplicaSet
↓
Pods
```

Tức là delete Deployment sẽ dẫn tới xóa workload do nó sở hữu.

Service là resource riêng:

```text
Service
```

nên nếu bạn tạo riêng Service, cần check/delete nó riêng.

---

# 38. `kubectl describe deployment`

Một command cực kỳ quan trọng:

```bash
kubectl describe deployment app1-deploy
```

Bạn nên nhìn:

```text
Replicas
StrategyType
RollingUpdateStrategy
Pod Template
Conditions
OldReplicaSets
NewReplicaSet
Events
```

Đặc biệt khi troubleshooting:

```text
Conditions
Events
```

---

# 39. Deployment lifecycle tổng thể

Đây là flow quan trọng nhất của section:

```text
deployment.yaml
      ↓
kubectl apply
      ↓
Deployment
      ↓
ReplicaSet V1
      ↓
Pods V1
```

Release mới:

```text
image V1 → V2
      ↓
Deployment detects template change
      ↓
ReplicaSet V2
      ↓
Pods V2
      ↓
scale V2 up
      ↓
scale V1 down
```

Rollback:

```text
V2 has bug
   ↓
kubectl rollout undo
   ↓
old ReplicaSet scaled up
   ↓
bad ReplicaSet scaled down
```

Nếu bạn hiểu flow này thì Deployment coi như hiểu được khoảng 70–80%.

---

# 40. Commands bắt buộc phải thuộc

```bash
kubectl get deploy
```

```bash
kubectl describe deployment <name>
```

```bash
kubectl create deployment <name> --image=<image>
```

```bash
kubectl apply -f deployment.yaml
```

```bash
kubectl scale deployment <name> --replicas=3
```

```bash
kubectl set image deployment/<name> \
  <container>=<image>
```

```bash
kubectl rollout status deployment/<name>
```

```bash
kubectl rollout history deployment/<name>
```

```bash
kubectl rollout history deployment/<name> \
  --revision=2
```

```bash
kubectl rollout undo deployment/<name>
```

```bash
kubectl rollout undo deployment/<name> \
  --to-revision=2
```

```bash
kubectl rollout pause deployment/<name>
```

```bash
kubectl rollout resume deployment/<name>
```

```bash
kubectl rollout restart deployment/<name>
```

```bash
kubectl delete deployment <name>
```

---

# 41. Lab quan trọng nhất — Deployment

## Lab 1 — Create

Tạo:

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: nginx-deploy

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
kubectl apply -f deployment.yaml
```

Check:

```bash
kubectl get deploy
kubectl get rs
kubectl get pods
```

Bạn phải nhìn ra:

```text
1 Deployment
1 ReplicaSet
3 Pods
```

---

# 42. Lab 2 — Scale

```bash
kubectl scale deployment nginx-deploy \
  --replicas=5
```

Expected:

```text
5 Pods
```

Sau đó về:

```bash
kubectl scale deployment nginx-deploy \
  --replicas=3
```

---

# 43. Lab 3 — Rolling Update

```bash
kubectl set image deployment/nginx-deploy \
  nginx=nginx:1.28
```

Ngay lập tức:

```bash
kubectl get pods -w
```

Ở terminal khác:

```bash
kubectl get rs
```

Bạn phải quan sát được:

```text
old RS → scale down
new RS → scale up
```

---

# 44. Lab 4 — History

```bash
kubectl rollout history deployment/nginx-deploy
```

Sau đó:

```bash
kubectl rollout status deployment/nginx-deploy
```

---

# 45. Lab 5 — Rollback

Update sang một version khác.

Sau đó:

```bash
kubectl rollout undo deployment/nginx-deploy
```

Check:

```bash
kubectl rollout history deployment/nginx-deploy
kubectl get rs
kubectl get pods
```

---

# 46. Lab 6 — Break rollout

Đây là lab rất đáng làm.

Set image sai:

```bash
kubectl set image deployment/nginx-deploy \
  nginx=nginx:this-tag-does-not-exist
```

Check:

```bash
kubectl get pods
```

Bạn sẽ gặp:

```text
ImagePullBackOff
```

Sau đó:

```bash
kubectl describe pod <bad-pod>
```

và:

```bash
kubectl rollout status deployment/nginx-deploy
```

Cuối cùng:

```bash
kubectl rollout undo deployment/nginx-deploy
```

Nếu tự xử lý được lab này thì kiến thức Deployment đã khá chắc.

---

# 47. Lab 7 — Rolling strategy

Sửa:

```yaml
strategy:
  type: RollingUpdate

  rollingUpdate:
    maxUnavailable: 0
    maxSurge: 1
```

Update image rồi:

```bash
kubectl get pods -w
```

Quan sát:

```text
new Pod created
↓
new Pod ready
↓
old Pod terminated
```

---

# 48. 10 câu tự kiểm tra

Bạn nên trả lời được:

**1. Deployment khác ReplicaSet ở điểm nào?**

**2. Deployment tạo resource nào bên dưới nó?**

**3. Tại sao update image tạo ReplicaSet mới?**

**4. RollingUpdate hoạt động như thế nào?**

**5. ReplicaSet cũ được giữ lại để làm gì?**

**6. `kubectl rollout undo` làm gì?**

**7. `maxSurge` nghĩa là gì?**

**8. `maxUnavailable` nghĩa là gì?**

**9. `Recreate` khác `RollingUpdate` thế nào?**

**10. Tại sao Service vẫn hoạt động trong lúc Deployment rolling update?**

Nếu trả lời được khoảng **8/10 + hoàn thành lab 1, 3, 5, 6**, mình sẽ đánh dấu:

```text
✅ Deployment MASTERED
```

# Tracker cập nhật

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
🟡 ReplicaSet lab
✅ Deployment concept
✅ Scaling
✅ Rolling Update
✅ Rollback
✅ Pause / Resume
✅ Deployment Strategy
✅ Restart
🟡 Deployment labs

CONFIGURATION
⬜ ConfigMap
⬜ Secret

RELIABILITY
⬜ Liveness Probe
⬜ Readiness Probe
⬜ Startup Probe
⬜ Requests / Limits

STORAGE
⬜ Volume
⬜ PV / PVC

NETWORKING
⬜ Ingress

SECURITY
⬜ ServiceAccount
⬜ RBAC

OPS
⬜ Helm
⬜ Troubleshooting
```

### Quan trọng nhất cần nhớ sau section Deployment

```text
Deployment
   ↓ manages
ReplicaSet
   ↓ manages
Pods
```

và:

```text
New Pod template
      ↓
New ReplicaSet
      ↓
Rolling Update
      ↓
New Pods
```
