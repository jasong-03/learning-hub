# Kubernetes — Giai đoạn 5: AWS EKS Production

*Advanced → Production · AWS · Kubernetes · Terraform · DevOps · Capstone*

Đây là giai đoạn cuối trong lộ trình Kubernetes 5 giai đoạn của bạn.

Bốn giai đoạn trước giúp bạn hiểu cách Kubernetes vận hành. Giai đoạn 5 sẽ dạy cách xây dựng, triển khai, bảo mật, giám sát và vận hành một Kubernetes Cluster thực tế trên AWS.

Mục tiêu sau khi học là có thể tự triển khai:

- Một hệ thống backend chạy trên Amazon EKS.
- Infrastructure quản lý bằng Terraform.
- CI/CD với GitHub Actions, ECR và ArgoCD.
- Public HTTPS qua AWS Application Load Balancer.
- Persistent storage cho workload có trạng thái.
- Autoscaling cả Pods và Nodes.
- Monitoring, logging, security và incident troubleshooting.

## Lộ trình Giai đoạn 5

AWS EKS Learning Checklist (10 chủ đề):

1. **AWS EKS Architecture** — Control plane, data plane, cluster lifecycle.
2. **VPC & Networking** — Subnets, NAT, routes, CNI, security groups.
3. **IAM & EKS Pod Identity** — Human access, workload IAM, IRSA.
4. **Terraform** — Provision AWS infrastructure bằng Infrastructure as Code.
5. **ECR & CI/CD** — Container registry và image delivery.
6. **ALB / NLB / Ingress** — Public traffic, DNS, HTTPS, target groups.
7. **EBS CSI & Persistent Storage** — PVC, StorageClass và EBS volumes.
8. **Karpenter & Autoscaling** — HPA, Node provisioning, capacity.
9. **Observability & Security** — CloudWatch, Prometheus, audit và hardening.
10. **Production Operations** — Deploy, incident response, upgrades, DR và cost.

> Phần này là kiến thức AWS/EKS mở rộng cho Capstone, không phải một Lab riêng nguyên bản trong bộ 46 Labs. Một số chi tiết về EKS Auto Mode, IAM và giá được đối chiếu với tài liệu AWS hiện hành.

# Phần 1 — Amazon EKS Architecture

## 1. EKS là gì?

Amazon EKS (Elastic Kubernetes Service) là dịch vụ Kubernetes được AWS quản lý, đặc biệt là Kubernetes control plane.

Bạn vẫn sử dụng những lệnh quen thuộc:

```bash
kubectl get nodes
kubectl get pods -A
kubectl apply -f deployment.yaml
kubectl rollout status deployment/backend
```

Điểm khác biệt chính là control plane được AWS vận hành, còn compute chạy workload tùy thuộc mô hình EKS bạn chọn.

## 2. Kiến trúc EKS

```text
+---------------------------------------------------+
| AWS-managed Control Plane                         |
|                                                   |
|   [ API Server ]   [ Scheduler ]   [ Controllers ]|
|                                                   |
|   AWS cũng quản lý backing datastore              |
|   của control plane.                              |
+---------------------------------------------------+
                         |
                         v
+---------------------------------------------------+
| Customer VPC — Data Plane                         |
|                                                   |
|   +-------------------+   +-------------------+   |
|   | Worker Node 1     |   | Worker Node 2     |   |
|   |   [ Pod ] [ Pod ] |   |   [ Pod ] [ Pod ] |   |
|   +-------------------+   +-------------------+   |
+---------------------------------------------------+
```

### Control Plane vs Data Plane

| Control Plane                     | Data Plane                                       |
| --------------------------------- | ------------------------------------------------ |
| Kubernetes API Server             | EC2 worker nodes hoặc compute khác               |
| Scheduler                         | kubelet                                          |
| Controllers                       | Container runtime                                |
| Backing datastore                 | Application Pods                                 |
| AWS quản lý hạ tầng control plane | Tùy compute mode, AWS và bạn chia sẻ trách nhiệm |

AWS vận hành control plane trong hạ tầng do AWS quản lý, tách khỏi VPC nơi các worker nodes của bạn chạy.

*Nguồn: Amazon EKS*

## 3. Các mô hình Compute trên EKS

| Mô hình             | Cách vận hành                                                 | Phù hợp                                     |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| Managed Node Groups | AWS quản lý vòng đời node group, bạn chọn EC2 và cấu hình     | Học sâu về EKS operations                   |
| Self-managed Nodes  | Bạn quản lý EC2 nodes nhiều hơn                               | Nhu cầu tùy biến đặc biệt                   |
| Fargate             | Không trực tiếp quản lý EC2 worker nodes                      | Một số workloads phù hợp mô hình serverless |
| EKS Auto Mode       | AWS quản lý thêm nhiều thành phần hạ tầng, compute và scaling | Giảm operational overhead                   |

### EKS Auto Mode khác gì?

EKS Auto Mode tích hợp việc quản lý compute scaling, load balancing, networking và block storage trong mô hình AWS-managed. Một số thành phần trước đây cần cài controller riêng sẽ được AWS quản lý bên ngoài cluster.

*Nguồn: Amazon EKS*

> **Đề xuất cho việc học:** Bắt đầu với Managed Node Groups để hiểu cách EKS hoạt động. Sau đó học EKS Auto Mode để hiểu mô hình giảm gánh nặng vận hành.

# Phần 2 — AWS VPC & EKS Networking

## 4. VPC là gì trong EKS?

VPC là mạng ảo nơi các worker nodes, load balancers và những tài nguyên AWS liên quan được triển khai.

Một kiến trúc production phổ biến sử dụng ít nhất hai Availability Zones.

