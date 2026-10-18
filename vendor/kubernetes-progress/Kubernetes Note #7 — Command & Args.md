# Kubernetes Command &amp; Args — Tổng ôn kiến thức A–Z

Sau khi học Requests &amp; Limits, chúng ta tiếp tục với Command &amp; Args — cách Kubernetes xác định container sẽ chạy chương trình gì và truyền tham số như thế nào khi khởi động.

Đây là kiến thức quan trọng khi bạn deploy backend, chạy worker, CronJob, database migration hoặc debug container bị `CrashLoopBackOff`.

## 1. Command &amp; Args là gì?

Khi container khởi động, nó cần biết hai điều:

- `command`: Chạy chương trình nào?
- `args`: Truyền những tham số nào cho chương trình đó?

Trong Kubernetes:


| Kubernetes | Dockerfile   | Ý nghĩa               |
| ---------- | ------------ | --------------------- |
| `command`  | `ENTRYPOINT` | Chương trình thực thi |
| `args`     | `CMD`        | Tham số mặc định      |


Ví dụ một Docker image có:

```
FROM python:3.12-slim
WORKDIR /app
COPY app.py .

ENTRYPOINT ["python"]
CMD ["app.py"]
```

Khi chạy bình thường, container thực thi:

```
python app.py
```

Nếu Kubernetes khai báo:

```
command: ["python"]
args: ["worker.py"]
```

Container sẽ chạy:

```
python worker.py
```

Ghi nhớ: Kubernetes `command` ghi đè Docker `ENTRYPOINT`, còn Kubernetes `args` ghi đè Docker `CMD`.

## 2. Cơ chế ghi đè Command &amp; Args

Đây là bảng quan trọng nhất của bài.

Giả sử Dockerfile:

```
ENTRYPOINT ["python"]
CMD ["app.py"]
```


| Kubernetes Pod Spec                                          | Lệnh cuối cùng                         |
| ------------------------------------------------------------ | -------------------------------------- |
| Không khai báo gì                                            | `python [app.py](http://app.py)`       |
| Chỉ `args: ["[worker.py](http://worker.py)"]`                | `python [worker.py](http://worker.py)` |
| Chỉ `command: ["sleep", "60"]`                               | `sleep 60`                             |
| `command: ["python"]` và `args: ["[job.py](http://job.py)"]` | `python [job.py](http://job.py)`       |


Lưu ý: Khi ghi đè `command`, Kubernetes không giữ `CMD` mặc định của image theo cách có thể dựa vào trong mọi trường hợp. Vì thế, nếu chương trình cần tham số, hãy khai báo rõ cả hai.

### Thử thay đổi cấu hình

Docker image mặc định

```
ENTRYPOINT ["python"]
CMD ["app.py"]
```

Không override

Chỉ override args

Chỉ override command

Override command và args

Lệnh container sẽ thực thi

