# Kubernetes Service Types — Tổng ôn kiến thức từ A–Z

Sau khi hiểu Deployment, ReplicaSet và Pod, kiến thức tiếp theo rất quan trọng là Service.

Nếu Deployment trả lời câu hỏi:

> Làm sao để ứng dụng luôn có đủ Pod chạy?

Thì Service trả lời:

> Làm sao để các ứng dụng khác có thể truy cập những Pod đó một cách ổn định?

## 1. Tại sao Kubernetes cần Service?

Giả sử backend có 3 Pods:

```
backend-pod-1 → 10.244.1.5
backend-pod-2 → 10.244.1.6
backend-pod-3 → 10.244.1.7
```

Khi một Pod chết, Deployment tạo Pod thay thế, nhưng Pod mới có thể nhận IP khác.

Vấn đề: Frontend không thể liên tục cập nhật IP của từng backend Pod.

Giải pháp: Kubernetes Service tạo một điểm truy cập ổn định và định tuyến đến các Pod phù hợp.

Frontend

Gửi request đến backend-svc

Service: backend-svc

ClusterIP: 10.96.0.100

DNS: backend-svc

Pod 1

10.244.1.5

Pod 2

10.244.1.6

Pod 3

10.244.1.7

IP chỉ mang tính minh họa. Service phân phối các kết nối đến các backend đủ điều kiện, không bảo đảm round-robin chính xác từng request.

Điểm cần nhớ: Deployment quản lý vòng đời Pod; Service cung cấp kết nối ổn định đến các Pod đó.

## 2. Bốn loại Service quan trọng nhất