```text
                         Internet
                            |
                     Internet Gateway
                            |
+-----------------------------------------------------------+
| VPC: 10.0.0.0/16                                          |
|                                                           |
|  Availability Zone A           Availability Zone B        |
|  +-----------------------+     +-----------------------+  |
|  | Public Subnet         |     | Public Subnet         |  |
|  | 10.0.1.0/24           |     | 10.0.2.0/24           |  |
|  | ALB / NAT             |     | ALB / NAT             |  |
|  +-----------------------+     +-----------------------+  |
|  | Private Subnet        |     | Private Subnet        |  |
|  | 10.0.11.0/24          |     | 10.0.12.0/24          |  |
|  | EKS Nodes / Pods      |     | EKS Nodes / Pods      |  |
|  +-----------------------+     +-----------------------+  |
+-----------------------------------------------------------+
```

CIDRs và placement chỉ là minh họa. Route tables, subnet sizing và AWS controller configuration quyết định kiến trúc thực tế.

AWS khuyến nghị kiến trúc gồm public và private subnets trên nhiều Availability Zones; đặt worker nodes trong private subnets phù hợp với phần lớn ứng dụng.

*Nguồn: Amazon EKS*

## 5. Public vs Private Subnet

| Public Subnet                                | Private Subnet                                  |
| -------------------------------------------- | ----------------------------------------------- |
| Route đến Internet Gateway                   | Không có route trực tiếp đến Internet Gateway   |
| Thường chứa internet-facing ALB, NAT Gateway | Thường chứa EKS worker nodes, private workloads |
| Có thể hỗ trợ tài nguyên public              | Outbound có thể qua NAT hoặc VPC endpoints      |

Private subnet không có nghĩa hoàn toàn không có Internet. Node ở private subnet vẫn có thể gọi Internet qua NAT Gateway nếu route và security rules cho phép.

### Những thành phần mạng phải thuộc

| Thành phần       | Vai trò                                                               |
| ---------------- | --------------------------------------------------------------------- |
| VPC              | Mạng logic của AWS                                                    |
| Subnet           | Phân vùng IP trong một Availability Zone                              |
| Route Table      | Xác định đường đi packets                                             |
| Internet Gateway | Kết nối mạng public tới Internet                                      |
| NAT Gateway      | Cho phép kết nối outbound trong thiết kế IPv4 private subnet phổ biến |
| Security Group   | Stateful firewall                                                     |
| Network ACL      | Stateless subnet-level filtering                                      |
| VPC Endpoint     | Truy cập một số AWS services qua đường private                        |

## 6. Amazon VPC CNI

Trong EKS truyền thống, Amazon VPC CNI cung cấp kết nối mạng cho Kubernetes Pods.

Khác với một số Kubernetes CNI dùng overlay network, VPC CNI có thể cấp Pod IP từ địa chỉ trong VPC, giúp tích hợp với AWS networking.

Bạn phải hiểu:

- Pod IP allocation.
- ENI và secondary IPs/IP prefixes.
- IP exhaustion.
- Node instance network limits.
- Routing giữa Pods và VPC resources.

Một lỗi EKS thực tế:

```text
FailedCreatePodSandBox
failed to assign an IP address to container
```

Lỗi này có thể liên quan đến thiếu Pod IP capacity, subnet addresses hoặc giới hạn ENI/IP của Node.

### Trace Networking trên AWS

```text
Internet
  ↓
Route 53
  ↓
ALB
  ↓
Target Group
  ↓
Pod IP hoặc Node IP:NodePort
  ↓
Application Container
```

Nếu API trả 502, bạn cần kiểm tra cả hai lớp:

1. AWS: ALB listeners, target groups, target health, security groups.
2. Kubernetes: Ingress, Service, EndpointSlices, Pod readiness, application logs.

# Phần 3 — IAM, EKS Access Entries & Pod Identity

## 7. IAM và RBAC khác nhau thế nào?

Đây là chủ đề rất quan trọng trong EKS.

| Cơ chế                  | Quản lý quyền gì?                                           |
| ----------------------- | ----------------------------------------------------------- |
| AWS IAM                 | AWS APIs: S3, ECR, Secrets Manager, EC2...                  |
| Kubernetes RBAC         | Kubernetes APIs: Pods, Deployments, Secrets...              |
| EKS Access Entries      | Liên kết IAM identity với quyền truy cập Kubernetes cluster |
| EKS Pod Identity / IRSA | Cấp AWS IAM credentials cho workloads                       |

## 8. Con người truy cập EKS

Ví dụ một DevOps Engineer dùng AWS CLI và kubectl.

Luồng cơ bản:

```text
Developer AWS identity
        ↓
AWS CLI / EKS authentication
        ↓
EKS access entry / authorization
        ↓
Kubernetes API Server
        ↓
kubectl get pods
```

EKS Access Entries là cách AWS khuyến nghị để cấp quyền truy cập Kubernetes cho IAM principals trong các cluster hỗ trợ, thay cho việc phụ thuộc hoàn toàn vào `aws-auth` ConfigMap kiểu cũ.

*Nguồn: Amazon EKS*

### Kiểm tra AWS identity

```bash
aws sts get-caller-identity --profile <lab-profile>
```

### Cập nhật kubeconfig

```bash
aws eks update-kubeconfig \
  --region ap-southeast-1 \
  --name <cluster-name> \
  --profile <lab-profile>
```

Kiểm tra:

```bash
kubectl config current-context
kubectl get nodes
```

> **Lưu ý:** Có credentials AWS hợp lệ không đồng nghĩa chắc chắn chạy được `kubectl get nodes`. IAM identity còn phải được cấp quyền Kubernetes tương ứng.

## 9. EKS Pod Identity

Ví dụ backend cần đọc dữ liệu từ S3.

Không nên đưa `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` vào Kubernetes Secret để làm cách cấp quyền chính.

