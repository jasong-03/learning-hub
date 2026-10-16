# Kubernetes — Giai đoạn 1: Application Deployment

Intermediate

6 chủ đề · Lý thuyết + YAML + Troubleshooting + Lab

Đây là phần kiến thức giúp bạn chuyển từ biết tạo Deployment và Service sang triển khai được ứng dụng thực tế có cấu hình, health checks và lưu trữ dữ liệu.

Mình tổng hợp cả 6 chủ đề trong một lần, dựa trên các phần tương ứng của bộ Kubernetes 46 Labs bạn đã gửi và bổ sung những lưu ý vận hành production.

## Lộ trình Giai đoạn 1

Learning Checklist

0/6

1\. ConfigMap

Cấu hình ứng dụng không cần rebuild image

2\. Secret

Quản lý password, API keys và thông tin nhạy cảm

3\. Health Probes

Liveness, Readiness, Startup

4\. Volumes, PV & PVC

Lưu trữ dữ liệu cho container

5\. StorageClass

Tự động cấp phát storage

6\. StatefulSet

Triển khai ứng dụng cần identity và storage ổn định

# Phần 1 — ConfigMap

## 1. ConfigMap là gì?

ConfigMap dùng để lưu cấu hình không nhạy cảm, tách biệt khỏi container image.

Ví dụ backend FastAPI cần:

```
APP_ENV=production
LOG_LEVEL=info
API_TIMEOUT=30
```

Thay vì hardcode trong source code hay Dockerfile, bạn đưa chúng vào ConfigMap.

ConfigMap

APP_ENV, LOG_LEVEL, API_TIMEOUT

Environment

Inject vào biến môi trường

Volume

Mount thành file cấu hình

## 2. Manifest ConfigMap

```

apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
  API_TIMEOUT: "30"

```

Các giá trị trong `data` là string. Vì vậy với số `30`, bạn nên đặt trong dấu ngoặc kép.

### Cách 1: Inject từng biến

```
env:
  - name: APP_ENV
    valueFrom:
      configMapKeyRef:
        name: backend-config
        key: APP_ENV
```

### Cách 2: Inject tất cả

```
envFrom:
  - configMapRef:
      name: backend-config
```

Khi container chạy, ứng dụng có thể đọc:

```
import osenv = os.getenv("APP_ENV")timeout = int(os.getenv("API_TIMEOUT", "30"))
```

### Cách 3: Mount ConfigMap thành file

```
volumeMounts:
  - name: config-volume
    mountPath: /etc/app-config
    readOnly: true

volumes:
  - name: config-volume
    configMap:
      name: backend-config
```

Kết quả có các file:

```
/etc/app-config/
├── APP_ENV
├── LOG_LEVEL
└── API_TIMEOUT
```

## 3. ConfigMap update có tự áp dụng không?

Đây là điểm rất hay bị hỏi.

| Cách inject                | Khi ConfigMap thay đổi                             |
| -------------------------- | -------------------------------------------------- |
| `env`                      | Container đang chạy không tự cập nhật              |
| `envFrom`                  | Container đang chạy không tự cập nhật              |
| Volume mount thông thường  | File có thể được cập nhật sau một khoảng thời gian |
| Volume mount qua `subPath` | Không nhận cập nhật tự động                        |

Với cấu hình dạng environment variables, thông thường bạn cần rollout lại Deployment:

```
kubectl rollout restart deployment/backend -n production
```

Cần nhớ: ConfigMap thay đổi không mặc nhiên restart Pod. Ngay cả khi file được cập nhật qua volume, ứng dụng cũng phải hỗ trợ đọc lại file nếu muốn nhận giá trị mới mà không restart.

# Phần 2 — Secret

## 4. Secret là gì?

Secret là Kubernetes resource dùng để lưu và phân phối dữ liệu nhạy cảm, chẳng hạn:

- Database password.
- API token.
- TLS certificate.
- Credentials.

ConfigMap và Secret có cấu trúc khá giống nhau, nhưng mục đích sử dụng khác nhau.

| ConfigMap                       | Secret                             |
| ------------------------------- | ---------------------------------- |
| Không nhạy cảm                  | Nhạy cảm                           |
| APP_ENV, LOG_LEVEL              | DB_PASSWORD, API_TOKEN             |
| `data` là string                | `data` base64 hoặc `stringData`    |
| Không thiết kế riêng cho secret | Có cơ chế riêng cho sensitive data |

