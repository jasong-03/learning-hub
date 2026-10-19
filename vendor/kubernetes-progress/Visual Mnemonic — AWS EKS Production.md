# Visual Mnemonic — Giai đoạn 5: AWS EKS Production

> Advanced → Production · 10 chủ đề · Mnemonic + Active Recall

## 1. Big Picture — Khu công nghiệp AWS

Bốn giai đoạn trước dạy Kubernetes chạy thế nào. Giai đoạn 5 trả lời: **cluster đó sống ở đâu trên AWS, ai được vào, hàng hóa (image, traffic, dữ liệu) đi qua cổng nào và ai trả tiền?** Hãy tưởng tượng EKS là một **khu công nghiệp do AWS cho thuê**: AWS giữ ban quản lý khu, bạn thuê đất, dựng xưởng và tuyển công nhân.

## 2. Visual Mnemonic — Khu công nghiệp AWS

### EKS Control Plane — Ban quản lý khu

AWS vận hành API Server, Scheduler, Controllers và datastore ở hạ tầng riêng, tách khỏi VPC của bạn. Bạn vẫn dùng `kubectl` như cũ.

### Data Plane — Nhà xưởng của bạn

Worker Nodes, kubelet và Pods chạy trong VPC của bạn. Managed Node Groups, Fargate hay EKS Auto Mode quyết định AWS gánh bao nhiêu phần việc vận hành xưởng.

### VPC & Subnets — Khuôn viên có tường rào

Public subnet là mặt tiền giáp đường lớn (ALB, NAT Gateway); private subnet là khu xưởng bên trong (worker nodes). NAT Gateway là cổng xuất hàng một chiều để Node ra Internet mà không mở cửa cho bên ngoài vào.

### Amazon VPC CNI — Số phòng thật

Mỗi Pod nhận một IP thật từ subnet của VPC, giống mỗi công nhân có số phòng thật trong khu. Subnet hết IP thì Pod không có chỗ ở dù Node còn CPU/RAM.

### IAM vs RBAC — Thẻ ra vào khu và quyền trong xưởng

IAM quyết định ai gọi được AWS APIs (S3, ECR, EC2...). RBAC quyết định ai làm gì với Kubernetes APIs (Pods, Deployments...). EKS Access Entries là bàn đăng ký nối thẻ IAM với quyền vào cluster.

### EKS Pod Identity / IRSA — Thẻ tạm cho từng tổ

Pod nhận temporary AWS credentials qua ServiceAccount được liên kết với một IAM role tối thiểu. Không phát chìa khóa vĩnh viễn (`AWS_ACCESS_KEY_ID`) cho công nhân.

### Terraform — Bản vẽ quy hoạch

Mô tả VPC, EKS, IAM bằng code; `plan` là xem trước bản vẽ, `apply` là thi công. State là sổ địa chính, phải lưu tập trung và khóa khi nhiều người sửa.

### ECR & CI/CD — Kho hàng và dây chuyền giao hàng

CI build image, scan rồi đẩy lên ECR; ArgoCD hoặc pipeline đưa image vào cluster. GitHub OIDC cho pipeline thẻ tạm thay vì long-lived AWS keys.

### ALB / NLB — Cổng khách và cổng hàng

ALB là cổng khách Layer 7, đọc host/path để chỉ đường HTTP/HTTPS (thường đi với Ingress). NLB là cổng hàng Layer 4 cho TCP/UDP/TLS (thường đi với Service `LoadBalancer`).

### EBS CSI — Tủ khóa gắn vào một tòa nhà

PVC xin tủ, EBS CSI driver cấp EBS volume thật. Tủ EBS nằm trong **một Availability Zone**, nên Pod dùng nó phải chạy ở đúng AZ đó.

### Karpenter — Đội thuê thêm xưởng

HPA tuyển thêm công nhân (Pods); Karpenter thuê thêm xưởng (EC2 Nodes) khi Pods `Pending` vì thiếu chỗ. Spot là xưởng giá rẻ AWS có thể thu hồi với thông báo ngắn.

### Observability & Security — Camera và đội bảo vệ

CloudWatch, Prometheus, Grafana và logs là camera; Security Groups gác ở lớp mạng VPC, NetworkPolicy gác giữa các Pods trong cluster.