Thay vào đó, dùng EKS Pod Identity hoặc IRSA.

```text
Backend Pod
  serviceAccountName: backend-s3-reader
        ↓
EKS Pod Identity Association
        ↓
IAM Role
  Chỉ có s3:GetObject trên bucket cần thiết
        ↓
Amazon S3
```

Cách hoạt động:

1. Tạo IAM role và policy tối thiểu.
2. Tạo Kubernetes ServiceAccount.
3. Tạo Pod Identity Association giữa ServiceAccount và IAM role.
4. Pod dùng AWS SDK credential provider chain để nhận temporary credentials.
5. Ứng dụng gọi AWS APIs.

EKS Pod Identity không yêu cầu service account annotation như IRSA, nhưng với EC2 nodes truyền thống nó cần Pod Identity Agent. Trong EKS Auto Mode, thành phần cần thiết được AWS quản lý.

*Nguồn: Amazon EKS*

### ServiceAccount YAML

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: backend-s3-reader
  namespace: production
```

### Pod sử dụng identity

```yaml
spec:
  serviceAccountName: backend-s3-reader
  containers:
    - name: backend
      image: example/backend:v1
```

Ví dụ association sau khi IAM role đã được tạo, trust policy và agent đã được cấu hình đúng:

```bash
aws eks create-pod-identity-association \
  --cluster-name <cluster-name> \
  --namespace production \
  --service-account backend-s3-reader \
  --role-arn <role-arn>
```

### Pod Identity vs IRSA

|                           | EKS Pod Identity                      | IRSA                              |
| ------------------------- | ------------------------------------- | --------------------------------- |
| IAM integration           | Pod Identity Association              | Kubernetes OIDC federated role    |
| ServiceAccount annotation | Không bắt buộc                        | Thường dùng                       |
| Agent                     | Cần agent trên EC2 nodes truyền thống | Không cần Pod Identity Agent      |
| Sử dụng                   | Nhiều workloads trên EKS EC2          | Workloads phù hợp OIDC federation |

> **Quan trọng:** IAM role cho ứng dụng không nên reuse node IAM role hoặc cấp `AdministratorAccess`.

# Phần 4 — Terraform: Infrastructure as Code

## 10. Terraform dùng để làm gì?

Terraform giúp bạn khai báo AWS infrastructure bằng code, có thể review, tái sử dụng và quản lý thay đổi.

Thay vì tạo thủ công:

```text
VPC → Subnets → Route Tables → IAM → EKS → Node Groups
```

Bạn viết Terraform configuration, sau đó Terraform tạo và quản lý resources theo state.

### Terraform Workflow

```text
Terraform Code
      ↓
terraform plan   → Xem những resources sẽ thay đổi
      ↓
terraform apply  → Tạo hoặc cập nhật AWS resources
      ↓
Terraform State  → Theo dõi resources đang quản lý
```

## 11. Cấu trúc Terraform project

```text
eks-infrastructure/
├── versions.tf
├── providers.tf
├── variables.tf
├── main.tf
├── outputs.tf
├── terraform.tfvars.example
└── environments/
    ├── dev/
    └── production/
```

### Ví dụ Terraform với VPC và EKS

Ví dụ rút gọn sau dùng các module Terraform AWS phổ biến. Đây là khung học kiến trúc, chưa phải cấu hình hoàn chỉnh, chưa được xác minh tương thích phiên bản và chưa an toàn để `apply` trực tiếp.

```hcl
provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  # Pin a verified module version before deployment.
  name = "eks-lab-vpc"
  cidr = "10.0.0.0/16"

  azs = [
    "ap-southeast-1a",
    "ap-southeast-1b"
  ]

  private_subnets = [
    "10.0.11.0/24",
    "10.0.12.0/24"
  ]

  public_subnets = [
    "10.0.1.0/24",
    "10.0.2.0/24"
  ]

  enable_nat_gateway = true
  single_nat_gateway = true
}

module "eks" {
  source = "terraform-aws-modules/eks/aws"

  # Pin a verified module version before deployment.
  name = "eks-learning"

  vpc_id = module.vpc.vpc_id

  subnet_ids = module.vpc.private_subnets

  # Complete this module's version-specific
  # Kubernetes, node group, add-on and access settings
  # before planning or applying.
}
```

Tại sao không nên copy code mẫu trên và apply ngay?

- Terraform module versions thay đổi inputs và defaults.
- IAM và cluster access cần cấu hình rõ.
- NAT Gateway, EKS, EC2 và public IPv4 đều có thể phát sinh phí.
- Một số defaults không phù hợp production.
- Terraform state cần được bảo vệ.

### Lệnh Terraform phải thuộc

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan
terraform apply
terraform show
terraform state list
```

Cleanup lab khi đã xác nhận toàn bộ resources và hậu quả:

```bash
terraform plan -destroy
terraform destroy
```

> **Cảnh báo:** `terraform destroy` không tự bảo đảm dọn hết mọi tài nguyên được controllers tạo bên ngoài Terraform, chẳng hạn load balancers và volumes. Cũng không nên chạy destroy khi còn dữ liệu cần giữ.

## 12. Terraform State

Terraform state rất quan trọng.

Trong production, thường dùng remote backend, ví dụ S3 với locking được cấu hình phù hợp.

Best practices:

- Không commit state file vào Git.
- Mã hóa và giới hạn quyền truy cập state.
- Có cơ chế locking tránh concurrent apply.
- Tách state theo môi trường hoặc phạm vi quản lý hợp lý.
- Review `terraform plan` trước apply.
- Không sửa state thủ công khi chưa hiểu tác động.

Terraform state có thể chứa dữ liệu nhạy cảm. Đừng chỉ nghĩ file `.tfvars` mới cần bảo vệ.