## 5. Secret Manifest

```
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
type: Opaque
stringData:
  DB_USERNAME: "appuser"
  DB_PASSWORD: "demo-password"
```

Đây chỉ là mật khẩu minh họa, không dùng cho production.

`stringData` cho phép nhập plain text, Kubernetes sẽ chuyển sang dữ liệu trong `data` khi lưu.

### Inject Secret vào Pod

```
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: backend-secret
        key: DB_PASSWORD
```

Ứng dụng:

```
import ospassword = os.environ["DB_PASSWORD"]
```

## 6. Base64 có phải encryption không?

Không.

Ví dụ:

```
echo -n "mypassword" | base64
```

Có thể đảo ngược:

```
echo "bXlwYXNzd29yZA==" | base64 -d
```

Bất kỳ ai đọc được giá trị này đều có thể giải mã.

Để bảo vệ Secret trong production, bạn cần quan tâm:

- Bật encryption at rest cho Kubernetes Secret data trong etcd.
- Giới hạn quyền đọc Secret bằng RBAC.
- Không commit plaintext Secret hoặc file chứa credentials lên Git.
- Hạn chế đưa Secret vào logs hay command-line arguments.
- Cân nhắc external secret manager như AWS Secrets Manager kết hợp cơ chế tích hợp phù hợp.

Kubernetes Secret không mặc định bảo đảm dữ liệu đã được mã hóa trong etcd ở mọi cluster. Điều này phụ thuộc cấu hình cluster.

## 7. ConfigMap vs Secret — Chọn loại nào?

| Dữ liệu                | Resource  |
| ---------------------- | --------- |
| `LOG_LEVEL=debug`      | ConfigMap |
| `APP_ENV=staging`      | ConfigMap |
| `DB_HOST=postgres-svc` | ConfigMap |
| `DB_PASSWORD=...`      | Secret    |
| `JWT_SIGNING_KEY=...`  | Secret    |
| TLS private key        | Secret    |

Production note: Environment variable tiện lợi, nhưng Secret được mount dưới dạng file có thể phù hợp hơn trong một số hệ thống cần rotation. Không có nghĩa dùng file tự động giải quyết toàn bộ việc cập nhật credentials.

# Phần 3 — Health Probes

## 8. Vì sao Pod Running chưa chắc ứng dụng khỏe?

Giả sử FastAPI đã chạy process nhưng:

- Chưa kết nối được database.
- Chưa load model.
- Chưa hoàn thành khởi tạo.
- Bị deadlock.
- HTTP server không trả response.

Kubernetes có thể vẫn nhìn thấy container ở trạng thái `Running`.

Để hiểu ứng dụng có sẵn sàng và còn hoạt động đúng không, Kubernetes dùng Health Probes.

Có 3 loại quan trọng:

Startup Probe

Ứng dụng đã khởi động hoàn tất chưa?

Phù hợp app khởi động lâu, load AI model, warm cache.

Readiness Probe

Ứng dụng có sẵn sàng nhận traffic không?

Nếu thất bại, Pod được đánh dấu Not Ready và bị loại khỏi các backend sẵn sàng của Service.

Liveness Probe

Ứng dụng có còn hoạt động không?

Nếu thất bại liên tục đến ngưỡng, kubelet restart container.

### Bảng so sánh

| Probe     | Khi thất bại                                              |
| --------- | --------------------------------------------------------- |
| Startup   | Container có thể bị restart                               |
| Readiness | Pod bị đánh dấu Not Ready, không restart chỉ vì readiness |
| Liveness  | Container bị restart sau khi đạt failure threshold        |

## 9. Manifest Health Probes

Ví dụ một API chạy port 8000 và có các endpoint health tương ứng:

```

containers:
  - name: backend
    image: example/backend:v1
    ports:
      - containerPort: 8000

    startupProbe:
      httpGet:
        path: /health/startup
        port: 8000
      periodSeconds: 5
      failureThreshold: 24

    readinessProbe:
      httpGet:
        path: /health/ready
        port: 8000
      periodSeconds: 5
      failureThreshold: 3

    livenessProbe:
      httpGet:
        path: /health/live
        port: 8000
      periodSeconds: 10
      failureThreshold: 3

```

