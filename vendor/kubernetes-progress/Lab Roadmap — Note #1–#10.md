# Lab Roadmap — Note #1–#10

Học xong note nào thì làm lab đó. Mỗi note gồm: lab **bắt buộc**, lab **nên làm**, và 

Môi trường lab: một EC2 `t3.small` trong account AWS học `<AWS_ACCOUNT_ID>` (Ubuntu 24.04, Docker, kind, kubectl, helm), quản lý bằng lệnh `k8s-lab`. Đã dựng và chạy thử ngày 2026-10-10.

---

## 0. Quy trình mỗi buổi lab

Lab chạy trên EC2 riêng, không chạy trên Mac. Instance **không có IAM role**, không có `~/.aws`, không có kubeconfig EKS; `kubectl` ở đó chỉ thấy cluster kind cục bộ. Trên Mac, `kubectl` vẫn trỏ `<org>-production` như cũ, nên **không gõ lệnh lab trong terminal Mac**. Chỉ gõ sau khi `k8s-lab shell`, khi prompt hiện `[K8S-LAB]`.

`k8s-lab` dùng file config AWS riêng `~/k8s-lab/aws/config`, chỉ chứa profile SSO của account học `<AWS_ACCOUNT_ID>`. Nó **không đọc** `~/.aws/config`, `~/.aws/credentials`, hay credentials trong biến môi trường của terminal, nên không thể chạm vào profile `<org>-*` hay account production. Trước mọi thao tác, nó còn kiểm tra account ID phải là `<AWS_ACCOUNT_ID>`.

```bash
k8s-lab login      # mở trình duyệt đăng nhập SSO, dùng được vài giờ, chạy được ở bất kỳ terminal nào
k8s-lab up         # start instance, mở SSH cho IP hiện tại, chờ cluster Ready (khoảng 1-2 phút)
k8s-lab shell      # vào instance, prompt: [K8S-LAB] lab@k8s-lab:~/work (ctx:kind-lab)$
# ... làm lab, lưu YAML trong ~/work ...
exit
k8s-lab stop       # stop instance, giữ nguyên disk + cluster + ~/work
```

| Lệnh | Tác dụng |
|---|---|
| `k8s-lab login` | Đăng nhập SSO account học (khi `k8s-lab` báo "not logged in") |
| `k8s-lab up` | Start instance, cập nhật security group về IP hiện tại, chờ cluster kind Ready |
| `k8s-lab shell` | SSH vào instance bằng user `lab` |
| `k8s-lab status` | Trạng thái, IP, chi phí, cluster, kiểm tra credential |
| `k8s-lab stop` | Stop instance; disk, cluster và `~/work` được giữ |
| `k8s-lab doctor` | Kiểm tra account, IAM role, security group, CPU credit, cô lập credential |
| `k8s-lab destroy` | Xóa hẳn instance, disk, security group, key pair (hỏi xác nhận) |
| `k8s-lab create` | Chỉ dùng nếu đã `destroy` và muốn dựng lại từ đầu |

### Chi phí

| Trạng thái | Chi phí |
|---|---|
| Đang chạy | khoảng $0.031/giờ (t3.small $0.0264 + public IPv4 $0.005) |
| Đã stop | khoảng $1.9/tháng (disk gp3 20GB); không tính compute, không tính IP |

Tiết kiệm sẵn có:

- **Tự stop khi quên:** instance tự stop sau **60 phút không có phiên SSH nào** (đã chạy thử).
- **CPU credit `standard`:** lab đốt CPU như `cpu-hog` không phát sinh phí CPU credit.
- **Không dùng Elastic IP:** mỗi lần `up` IP public sẽ đổi, nhưng script tự xử lý.

### Trên instance có sẵn

| Thứ | Vị trí / ghi chú |
|---|---|
| Cluster kind | tên `lab`, context `kind-lab`, 1 node `lab-control-plane`, tự chạy lại sau khi start |
| Lab và manifest của repo | `~/repo/labs/`, `~/repo/manifests/` |
| Thư mục làm việc | `~/work` (nằm trên disk, giữ qua stop/start) |
| Alias | `k` = `kubectl`, có tab completion cho kubectl, kind, helm |

