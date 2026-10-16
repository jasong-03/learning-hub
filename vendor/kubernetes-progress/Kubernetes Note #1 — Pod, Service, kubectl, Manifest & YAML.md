# Kubernetes Note #1 — Pod, Service, kubectl, Manifest &amp; YAML

![Kubernetes Note #1 — Pod, Service, kubectl, Manifest & YAML](image/Kubernetes%20Note%20%231%20%E2%80%94%20Pod%2C%20Service%2C%20kubectl%2C%20Manifest%20%26%20YAML.png)

## 1. Pod là gì?

### Khái niệm cốt lõi

**Pod là đơn vị deploy nhỏ nhất trong Kubernetes.**

Kubernetes không trực tiếp coi container là resource triển khai nhỏ nhất. Thay vào đó:

```
Kubernetes
   ↓
 Pod
   ↓
Container
```

Một Pod có thể chứa:

```
Pod
├── Container A
└── Container B
```

Nhưng trường hợp phổ biến nhất:

```
1 Pod
  ↓
1 application container
```

### Pod và Node

Node là máy chạy workload:

```
Kubernetes Cluster

Node 1
├── Pod A
├── Pod B
└── Pod C

Node 2
├── Pod D
└── Pod E
```

Node có thể là:

- VM
- EC2
- bare-metal server
- machine trong Minikube/kind

Pod sẽ được Kubernetes scheduler đặt lên một Node.

---

# 2. Pod có IP riêng

Mỗi Pod thường được cấp **một IP riêng trong cluster**.

Ví dụ:

```
Node
IP: 10.0.1.5

└── Pod
    IP: 10.244.0.7
    └── Container
        App port: 8080
```

Điểm rất quan trọng:

> **IP thuộc về Pod, không phải từng container bên trong Pod.**

Nếu Pod có nhiều container:

```
Pod IP: 10.244.0.7

├── Container App
│   └── :8080
│
└── Container Sidecar
    └── :9000
```

Hai container:

- dùng chung network namespace
- dùng chung Pod IP
- có thể giao tiếp qua `localhost`

Ví dụ:

```
Container A
   ↓
localhost:9000
   ↓
Container B
```

### ⚠️ Vì vậy

Hai container trong cùng Pod **không thể cùng bind một port giống nhau**.

Ví dụ:

```
❌ Container A → :8080
❌ Container B → :8080
```

sẽ conflict nếu cả hai cùng listen trên cùng interface.

---

# 3. Multi-container Pod

Một Pod có thể có nhiều container khi các container đó **phụ thuộc rất chặt vào nhau**.

Ví dụ:

```
Pod
├── Main Application
└── Sidecar
     └── logging / proxy / helper
```

Ưu điểm:

```
shared network
shared storage
same lifecycle
```

Nhưng có vấn đề:

Nếu scale:

```
1 Pod
├── App
└── Sidecar
```

thành:

```
10 Pods
```

thì bạn nhận:

```
10 App containers
+
10 Sidecar containers
```

Không thể scale riêng App mà không scale Sidecar.

### Rule nên nhớ

> Chỉ đặt nhiều container vào cùng Pod khi lifecycle của chúng thực sự gắn chặt với nhau.

---

# 4. Scaling Pod

Giả sử:

```
1 Pod

CPU: 0.5
RAM: 1 GB
```

Traffic tăng lên.

Có hai hướng:

### Vertical scaling

Tăng resource:

```
0.5 CPU → 2 CPU
1 GB → 4 GB
```

### Horizontal scaling

Tăng số Pod:

```
1 Pod
   ↓
3 Pods
   ↓
10 Pods
```

Kubernetes thường được thiết kế rất tốt cho **horizontal scaling**.

```
            Traffic
               ↓
         ┌─────┴─────┐
         ↓           ↓
       Pod 1       Pod 2
         ↓           ↓
       Pod 3       Pod 4
```

Sau này bạn sẽ học:

```
Deployment
ReplicaSet
HPA
Cluster Autoscaler / Karpenter
```

---

# 5. Tạo Pod bằng kubectl

Imperative example:

```
kubectl run app1 --image=<image>
```

Check:

```
kubectl get pods
```

Shortcut:

```
kubectl get po
```

Theo dõi thay đổi realtime:

```
kubectl get pods --watch
```

hoặc:

```
kubectl get pods -w
```

---

# 6. Xem chi tiết Pod

```
kubectl describe pod app1
```

Bạn có thể thấy:

```
Name
Namespace
Node
Status
IP
Containers
Image
Container ID
Ports
Volumes
Events
```

Đặc biệt khi debug hãy nhìn:

```
Status
Containers
Conditions
Events
```

---

# 7. Container image và imagePullPolicy

Transcript có chỗ này cần chỉnh lại một chút.

Kubernetes có:

```
imagePullPolicy:
```

Ba giá trị chính:

```
Always
IfNotPresent
Never
```

### IfNotPresent

Nếu image đã có trên Node:

```
use local image
```

Nếu chưa:

```
pull registry
```

### Always

Kubernetes sẽ kiểm tra registry mỗi lần container start.

Nhưng không nhất thiết tải lại toàn bộ layers nếu digest/image đã có cache.

### Never

Không pull image.

Chỉ dùng local.

---

## ⚠️ Đừng reuse tag khi dev

Ví dụ không nên:

```
myapp:v1
```

Build code mới nhưng vẫn push:

```
myapp:v1
```

Điều này rất dễ gây confusion.

Tốt hơn:

```
myapp:v1.0.1
myapp:v1.0.2
```

hoặc:

```
myapp:<git-sha>
```

Production càng nên dùng immutable image tag/digest.

---

# 8. Vì sao cần Service?

Pod IP không nên được coi là endpoint ổn định.

Pod có thể:

```
die
restart
recreate
move Node
```

và IP có thể thay đổi.

Ví dụ:

```
Pod 1
10.244.0.7

dies

Pod mới
10.244.1.15
```

Nếu client gọi trực tiếp:

```
10.244.0.7
```

thì sẽ hỏng.

Solution:

```
Client
   ↓
Service
   ↓
Pods
```

Service cung cấp endpoint ổn định phía trước các Pod.

---

# 9. Các Service type quan trọng

Bạn cần biết 3 cái trước:

```
ClusterIP
NodePort
LoadBalancer
```

### ClusterIP

Mặc định.

Chỉ truy cập trong cluster:

```
Pod
 ↓
Service
 ↓
Pod
```

### NodePort

Expose service thông qua:

```
<NodeIP>:<NodePort>
```

Default NodePort range thường là:

```
30000–32767
```

Ví dụ:

```
10.0.1.5:31214
```

### LoadBalancer

Cloud provider tạo Load Balancer phía trước Service.

Ví dụ AWS:

```
Internet
   ↓
AWS Load Balancer
   ↓
Kubernetes Service
   ↓
Pods
```

---

# 10. Service port vs targetPort vs nodePort

Đây là phần **cực kỳ quan trọng**.

Ví dụ:

```
ports:
  - port: 8081
    targetPort: 8080
    nodePort: 31214
```

Flow:

```
User
 ↓
NodeIP:31214
 ↓
Service:8081
 ↓
Pod:8080
```

Ý nghĩa:

### `targetPort`

Port mà application/container listen.

```
8080
```

### `port`

Port của Kubernetes Service.

```
8081
```

### `nodePort`

Port expose trên Node.

```
31214
```

Nhớ bằng flow:

```
nodePort
   ↓
port
   ↓
targetPort
```

---

# 11. Tạo NodePort Service

Ví dụ imperative:

```
kubectl expose pod app1 \
  --name=service1 \
  --type=NodePort \
  --port=8081 \
  --target-port=8080
```

Check:

```
kubectl get services
```

Shortcut:

```
kubectl get svc
```

Detail:

```
kubectl describe svc service1
```

---

# 12. NodePort và nhiều Node

Giả sử:

```
Node 1
10.0.1.5

Node 2
10.0.1.6
```

NodePort:

```
31214
```

Service về nguyên tắc có thể được access:

```
10.0.1.5:31214
```

hoặc:

```
10.0.1.6:31214
```

rồi Kubernetes networking sẽ route tới backend Pod phù hợp.

Bạn **không cần chọn trực tiếp Pod nào**.

Đây là điểm Service giải quyết.

---

# 13. Minikube NodePort

Local Minikube có thể dùng:

```
minikube service service1 --url
```

Nó trả URL để access service.

Ví dụ:

```
http://127.0.0.1:59007
```

Đây chủ yếu là tiện ích của Minikube.

Không phải cách bạn sẽ access EKS production.

---

# 14. kubectl logs

Xem log:

```
kubectl logs app1
```

Theo dõi realtime:

```
kubectl logs -f app1
```

`-f` = follow.

Ví dụ:

```
request 1
request 2
request 3
...
```

---

## Multi-container Pod

Nếu Pod có:

```
Pod app1
├── application
└── logging-sidecar
```

phải chọn container:

```
kubectl logs app1 -c application
```

hoặc:

```
kubectl logs app1 -c logging-sidecar
```

Follow:

```
kubectl logs -f app1 -c application
```

---

# 15. kubectl exec

Cho phép chạy command bên trong container.

Ví dụ:

```
kubectl exec app1 -- ls
```

Syntax:

```
kubectl exec POD -- COMMAND
```

`--` phân cách:

```
kubectl arguments
--
container command
```

---

## Vào shell container

```
kubectl exec -it app1 -- sh
```

Trong đó:

```
-i = interactive
-t = terminal
```

Nếu image có Bash:

```
kubectl exec -it app1 -- bash
```

Sau đó có thể:

```
ls
pwd
cat file
env
curl ...
```

### Multi-container

```
kubectl exec -it app1 -c application -- sh
```

---

# 16. Imperative vs Declarative

Đây là concept **rất quan trọng trong DevOps**.

## Imperative

Bạn bảo Kubernetes **làm từng hành động**.

Ví dụ:

```
kubectl run app2 --image=myapp:v2
```

hoặc:

```
kubectl expose ...
```

Tư duy:

```
Do this
Then this
Then this
```

Ưu điểm:

- nhanh
- dễ test
- tiện khi troubleshooting
- thích hợp resource tạm thời

Nhược điểm:

- khó reproduce
- khó review
- dễ gõ sai
- không phù hợp hệ thống lớn

---

# 17. Declarative

Bạn mô tả **desired state**.

Ví dụ:

```
apiVersion: v1
kind: Pod

metadata:
  name: simple-app

spec:
  containers:
    - name: simple-app
      image: myapp:v2
      ports:
        - containerPort: 8080
```

Sau đó:

```
kubectl apply -f pod.yaml
```

Bạn không nói:

```
create container
assign networking
create pod
start app
...
```

Bạn chỉ nói:

> Tôi muốn hệ thống có trạng thái như YAML này.

Kubernetes cố đưa actual state về desired state.

Đây chính là tư duy cực kỳ quan trọng:

```
Desired State
      ↓
 Kubernetes
      ↓
Actual State
```

---

# 18. Kubernetes manifest

Một resource manifest thường có 4 phần quan trọng:

```
apiVersion:
kind:
metadata:
spec:
```

Ví dụ:

```
apiVersion: v1

kind: Pod

metadata:
  name: simple-app

spec:
  containers:
    - name: simple-app
      image: nginx
```

### apiVersion

API Kubernetes dùng.

```
apiVersion: v1
```

### kind

Resource type.

Ví dụ:

```
Pod
Service
Deployment
ReplicaSet
ConfigMap
Secret
```

### metadata

Thông tin định danh:

```
metadata:
  name: simple-app
  labels:
    app: simple-app
```

### spec

Desired state/resource configuration.

```
spec:
  containers:
    ...
```

---

# 19. YAML cơ bản

YAML cực kỳ quan trọng trong Kubernetes.

Có 3 kiểu bạn cần thuộc.

## A. Key-value

```
name: Quan
age: 18
```

---

## B. Dictionary / Map

```
person:
  name: Quan
  age: 18
  address: HCMC
```

Trong Kubernetes:

```
metadata:
  labels:
    app: frontend
    environment: dev
```

---

# 20. List / Array

Dùng dấu:

```
-
```

Ví dụ:

```
containers:
  - name: app
    image: myapp:v1

  - name: sidecar
    image: nginx
```

Một Pod có nhiều containers nên:

```
containers:
```

là một list.

---

# 21. YAML indentation

YAML phụ thuộc indentation.

Ví dụ đúng:

```
metadata:
  name: app
```

Sai:

```
metadata:
name: app
```

Thường sử dụng:

```
2 spaces
```

Không nên dùng tab.

---

# 22. Multi-line string

## Literal `|`

Giữ newline.

```
description: |
  line one
  line two
  line three
```

Kết quả tương đương:

```
line one\n
line two\n
line three
```

Rất hữu ích cho:

```
scripts
config files
certificates
large text
```

---

## Folded `>`

Gộp các dòng thành text liên tục.

```
description: >
  this is
  a long
  description
```

gần tương đương:

```
this is a long description
```

---

# 23. Bức tranh tổng thể bạn vừa học

Từ transcript này, flow kiến thức của bạn hiện tại là:

```
Node
 │
 └── Pod
      │
      └── Container
           │
           └── application :8080
```

Muốn expose:

```
User
 │
 │ NodeIP:NodePort
 ↓
Service
 │
 │ targetPort
 ↓
Pod
 ↓
Container
```

Và Kubernetes resource được quản lý bằng:

```
YAML Manifest
      ↓
kubectl apply
      ↓
Kubernetes API
      ↓
Desired State
```

Đây là **foundation rất quan trọng** trước khi sang ReplicaSet và Deployment.

---

# 24. Commands cần thuộc sau section này

```
kubectl get pods
kubectl get pods -w

kubectl describe pod <pod>

kubectl run <pod> --image=<image>

kubectl logs <pod>
kubectl logs -f <pod>

kubectl logs <pod> -c <container>

kubectl exec <pod> -- <command>

kubectl exec -it <pod> -- sh

kubectl get svc
kubectl describe svc <service>

kubectl expose pod <pod> \
  --type=NodePort \
  --port=<service-port> \
  --target-port=<container-port>

kubectl apply -f <file.yaml>
```

---

# 25. Lab bắt buộc

Status hiện tại mình đánh dấu:

```
K8s Progress

✅ Pod concept
🟡 Pod lab — cần verify thực hành

✅ Pod IP / Container port
✅ Multi-container concept
✅ Horizontal scaling concept

✅ Service concept
✅ NodePort concept
🟡 NodePort lab — cần làm lại không nhìn video

✅ kubectl logs
🟡 logs lab

✅ kubectl exec
🟡 exec lab

✅ Imperative vs Declarative
✅ Manifest structure

✅ YAML basics
🟡 YAML lab
```

### Lab 1 — Pod

Tự tạo Pod:

```
kubectl run nginx-lab --image=nginx
```

Sau đó:

```
kubectl get pods -o wide
kubectl describe pod nginx-lab
```

Bạn phải xác định được:

```
Pod IP = ?
Node = ?
Image = ?
Status = ?
```

---

### Lab 2 — logs / exec

```
kubectl logs nginx-lab
```

Vào container:

```
kubectl exec -it nginx-lab -- sh
```

Trong container:

```
hostname
ls
cat /etc/os-release
```

---

### Lab 3 — Declarative

Tự viết:

```
apiVersion: v1
kind: Pod

metadata:
  name: nginx-yaml

spec:
  containers:
    - name: nginx
      image: nginx:latest
      ports:
        - containerPort: 80
```

Apply:

```
kubectl apply -f pod.yaml
```

---

### Lab 4 — NodePort

Expose:

```
kubectl expose pod nginx-yaml \
  --name=nginx-service \
  --type=NodePort \
  --port=80 \
  --target-port=80
```

Check:

```
kubectl get svc
kubectl describe svc nginx-service
```

Bạn phải tự chỉ ra:

```
ClusterIP
Port
TargetPort
NodePort
Endpoints
```

Nếu làm được 4 lab này mà không nhìn transcript thì phần này coi như **DONE**.

---

# 26. 8 câu tự kiểm tra

Trước khi sang bài tiếp theo, bạn nên trả lời được:

**1. Vì sao Kubernetes dùng Pod thay vì trực tiếp deploy container?**

**2. Pod và Node khác nhau như thế nào?**

**3. Nếu một Pod có 2 container thì chúng có chung IP không?**

**4.** `port`**,** `targetPort`**,** `nodePort` **khác nhau thế nào?**

**5. Tại sao không nên để user gọi trực tiếp Pod IP?**

**6.** `kubectl logs -f` **khác** `kubectl logs` **thế nào?**

**7. Imperative và declarative khác nhau thế nào?**

**8.** `apiVersion`**,** `kind`**,** `metadata`**,** `spec` **có ý nghĩa gì?**

Nếu bạn trả lời được **7/8 trở lên + hoàn thành 4 lab** → mình sẽ đánh dấu section này **✅ MASTERED**.

### Tracker hiện tại

```
KUBERNETES — 7 DAY TRACKER

FOUNDATION
✅ Kubernetes basic architecture
✅ Pod
✅ Service fundamentals
✅ NodePort
✅ kubectl logs / exec
✅ Imperative vs Declarative
✅ YAML / Manifest

NEXT
➡️ ReplicaSet
⬜ Deployment
⬜ Rolling Update / Rollback
⬜ ConfigMap / Secret
⬜ Probes
⬜ Resource Requests / Limits
⬜ Storage / PVC
⬜ Ingress
⬜ RBAC
⬜ Helm
⬜ Troubleshooting
```

