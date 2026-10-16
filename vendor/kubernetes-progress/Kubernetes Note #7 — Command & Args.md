# Kubernetes Note #7 — Command & Args

![Kubernetes Note #7 — Command & Args](image/Kubernetes%20Note%20%237%20%E2%80%94%20Command%20%26%20Args.png)

## 1. Docker và Kubernetes mapping

```text
Docker ENTRYPOINT
        ↓
Kubernetes command
```

và:

```text
Docker CMD
     ↓
Kubernetes args
```

| Dockerfile | Kubernetes field | Ý nghĩa |
|---|---|---|
| `ENTRYPOINT` | `command` | executable chạy |
| `CMD` | `args` | tham số truyền vào executable |

---

## 2. Image dùng cho ví dụ

Giả sử Dockerfile:

```dockerfile
FROM busybox
ENTRYPOINT ["sleep"]
CMD ["1000"]
```

Chạy mặc định:

```bash
sleep 1000
```

---

## 3. Override cả command và args

```yaml
spec:
  containers:
    - name: app
      image: example
      command:
        - sleep
      args:
        - "2000"
```

=> chạy:

```bash
sleep 2000
```

> Giá trị trong `args`/`command` phải là **string**. Viết `"2000"` có dấu nháy; viết `2000` (số) sẽ bị API reject.

---

## 4. Chỉ override args

```yaml
args:
  - "3000"
```

Image có `ENTRYPOINT ["sleep"]`, nên kết quả:

```bash
sleep 3000
```

> **Lưu ý:** cách này chỉ đúng khi image dùng `ENTRYPOINT`. Nếu image chỉ có `CMD ["sleep", "1000"]` (không có ENTRYPOINT), thì `args: ["3000"]` thay toàn bộ CMD → container cố chạy executable tên `3000` → lỗi.

---

## 5. Bảng 4 trường hợp

| Khai báo trong Pod | Lệnh thực sự chạy |
|---|---|
| Không `command`, không `args` | `ENTRYPOINT` + `CMD` của image |
| Chỉ `args` | `ENTRYPOINT` của image + `args` |
| Chỉ `command` | **chỉ** `command` (CMD của image bị bỏ qua) |
| Cả `command` và `args` | `command` + `args` |

> **Điểm dễ nhầm:** khai báo `command` mà không có `args` thì `CMD` mặc định của image **không** được dùng nữa.

---

## 6. Override command

```yaml
command:
  - ls
```

Container chạy `ls` (CMD `1000` của image bị bỏ qua).

`ls` chạy xong:

```text
process exits (exit code 0)
```

=> container kết thúc.

Concept cốt lõi:

> Container chỉ sống chừng nào **main process (PID 1)** còn chạy.

Pod status sau đó phụ thuộc `restartPolicy`:

| `restartPolicy` | Kết quả |
|---|---|
| `Always` (mặc định của Pod và bắt buộc với Deployment) | Container restart liên tục → `Completed` rồi `CrashLoopBackOff` |
| `OnFailure` | Exit 0 → không restart → `Completed` |
| `Never` | Không restart → `Completed` |

Ví dụ thấy `Completed` ổn định:

```bash
kubectl run ls-demo --image=busybox --restart=Never -- ls /
kubectl get pod ls-demo
kubectl logs ls-demo
```

---

## 7. Chạy shell command

Muốn dùng pipe, `&&`, biến môi trường shell... phải gọi shell:

```yaml
command: ["sh", "-c"]
args:
  - echo "start" && sleep 3600
```

`command`/`args` **không** tự chạy qua shell. Viết `command: ["echo $HOME"]` sẽ tìm executable tên `echo $HOME`.

Kubernetes có cú pháp riêng để chèn env var của container: `$(VAR_NAME)`.

```yaml
env:
  - name: MESSAGE
    value: hello
args:
  - "$(MESSAGE)"
```

---

## 8. Imperative

```bash
kubectl run app --image=busybox -- sleep 2000
```

Mọi thứ sau `--` là **args**.

Override command:

```bash
kubectl run app --image=busybox --command -- sleep 2000
```

`--command` biến phần sau `--` thành **command**.