python [app.py](http://app.py)

 Copy

Sử dụng ENTRYPOINT và CMD mặc định của image.

## 3. Cách viết Command &amp; Args trong YAML

### Cách 1 — Exec form (khuyên dùng)

```
spec:
  containers:
    - name: app
      image: python:3.12-slim
      command: ["python", "-c"]
      args: ["print('Hello Kubernetes')"]
```

Lệnh tương đương:

```
python -c "print('Hello Kubernetes')"
```

Mỗi phần tử trong array là một argument riêng biệt.

Ví dụ:

```
command: ["sleep"]
args: ["3600"]
```

Tương đương `sleep 3600`.

### Cách 2 — Dạng YAML list

```
command:
  - python
  - -c
args:
  - print("Hello Kubernetes")
```

Hai cách trên tương đương.

## 4. Command &amp; Args không tự chạy qua Shell

Đây là lỗi rất phổ biến.

Sai:

```
command: ["echo", "Hello", "&&", "sleep", "3600"]
```

Kubernetes không tự diễn giải `&&` như shell operator.

Nếu muốn dùng nhiều lệnh, hãy gọi shell một cách tường minh:

```
command: ["/bin/sh", "-c"]
args:
  - |
    echo "Starting application"
    sleep 2
    echo "Application ready"
    exec python app.py
```

`/bin/sh -c` sẽ xử lý các shell operators như `&&`, `|`, `;` và biến môi trường.

`exec` ở lệnh cuối giúp tiến trình Python thay thế shell, nhận Unix signals tốt hơn khi Kubernetes shutdown Pod.

Lưu ý: Image phải có `/bin/sh`; một số image distroless không chứa shell.

## 5. Environment Variables trong Command &amp; Args

Ví dụ:

```
spec:
  containers:
    - name: worker
      image: busybox:1.36
      env:
        - name: TASK_NAME
          value: "process-orders"
      command: ["/bin/sh", "-c"]
      args:
        - 'echo "Running $TASK_NAME"; sleep 3600'
```

Trong trường hợp này, shell đọc `$TASK_NAME` từ environment.

Kubernetes cũng hỗ trợ cú pháp biến `$(VARIABLE_NAME)` trong `command` và `args` bằng cơ chế thay thế riêng, chẳng hạn:

```
env:
  - name: TASK_NAME
    value: "process-orders"
command: ["echo"]
args: ["$(TASK_NAME)"]
```

Hai cơ chế này khác nhau:


| Cú pháp                    | Ai thay thế?                                   |
| -------------------------- | ---------------------------------------------- |
| `$(TASK_NAME)`             | Kubernetes khi chuẩn bị container command/args |
| `$TASK_NAME` trong `sh -c` | Shell bên trong container                      |


## 6. Ứng dụng thực tế

### Backend API

```
containers:
  - name: api
    image: python:3.12-slim
    workingDir: /app
    command: ["uvicorn"]
    args:
      - "main:app"
      - "--host"
      - "0.0.0.0"
      - "--port"
      - "8000"
```

Ứng dụng chạy:

```
uvicorn main:app --host 0.0.0.0 --port 8000
```

Ví dụ giả định image đã có `uvicorn`, mã nguồn và dependencies; `python:3.12-slim` nguyên bản chưa có các thành phần này.

### Background Worker

```
command: ["celery"]
args: ["-A", "tasks", "worker", "--loglevel=info"]
```

Phù hợp với worker chạy lâu dài, thường quản lý bằng Deployment.

### Database Migration

```
command: ["alembic"]
args: ["upgrade", "head"]
```

Database migration thường nên chạy qua Kubernetes Job, không chạy lặp lại mỗi khi backend Deployment tạo Pod.

### CronJob

```
command: ["python"]
args: ["cleanup.py"]
```

CronJob dùng lịch chạy định kỳ để thực thi tác vụ rồi kết thúc.

## 7. Troubleshooting Command &amp; Args

Khi container không thể start, bạn nên kiểm tra:

```
kubectl get pods -n <namespace>

kubectl describe pod <pod-name> -n <namespace>

kubectl logs <pod-name> -n <namespace>

kubectl logs <pod-name> -n <namespace> --previous
```


| Lỗi                                   | Nguyên nhân thường gặp                                          | Cách xử lý                           |
| ------------------------------------- | --------------------------------------------------------------- | ------------------------------------ |
| `exec: ... executable file not found` | Command không tồn tại trong image hoặc PATH                     | Kiểm tra Dockerfile/image            |
| `permission denied`                   | File không có quyền execute                                     | Kiểm tra permissions                 |
| `CrashLoopBackOff`                    | Process crash hoặc kết thúc liên tục với restart policy phù hợp | Đọc logs và exit code                |
| `Exit Code: 127`                      | Command không tìm thấy (thường khi chạy qua shell)              | Kiểm tra command/PATH                |
| `Exit Code: 126`                      | Command tồn tại nhưng không thực thi được (thường qua shell)    | Kiểm tra quyền và định dạng          |
| `Exit Code: 0` nhưng restart          | Process hoàn thành, nhưng Pod dùng `restartPolicy: Always`      | Dùng Job nếu tác vụ chỉ chạy một lần |


### Vì sao `sleep` thường được dùng khi debug?

Một container chạy:

```
command: ["sleep"]
args: ["3600"]
```

sẽ tồn tại khoảng một giờ nếu lệnh chạy thành công.

Điều này giúp bạn có thời gian `kubectl exec` để kiểm tra bên trong container.

Tuy nhiên, không nên dùng `sleep infinity` hay sleep dài hạn để che lỗi startup trong production.

## 8. Mini Lab trên `kind-lab`

Thực hành an toàn với namespace riêng `command-lab`.

```
kubectl config current-context

kubectl create namespace command-lab \
  --dry-run=client -o yaml | kubectl apply -f -
```

Tạo `command-demo.yaml`:

```

apiVersion: v1
kind: Pod
metadata:
  name: command-demo
  namespace: command-lab
spec:
  containers:
    - name: app
      image: busybox:1.36
      env:
        - name: APP_NAME
          value: "kubernetes-lab"
      command: ["/bin/sh", "-c"]
      args:
        - |
          echo "Starting $APP_NAME"
          echo "Running inside Kubernetes"
          sleep 3600

```

Chạy và kiểm tra:

```
kubectl apply -f command-demo.yaml

kubectl get pods -n command-lab

kubectl logs command-demo -n command-lab

kubectl exec -it command-demo -n command-lab \
  -- /bin/sh
```

Expected logs:

```
Starting kubernetes-lab
Running inside Kubernetes
```

Sau khi hoàn thành:

```
kubectl delete namespace command-lab
```

Không xóa cluster Kind.

## 9. Kiểm tra kiến thức

Command &amp; Args Test

0/5

1. Kubernetes command tương ứng với field nào của Docker?

CMD

ENTRYPOINT

EXPOSE

2. Chỉ khai báo args, còn command bỏ trống thì điều gì xảy ra?

Giữ ENTRYPOINT của image và thay CMD

Không thể chạy container

Luôn chạy bash

3. Muốn chạy echo hello &amp;&amp; sleep 60 trong một câu lệnh, cách nào đúng?

command: ["echo", "hello", "&amp;&amp;", "sleep", "60"]

command: ["/bin/sh", "-c"] và args: ["echo hello &amp;&amp; sleep 60"]

4. Một Pod chạy script xong Exit 0 rồi restart liên tục vì restartPolicy Always. Nên dùng gì cho tác vụ one-off?

Deployment

Job

Service

5. Tại sao nên dùng exec ở cuối shell startup script?

Giúp process chính thay shell và nhận signals tốt hơn

Để tăng CPU limit

Để tự động tạo Service

## 10. Chốt kiến thức — 5 điều cần nhớ

1. `command` = ENTRYPOINT, `args` = CMD theo cách Kubernetes ghi đè cấu hình image.
2. Command &amp; Args dùng dạng array; từng phần tử là một argument riêng.
3. Kubernetes không tự chạy shell. Muốn dùng `&&`, pipe hoặc shell expansion, hãy gọi `/bin/sh -c`.
4. Dùng `exec` trong shell startup script để process chính xử lý shutdown signals tốt hơn.
5. Khi debug `CrashLoopBackOff`, phải kiểm tra command thực tế, container logs, exit code và restart policy.

Góc nhìn DevOps: Command &amp; Args không chỉ là cú pháp YAML. Nó quyết định tiến trình chính của container, từ đó ảnh hưởng trực tiếp đến startup, graceful shutdown, health checks và vòng đời Pod.

Sau bài này, chủ đề nên học tiếp là Environment Variables, ConfigMap &amp; Secret — cách cấu hình ứng dụng mà không cần build lại Docker image.