Phải tự triển khai những health endpoints này trong backend; Kubernetes không tự tạo chúng.

### Giải thích

Startup Probe:

```
periodSeconds: 5
failureThreshold: 24
```

Cho app khoảng 120 giây để khởi động trong trường hợp probe liên tục thất bại; thời gian thực tế còn phụ thuộc thời điểm probe, timeout và execution.

Trong khi startup probe chưa thành công, Kubernetes chưa chạy liveness và readiness probes.

### Tại sao không nên dùng một endpoint cho mọi Probe?

Giả sử PostgreSQL tạm thời mất kết nối.

- Readiness có thể thất bại để API ngừng nhận traffic nếu API thực sự không phục vụ được request.
- Liveness nên kiểm tra app còn sống và có thể phục hồi không.

Nếu liveness cũng thất bại mỗi khi database mất kết nối, Kubernetes có thể restart hàng loạt backend Pods dù restart không sửa được database.

Nguyên tắc production:

- Liveness: Kiểm tra khả năng sống và phục hồi của process.
- Readiness: Kiểm tra khả năng phục vụ request.
- Startup: Cho phép quá trình khởi tạo kéo dài hợp lý.

## 10. Troubleshooting Probes

```
kubectl get pods -n production
kubectl describe pod <pod-name> -n production
kubectl logs <pod-name> -n production
```

Ví dụ Events:

```
Readiness probe failed:
connection refused
```

Nghĩa là ứng dụng chưa accept kết nối tại thời điểm probe.

Hoặc:

```
Liveness probe failed:
HTTP probe failed with statuscode: 500
```

Cần kiểm tra:

- App có listen đúng port không?
- Health endpoint có tồn tại không?
- Startup có quá chậm không?
- Có CPU throttling nghiêm trọng không?
- Probe timeout quá thấp không?
- Dependency có thực sự cần thiết để app phục vụ request không?

Một probe cấu hình sai có thể gây downtime ngay cả khi application code vẫn hoạt động.

# Phần 4 — Volumes, PV & PVC

## 11. Vì sao Kubernetes cần Storage?

Mặc định, filesystem có thể ghi của container không phải nơi lưu dữ liệu lâu dài đáng tin cậy.

Ví dụ PostgreSQL ghi database vào filesystem bên trong container. Nếu container bị thay thế, dữ liệu nằm ở lớp ghi đó có thể mất.

Giải pháp: Sử dụng Kubernetes Volumes và persistent storage.

## 12. Phân biệt Volume, PV, PVC

Pod / Container

volumeMounts: /data

PVC — PersistentVolumeClaim

Yêu cầu một vùng storage

PV — PersistentVolume

Đại diện tài nguyên storage đã cấp

Storage Backend

Local disk · EBS · NFS · CSI volume

| Resource     | Trách nhiệm                            |
| ------------ | -------------------------------------- |
| Volume       | Cách Pod gắn storage vào container     |
| PV           | Kubernetes object đại diện cho storage |
| PVC          | Yêu cầu storage của workload           |
| StorageClass | Chính sách/cách cấp phát storage       |

### Những loại Volume cần nhớ

| Volume            | Dữ liệu tồn tại bao lâu?         | Use case                                        |
| ----------------- | -------------------------------- | ----------------------------------------------- |
| `emptyDir`        | Theo vòng đời Pod                | Cache, temporary files                          |
| `configMap`       | Theo dữ liệu ConfigMap           | Config files                                    |
| `secret`          | Theo dữ liệu Secret              | Credentials files                               |
| PVC-backed volume | Theo PV và reclaim policy        | Database, persistent application data           |
| `hostPath`        | Dữ liệu trên filesystem của Node | Một số công cụ hệ thống, lab; cần chú ý bảo mật |

Quan trọng: `emptyDir` vẫn giữ dữ liệu khi container restart trong cùng Pod, nhưng mất khi Pod bị xóa và thay bằng Pod khác.

## 13. PersistentVolumeClaim Manifest

```

apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi

```

Ở đây:

- `ReadWriteOnce`: Volume có thể được mount read-write bởi một Node tại một thời điểm; không đồng nghĩa giới hạn chỉ một Pod.
- `storage: 1Gi`: Yêu cầu 1Gi storage.
- Nếu không chỉ định `storageClassName`, Kubernetes có thể dùng default StorageClass nếu có.

### Pod mount PVC

```

apiVersion: v1
kind: Pod
metadata:
  name: storage-demo
spec:
  containers:
    - name: app
      image: busybox:1.36
      command: ["sleep", "3600"]
      volumeMounts:
        - name: app-storage
          mountPath: /data
  volumes:
    - name: app-storage
      persistentVolumeClaim:
        claimName: app-data

```

Bên trong container:

```
echo "hello" > /data/test.txt
```

Nếu Pod bị xóa và Pod mới mount lại chính PVC đó thành công, dữ liệu vẫn có thể tồn tại.

### Access Modes cần nhớ

| Mode                      | Ý nghĩa                                                         |
| ------------------------- | --------------------------------------------------------------- |
| `ReadWriteOnce` / RWO     | Read-write trên một Node                                        |
| `ReadOnlyMany` / ROX      | Read-only từ nhiều Nodes                                        |
| `ReadWriteMany` / RWX     | Read-write từ nhiều Nodes                                       |
| `ReadWriteOncePod` / RWOP | Chỉ một Pod được mount read-write trong cluster, với CSI hỗ trợ |

Không phải storage backend nào cũng hỗ trợ mọi access mode.

## 14. PV Reclaim Policy

Khi bạn xóa PVC, chuyện gì xảy ra với underlying storage?

Phụ thuộc reclaim policy:

| Policy   | Hành vi                                           |
| -------- | ------------------------------------------------- |
| `Delete` | Storage được provisioner xóa theo cơ chế hỗ trợ   |
| `Retain` | Giữ lại PV/backing storage để quản trị viên xử lý |

Đặc biệt với database production: Phải kiểm tra reclaim policy và backup trước khi xóa PVC.

PVC không phải backup. Replica cũng không thay thế backup.

# Phần 5 — StorageClass

## 15. StorageClass dùng để làm gì?

Nếu mỗi lần tạo PVC bạn đều phải tự cấp một ổ đĩa, việc quản lý sẽ rất thủ công.

StorageClass cho phép Kubernetes dùng một storage provisioner để dynamic provisioning, tức tự tạo PV/backend volume tương ứng khi PVC yêu cầu.

PVC

StorageClass

PV + Disk

Ví dụ trên AWS EKS, StorageClass có thể sử dụng Amazon EBS CSI Driver để provision EBS volumes.

Một manifest minh họa:

```

apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: app-storage
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true

```

Lưu ý đây là ví dụ cho một môi trường EKS có driver tương ứng; không áp dụng trực tiếp trên Kind. Một số môi trường EKS khác sử dụng provisioner khác, chẳng hạn chế độ Auto Mode.

`WaitForFirstConsumer` có ý nghĩa quan trọng: PVC chờ một Pod sử dụng trước khi provision/bind, giúp lựa chọn storage phù hợp với scheduling và topology của Pod.

### Các lệnh debug storage

```
kubectl get storageclass

kubectl get pvc -A

kubectl get pv

kubectl describe pvc app-data -n production

kubectl describe pod <pod-name> -n production
```

Nếu PVC bị `Pending`, hãy kiểm tra:

1. StorageClass có tồn tại không?
2. CSI driver/provisioner có hoạt động không?
3. Có lỗi provisioning, quota hoặc quyền truy cập không?
4. Có điều kiện topology/availability zone nào không phù hợp không?
5. Có Pod consumer để kích hoạt `WaitForFirstConsumer` chưa?

Liên hệ AWS: EBS thường ràng buộc với một Availability Zone, nên Pod có thể gặp lỗi attach hoặc scheduling nếu topology không tương thích.

# Phần 6 — StatefulSet

## 16. StatefulSet là gì?

StatefulSet dùng để quản lý những Pods cần identity ổn định, storage riêng và thứ tự triển khai có kiểm soát.

Khác với Deployment, StatefulSet cung cấp danh tính có thể dự đoán cho từng Pod.

Deployment

backend-7f8d-x2

backend-7f8d-q9

backend-7f8d-k5

Pod names có thể thay đổi