# Phần 5 — Amazon ECR & CI/CD

## 13. Amazon ECR là gì?

ECR (Elastic Container Registry) là container image registry của AWS.

Luồng triển khai:

```text
Source Code
   ↓
GitHub Actions
   ↓
Docker Build & Tests
   ↓
Amazon ECR
   ↓
EKS Nodes pull image
   ↓
Kubernetes Pods
```

## 14. Docker image lên ECR

Ví dụ lệnh học tập, sau khi bạn đã tạo ECR repository và xác định đúng account, region:

```bash
aws sts get-caller-identity \
  --profile <lab-profile>

aws ecr describe-repositories \
  --repository-names backend \
  --region ap-southeast-1 \
  --profile <lab-profile>
```

Login ECR:

```bash
aws ecr get-login-password \
  --region ap-southeast-1 \
  --profile <lab-profile> \
  | docker login \
      --username AWS \
      --password-stdin \
      <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com
```

Build và push:

```bash
docker build -t backend:v1 .

docker tag backend:v1 \
  <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/backend:v1

docker push \
  <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/backend:v1
```

Sau đó Deployment sử dụng image URI trên ECR.

## 15. CI/CD Production Workflow

| Bước | Giai đoạn       | Nội dung                               |
| ---- | --------------- | -------------------------------------- |
| 1    | Developer Push  | GitHub Pull Request / main             |
| 2    | CI              | Lint, test, SAST, dependency checks    |
| 3    | Container Build | Image tagged with commit SHA           |
| 4    | Registry        | Push immutable artifact lên ECR        |
| 5    | GitOps Update   | PR cập nhật image digest               |
| 6    | ArgoCD          | Sync EKS cluster từ Git                |
| 7    | Verify          | Health, smoke tests, metrics, rollback |

### Vì sao nên dùng GitHub OIDC thay vì long-lived AWS keys?

GitHub Actions có thể liên kết với AWS IAM bằng OIDC và assume role phù hợp để lấy temporary credentials.

Điều này giúp tránh lưu AWS access keys dài hạn trong GitHub Secrets.

Trong production:

- Hạn chế trust policy theo repository và branch/environment.
- Cấp IAM permissions tối thiểu.
- Không để CI tự có quyền quản trị toàn AWS account.
- Tách quyền build/push ECR khỏi quyền thay đổi infrastructure.

# Phần 6 — AWS Load Balancer Controller

## 16. ALB và NLB khác nhau thế nào?

| ALB                     | NLB                                     |
| ----------------------- | --------------------------------------- |
| Layer 7                 | Layer 4                                 |
| HTTP/HTTPS              | TCP/UDP/TLS                             |
| Host/path routing       | Kết nối network                         |
| Thường dùng với Ingress | Thường dùng với Service LoadBalancer    |
| Phù hợp web/API         | Phù hợp TCP services, network use cases |

Trong EKS truyền thống, AWS Load Balancer Controller có thể tạo ALB từ Ingress và NLB từ Service `LoadBalancer`, tùy cấu hình.

*Nguồn: Amazon EKS*

## 17. AWS ALB Ingress

Ví dụ:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: backend-ingress
  namespace: production
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
spec:
  ingressClassName: alb
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: backend-svc
                port:
                  number: 80
```

Đây là ví dụ cho cluster dùng AWS Load Balancer Controller truyền thống, đã cấu hình IAM, controller và subnet discovery. Auto Mode dùng integration/controller-specific configuration khác.

### ALB Target Types

| Target type   | Luồng traffic          | Thành phần                |
| ------------- | ---------------------- | ------------------------- |
| Instance Mode | ALB → NodePort → Pod   | EC2 Node → Pod            |
| IP Mode       | ALB → Pod IP trực tiếp | ALB IP Target → Pod       |

AWS mô tả `instance` target mode dùng NodePort, còn `ip` mode định tuyến đến Pod IP trực tiếp.

*Nguồn: Amazon EKS*

### HTTPS Production

Để có HTTPS, bạn thường kết hợp:

- **Route 53** — DNS.
- **AWS Certificate Manager** — TLS certificate.
- **ALB Listener 443**.
- **Target Group** — Backend target registration và health checks.
- **Security Groups** — Cho phép luồng traffic cần thiết.

Không nên tự động expose mọi Kubernetes Service ra Internet.

## 18. Troubleshooting ALB 502 / 503 / 504

Luồng trace:

```text
Client
  ↓
Route 53
  ↓
ALB Listener
  ↓
ALB Rule
  ↓
Target Group
  ↓
Pod IP / NodePort
  ↓
Application
```

| Lớp            | Kiểm tra                        |
| -------------- | ------------------------------- |
| DNS            | Hostname trỏ đúng ALB?          |
| Listener       | HTTP/HTTPS port và certificate? |
| ALB Rules      | Host/path routing đúng?         |
| Target Group   | Có targets healthy không?       |
| Security Group | ALB reach được targets?         |
| Pod            | Ready, đúng port, app listen?   |
| Application    | Logs và upstream dependencies?  |

Ví dụ truy vấn targets:

```bash
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn> \
  --profile <lab-profile>
```

> **Cảnh báo:** Trong một incident, tăng memory limit của backend hoặc restart toàn bộ Pods trước khi kiểm tra target health, OOM và rollout có thể làm sự cố nặng hơn.

# Phần 7 — EBS CSI Driver & Persistent Storage

## 19. Kubernetes PVC liên kết với AWS EBS thế nào?

Bạn đã học PV/PVC ở Giai đoạn 1. Trên EKS, Amazon EBS có thể là backing storage của PVC.

```text
Database Pod
  Mount: /var/lib/database
        ↓
PVC
        ↓