[Designing Your First App with Kubernetes - Mirantis](https://images.openai.com/static-rsc-4/5ECXXL7nu4Pcx6XRYHZqujCqgZCJDi4sn543FtUdBfx3TEbVyz-hFGozcRl3r0aWrBOj6zLo-NsQCe8NGpmV2bYejCmklUw1JjlEvXQEA0CEGZgjHPr_yILNPNcjUJmSSBFnKaa3z29i3Gczq_OK0ABqZ908GJEYEPe0OnfdYJY?purpose=inline)

1\. ClusterIP

Chỉ truy cập được từ mạng nội bộ cluster theo cấu hình thông thường.

Ví dụ: Frontend gọi Backend, Backend gọi Redis.

[iT 邦幫忙::一起幫忙解決難題，拯救 IT 人的一天](https://images.openai.com/static-rsc-4/25XlAA7x9MDlZlI3_JwPeyCsib_ggUq-Vl1fHFImlSXka3Ng0eZUWDZShWuklkgAani4U7kjXnWfAIxM_VD1qWjgwzNwH6aeC5niM0uf-Sxl8xxGvjZfAdSY0TAm4qBDpIqbkjRm3u_a-TWo5-C6Ey6bZ3oS4EFKG8xj9LFtRBc?purpose=inline)

2\. NodePort

Mở một port trên các Node để truy cập Service qua IP Node và port đó.

Ví dụ: Truy cập app bằng NodeIP:30080 trong lab.

[Kubernetes Service and Ingress-Part 5 | by Dumlu Timuralp | Medium](https://images.openai.com/static-rsc-4/ZifNjuFC9_kd0_jy7CrdwE6tUA6Jh7OLw7JNwTAb6eSE-tGp_ImD-c84ItvtG9ZDuc-JgWaxAmw44RyccVGEX6WruMRrdOTyzmUggpgxm2mq0-o21MHeB-H4QFm1nP6UJEbdcgBioyv1AK3AeFXVXNuDKX65Nv_yDr1psD1x3To?purpose=inline)

3\. LoadBalancer

Yêu cầu tích hợp hạ tầng cấp một load balancer để expose Service.

Ví dụ: AWS Load Balancer đưa traffic từ bên ngoài vào ứng dụng.

[Kubernetes、ExternalName Serviceの検証と利用時の注意事項](https://images.openai.com/static-rsc-4/3mM0WF3q0SczHDHNdOGjrGJHHvAda2Ww9XLp6-ti0_IuJrHC3aP35D8qLu6fV5ERy4UrJ8YD97Z1SfKM7xvm7zrG6WTCeSgv5JWtY8QC3zG5PqXaGLbnPPQl6D1-0E95Ahzguby-fAb-Rvr9AotvsTt_poUyjbw4PPS4tsH8-rQ?purpose=inline)

4\. ExternalName

Ánh xạ tên Service đến một tên DNS khác, không tạo proxy hay ClusterIP thông thường.

Ví dụ: Dùng tên Service nội bộ để tham chiếu database bên ngoài.

### Bảng so sánh

| Type           | Truy cập                          | Ứng dụng          |
| -------------- | --------------------------------- | ----------------- |
| `ClusterIP`    | Trong cluster                     | Internal APIs     |
| `NodePort`     | Node IP + port, nếu mạng cho phép | Lab, testing      |
| `LoadBalancer` | Qua load balancer của hạ tầng     | Expose ứng dụng   |
| `ExternalName` | DNS alias                         | Dịch vụ bên ngoài |

`ClusterIP` là loại mặc định khi không khai báo `spec.type`.

## 3. ClusterIP — Loại phổ biến nhất

Ví dụ bạn có Deployment `backend`, các Pod có label `app: backend`.

Manifest:

```

apiVersion: v1
kind: Service
metadata:
  name: backend-svc
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 8080

```

Giải thích:

- `selector: app: backend` → Tìm các Pod có label tương ứng.
- `port: 80` → Port mà client dùng để kết nối Service.
- `targetPort: 8080` → Port đích trên Pod mà Service chuyển traffic tới.

Ví dụ frontend gọi:

```
curl http://backend-svc:80
```

Service chuyển kết nối tới một Pod backend ở port `8080`, giả sử ứng dụng thực sự đang lắng nghe port này.

### 3 loại port rất dễ nhầm

| Field           | Ý nghĩa                                |
| --------------- | -------------------------------------- |
| `port`          | Port của Service                       |
| `targetPort`    | Port đích trên Pod                     |
| `containerPort` | Port container khai báo trong Pod spec |

Quan trọng: `containerPort` chủ yếu là metadata khai báo port; ứng dụng vẫn phải thực sự listen trên port đó. `targetPort` phải trỏ đến port app đang lắng nghe, không nhất thiết phải trùng trường `containerPort`.

## 4. NodePort — Truy cập qua IP của Node

NodePort mở một port trên Node, mặc định trong khoảng `30000–32767`.

```
apiVersion: v1
kind: Service
metadata:
  name: backend-nodeport
spec:
  type: NodePort
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080
```

Luồng kết nối:

```
Client
  ↓
NodeIP:30080
  ↓
Service port:80
  ↓
Pod:8080
```

Ví dụ:

```
curl http://192.168.1.10:30080
```

Lưu ý: Với cluster Kind, Node chạy bên trong Docker container nên bạn không mặc nhiên truy cập được `localhost:30080`. Bạn cần cấu hình port mapping hoặc giải pháp truy cập phù hợp.

Ứng dụng: NodePort hữu ích để học networking hoặc expose dịch vụ trong môi trường kiểm soát. Production thường dùng LoadBalancer hoặc Ingress/Gateway thay vì yêu cầu người dùng truy cập trực tiếp NodePort.

## 5. LoadBalancer — Truy cập từ bên ngoài

Ví dụ trên AWS EKS:

```
apiVersion: v1
kind: Service
metadata:
  name: backend-public
spec:
  type: LoadBalancer
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 8080
```

Luồng điển hình:

```
Internet
   ↓
AWS Load Balancer
   ↓
Kubernetes Service
   ↓
Backend Pods
```

Khi tạo Service `LoadBalancer`, Kubernetes cần một cloud-controller hoặc load-balancer controller tương thích để cấp LB. Trên EKS, loại LB và cách định tuyến phụ thuộc controller và cấu hình sử dụng.

Trên Kind thuần túy, Service có thể nằm ở trạng thái `EXTERNAL-IP: <pending>` vì không có controller cung cấp external load balancer.

Điểm cần nhớ: `LoadBalancer` không đồng nghĩa tự động có AWS ALB. ALB thường được cấu hình thông qua Ingress hoặc các resource tương thích với AWS Load Balancer Controller.

## 6. ExternalName — DNS alias

Ví dụ:

```
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  type: ExternalName
  externalName: db.example.com
```

Ứng dụng có thể truy vấn DNS tên:

```
external-db.default.svc.cluster.local
```

DNS sẽ trả về CNAME hướng đến `db.example.com`.

ExternalName không tự tạo network proxy, không mở kết nối hoặc chuyển port, và vẫn yêu cầu DNS cũng như kết nối mạng tới đích hoạt động.

## 7. Headless Service — Trường hợp đặc biệt

Headless Service không phải `type` thứ năm. Đây là Service có:

```
spec:
  clusterIP: None
```

Thường dùng với StatefulSet, khi client cần tìm địa chỉ từng Pod cụ thể thay vì truy cập qua một ClusterIP chung.

Ví dụ:

```
postgres-0.db-svc
postgres-1.db-svc
postgres-2.db-svc
```

DNS có thể trả về địa chỉ từng endpoint. StatefulSet kết hợp Headless Service để cung cấp tên mạng ổn định cho mỗi Pod.

## 8. Service tìm Pod bằng cách nào?

Đây là phần quan trọng nhất khi troubleshooting.

```

# Deployment Pod template
metadata:
  labels:
    app: backend
    env: production

# Service
spec:
  selector:
    app: backend

```

Service chọn tất cả Pod có `app=backend` trong cùng namespace, dù Pod có thêm label khác.

Kubernetes tạo/cập nhật EndpointSlices để biểu diễn các backend của Service.

```
Service selector
      ↓
Pod labels
      ↓
EndpointSlices
      ↓
Ready backend endpoints
```

Các lệnh quan trọng:

```
kubectl get svc -n deployment-lab
kubectl get endpointslice -n deployment-lab
kubectl describe svc backend-svc -n deployment-lab
kubectl get pods --show-labels -n deployment-lab
```

Nếu Service không có endpoint sẵn sàng, hãy kiểm tra selector, labels và readinessProbe trước tiên.

## 9. Service khác Ingress thế nào?

| Thành phần         | Vai trò                                     |
| ------------------ | ------------------------------------------- |
| Deployment         | Quản lý ứng dụng và Pods                    |
| Service            | Tạo điểm truy cập ổn định đến backend       |
| Ingress            | Định tuyến HTTP/HTTPS theo hostname và path |
| Ingress Controller | Triển khai các quy tắc định tuyến Ingress   |

Ví dụ:

```
https://api.example.com
         ↓
    Ingress Controller
         ↓
    Service backend
         ↓
     Backend Pods
```

Một Service có thể dùng với Ingress, nhưng không bắt buộc phải có Ingress.

## 10. Cheat Sheet — Lệnh Service cần nhớ

```
# Xem các Service
kubectl get svc -n deployment-lab

# Chi tiết Service
kubectl describe svc backend-svc -n deployment-lab

# Xem các endpoint hiện tại
kubectl get endpointslice -n deployment-lab

# Xem label của các Pod
kubectl get pods --show-labels -n deployment-lab

# Xem YAML
kubectl get svc backend-svc -n deployment-lab -o yaml

# Test Service từ máy local
kubectl port-forward svc/backend-svc 8080:80 \
  -n deployment-lab
```

Sau lệnh `port-forward`, bạn có thể thử `curl http://localhost:8080` ở terminal khác.

## 11. Kiểm tra kiến thức Service Types

Service Knowledge Test

0/5 câu

1\. Frontend muốn gọi Backend trong cùng cluster. Nên sử dụng loại Service nào?

ClusterIP

NodePort

ExternalName

2\. Service có port: 80, targetPort: 8080. App cần listen trên port nào?

80

8080

30080

3\. Bạn tạo LoadBalancer trên Kind nhưng EXTERNAL-IP là pending. Tại sao?

Pod thiếu label

Có thể chưa có LB controller cung cấp địa chỉ

ReplicaSet lỗi

4\. Service không có backend endpoints. Điều gì cần kiểm tra trước?

Selector, Pod labels và readiness

Dockerfile EXPOSE

Tên Deployment

5\. Headless Service được khai báo bằng cấu hình nào?

type: Headless

nodePort: 30080

clusterIP: None

### Chốt kiến thức

Chỉ cần nhớ:

- ClusterIP: Truy cập nội bộ cluster.
- NodePort: Truy cập qua IP và port của Node.
- LoadBalancer: Expose Service thông qua LB của hạ tầng.
- ExternalName: Bí danh DNS tới một hostname khác.
- Headless: Không có ClusterIP, phù hợp khi cần DNS tới các Pod cụ thể.

Khi làm DevOps, ngoài việc biết Service Type nào phù hợp, kỹ năng quan trọng nhất là troubleshoot đường đi request từ Service → EndpointSlice → Pod.

Bài thực hành tương ứng trong giáo trình GitHub của bạn là Lab 14 — Services and Cluster Networking.