StatefulSet

postgres-0

postgres-1

postgres-2

Identity cố định theo ordinal

### Deployment vs StatefulSet

| Đặc điểm     | Deployment                        | StatefulSet                         |
| ------------ | --------------------------------- | ----------------------------------- |
| Pod identity | Không cố định                     | Ổn định                             |
| Pod names    | Sinh theo ReplicaSet              | `app-0`, `app-1`...                 |
| Storage      | Có thể sử dụng PVC                | Hỗ trợ PVC riêng cho mỗi replica    |
| Scaling      | Không có thứ tự identity mặc định | Có thể tạo/xóa theo thứ tự          |
| Phù hợp      | Stateless API, frontend           | Database, distributed stateful apps |

Deployment vẫn có thể dùng PVC, và StatefulSet không tự biến ứng dụng thành database HA.

## 17. StatefulSet + Headless Service

Đây là cặp resource cần nhớ.

Ví dụ PostgreSQL có 3 Pods:

```
postgres-0
postgres-1
postgres-2
```

Với Headless Service `postgres`, Pod có thể có DNS:

```
postgres-0.postgres.default.svc.cluster.local
postgres-1.postgres.default.svc.cluster.local
postgres-2.postgres.default.svc.cluster.local
```

Điều này cho phép các Pod tìm nhau bằng identity ổn định.

### Headless Service Manifest

```
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
    - port: 5432
```

## 18. StatefulSet Manifest

Đây là ví dụ học StatefulSet với Nginx để quan sát stable identity và PVC riêng; chưa phải cấu hình database production.

```

apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  serviceName: web-headless
  replicas: 3

  selector:
    matchLabels:
      app: web

  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:alpine
          ports:
            - containerPort: 80
          volumeMounts:
            - name: data
              mountPath: /usr/share/nginx/html

  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 1Gi

```

Cần tạo Headless Service `web-headless` cùng namespace với StatefulSet.

Kubernetes sẽ tạo các PVC tương ứng:

```
data-web-0
data-web-1
data-web-2
```

Mỗi replica có vùng storage riêng.

Quan trọng: `replicas: 3` không tự động tạo PostgreSQL replication hay high availability. Muốn triển khai PostgreSQL HA, bạn cần cơ chế replication, failover, backup hoặc database operator phù hợp.

## 19. StatefulSet Scaling & Troubleshooting

```
# Xem StatefulSets
kubectl get sts -n production

# Xem Pods
kubectl get pods -n production -o wide

# Xem PVCs
kubectl get pvc -n production

# Scale
kubectl scale sts/web --replicas=3 -n production

# Xem thông tin
kubectl describe sts web -n production
```

Với chính sách `OrderedReady` mặc định:

- Pod `web-0` phải Running và Ready trước khi tiếp tục tạo `web-1`.
- Tiếp theo mới đến `web-2`.
- Khi scale down, Pods thường được xóa theo thứ tự ordinal giảm dần.

Nếu `web-0` chưa Ready, StatefulSet có thể bị kẹt không tạo tiếp các replica sau.

Mặc định, PVC từ `volumeClaimTemplates` được giữ lại khi StatefulSet scale down hoặc bị xóa, trừ khi bạn cấu hình chính sách retention khác.

Đó là lý do phải quản lý vòng đời PVC cẩn thận.

# Phần 7 — Lab tổng hợp Giai đoạn 1

Bây giờ kết hợp 6 chủ đề vào một mini-project chạy trên cluster `kind-lab` của bạn.

Mục tiêu: Deploy một web app Nginx có ConfigMap, Secret, Health Probes, PersistentVolumeClaim và một StatefulSet độc lập để kiểm tra stable Pod identity.

Lab này tập trung vào cơ chế Kubernetes, chưa phải hệ thống FastAPI + PostgreSQL hoàn chỉnh.

## 20. Kiến trúc Lab

Client — kubectl port-forward

Service: web-svc

ClusterIP :80

Deployment: web — 2 replicas

web-pod-1

Probes + Config

web-pod-2

Probes + Config

StatefulSet: storage-demo

storage-demo-0

PVC riêng

storage-demo-1

PVC riêng

## 21. Setup