StorageClass + EBS CSI Driver
        ↓
Amazon EBS Volume
  Gắn vào EC2 Node tương thích
```

### StorageClass — EKS truyền thống

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

Cấu hình này yêu cầu Amazon EBS CSI Driver tương thích đã cài và có đủ IAM permissions. EKS Auto Mode sử dụng provisioner `ebs.csi.eks.amazonaws.com` cho block storage do Auto Mode quản lý.

### PVC

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
  namespace: production
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp3
  resources:
    requests:
      storage: 20Gi
```

### Những điều quan trọng

- EBS volume thông thường gắn với một Availability Zone.
- Pod có PVC EBS cần được schedule phù hợp với topology của volume.
- `ReadWriteOnce` không đồng nghĩa với hỗ trợ nhiều Nodes cùng read-write.
- `WaitForFirstConsumer` giúp provision volume phù hợp nơi Pod sẽ chạy.
- EBS volume không phải database backup.
- Xóa PVC có thể khiến backing EBS volume bị xóa khi reclaim policy là `Delete`.

Với database production, nên cân nhắc managed database như Amazon RDS nếu mục tiêu là vận hành database đáng tin cậy mà không muốn tự quản trị backup, failover và replication trong Kubernetes.

# Phần 8 — Karpenter & Autoscaling

## 20. HPA vs Node Autoscaling

Một trong những kiến thức quan trọng nhất khi làm EKS:

HPA tăng số Pods, còn Karpenter hoặc một node autoscaler khác cung cấp thêm compute capacity khi cần.

```text
Traffic tăng
     ↓
HPA tăng replicas 3 → 8
     ↓
Pods Pending
  Insufficient CPU / Memory
     ↓
Karpenter provision thêm EC2 Nodes
     ↓
Pending Pods được schedule
```

Đây là luồng điển hình. Karpenter không bắt buộc phải đợi HPA; nó phản ứng với nhu cầu scheduling/capacity của Pods.

## 21. NodePool & EC2NodeClass

Trong self-managed Karpenter trên EKS, bạn thường gặp:

| Resource     | Vai trò                                                         |
| ------------ | --------------------------------------------------------------- |
| NodePool     | Quy định khả năng scheduling, instance requirements, disruption |
| EC2NodeClass | Cấu hình AWS cụ thể như AMI, subnets, security groups, IAM role |
| NodeClaim    | Đại diện một yêu cầu Node compute cụ thể                        |

Ví dụ NodePool minh họa:

```yaml
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: application
spec:
  template:
    spec:
      nodeClassRef:
        group: karpenter.k8s.aws
        kind: EC2NodeClass
        name: application
      requirements:
        - key: kubernetes.io/arch
          operator: In
          values: ["amd64"]
        - key: karpenter.sh/capacity-type
          operator: In
          values: ["on-demand"]
  limits:
    cpu: "100"
```

Đây là manifest minh họa, chưa thể apply nếu không có Karpenter Controller, EC2NodeClass, IAM và discovery configuration tương ứng.

## 22. Spot vs On-Demand

| On-Demand                              | Spot                                |
| -------------------------------------- | ----------------------------------- |
| Giá ổn định hơn                        | Có thể tiết kiệm đáng kể            |
| Phù hợp baseline và critical workloads | Phù hợp workloads chịu interruption |
| EC2 capacity vẫn có thể bị giới hạn    | Có thể bị AWS thu hồi               |
| Ít gián đoạn do mô hình mua instance   | Cần thiết kế chịu interruption      |

Production thường kết hợp:

- On-Demand cho critical baseline.
- Spot cho workloads có thể reschedule.
- PDB và topology spread.
- Graceful shutdown.
- Capacity diversification.

### Karpenter và HPA có thể gây vấn đề gì?

Ví dụ HPA tăng từ 3 lên 20 Pods khi traffic spike.

Nhưng:

- NodePool CPU limit quá thấp.
- Instance types không đáp ứng resources.
- EC2 quota đã hết.
- Subnet thiếu IPs.
- Node affinity/taints quá chặt.

Kết quả: Pods Pending dù HPA hoạt động đúng.

Trace:

```text
HPA → Pod Scheduling Events → Karpenter NodeClaims/Events → EC2 capacity/quota → VPC networking
```

## 23. EKS Auto Mode và Karpenter

EKS Auto Mode sử dụng cơ chế Karpenter-based scaling do AWS quản lý, nên bạn không nhất thiết cài và vận hành self-managed Karpenter Controller. Bạn vẫn cấu hình compute policies thông qua các resource được Auto Mode hỗ trợ.

AWS cũng quản lý node replacement và một số thành phần quan trọng ngoài cluster.

*Nguồn: Amazon EKS*

# Phần 9 — Production Observability & Security

## 24. Monitoring EKS cần theo dõi những gì?

Bạn cần giám sát theo nhiều lớp.

| Lớp                | Metrics / Signals                                   |
| ------------------ | --------------------------------------------------- |
| Application        | RPS, p95 latency, 4xx/5xx, dependency latency       |
| Pod / Container    | CPU, memory, restarts, OOM, throttling              |
| Node               | CPU, memory, disk, Ready, pressure                  |
| Kubernetes         | Pending Pods, deployments Available, HPA            |
| ALB                | HTTPCode_ELB_5XX, target 5xx, target health         |
| EBS                | Storage performance, utilization, attachment errors |
| EKS Control Plane  | API/audit logs, authentication failures             |
| Karpenter          | Provisioning, disruption, NodeClaims, errors        |
| AWS Infrastructure | NAT, EC2, VPC flow logs khi cần                     |

### Công cụ phổ biến

- Amazon CloudWatch.
- Prometheus.
- Grafana.
- Loki hoặc CloudWatch Logs.
- OpenTelemetry.
- AWS CloudTrail.
- EKS control plane logging.