Lab trong repo bảo `kind create cluster --name learning`: bỏ qua, dùng luôn cluster `lab`. Cleanup `kind delete cluster --name learning` cũng bỏ qua. Lab cần cluster nhiều node (`lab-03`, `lab-09`, `lab-15`, `lab-17`, `lab-42`) thì `kind delete cluster --name lab` rồi tạo theo config của lab; làm xong tạo lại bằng `kind create cluster --name lab`. t3.small chỉ có 2GB RAM nên cluster 3 node có thể thiếu RAM (chưa chạy thử); khi tới các lab đó hãy báo để nâng instance tạm thời.

### Đã chạy thử trên t3.small (2 vCPU, 2GB)

| Kiểm tra | Kết quả |
|---|---|
| Cluster kind sau khi tạo | Ready, RAM 945Mi/1905Mi, disk 29% |
| lab-24 nguyên văn (apply metrics-server + patch kind) | Ready (đã gỡ lại để bạn tự làm) |
| lab-21 OOMKilled | `OOMKilled`, exit 137 |
| lab-21 CPU throttling | `cpu-hog` dừng ở 198m (limit 200m) |
| Pod request 500m (lab-02 `good-pod`) | Running; tổng request CPU của node 1650m/2000m |
| Stop rồi start | IP đổi, cluster Ready lại, file trong `~/work` còn nguyên |
| Tự stop khi idle | Instance tự chuyển sang `stopped` |
| Cô lập | Không IAM role (metadata trả 404), không `~/.aws`, 0 biến `AWS_*` trên instance dù Mac đang có 3, chỉ context `kind-lab` |
| Security group | Chỉ port 22 từ IP của bạn; 80/443/6443/30007 đóng |

### Truy cập Service trên kind

Không có `minikube service`. Làm trong `k8s-lab shell`:

| Loại | Cách gọi |
|---|---|
| ClusterIP | `kubectl run tmp --rm -it --image=busybox:1.36 --restart=Never -- wget -qO- <svc>.<ns>` |
| NodePort | `curl http://$(kubectl get node lab-control-plane -o jsonpath='{.status.addresses[0].address}'):<nodePort>` |
| LoadBalancer | kind không có cloud LB nên `EXTERNAL-IP` ở `<pending>` mãi; đó là hành vi đúng của cluster không có cloud provider |

`nslookup` của busybox in thêm dòng `NXDOMAIN` cho các search domain không khớp. Đó không phải lỗi; hãy tìm dòng `Name:` / `canonical name`, hoặc dùng FQDN như `nslookup nginx.prod.svc.cluster.local`.

---

## Tổng quan

| Note | Lab bắt buộc | Lab nên làm | Repo có lab riêng? |
|---|---|---|---|
| #1 Pod, Service, kubectl, YAML | Note #1 Lab 1–4 | `labs/lab-01` (bước 1–5) | Một phần |
| #2 ReplicaSet | Note #2 Lab 1, 2, 4, 5 | `manifests/03-workloads/replicaset.yaml` | Không |
| #3 Deployment | `labs/lab-06`, `labs/lab-07` | Note #3 Lab 6, 7 | Có |
| #4 Service Types | `labs/lab-14` | Lab NodePort/LoadBalancer/ExternalName bên dưới | Một phần (chỉ ClusterIP) |
| #5 Namespace | Lab B (Note #10) + DNS cross-namespace | `labs/lab-02` bước 1 | Một phần |
| #6 Requests & Limits | `labs/lab-21` bước 1, 2, 4, 5 | Lab C (Note #10) | Có |
| #7 Command & Args | Mini lab bên dưới | — | Không |
| #8 Metrics Server | `labs/lab-24` + `labs/lab-21` bước 3 | Lab C (Note #10) | Có |
| #9 ResourceQuota | `labs/lab-02` bước 2–4 (đã sửa lệnh) | `manifests/01-fundamentals/namespace-with-quota.yaml` | Có (lệnh hỏng) |
| #10 LimitRange | Lab D (Note #10) | `manifests/06-configuration/limit-range.yaml` | Không |