```
kubectl config current-context
kubectl get nodes
kubectl get storageclass

kubectl create namespace app-stage1 \
  --dry-run=client -o yaml | kubectl apply -f -

mkdir -p ~/work/app-stage1
cd ~/work/app-stage1
```

Chỉ tiếp tục nếu context đúng `kind-lab` và các Node Ready. Phần StatefulSet cần một default StorageClass có khả năng provision PVC.

## 22. Tạo ConfigMap, Secret, Deployment và Service

Lưu vào file `web.yaml`:

```

apiVersion: v1
kind: ConfigMap
metadata:
  name: web-config
  namespace: app-stage1
data:
  index.html: |
    <h1>Kubernetes Stage 1</h1>
    <p>ConfigMap is working!</p>
---
apiVersion: v1
kind: Secret
metadata:
  name: web-secret
  namespace: app-stage1
type: Opaque
stringData:
  DEMO_TOKEN: "not-a-real-secret"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: app-stage1
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80
          env:
            - name: DEMO_TOKEN
              valueFrom:
                secretKeyRef:
                  name: web-secret
                  key: DEMO_TOKEN
          volumeMounts:
            - name: html
              mountPath: /usr/share/nginx/html
              readOnly: true
          startupProbe:
            httpGet:
              path: /
              port: 80
            periodSeconds: 5
            failureThreshold: 12
          readinessProbe:
            httpGet:
              path: /
              port: 80
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /
              port: 80
            periodSeconds: 10
          resources:
            requests:
              cpu: "50m"
              memory: "64Mi"
            limits:
              cpu: "250m"
              memory: "256Mi"
      volumes:
        - name: html
          configMap:
            name: web-config
---
apiVersion: v1
kind: Service
metadata:
  name: web-svc
  namespace: app-stage1
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80

```

Chạy:

```
kubectl apply -f web.yaml

kubectl rollout status deploy/web \
  -n app-stage1 --timeout=180s

kubectl get deploy,pods,svc -n app-stage1

kubectl port-forward svc/web-svc 8080:80 \
  -n app-stage1
```

Ở terminal khác:

```
curl http://localhost:8080
```

Expected:

```
<h1>Kubernetes Stage 1</h1>
<p>ConfigMap is working!</p>
```

Bạn cũng có thể cập nhật nội dung ConfigMap rồi quan sát file mount thay đổi sau khi kubelet đồng bộ. Đây là môi trường demo, nên Secret chỉ chứa chuỗi giả và tuyệt đối không dùng credentials thật.

## 23. Tạo StatefulSet có PVC riêng

Lưu vào file `stateful.yaml`:

```

apiVersion: v1
kind: Service
metadata:
  name: storage-headless
  namespace: app-stage1
spec:
  clusterIP: None
  selector:
    app: storage-demo
  ports:
    - name: http
      port: 80
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: storage-demo
  namespace: app-stage1
spec:
  serviceName: storage-headless
  replicas: 2
  selector:
    matchLabels:
      app: storage-demo
  template:
    metadata:
      labels:
        app: storage-demo
    spec:
      containers:
        - name: nginx
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80
          volumeMounts:
            - name: data
              mountPath: /data
          resources:
            requests:
              cpu: "25m"
              memory: "32Mi"
            limits:
              cpu: "200m"
              memory: "128Mi"
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 1Gi

```

Chạy:

```
kubectl apply -f stateful.yaml

kubectl rollout status sts/storage-demo \
  -n app-stage1 --timeout=180s

kubectl get sts,pods,pvc -n app-stage1
```

Expected có:

```
storage-demo-0
storage-demo-1

data-storage-demo-0
data-storage-demo-1
```

### Kiểm tra dữ liệu tồn tại sau khi Pod được tạo lại

```
# Ghi dữ liệu
kubectl exec -n app-stage1 storage-demo-0 \
  -- sh -c 'echo "persistent-data" > /data/test.txt'

# Xóa Pod, StatefulSet sẽ tái tạo
kubectl delete pod storage-demo-0 -n app-stage1

# Chờ Pod Ready
kubectl wait --for=condition=Ready \
  pod/storage-demo-0 -n app-stage1 --timeout=180s

# Đọc lại dữ liệu
kubectl exec -n app-stage1 storage-demo-0 \
  -- cat /data/test.txt
```

Expected:

```
persistent-data
```

Nếu PVC Pending hoặc Pod không Ready, kiểm tra StorageClass, provisioner, Events và `kubectl describe pvc`.

## 24. Troubleshooting Checklist

| Triệu chứng                                 | Kiểm tra                                        |
| ------------------------------------------- | ----------------------------------------------- |
| Pod không tạo vì thiếu ConfigMap/Secret key | Pod Events và `describe`                        |
| Pod Running nhưng Not Ready                 | Readiness probe, app logs                       |
| Pod restart liên tục                        | Liveness/startup probes, `--previous` logs      |
| PVC Pending                                 | StorageClass, provisioner, Events               |
| StatefulSet không tạo Pod thứ hai           | Pod đầu tiên Ready chưa? PVC đã Bound chưa?     |
| Dữ liệu mất sau restart                     | Đã mount đúng PVC hay đang dùng filesystem tạm? |

Các lệnh chung:

```
kubectl get all -n app-stage1
kubectl get pvc -n app-stage1
kubectl get events -n app-stage1 \
  --sort-by=.metadata.creationTimestamp

kubectl describe sts storage-demo -n app-stage1
kubectl describe pod storage-demo-0 -n app-stage1
kubectl describe pvc data-storage-demo-0 -n app-stage1
```

## 25. Cleanup an toàn

Đây là lab dùng namespace riêng, không xóa Kind cluster.

```
kubectl delete namespace app-stage1
```

Cảnh báo: Với PVC do StorageClass có `reclaimPolicy: Delete` cấp phát, xóa namespace có thể dẫn đến xóa backing volume và mất dữ liệu. Chỉ cleanup sau khi bạn không còn cần dữ liệu lab và đã hiểu chính sách storage.

# Phần 8 — Tự kiểm tra kiến thức

Application Deployment Test

0/6 câu

1\. Bạn đổi LOG_LEVEL trong ConfigMap được inject bằng envFrom. Container đang chạy có tự nhận giá trị mới không?

Có, ngay lập tức

Không, thường phải restart/recreate container

2\. Kubernetes Secret lưu base64. Điều đó có nghĩa dữ liệu đã được encrypt an toàn?

Đúng

Không, base64 chỉ là encoding

3\. Ứng dụng chưa kết nối được dependency nên chưa thể nhận request, nhưng process vẫn sống. Probe nào phù hợp?

Readiness

Liveness

Chỉ Startup

4\. Muốn dữ liệu tồn tại sau khi Pod bị xóa rồi tạo lại, chọn gì?

emptyDir

PersistentVolumeClaim

Container writable layer

5\. StatefulSet có 3 replicas với volumeClaimTemplates. Thông thường sẽ có bao nhiêu PVC riêng?

1

3

0

6\. StatefulSet 3 replicas tự động cung cấp PostgreSQL HA và failover?

Có

Không

## Tổng kết Giai đoạn 1

| Chủ đề          | Một câu phải thuộc                                     |
| --------------- | ------------------------------------------------------ |
| ConfigMap       | Tách cấu hình không nhạy cảm khỏi image                |
| Secret          | Quản lý dữ liệu nhạy cảm, base64 không phải encryption |
| Startup Probe   | Kiểm tra app đã khởi động xong                         |
| Readiness Probe | Quyết định Pod có sẵn sàng nhận traffic                |
| Liveness Probe  | Phát hiện app cần restart                              |
| Volume          | Cung cấp storage cho container trong Pod               |
| PVC             | Yêu cầu persistent storage                             |
| PV              | Đại diện cho storage được cung cấp                     |
| StorageClass    | Cấp phát storage động theo policy                      |
| StatefulSet     | Quản lý Pod identity và storage riêng ổn định          |

Mục tiêu hoàn thành thực sự: Bạn không chỉ đọc hiểu YAML mà còn có thể tự deploy, thay đổi ConfigMap, kiểm tra probe, tạo PVC, xóa Pod StatefulSet và xác minh dữ liệu vẫn tồn tại.

Sau khi thực hành được toàn bộ những nội dung trên, bạn đã có nền tảng để chuyển sang Giai đoạn 2 — Networking & Security, gồm Ingress, Gateway API, CoreDNS, RBAC, ServiceAccount và NetworkPolicy.