## 25. Monitoring Architecture

```text
EKS Workloads
    ├── Application Metrics → Prometheus
    ├── Container Logs → Loki / CloudWatch
    ├── Request Traces → Tempo / Tracing Backend
    └── Kubernetes Events → Monitoring Pipeline

AWS Infrastructure
    ├── ALB / EC2 / EBS Metrics → CloudWatch
    └── AWS API Activities → CloudTrail

                 ↓
       Grafana Dashboards
                 ↓
          Alerting / On-call
```

### Alerts nên có

| Alert                         | Mục tiêu                                        |
| ----------------------------- | ----------------------------------------------- |
| Backend 5xx rate cao          | Phát hiện lỗi khách hàng                        |
| p95 latency tăng              | Phát hiện suy giảm hiệu năng                    |
| Pod OOMKilled                 | Phát hiện memory failure                        |
| Pods Pending kéo dài          | Phát hiện thiếu capacity hoặc scheduling errors |
| ALB unhealthy targets         | Phát hiện backend availability issues           |
| Node NotReady                 | Phát hiện Node failure                          |
| PVC gần đầy                   | Tránh hết storage                               |
| Karpenter provisioning errors | Phát hiện lỗi cấp Node                          |

## 26. EKS Security Checklist

Các lớp security quan trọng:

1. **IAM** — Least privilege, temporary credentials, phân tách quyền.
2. **EKS Access** — Access Entries, hạn chế cluster-admin.
3. **Workload Identity** — Pod Identity hoặc IRSA.
4. **Network** — Private subnets, security groups, NetworkPolicy.
5. **Kubernetes** — RBAC, ServiceAccounts, Pod Security.
6. **Container** — Non-root, seccomp, image scanning, read-only root filesystem khi phù hợp.
7. **Secrets** — AWS Secrets Manager và cơ chế tích hợp an toàn.
8. **Supply Chain** — Image digest, scanning, signed artifacts/provenance khi triển khai.
9. **Audit** — CloudTrail, EKS audit logs và logging retention.
10. **Recovery** — Backups và tested restore procedure.

### Đặc biệt: Security Groups vs NetworkPolicy

| Security Group                      | NetworkPolicy                                   |
| ----------------------------------- | ----------------------------------------------- |
| AWS VPC networking layer            | Kubernetes Pod networking                       |
| Áp dụng trên ENIs/resources phù hợp | Áp dụng theo Pod labels, namespace selectors    |
| Stateful rules                      | Policy ingress/egress theo Kubernetes semantics |
| AWS quản lý enforcement             | CNI/plugin hỗ trợ enforcement                   |

Không được xem NetworkPolicy là thay thế toàn bộ Security Groups.

# Phần 10 — EKS Production Operations

## 27. Checklist triển khai production

Trước khi release, kiểm tra:

| Hạng mục     | Tiêu chí                                             |
| ------------ | ---------------------------------------------------- |
| Deployment   | Đủ replicas, Ready/Available                         |
| Resources    | Requests và limits đã benchmark                      |
| Probes       | Startup, readiness, liveness hợp lý                  |
| Scaling      | HPA và Node capacity hoạt động                       |
| Availability | Multi-AZ, PDB, topology spread phù hợp               |
| Security     | IAM, RBAC, image, secrets, network                   |
| Storage      | PVC, reclaim policy, backup                          |
| Traffic      | ALB target health, TLS, DNS                          |
| Monitoring   | Metrics, logs, alerts                                |
| Rollback     | Có rollback plan, biết giới hạn rollback schema/data |

## 28. EKS Upgrades

Cần phân biệt:

- Kubernetes control plane version.
- Managed Node Group/AMI version.
- Cluster add-ons như VPC CNI, CoreDNS, kube-proxy.
- Third-party controllers như ALB Controller, Karpenter.
- Kubernetes API compatibility.

Quy trình khuyến nghị:

```text
Assess compatibility
       ↓
Test non-production
       ↓
Backup / Recovery plan
       ↓
Upgrade Control Plane
       ↓
Update Add-ons
       ↓
Roll / Replace Nodes
       ↓
Verify Workloads
       ↓
Monitor / Close change
```

Thứ tự chi tiết còn phụ thuộc loại compute và EKS version. Không nên coi upgrade là một thao tác một lệnh không có rủi ro.

## 29. Disaster Recovery

Với EKS, disaster recovery gồm nhiều lớp:

- Terraform state và infrastructure code.
- GitOps manifests.
- Database backups.
- EBS snapshots / backup jobs.
- Kubernetes resource backup khi cần.
- IAM roles, certificates, secrets và network infrastructure.
- Runbook khôi phục.

> **Điểm phải nhớ:** Khôi phục Kubernetes manifests không đồng nghĩa khôi phục dữ liệu ứng dụng.

Ví dụ PostgreSQL vẫn cần backup/restore hoặc cơ chế replication thích hợp.

# Phần 11 — AWS EKS Pricing & Cost Optimization

## 30. Học EKS có tốn tiền không?

Có. Đây là phần đặc biệt quan trọng vì EKS không giống Kind chạy local miễn phí.

Theo bảng giá AWS hiện hành, EKS cluster với Kubernetes version trong standard support có phí control plane khoảng $0.10/giờ, chưa bao gồm EC2, load balancer, storage, NAT Gateway và các dịch vụ khác. Extended support có giá cao hơn.

*Nguồn: Amazon Web Services, Inc.*

### Ước tính riêng EKS Control Plane

| Thông số               | Giá trị                               |
| ---------------------- | ------------------------------------- |
| Thời gian chạy cluster | 24 giờ                                |
| Phạm vi                | Standard support · Control plane only |
| Đơn giá                | $0.10/giờ                             |
| Ước tính               | **$2.40**                             |