---

## Note #1 — Pod, Service, kubectl, Manifest & YAML

### Bắt buộc

Note #1, mục 25: **Lab 1 (Pod), Lab 2 (logs/exec), Lab 3 (Declarative), Lab 4 (NodePort)**.

Truy cập NodePort ở Lab 4 (trong `k8s-lab shell`):

```bash
NODE_IP=$(kubectl get node lab-control-plane -o jsonpath='{.status.addresses[0].address}')
curl http://$NODE_IP:$(kubectl get svc nginx-service -o jsonpath='{.spec.ports[0].nodePort}')
```

### Nên làm

**Multi-container Pod**: luyện `logs -c` và `exec -c`:

```bash
kubectl apply -f ~/repo/manifests/01-fundamentals/multi-container-pod.yaml
kubectl logs app-with-sidecar -c sidecar -f
kubectl exec -it app-with-sidecar -c app -- sh
```

**`labs/lab-01-anatomy-of-a-container.md`**: chỉ làm bước 1–5, dùng Docker, hiểu container = namespace + cgroup.

> Bỏ qua bước 6 của lab-01: `yes 123456789 | md5sum` không cấp phát memory nên container **không** bị OOMKilled. Phần OOM sẽ làm đúng ở `labs/lab-21` (Note #6).

### Đạt khi

Tự chỉ ra được Pod IP, Node, Image, Status; và ClusterIP / Port / TargetPort / NodePort / Endpoints của Service mà không nhìn note.

---

## Note #2 — ReplicaSet

Repo **không có lab ReplicaSet riêng** (`labs/lab-06` đi thẳng vào Deployment), nên dùng lab trong Note #2.

### Bắt buộc

Note #2, mục 27: **Lab 1 (tạo), Lab 2 (self-healing), Lab 4 (adoption), Lab 5 (update image limitation)**.

Lab 4 là quan trọng nhất. Pod thủ công phải được tạo **trước** ReplicaSet:

```bash
kubectl run manual-nginx --image=nginx:1.27 --labels=app=nginx
kubectl apply -f rs.yaml
kubectl get pods --show-labels
```

Thử thêm: tạo Pod thứ 4 có `app=nginx` khi ReplicaSet đã đủ 3 → ReplicaSet sẽ **xóa** bớt một Pod.

### Nên làm

Lab 3 (scale), hoặc dùng manifest có sẵn:

```bash
kubectl apply -f ~/repo/manifests/03-workloads/replicaset.yaml
kubectl get rs web-rs
```

---

## Note #3 — Deployment

### Bắt buộc

1. **`labs/lab-06-pods-replicasets-and-deployments.md`**: cả 8 bước, bỏ bước tạo cluster kind (dùng cluster `lab` có sẵn).
2. **`labs/lab-07-deployments-and-rollout-strategies.md`**: cả 7 bước. Đây chính là Note #3 Lab 6 (break rollout) + Lab 7 (rolling strategy), có thêm readinessProbe.

Ở lab-07 bước 4, tự tính trước khi xem đáp án:

```text
replicas = 4, maxSurge = 1, maxUnavailable = 1
→ tối đa 5 Pod, tối thiểu 3 Pod available
→ 3 Running (cũ) + 2 ImagePullBackOff (mới)
```

### Nên làm

Note #3 Lab 4 (history) và thử:

```bash
kubectl rollout history deployment/rollout-app
kubectl rollout undo deployment/rollout-app --to-revision=1
kubectl rollout history deployment/rollout-app
```

Quan sát revision cũ biến mất và được đánh số lại thành revision mới.

---

## Note #4 — Service Types

### Bắt buộc

**`labs/lab-14-services-and-cluster-networking.md`**: cả 7 bước. Lab này chỉ cover **ClusterIP**, Endpoints, và Service hỏng do selector sai.

`kubectl get endpoints` trên kubectl mới sẽ có cảnh báo deprecated. Dùng thêm:

```bash
kubectl get endpointslices -l kubernetes.io/service-name=web-svc
```

### Bổ sung: NodePort, LoadBalancer, ExternalName

Tiếp tục với `web-deploy` của lab-14 (trước bước cleanup):

```bash
kubectl expose deployment web-deploy --name=web-np --type=NodePort --port=80
kubectl get svc web-np
NODE_IP=$(kubectl get node lab-control-plane -o jsonpath='{.status.addresses[0].address}')
curl http://$NODE_IP:$(kubectl get svc web-np -o jsonpath='{.spec.ports[0].nodePort}')
```

```bash
kubectl expose deployment web-deploy --name=web-lb --type=LoadBalancer --port=80
kubectl get svc web-lb
```

`EXTERNAL-IP` sẽ ở `<pending>` mãi vì kind không có cloud provider cấp load balancer. Đây chính là điểm cần hiểu: `type: LoadBalancer` chỉ là yêu cầu, phải có cloud controller (AWS, GCP...) mới cấp IP. Service vẫn có ClusterIP và NodePort, nên vẫn gọi được qua NodePort như trên.

ExternalName:

```bash
kubectl create service externalname ext-example --external-name=example.com
kubectl run tmp --rm -it --image=busybox:1.36 --restart=Never -- nslookup ext-example
```

Kết quả phải thấy CNAME trỏ về `example.com`.

> Không dùng `manifests/04-networking/nodeport-service.yaml` chung với Pod nginx: manifest đó có `targetPort: 8080` trong khi nginx listen port 80 → Service có endpoint nhưng gọi không được. Đây là bài debug hay nếu muốn tự thử.

### Đạt khi

Giải thích được vì sao NodePort/LoadBalancer Service vẫn có ClusterIP.

---

## Note #5 — Namespace

### Bắt buộc

**Lab B** trong phần tổng kết Note #10 (cùng Deployment `nginx` ở `dev` và `prod`).

**Cross-namespace DNS**: phần quan trọng nhất của Note #5:

```bash
kubectl create namespace dev
kubectl create namespace prod
kubectl create deployment nginx --image=nginx:1.27 -n prod
kubectl expose deployment nginx --port=80 -n prod

kubectl run tmp -n dev --rm -it --image=busybox:1.36 --restart=Never -- sh
```

Trong Pod:

```bash
cat /etc/resolv.conf
wget -qO- nginx
wget -qO- nginx.prod
wget -qO- nginx.prod.svc.cluster.local
```

Kết quả mong đợi: `nginx` lỗi (không có Service `nginx` trong `dev`), hai lệnh sau thành công → namespace không chặn network.

### Nên làm

**`labs/lab-02-namespaces-and-contexts.md` bước 1** (tạo context): chạy nguyên văn được trên instance, vì `kind get clusters` trả về `lab`.

Nhớ chuyển lại: `kubectl config use-context kind-lab`.

Bước 2–4 của lab-02 để dành cho Note #9.

---

## Note #6 — Resource Requests & Limits

### Bắt buộc

**`labs/lab-21-resource-management-and-oomkiller.md`**: làm **bước 1, 2, 4, 5** (OOMKilled, debug exit code 137, QoS Burstable vs Guaranteed).

**Để bước 3 (CPU throttling) sau Note #8**, vì bước này cần `kubectl top`, mà lab-21 không cài Metrics Server.

> EC2 t3.small là x86_64 nên `polinux/stress` (chỉ có bản amd64) chạy native; đã chạy thử ra `OOMKilled`, exit 137. Bản thay thế dưới đây chỉ cần khi chạy trên máy ARM:
>
> ```yaml
> apiVersion: v1
> kind: Pod
> metadata:
>   name: memory-hog
> spec:
>   containers:
>     - name: app
>       image: python:3.12-alpine
>       command: ["python", "-c"]
>       args: ["b = bytearray(250 * 1024 * 1024); import time; time.sleep(3600)"]
>       resources:
>         requests:
>           memory: 50Mi
>         limits:
>           memory: 100Mi
> ```

Bài tự làm thêm: Pod không khai báo resource → kiểm tra QoS là `BestEffort`.

### Nên làm

**Pending vì thiếu resource**:

```bash
kubectl describe node lab-control-plane | grep -A 8 "Allocatable"
kubectl run too-big --image=nginx --overrides='{"spec":{"containers":[{"name":"too-big","image":"nginx","resources":{"requests":{"cpu":"64"}}}]}}'
kubectl get pod too-big
kubectl describe pod too-big | tail -5
```

Mong đợi: `Pending`, event `FailedScheduling ... Insufficient cpu`.

---

## Note #7 — Command & Args

Repo không có lab riêng. Dùng mini lab này.

`busybox` **không có ENTRYPOINT**, chỉ có `CMD ["sh"]`. Đây là ví dụ tốt để thấy khác biệt.

```bash
kubectl run c1 --image=busybox:1.36 --restart=Never -- sleep 5
kubectl run c2 --image=busybox:1.36 --restart=Never --command -- sleep 5
kubectl run c3 --image=busybox:1.36 --restart=Never -- 3000
kubectl get pods c1 c2 c3
kubectl describe pod c3 | grep -A 3 "State"
```

Tự giải thích:

| Pod | Chuyện gì xảy ra | Vì sao |
|---|---|---|
| `c1` | chạy `sleep 5` → `Completed` | `args` thay CMD; image không có ENTRYPOINT |
| `c2` | chạy `sleep 5` → `Completed` | `--command` đặt `command` |
| `c3` | lỗi `StartError` / `ContainerCannotRun` | không có ENTRYPOINT nên `3000` bị coi là executable |

So sánh `restartPolicy`:

```bash
kubectl run ls-always --image=busybox:1.36 -- ls /
kubectl run ls-never --image=busybox:1.36 --restart=Never -- ls /
kubectl get pods -w
```

Mong đợi: `ls-always` → `Completed` → `CrashLoopBackOff`; `ls-never` → `Completed` và giữ nguyên.

Xem lại `labs/lab-21` bước 1: `command: ["stress"]` + `args: [...]` là ví dụ thực tế.

---

## Note #8 — Metrics Server & kubectl top

### Bắt buộc

**`labs/lab-24-monitoring-and-metrics.md`**: chạy nguyên văn trên instance (đã chạy thử). Ở Step 7, chỉ xóa `cpu-hog`, giữ metrics-server lại để làm tiếp bước dưới.

Sau đó **quay lại `labs/lab-21` bước 3** (CPU throttling): CPU dừng ở khoảng 200m (bằng limit).

Lab C (Note #10): so sánh request với usage thực tế:

```bash
kubectl top pods --containers
kubectl describe node lab-control-plane | grep -A 10 "Allocated resources"
```

### Nên làm (xem trước)

`labs/lab-36-horizontal-pod-autoscaler.md`: HPA dùng chính Metrics Server. Chỉ làm khi đã học HPA.

---

## Note #9 — ResourceQuota

### Bắt buộc

**`labs/lab-02-namespaces-and-contexts.md` bước 2–4**.

> **Lệnh trong lab bị hỏng:** bước 3 và 4 dùng `kubectl run --requests/--limits`. Các flag này đã bị xóa từ kubectl 1.24 (instance cài kubectl 1.37) nên lệnh sẽ báo `unknown flag`. Dùng YAML thay thế:

```bash
kubectl apply -n team-alpha -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: good-pod
spec:
  containers:
    - name: nginx
      image: nginx:alpine
      resources:
        requests: {cpu: 500m, memory: 256Mi}
        limits: {cpu: "1", memory: 512Mi}
EOF
```

Bước 4 (bad-pod): dùng cùng YAML, đổi `name: bad-pod` và `requests.cpu: "1"`. Mong đợi `Forbidden: exceeded quota`.

Thêm 2 bài tự kiểm tra:

```bash
kubectl run no-resources -n team-alpha --image=nginx
```

Mong đợi: `must specify limits.cpu ... requests.cpu ...`.

```bash
kubectl create deployment big -n team-alpha --image=nginx --replicas=5
kubectl get deploy,rs,pods -n team-alpha
kubectl describe rs -n team-alpha
```

Mong đợi: `apply` thành công nhưng Pod không xuất hiện; lỗi nằm trong events của ReplicaSet.

### Nên làm

```bash
kubectl apply -f ~/repo/manifests/01-fundamentals/namespace-with-quota.yaml
kubectl describe quota -n team-a
```

---

## Note #10 — LimitRange

### Bắt buộc

**Lab D** trong phần tổng kết Note #10. Dùng manifest có sẵn (manifest không có `namespace` nên phải truyền `-n`):

```bash
kubectl create namespace limits-lab
kubectl apply -n limits-lab -f ~/repo/manifests/06-configuration/limit-range.yaml
kubectl describe limitrange default-limits -n limits-lab
```

Kiểm tra 4 trường hợp trong bảng "Specify một phần" của Note #10:

```bash
kubectl run none -n limits-lab --image=nginx
kubectl get pod none -n limits-lab -o jsonpath='{.spec.containers[0].resources}'; echo

kubectl run too-big -n limits-lab --image=nginx \
  --overrides='{"spec":{"containers":[{"name":"too-big","image":"nginx","resources":{"limits":{"cpu":"3"}}}]}}'
```

Mong đợi:

- `none` → request `100m/128Mi`, limit `500m/512Mi`
- `too-big` → `Forbidden: maximum cpu usage per Container is 2, but limit is 3`

Bài kết hợp: thêm ResourceQuota vào `limits-lab` rồi tạo lại Pod `none` → **không** bị reject vì LimitRange đã tự điền resource.

---

## Thứ tự gợi ý trong 1 tuần

| Ngày | Note | Lab |
|---|---|---|
| 1 | #1, #2 | Note #1 Lab 1–4, Note #2 Lab 1, 2, 4, 5 |
| 2 | #3 | lab-06, lab-07 |
| 3 | #4, #5 | lab-14 + bổ sung NodePort/LB/ExternalName, DNS cross-namespace |
| 4 | #6, #7 | lab-21 (bước 1, 2, 4, 5), mini lab command/args |
| 5 | #8 | lab-24, lab-21 bước 3 |
| 6 | #9, #10 | lab-02 (đã sửa), Lab D |
| 7 | Ôn tập | Làm lại lab-07 và Lab D không nhìn note |

---

## Lỗi phát hiện trong lab/manifests của repo

Chưa sửa. Ghi lại để xử lý sau.

| File | Vấn đề |
|---|---|
| `labs/lab-02-namespaces-and-contexts.md` | `kubectl run --requests/--limits` đã bị xóa từ kubectl 1.24; chỉ chạy với kind (`kind get clusters`); "Next Steps" trỏ tới "Lesson 35 - kubectl Essentials" không tồn tại |
| `labs/lab-01-anatomy-of-a-container.md` | Bước 6 dùng `yes ... \| md5sum`, không cấp phát memory nên không gây OOM |
| `labs/lab-21-resource-management-and-oomkiller.md` | Bước 3 cần `kubectl top` nhưng lab không cài Metrics Server; `polinux/stress` chỉ có amd64 (không sao trên EC2 x86_64); prerequisite ghi "Lesson 25" thay vì Lesson 21 |
| `labs/lab-14-services-and-cluster-networking.md` | Prerequisite ghi "Lesson 17" thay vì Lesson 14 |
| `manifests/13-troubleshooting/stress-pod.yaml` | `requests.memory: 256Mi` > `limits.memory: 128Mi` → API reject |
| `manifests/04-networking/nodeport-service.yaml` | `targetPort: 8080` không khớp với Pod `app: web` (nginx port 80) trong các manifest khác |