## 3. How It Works — Một request đi qua khu công nghiệp

| Bước | Thành phần | Mnemonic |
|---|---|---|
| 1 | Route 53 | Biển chỉ đường tới khu |
| 2 | ALB Listener + Rule | Cổng khách đọc địa chỉ trên phiếu |
| 3 | Target Group | Danh sách phòng đang nhận khách |
| 4 | Security Group | Bảo vệ kiểm tra ALB có được vào xưởng không |
| 5 | Pod IP (VPC CNI) | Phòng thật của công nhân |
| 6 | Ứng dụng | Công nhân xử lý và trả kết quả |

Khi gặp `502 / 503 / 504`, đi lại đúng thứ tự này: DNS → Listener → Rules → Target health → Security Group → Pod Ready/port → logs ứng dụng. Đừng restart toàn bộ Pods trước khi xem target health.

## 4. Remember This — Những điểm phải nhớ

| Khái niệm | Điều quan trọng |
|---|---|
| Control plane | AWS vận hành; bạn vẫn chịu trách nhiệm workload, IAM và cấu hình |
| VPC CNI | Pod dùng IP thật của subnet; subnet nhỏ có thể làm Pod không tạo được |
| IAM ≠ RBAC | IAM cho AWS APIs, RBAC cho Kubernetes APIs |
| Pod Identity | Credentials tạm thời theo ServiceAccount; không reuse node role, không cấp `AdministratorAccess` |
| Terraform state | Là sự thật của Terraform; mất hoặc sửa tay sẽ lệch với hạ tầng |
| ALB vs NLB | Layer 7 HTTP routing vs Layer 4 kết nối mạng |
| EBS | Gắn với một AZ; persistent storage ≠ backup |
| HPA ≠ Karpenter | HPA tăng Pods, Karpenter tăng Nodes; quota, subnet IP và NodePool limit vẫn có thể chặn |
| Security Group ≠ NetworkPolicy | Lớp VPC khác lớp Pod; không cái nào thay thế hoàn toàn cái kia |
| Chi phí | Control plane tính theo giờ; EC2, EBS, NAT, ALB, logs và data transfer tính riêng. Xóa lab khi học xong |

## 5. Mini Quiz — Active Recall

1. Backend cần đọc S3. Cách cấp quyền nên dùng là gì, và vì sao không dùng access key trong Secret?
2. HPA đã tăng lên 20 replicas nhưng nhiều Pod vẫn `Pending`. Kể ba nguyên nhân phía AWS.
3. Pod dùng PVC trên EBS cần chạy lại, nhưng AZ chứa volume không còn Node phù hợp. Chuyện gì xảy ra?
4. ALB trả `502`. Bạn kiểm tra gì đầu tiên ở phía AWS?
5. Developer có IAM user hợp lệ nhưng `kubectl get pods` bị từ chối. Nên xem gì?

<details><summary>Xem đáp án</summary>

1. **EKS Pod Identity hoặc IRSA** với IAM role chỉ có quyền cần thiết. Access key là credentials dài hạn, dễ lộ và khó xoay vòng.
2. NodePool CPU limit quá thấp, EC2 quota hết, subnet hết IP, instance type không đáp ứng requests, affinity/taints quá chặt.
3. PV của EBS có node affinity theo AZ, nên scheduler chỉ đặt Pod vào Node cùng AZ với volume. Không có Node phù hợp ở AZ đó thì Pod `Pending` cho tới khi có capacity ở đúng AZ.
4. **Target health** của Target Group, rồi Security Group giữa ALB và targets, rồi readiness/port của Pod.
5. **EKS Access Entry** (hoặc mapping `aws-auth` kiểu cũ) của IAM principal đó và quyền RBAC/access policy được gán.

</details>

## 6. Hands-on gợi ý

Dựng cluster bằng Terraform với Managed Node Group, triển khai một backend qua ECR và ALB Ingress, gắn Pod Identity để đọc một S3 bucket, thêm PVC trên EBS, rồi cố tình tạo Pod `Pending` để xem Karpenter phản ứng. Đặt budget alert trước khi bắt đầu và `terraform destroy` ngay khi học xong.