Cách tính: 24 giờ × $0.10/giờ = $2.40.

Chưa bao gồm EC2, EBS, ALB/NLB, NAT, public IPv4, data transfer, logs và các phí phát sinh khác. Số tiền thực tế phụ thuộc region và kiến trúc.

### Phí theo thành phần

| Thành phần        | Phát sinh phí                                          |
| ----------------- | ------------------------------------------------------ |
| EKS Control Plane | Theo cluster-hours                                     |
| EC2 Worker Nodes  | Theo instance-hours                                    |
| NAT Gateway       | Theo giờ và data processing                            |
| ALB / NLB         | Theo giờ và usage                                      |
| EBS Volumes       | Storage provisioned và một số đặc tính hiệu năng/usage |
| ECR               | Storage và data transfer theo chính sách giá           |
| CloudWatch        | Logs, metrics và các chức năng sử dụng                 |
| EKS Auto Mode     | Có phí quản lý compute bổ sung theo cấu hình sử dụng   |

### Chiến lược học tiết kiệm

- **Giai đoạn A — Local Kind** — Học Helm, ArgoCD, HPA, probes, scheduling, monitoring và troubleshooting trên cluster hiện tại. Không cần tạo EKS.
- **Giai đoạn B — EKS Lab ngắn hạn** — Tạo cluster bằng IaC sau khi review estimated cost, thực hành AWS-specific features trong vài giờ, rồi dọn resources khi đã xác minh dữ liệu không còn cần.
- **Giai đoạn C — Production Architecture** — Thiết kế Multi-AZ, IAM, autoscaling, monitoring, backup và CI/CD theo chuẩn production, không nhất thiết chạy cluster 24/7 chỉ để học.

> Nếu tài khoản AWS của bạn còn credit, hãy kiểm tra phạm vi áp dụng, ngày hết hạn và dịch vụ được cover trong Billing trước khi dựa vào credit để triển khai. Credit không làm tài nguyên tự dừng khi hết.

# Phần 12 — Capstone: AWS EKS Production Platform

Đây là đề bài tốt nghiệp mình đề xuất để kết hợp toàn bộ 5 giai đoạn Kubernetes.

## 31. Xây dựng hệ thống gì?

**Production-Style FastAPI Platform on AWS EKS**

Ứng dụng mẫu có:

- FastAPI Backend.
- PostgreSQL trên RDS.
- Redis (ElastiCache hoặc phương án phù hợp lab).
- Amazon ECR.
- EKS Managed Node Groups hoặc Auto Mode.
- ALB + ACM + Route 53.
- HPA + Node Autoscaling.
- Helm + ArgoCD + GitHub Actions.
- Prometheus + Grafana và tập trung logs.
- Terraform quản lý AWS resources.

```text
User — api.example.com
          ↓
Route 53 + ACM + ALB
  DNS · HTTPS · Routing
          ↓
+-------------------------------------------+
| Amazon EKS                                |
|   [ API 1 ]   [ API 2 ]   [ API 3 ]       |
|   Deployment · HPA · Probes · Service     |
|                                           |
|   [ Prometheus ]   [ Logs ]               |
+-------------------------------------------+
          ↓                     ↓
RDS PostgreSQL              Redis
  Managed Database            Cache / Queue

Delivery: GitHub Actions → ECR → GitOps → ArgoCD → EKS
```

## 32. Yêu cầu hoàn thành Capstone

| Nhóm           | Điều kiện đạt                                   |
| -------------- | ----------------------------------------------- |
| Infrastructure | Terraform provisioning và plan review           |
| Networking     | VPC multi-AZ, đúng public/private subnets       |
| Security       | IAM least privilege, Pod Identity, TLS          |
| Application    | FastAPI nhiều replicas, probes, resources       |
| Database       | RDS private, credentials an toàn, backup        |
| Delivery       | CI build/test, ECR, Helm, GitOps                |
| Scaling        | HPA và Node scaling hoạt động                   |
| Observability  | Dashboards, logs, alerts                        |
| Reliability    | Rollout, rollback, Pod/Node failure tests       |
| Documentation  | Architecture diagram, runbooks, cost và cleanup |

### Các bài kiểm tra sự cố

Khi Capstone chạy được, hãy chủ động giả lập trong môi trường lab:

1. Deploy sai image tag → `ImagePullBackOff`.
2. Set memory limit quá thấp → `OOMKilled`.
3. Tăng traffic → HPA scale.
4. Pods Pending do thiếu capacity → kiểm tra node autoscaling.
5. Readiness failure → quan sát endpoint health.
6. Thay đổi Deployment trực tiếp → kiểm tra ArgoCD drift.
7. Phát hành image lỗi → rollback.
8. Kiểm tra backup và restore bằng dữ liệu thử nghiệm.

> Không thực hiện các thử nghiệm phá hoại này trên production đang có người dùng thật.

# Phần 13 — EKS Troubleshooting Cheat Sheet

## 33. Triệu chứng và kiểm tra đầu tiên

| Triệu chứng               | Kiểm tra đầu tiên                                       |
| ------------------------- | ------------------------------------------------------- |
| `kubectl Unauthorized`    | AWS identity, EKS access entries, authentication        |
| `kubectl Forbidden`       | EKS access policy, Kubernetes RBAC                      |
| Nodes không join cluster  | IAM node role, subnet routes, endpoint, security groups |
| Pod `Pending`             | Requests, taints, affinity, Node capacity               |
| Pod không có IP           | VPC CNI, subnet IPs, ENI limits                         |
| Pod không pull ECR image  | Node IAM role, ECR permissions, DNS/network             |
| ALB không được tạo        | Controller, IAM, subnet discovery, IngressClass         |
| ALB 502                   | Target health, port, readiness, logs                    |
| PVC Pending               | CSI driver, IAM, StorageClass, topology                 |
| HPA không scale           | Metrics Server, requests, HPA status                    |
| Karpenter không tạo Nodes | NodePool, EC2NodeClass, quotas, networking              |
| App không đọc được S3     | Pod Identity/IRSA, IAM, networking                      |
| Pod OOMKilled             | Memory usage, limits, Node pressure                     |

### Các lệnh cần nhớ

```bash
# AWS identity
aws sts get-caller-identity

# EKS cluster
aws eks describe-cluster \
  --name <cluster-name> \
  --region <region>

# Kubernetes
kubectl get nodes -o wide
kubectl get pods -A -o wide
kubectl get events -A \
  --sort-by=.metadata.creationTimestamp

# Resource troubleshooting
kubectl describe pod <pod> -n <namespace>
kubectl describe node <node>
kubectl top pods -A
kubectl top nodes

# Rollout
kubectl rollout status deployment/<name> -n <namespace>
kubectl rollout history deployment/<name> -n <namespace>

# Storage
kubectl get pvc,pv -A
kubectl get storageclass
```

# Phần 14 — Kiểm tra kiến thức EKS

## 34. AWS EKS Knowledge Test

*8 câu hỏi*

**1. Trong EKS Managed Node Groups, AWS quản lý gì rõ nhất?**

- A. Kubernetes control plane và một phần vòng đời node group
- B. Toàn bộ application logic và database

> **Đáp án:** A — AWS vận hành control plane và quản lý vòng đời node group; application logic và database vẫn là trách nhiệm của bạn.

**2. Pod trên private subnet cần truy cập public Internet theo kiến trúc IPv4 thông thường. Cần gì?**

- A. Chỉ cần ClusterIP
- B. Outbound route qua NAT hoặc giải pháp phù hợp
- C. Ingress

> **Đáp án:** B — Private subnet không có route trực tiếp đến Internet Gateway; outbound đi qua NAT Gateway hoặc giải pháp tương đương. ClusterIP và Ingress chỉ xử lý traffic trong cluster hoặc traffic đi vào.

**3. Backend Pod cần đọc S3. Cách cấp quyền phù hợp nhất?**

- A. Lưu AWS root key trong Secret
- B. Pod Identity hoặc IRSA và least-privilege IAM role

> **Đáp án:** B — Pod Identity/IRSA cấp temporary credentials qua IAM role tối thiểu, không cần lưu long-lived keys trong Secret.

**4. HPA tăng replicas nhưng Pods Pending vì Insufficient CPU. Bạn cần điều tra gì?**

- A. Node capacity và node autoscaler
- B. Chỉ tăng memory limit

> **Đáp án:** A — HPA chỉ tăng số Pods; thiếu CPU để schedule là vấn đề capacity, cần kiểm tra Node và Karpenter/node autoscaler.

**5. ALB target-type ip khác instance như thế nào?**

- A. IP trực tiếp tới Pod IP; instance thông qua NodePort
- B. Không có gì khác

> **Đáp án:** A — `ip` mode định tuyến đến Pod IP trực tiếp, còn `instance` mode đi qua NodePort trên Node.

**6. PVC dùng EBS tại AZ A, Pod phải chạy AZ B. Nguy cơ gì?**

- A. Volume topology/attachment mismatch
- B. CoreDNS tự sửa mọi thứ

> **Đáp án:** A — EBS volume gắn với một Availability Zone nên không thể attach vào Node ở AZ khác.

**7. ArgoCD hiển thị Synced nhưng ALB trả 502. Bạn nên làm gì?**

- A. Xem target health, Service endpoints, Pods và logs
- B. Kết luận ArgoCD bị lỗi

> **Đáp án:** A — Synced chỉ cho biết manifests khớp Git; lỗi 502 cần trace qua target health, endpoints, readiness và logs ứng dụng.

**8. Khi xóa EKS cluster, điều gì cần kiểm tra?**

- A. Chỉ cần cluster biến mất khỏi console
- B. Load balancers, EC2, EBS, NAT, VPC, logs và Terraform-managed resources

> **Đáp án:** B — Nhiều tài nguyên do controllers hoặc Terraform tạo có thể còn tồn tại và tiếp tục phát sinh phí sau khi cluster bị xóa.

## Tổng kết toàn bộ 5 giai đoạn Kubernetes

| Giai đoạn                 | Năng lực đạt được                                            |
| ------------------------- | ------------------------------------------------------------ |
| 1. Application Deployment | ConfigMap, Secret, Probes, PV/PVC, StatefulSet               |
| 2. Networking & Security  | Ingress, DNS, Gateway API, RBAC, NetworkPolicy               |
| 3. Scaling & Operations   | HPA, Job, DaemonSet, Scheduling, Shutdown, Node Ops          |
| 4. Production Platform    | Helm, Prometheus, Loki, GitOps, CI/CD, Security              |
| 5. AWS EKS                | Terraform, AWS Networking/IAM, EKS, ECR, ALB, EBS, Karpenter |

> **Mốc hoàn thành thực sự:** Bạn có thể tự provision EKS bằng Terraform, deploy một backend qua CI/CD và GitOps, expose HTTPS, cấu hình autoscaling và IAM, theo dõi metrics/logs, xử lý 502/OOM/Pending, đồng thời quản lý được backup và chi phí.

Đến đây, bạn đã có bản đồ kiến thức Kubernetes từ cơ bản đến production. Bước học giá trị nhất tiếp theo không phải thêm lý thuyết, mà là làm Capstone end-to-end, trước trên Kind và sau đó thực hành các thành phần đặc thù AWS trên EKS với ngân sách được kiểm soát.
