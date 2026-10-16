# Kubernetes Labs — All Labs (01–46)

All 46 labs from [`labs/`](../labs/README.md) merged into one file, in curriculum order. Source files are unchanged; regenerate this file if they change.

## Table of Contents

| # | Lab | Source |
|---|-----|--------|
| 1 | [Lab 1 - The Anatomy of a Container](#lab-01) | [`labs/lab-01-anatomy-of-a-container.md`](../labs/lab-01-anatomy-of-a-container.md) |
| 2 | [Lab 2 - Namespaces and Contexts](#lab-02) | [`labs/lab-02-namespaces-and-contexts.md`](../labs/lab-02-namespaces-and-contexts.md) |
| 3 | [Lab 3 - Controlling Where Pods Run (Scheduling and Taints)](#lab-03) | [`labs/lab-03-scheduling-and-taints.md`](../labs/lab-03-scheduling-and-taints.md) |
| 4 | [Lab 4 - Pod Priority and Preemption](#lab-04) | [`labs/lab-04-pod-priority-and-preemption.md`](../labs/lab-04-pod-priority-and-preemption.md) |
| 5 | [Lab 5 - Node Affinity and Pod Anti-Affinity](#lab-05) | [`labs/lab-05-node-affinity-and-anti-affinity.md`](../labs/lab-05-node-affinity-and-anti-affinity.md) |
| 6 | [Lab 6 - Pods, ReplicaSets, and Deployments](#lab-06) | [`labs/lab-06-pods-replicasets-and-deployments.md`](../labs/lab-06-pods-replicasets-and-deployments.md) |
| 7 | [Lab 7 - Deployments and Rollout Strategies](#lab-07) | [`labs/lab-07-deployments-and-rollout-strategies.md`](../labs/lab-07-deployments-and-rollout-strategies.md) |
| 8 | [Lab 8 - StatefulSets](#lab-08) | [`labs/lab-08-statefulsets.md`](../labs/lab-08-statefulsets.md) |
| 9 | [Lab 9 - DaemonSets](#lab-09) | [`labs/lab-09-daemonsets.md`](../labs/lab-09-daemonsets.md) |
| 10 | [Lab 10 - Jobs and CronJobs](#lab-10) | [`labs/lab-10-jobs-and-cronjobs.md`](../labs/lab-10-jobs-and-cronjobs.md) |
| 11 | [Lab 11 - Init Containers](#lab-11) | [`labs/lab-11-init-containers.md`](../labs/lab-11-init-containers.md) |
| 12 | [Lab 12 - Advanced Stateful Workloads (Databases and Message Queues)](#lab-12) | [`labs/lab-12-advanced-stateful-workloads.md`](../labs/lab-12-advanced-stateful-workloads.md) |
| 13 | [Lab 13 - Networking Fundamentals and the CNI](#lab-13) | [`labs/lab-13-networking-fundamentals-and-the-cni.md`](../labs/lab-13-networking-fundamentals-and-the-cni.md) |
| 14 | [Lab 14 - Services and Cluster Networking](#lab-14) | [`labs/lab-14-services-and-cluster-networking.md`](../labs/lab-14-services-and-cluster-networking.md) |
| 15 | [Lab 15 - Ingress and Ingress Controllers](#lab-15) | [`labs/lab-15-ingress-and-ingress-controllers.md`](../labs/lab-15-ingress-and-ingress-controllers.md) |
| 16 | [Lab 16 - Network Policies](#lab-16) | [`labs/lab-16-network-policies.md`](../labs/lab-16-network-policies.md) |
| 17 | [Lab 17 - End-to-End Traffic Flow and the 502 Bad Gateway](#lab-17) | [`labs/lab-17-end-to-end-traffic-flow-and-the-502-bad-gateway.md`](../labs/lab-17-end-to-end-traffic-flow-and-the-502-bad-gateway.md) |
| 18 | [Lab 18 - Service Mesh (Istio and Linkerd)](#lab-18) | [`labs/lab-18-service-mesh-istio-and-linkerd.md`](../labs/lab-18-service-mesh-istio-and-linkerd.md) |
| 19 | [Lab 19 - Persistent Storage (PVs, PVCs, and StorageClasses)](#lab-19) | [`labs/lab-19-persistent-storage-pv-pvc-sc.md`](../labs/lab-19-persistent-storage-pv-pvc-sc.md) |
| 20 | [Lab 20 - ConfigMaps and Secrets](#lab-20) | [`labs/lab-20-configmaps-and-secrets.md`](../labs/lab-20-configmaps-and-secrets.md) |
| 21 | [Lab 21 - Resource Management and the OOMKiller](#lab-21) | [`labs/lab-21-resource-management-and-oomkiller.md`](../labs/lab-21-resource-management-and-oomkiller.md) |
| 22 | [Lab 22 - RBAC and Service Accounts](#lab-22) | [`labs/lab-22-rbac-and-service-accounts.md`](../labs/lab-22-rbac-and-service-accounts.md) |
| 23 | [Lab 23 - Container Security Contexts](#lab-23) | [`labs/lab-23-container-security-contexts.md`](../labs/lab-23-container-security-contexts.md) |
| 24 | [Lab 24 - Monitoring and Metrics](#lab-24) | [`labs/lab-24-monitoring-and-metrics.md`](../labs/lab-24-monitoring-and-metrics.md) |
| 25 | [Lab 25 - Logging](#lab-25) | [`labs/lab-25-logging.md`](../labs/lab-25-logging.md) |
| 26 | [Lab 26 - Probes and Health Checks](#lab-26) | [`labs/lab-26-probes-and-health-checks.md`](../labs/lab-26-probes-and-health-checks.md) |
| 27 | [Lab 27 - Observability Deep Dive (Prometheus and Grafana)](#lab-27) | [`labs/lab-27-prometheus-and-grafana.md`](../labs/lab-27-prometheus-and-grafana.md) |
| 28 | [Lab 28 - Centralized Logging (Loki and Promtail)](#lab-28) | [`labs/lab-28-loki-and-promtail.md`](../labs/lab-28-loki-and-promtail.md) |
| 29 | [Lab 29 - Helm](#lab-29) | [`labs/lab-29-helm.md`](../labs/lab-29-helm.md) |
| 30 | [Lab 30 - Helm Deep Dive (Writing Production Charts)](#lab-30) | [`labs/lab-30-helm-deep-dive-writing-production-charts.md`](../labs/lab-30-helm-deep-dive-writing-production-charts.md) |
| 31 | [Lab 31 - GitOps Principles and Practices](#lab-31) | [`labs/lab-31-gitops-principles-and-practices.md`](../labs/lab-31-gitops-principles-and-practices.md) |
| 32 | [Lab 32 - CI/CD Pipelines (GitHub Actions and ArgoCD)](#lab-32) | [`labs/lab-32-cicd-pipelines-github-actions-argocd.md`](../labs/lab-32-cicd-pipelines-github-actions-argocd.md) |
| 33 | [Lab 33 - Extending Kubernetes (CRDs and Operators)](#lab-33) | [`labs/lab-33-crds-and-operators.md`](../labs/lab-33-crds-and-operators.md) |
| 34 | [Lab 34 - Operators in Practice](#lab-34) | [`labs/lab-34-operators-in-practice.md`](../labs/lab-34-operators-in-practice.md) |
| 35 | [Lab 35 - Building a 3-Tier Web Application](#lab-35) | [`labs/lab-35-building-a-3-tier-web-application.md`](../labs/lab-35-building-a-3-tier-web-application.md) |
| 36 | [Lab 36 - Horizontal Pod Autoscaler](#lab-36) | [`labs/lab-36-horizontal-pod-autoscaler.md`](../labs/lab-36-horizontal-pod-autoscaler.md) |
| 37 | [Lab 37 - Cluster Upgrades and Maintenance](#lab-37) | [`labs/lab-37-cluster-upgrades-and-maintenance.md`](../labs/lab-37-cluster-upgrades-and-maintenance.md) |
| 38 | [Lab 38 - Backups and Disaster Recovery with Velero](#lab-38) | [`labs/lab-38-backups-and-disaster-recovery-with-velero.md`](../labs/lab-38-backups-and-disaster-recovery-with-velero.md) |
| 39 | [Lab 39 - Multi-Cluster Kubernetes](#lab-39) | [`labs/lab-39-multi-cluster-kubernetes.md`](../labs/lab-39-multi-cluster-kubernetes.md) |
| 40 | [Lab 40 - Progressive Delivery with Argo Rollouts](#lab-40) | [`labs/lab-40-argo-rollouts.md`](../labs/lab-40-argo-rollouts.md) |
| 41 | [Lab 41 - The SRE Troubleshooting Masterclass](#lab-41) | [`labs/lab-41-sre-troubleshooting-masterclass.md`](../labs/lab-41-sre-troubleshooting-masterclass.md) |
| 42 | [Lab 42 - Node Pressure and Evictions](#lab-42) | [`labs/lab-42-node-pressure-and-evictions.md`](../labs/lab-42-node-pressure-and-evictions.md) |
| 43 | [Lab 43 - CKA Exam Masterclass (Speed and Shortcut Techniques)](#lab-43) | [`labs/lab-43-cka-exam-masterclass.md`](../labs/lab-43-cka-exam-masterclass.md) |
| 44 | [Lab 44 - Cluster Architecture and the Kubeconfig File](#lab-44) | [`labs/lab-44-cluster-architecture-and-kubeconfig.md`](../labs/lab-44-cluster-architecture-and-kubeconfig.md) |
| 45 | [Lab 45 - etcd Backup and Restore](#lab-45) | [`labs/lab-45-etcd-backup-and-restore.md`](../labs/lab-45-etcd-backup-and-restore.md) |
| 46 | [Lab 46 - Final Capstone Assessment and Portfolio Project](#lab-46) | [`labs/lab-46-capstone-assessment.md`](../labs/lab-46-capstone-assessment.md) |

---

<a id="lab-01"></a>

## Lab 1 - The Anatomy of a Container

### Objective

Prove that a container is a constrained Linux process by observing, hands-on, both halves of the story:

- **Namespaces** isolate what a process sees (it believes it is PID 1 and alone on the machine).
- **cgroups** limit what a process can use (memory limit kills the process when exceeded).

### Prerequisites

- Lesson 01 - The Anatomy of a Container.
- Docker installed and running on a Linux machine (Ubuntu recommended).
- A terminal.

#### Installing Docker

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect

# Verify
docker --version
```

### Target Environment

Local Linux host with Docker. The same concepts map directly onto any Kubernetes cluster via the Container Runtime Interface.

### Steps

#### 1. Inspect the host process tree

```bash
ps aux | head -n 10
```

Expected: normal host processes, with `systemd` (or `init`) as PID 1. Note the number of processes and the PID 1.

#### 2. Start an isolated container

```bash
docker run -it --memory="512m" --cpus="1" ubuntu:22.04 /bin/bash
```

This creates a cgroup with a 512MB RAM limit and a one-CPU limit, then opens a shell inside a fresh set of namespaces.

#### 3. Confirm the PID namespace isolation

```bash
ps aux
```

Expected: the container's shell appears as `/bin/bash` with **PID 1**. The host's `systemd` and other processes are invisible. This is the PID namespace in action.

You can also confirm you are not root's host session unexpectedly limited by checking the hostname view:

```bash
hostname
cat /proc/self/cgroup
```

#### 4. Confirm the network namespace

```bash
ip addr show
```

The container sees its own network interface with its own IP, not the host's full set of interfaces.

#### 5. Test reading the cgroup memory limit

```bash
cat /sys/fs/cgroup/memory/memory.limit_in_bytes 2>/dev/null
```

Look for the value corresponding to 512MB (`536870912`). If your system uses cgroup v2, inspect the equivalent v2 file instead.

#### 6. Demonstrate OOM behavior (Optional, Mini Project)

Run a container with a hard memory limit and force it to exceed the limit:

```bash
docker run -it --memory="100m" ubuntu:22.04 /bin/bash
```

Inside the container, allocate memory rapidly:

```bash
# repeat allocation until the process is killed
yes 123456789 | md5sum
```

Expected: the container exits with code 137 (OOM kill) because it exceeded its cgroup memory limit.

Verify with:

```bash
docker ps -a
```

The stopped container is shown with a high exit code.

### Verification

- The containerized `ps aux` shows PID 1 as the shell and hides the host's processes -> namespace isolation confirmed.
- The memory-limited container is killed by the kernel when it exceeds the limit -> cgroup limitation confirmed.

### Cleanup

```bash
exit          # inside the container shell
docker ps -a  # list any stopped containers from this lab
# Remove them if you want to free resources
docker rm <container-id>
```

### Expected Output Snapshot

```text
# Inside a disconnected container
PID   USER  TIME  COMMAND
1     root  0:00  /bin/bash
```

Note: the exact `ps` columns vary by image. The key observation is the container's own process tree with a low PID 1, and the absence of host processes.

### Related

- Lesson file: [lesson-01-anatomy-of-a-container.md](../docs/01-fundamentals/lesson-01-anatomy-of-a-container.md)

---

<a id="lab-02"></a>

## Lab 2 - Namespaces and Contexts

### Prerequisite

- Completion of [Lesson 2 - Namespaces and Contexts](../docs/01-fundamentals/lesson-02-namespaces-and-contexts.md).
- A running kind cluster.
- kubectl installed and configured.

### Objective

Create a Namespace, lock it down with a ResourceQuota, set up a Context, and then try to exceed the quota.

### Estimated Time

15 minutes.

---

### Step 1: Create a Namespace and Context

```bash
kubectl create namespace team-alpha

kubectl config set-context alpha-context --namespace=team-alpha --cluster=kind-$(kind get clusters) --user=kind-$(kind get clusters)
kubectl config use-context alpha-context
```

Verify it worked:

```bash
kubectl config current-context
kubectl get pods
```

(It should say `alpha-context` and `No resources found in team-alpha namespace.`)

### Step 2: Apply a ResourceQuota

Create `quota.yaml`:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: team-alpha
spec:
  hard:
    requests.cpu: "1"
    requests.memory: 1Gi
    limits.cpu: "2"
    limits.memory: 2Gi
```

Apply it:

```bash
kubectl apply -f quota.yaml
```

### Step 3: Test the Quota (The Good)

Deploy a Pod that requests 500m (half a CPU):

```bash
kubectl run good-pod --image=nginx:alpine --requests="cpu=500m,memory=256Mi" --limits="cpu=1,memory=512Mi"
```

Verify it's running:

```bash
kubectl get pods
```

### Step 4: Break Things on Purpose

Try to deploy a second Pod that requests 1 full CPU:

```bash
kubectl run bad-pod --image=nginx:alpine --requests="cpu=1,memory=256Mi" --limits="cpu=1,memory=512Mi"
```

**Your Task:**

- What happened when you tried to run the `bad-pod` command? Did it give you an error in the terminal immediately, or did it hang?
- Run `kubectl get pods`. Does `bad-pod` exist in the namespace?
- Based on the theory of Admission Controllers, at what exact point did Kubernetes reject this Pod, and why?

(Answer: 1. It gave an error immediately: `Error from server (Forbidden): pods "bad-pod" is forbidden: exceeded quota`. 2. No, it does not exist. 3. It was rejected at the API Server's Admission Control phase. The request was never saved to etcd, so the Scheduler and Kubelet never saw it).

### Step 5: Cleanup

```bash
kubectl config use-context kind-$(kind get clusters)
kubectl delete namespace team-alpha
kubectl config delete-context alpha-context
```

---

### What You Learned

- Namespaces provide logical grouping and isolation for resources within a single cluster.
- Contexts (stored in `~/.kube/config`) pair a user, cluster, and namespace so you don't have to type `-n` constantly.
- ResourceQuotas limit the total amount of CPU/Memory/Object count in a namespace.
- Quotas are enforced by the Admission Controller at the API Server level. If a Pod's requests would exceed the quota, the API Server returns 403 Forbidden instantly.

### Next Steps

Proceed to [Lesson 35 - kubectl Essentials and Cluster Access](../docs/01-fundamentals/README.md) to learn about kubectl.

---

[Back to Labs](../labs/README.md)

---

<a id="lab-03"></a>

## Lab 3 - Controlling Where Pods Run (Scheduling and Taints)

### Objective

Create a multi-node cluster, label a node, force a Pod to schedule there using nodeSelector, test Taints and Tolerations, and debug a broken schedule.

### Prerequisites

- Lesson 3 - Controlling Where Pods Run (Scheduling and Taints).
- A running kind cluster with multiple nodes.
- kubectl installed and configured.

#### Quick Multi-Node Cluster Setup (kind)

```bash
kind delete cluster

cat <<EOF > kind-multi.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
EOF

kind create cluster --config kind-multi.yaml

kubectl get nodes
```

### Steps

#### 1. Label a Node

```bash
kubectl label nodes kind-worker2 hardware=highmem
kubectl get nodes --show-labels
```

#### 2. Schedule a Pod Using NodeSelector

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: memory-app
spec:
  nodeSelector:
    hardware: highmem
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "sleep 3600"]
EOF
```

```bash
kubectl get pod memory-app -o wide
```

Expected: The NODE column shows `kind-worker2`.

#### 3. Test Taints and Tolerations

Taint the GPU node:

```bash
kubectl taint nodes kind-worker2 gpu=true:NoSchedule
```

Deploy a Pod without toleration:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: no-gpu-app
spec:
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "sleep 3600"]
EOF
```

```bash
kubectl get pod no-gpu-app -o wide
```

Expected: The Pod lands on `kind-worker` (not `kind-worker2`).

Deploy a Pod with toleration:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: gpu-app
spec:
  tolerations:
  - key: "gpu"
    operator: "Equal"
    value: "true"
    effect: "NoSchedule"
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "sleep 3600"]
EOF
```

```bash
kubectl get pod gpu-app -o wide
```

Expected: The Pod lands on `kind-worker2` (the tainted node).

#### 4. Debug a Broken Schedule

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: broken-schedule
spec:
  nodeSelector:
    disktype: nvme
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "sleep 3600"]
EOF
```

```bash
kubectl get pod broken-schedule
kubectl describe pod broken-schedule
```

The Pod stays Pending. The Events section shows why.

#### 5. Cleanup

```bash
kubectl delete pod memory-app no-gpu-app gpu-app broken-schedule
kubectl label nodes kind-worker2 hardware-
kubectl taint nodes kind-worker2 gpu=true:NoSchedule-
kind delete cluster
```

### Verification

- Pod with nodeSelector lands on the labeled node.
- Pod without toleration avoids the tainted node.
- Pod with toleration lands on the tainted node.
- Broken schedule Pod stays Pending with clear error message.

### Expected Output Snapshot

```text
$ kubectl get pod memory-app -o wide
NAME          READY   STATUS    NODE          
memory-app    1/1     Running   kind-worker2  

$ kubectl get pod no-gpu-app -o wide
NAME          READY   STATUS    NODE        
no-gpu-app    1/1     Running   kind-worker  

$ kubectl get pod gpu-app -o wide
NAME        READY   STATUS    NODE          
gpu-app     1/1     Running   kind-worker2  

$ kubectl get pod broken-schedule
NAME              READY   STATUS    PENDING
broken-schedule   0/1     Pending   
```

### Related

- Lesson file: [lesson-03-worker-node-architecture.md](../docs/02-architecture/lesson-03-worker-node-architecture.md)

---

<a id="lab-04"></a>

## Lab 4 - Pod Priority and Preemption

### Prerequisite

- Completion of [Lesson 4 - Pod Priority and Preemption](../docs/02-architecture/lesson-04-pod-priority-and-preemption.md).
- A running kind cluster (ideally multi-node).
- kubectl installed and configured.

### Objective

Create a low-priority app that fills up the cluster, and then deploy a high-priority app that kicks the low-priority app out.

### Estimated Time

15 minutes.

---

### Step 1: Create Priority Classes

Create `priority.yaml`:

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000000
globalDefault: false
description: "Critical apps that must schedule."
---
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: low-priority
value: 100
globalDefault: false
description: "Background batch jobs."
```

Apply it:

```bash
kubectl apply -f priority.yaml
```

Expected output:

```
priorityclass.scheduling.k8s.io/high-priority created
priorityclass.scheduling.k8s.io/low-priority created
```

### Step 2: Fill the Cluster with Low-Priority Pods

Create `low-app.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: low-priority-app
spec:
  replicas: 4
  selector:
    matchLabels:
      app: low
  template:
    metadata:
      labels:
        app: low
    spec:
      priorityClassName: low-priority
      containers:
      - name: app
        image: busybox:latest
        command: ["sleep", "3600"]
        resources:
          requests:
            cpu: "1000m"
```

Apply it and wait for the pods to run:

```bash
kubectl apply -f low-app.yaml
kubectl get pods -l app=low -o wide
```

Expected output: 4 pods running, spread across the worker nodes.

### Step 3: Deploy the High-Priority VIP Pod

Create `high-app.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: high-priority-vip
  labels:
    app: high
spec:
  priorityClassName: high-priority
  containers:
  - name: app
    image: busybox:latest
    command: ["sleep", "3600"]
    resources:
      requests:
        cpu: "1000m"
```

Apply it:

```bash
kubectl apply -f high-app.yaml
```

### Step 4: Investigate the Preemption

Wait about 5-10 seconds, then run:

```bash
kubectl get pods -l app=high
kubectl get pods -l app=low
```

**Your Task:**

- Did the `high-priority-vip` pod successfully start running?
- What happened to the `low-priority-app` pods? Did the replica count drop, or did one of the pods get deleted/replaced?
- Run `kubectl describe pod high-priority-vip` and look at the Events section. What does the message say about preemption and the victims?

(Answer: 1. Yes. 2. One low-priority pod was deleted. The ReplicaSet tries to recreate it to maintain 4 replicas, but the new pod stays Pending because the VIP took the CPU. 3. The events show `Preempted` and list the victim pod name).

### Step 5: Cleanup

```bash
kubectl delete pod high-priority-vip
kubectl delete deployment low-priority-app
kubectl delete priorityclass high-priority low-priority
```

---

### What You Learned

- PriorityClass assigns an integer priority value to a Pod.
- Preemption is the process of terminating lower-priority Pods to free up node resources.
- This allows cluster overcommitment: packing nodes full of low-priority workloads that act as "sacrificial lambs" for critical services.
- Victim Pods are deleted and given a graceful termination period.

### Next Steps

Proceed to [Lesson 15 - Ingress and Ingress Controllers](../docs/04-networking/lesson-15-ingress-and-ingress-controllers.md) to learn about exposing applications externally.

---

[Back to Labs](../labs/README.md)

---

<a id="lab-05"></a>

## Lab 5 - Node Affinity and Pod Anti-Affinity

### Objective

In this lab you will create a Deployment with a strict Pod Anti-Affinity rule and observe how Kubernetes spreads Pods across nodes. You will then watch what happens when the scheduler runs out of valid nodes. Finally, you will test Node Affinity to pull Pods to labeled nodes.

### Prerequisites

- A running kind cluster (ideally multi-node: 1 control-plane, 2 workers)
- kubectl installed and configured
- Completion of Lessons 1 through 24

### Pre-Lab Checklist

- [ ] kind cluster running with multiple nodes
- [ ] `kubectl get nodes` shows 2+ workers
- [ ] Understand Pod Anti-Affinity and Node Affinity

---

### Step 1: Check Your Cluster

Verify you have multiple nodes:

```bash
kubectl get nodes
```

You should see at least 1 control-plane and 2 workers. If you only have 1 node, the anti-affinity demo won't work as expected.

### Step 2: Create HA Deployment with Required Anti-Affinity

Create `ha-deploy.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ha-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - web
            topologyKey: kubernetes.io/hostname
      containers:
      - name: app
        image: nginx:alpine
```

Apply it:

```bash
kubectl apply -f ha-deploy.yaml
```

### Step 3: Observe the Spread

Wait about 15 seconds, then run:

```bash
kubectl get pods -l app=web -o wide
```

Notice where the Pods landed. One should be on `kind-worker`, and one should be on `kind-worker2`. They were forced to spread out.

### Step 4: Investigate the Failure

Run this command:

```bash
kubectl get pods -l app=web
```

Notice that the 3rd replica is likely NOT running. It is stuck in Pending.

Run this to see why:

```bash
kubectl describe pod -l app=web | grep -A 5 Events
```

**Your Task:**

- How many Pods are Running vs Pending?
- What is the exact warning/error message in the Events for the Pending Pod? (It should mention anti-affinity).
- Based on the cluster setup (1 control-plane + 2 workers), explain exactly why the 3rd Pod cannot be scheduled.

### Step 5: Switch to Preferred Anti-Affinity

Delete the current deployment:

```bash
kubectl delete deployment ha-web
```

Create `ha-preferred.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ha-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - web
              topologyKey: kubernetes.io/hostname
      containers:
      - name: app
        image: nginx:alpine
```

Apply it:

```bash
kubectl apply -f ha-preferred.yaml
```

Wait 15 seconds, then check:

```bash
kubectl get pods -l app=web -o wide
```

Now all 3 Pods should be Running. The scheduler tried to spread them, but since there were only 2 workers, it placed 2 on one node and 1 on the other.

### Step 6: Test Node Affinity

Create `node-affinity.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ssd-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ssd
  template:
    metadata:
      labels:
        app: ssd
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: disktype
                operator: In
                values:
                - ssd
      containers:
      - name: app
        image: nginx:alpine
```

Apply it:

```bash
kubectl apply -f node-affinity.yaml
```

Check the pods:

```bash
kubectl get pods -l app=ssd
```

They should be Pending because no nodes have the label `disktype=ssd`.

### Step 7: Label a Node and Watch Pods Schedule

Label a worker node:

```bash
kubectl label nodes kind-worker disktype=ssd
```

Check the pods again:

```bash
kubectl get pods -l app=ssd -o wide
```

Now they should be Running on `kind-worker`.

### Step 8: Verify the Label

```bash
kubectl get nodes --show-labels | grep disktype
```

### Step 9: Cleanup

```bash
kubectl delete deployment ha-web
kubectl delete deployment ssd-app
kubectl label nodes kind-worker disktype-
```

---

### Lab Questions

1. Why did the 3rd Pod stay Pending with required anti-affinity?
2. What is the difference between required and preferred anti-affinity in practice?
3. How could you use topologyKey `topology.kubernetes.io/zone` for multi-AZ high availability?
4. What would happen if you had only 1 worker node and used required anti-affinity with 2 replicas?

---

### Expected Results

After completing this lab:
- You understand how Pod Anti-Affinity spreads Pods across nodes
- You know the difference between required and preferred scheduling rules
- You can apply Node Affinity to pull Pods to labeled nodes
- You can debug FailedScheduling events

---

### Key Commands Reference

| Command | Purpose |
|---------|---------|
| `kubectl get pods -o wide` | Show pods with node assignment |
| `kubectl describe pod <name>` | See scheduling events |
| `kubectl label nodes <node> <key>=<val>` | Add label to node |
| `kubectl label nodes <node> <key>-` | Remove label from node |
| `kubectl get nodes --show-labels` | Show all node labels |

---

### Next

- Return to the [Lesson 25 file](../docs/02-architecture/lesson-05-node-affinity-and-anti-affinity.md) to review the concepts
- Try the advanced task: Use Pod Affinity (not Anti-Affinity) to co-locate related Pods
- Proceed to the next lesson to learn about the Kubernetes API and Controllers

---

<a id="lab-06"></a>

## Lab 6 - Pods, ReplicaSets, and Deployments

### Objective

Deploy an Nginx application using a declarative Deployment. Observe the Deployment -> ReplicaSet -> Pod hierarchy, test self-healing, scaling, rolling updates, and rollbacks.

### Prerequisites

- Lesson 6 - Pods, ReplicaSets, and Deployments.
- A running kind, minikube, or k3s cluster.
- kubectl installed and configured.

#### Quick Cluster Setup (kind)

If you do not have a cluster running, use kind:

```bash
# Create a cluster
kind create cluster --name learning

# Verify
kubectl cluster-info --context kind-learning
kubectl get nodes
```

When finished:

```bash
kind delete cluster --name learning
```

### Target Environment

Any local Kubernetes cluster (kind, minikube, k3s, Docker Desktop Kubernetes).

### Steps

#### 1. Create the Deployment

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deploy
  labels:
    app: nginx
spec:
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
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
EOF
```

#### 2. Verify the hierarchy

```bash
kubectl get deployments
kubectl get replicasets
kubectl get pods -l app=web
```

Expected: 1 Deployment, 1 ReplicaSet, and 3 Pods.

#### 3. Test self-healing

```bash
# Pick one Pod name from the list
kubectl delete pod <POD_NAME>

# Immediately check the Pod list
kubectl get pods -l app=web
```

The deleted Pod terminates, and a brand new Pod is created to maintain the count of 3.

#### 4. Test scaling

```bash
kubectl scale deployment nginx-deploy --replicas=5
kubectl get pods -l app=web
```

Now 5 Pods are running.

#### 5. Test rolling update

```bash
kubectl set image deployment/nginx-deploy nginx=nginx:1.26-alpine
kubectl rollout status deployment/nginx-deploy
kubectl get replicasets
```

A new ReplicaSet appears and scales up while the old one scales down.

#### 6. Test rollback

```bash
kubectl rollout undo deployment/nginx-deploy
kubectl rollout status deployment/nginx-deploy
```

Traffic shifts back to the previous version.

#### 7. Inspect the deployment history

```bash
kubectl rollout history deployment/nginx-deploy
```

#### 8. Cleanup

```bash
kubectl delete deployment nginx-deploy
```

### Verification

- The Deployment creates a ReplicaSet, which creates Pods.
- Deleting a Pod triggers immediate recreation (self-healing).
- Scaling changes the Pod count.
- Rolling update shifts traffic gradually between ReplicaSets.
- Rollback restores the previous version.

### Expected Output Snapshot

```text
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deploy   3/3     3            3           30s

NAME                      DESIRED   CURRENT   READY   AGE
nginx-deploy-7c5bdf7458   3         3         3       30s

NAME                            READY   STATUS    RESTARTS   AGE
nginx-deploy-7c5bdf7458-abc12   1/1     Running   0          30s
nginx-deploy-7c5bdf7458-def34   1/1     Running   0          30s
nginx-deploy-7c5bdf7458-ghi56   1/1     Running   0          30s
```

### Related

- Lesson file: [lesson-06-pods-replicasets-and-deployments.md](../docs/03-workloads/lesson-06-pods-replicasets-and-deployments.md)

---

<a id="lab-07"></a>

## Lab 7 - Deployments and Rollout Strategies

### Prerequisite

- Completion of [Lesson 7 - Deployments and Rollout Strategies](../docs/03-workloads/lesson-07-deployments-and-rollout-strategies.md).
- A running kind cluster.
- kubectl installed and configured.

### Objective

Deploy an app, perform a zero-downtime update, and then simulate a bad deploy and roll it back.

### Estimated Time

15 minutes.

---

### Step 1: Create the Deployment

Create `rollout-deploy.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rollout-app
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: rollout
  template:
    metadata:
      labels:
        app: rollout
    spec:
      containers:
      - name: app
        image: nginx:1.25-alpine
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 2
          periodSeconds: 2
```

Apply it:

```bash
kubectl apply -f rollout-deploy.yaml
```

Wait for all 4 to be running:

```bash
kubectl get pods -l app=rollout
```

### Step 2: Perform a Zero-Downtime Update (v2)

Update the image to version 1.26:

```bash
kubectl set image deployment/rollout-app app=nginx:1.26-alpine
```

Watch the rollout happen in real-time:

```bash
kubectl rollout status deployment/rollout-app
```

(It should say "deployment successfully rolled out").

Check the ReplicaSets:

```bash
kubectl get replicasets -l app=rollout
```

(You will see two ReplicaSets! v1 will have 0 desired/ready pods. v2 will have 4).

### Step 3: Break Things on Purpose

Update to an image tag that doesn't exist:

```bash
kubectl set image deployment/rollout-app app=nginx:broken-tag
```

Watch the status:

```bash
kubectl rollout status deployment/rollout-app
```

(Press Ctrl+C after a few seconds to stop watching. It will hang, waiting for the broken pods to become ready).

### Step 4: Investigate the Stuck Rollout

```bash
kubectl get pods -l app=rollout
```

**Your Task:**

- What states are the Pods in? (You should see a mix of Running and ImagePullBackOff).
- How many Pods are Running vs ImagePullBackOff?
- Why didn't Kubernetes kill all the v2 (1.26) pods? Based on the `maxUnavailable` setting, how is Kubernetes protecting your users right now?

(Answer: 1. Mix of Running and ImagePullBackOff. 2. 3 Running, 2 ImagePullBackOff (because maxSurge=1). 3. maxUnavailable is 1. K8s is not allowed to drop below 3 healthy pods. It scaled v2 down to 3, and tried to scale v3 up to 2. Because v3 is broken, it froze the rollout. Users are still being served by the 3 healthy v2 pods).

### Step 5: The Instant Rollback

```bash
kubectl rollout undo deployment/rollout-app
```

### Step 6: Verify the Recovery

Wait about 10 seconds, then run:

```bash
kubectl get pods -l app=rollout
kubectl get replicasets -l app=rollout
```

**Your Task:**

- After the rollback, what happened to the ImagePullBackOff pods?
- How many healthy Running pods do you have now?
- Look at the ReplicaSets. Did the DESIRED count of the healthy ReplicaSet (v2) go back up to 4?

(Answer: 1. They were deleted. 2. 4. 3. Yes, v2 scaled back up to 4, and v3 scaled down to 0).

### Step 7: Cleanup

```bash
kubectl delete deployment rollout-app
```

---

### What You Learned

- A RollingUpdate strategy deploys new Pods gradually, ensuring there are always enough healthy Pods to serve traffic.
- `maxSurge`: How many extra new Pods can be created (allows bursting).
- `maxUnavailable`: How many Pods can be down (limits risk).
- When an update fails (e.g., ImagePullBackOff), Kubernetes freezes the rollout. It will not violate `maxUnavailable`, so your old, healthy Pods stay running.
- `kubectl rollout undo` instantly reverts the Deployment to the previous ReplicaSet.

### Next Steps

Proceed to [Lesson 8 - StatefulSets](../docs/03-workloads/lesson-08-statefulsets.md) to learn about running stateful applications.

---

[Back to Labs](../labs/README.md)

---

<a id="lab-08"></a>

## Lab 8 - StatefulSets

### Objective

Create a StatefulSet with a Headless Service, observe the strict ordering, and verify unique PVCs per Pod.

### Prerequisites

- Lesson 8 - StatefulSets.
- A running kind cluster.
- kubectl installed and configured.

#### Quick Cluster Setup (kind)

```bash
kind create cluster --name learning
kubectl cluster-info --context kind-learning
```

### Steps

#### 1. Create a Headless Service

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: db-svc
spec:
  clusterIP: None
  selector:
    app: db
  ports:
  - port: 80
EOF
```

#### 2. Create the StatefulSet

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
spec:
  serviceName: db-svc
  replicas: 3
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
      - name: db
        image: busybox:latest
        command: ["sh", "-c", "echo 'Database started on \$(hostname)' && sleep 3600"]
  podManagementPolicy: OrderedReady
EOF
```

#### 3. Observe Sequential Boot

```bash
kubectl get pods -l app=db --watch
```

Expected: Pods boot one by one: `db-0`, then `db-1`, then `db-2`.

#### 4. Verify Stable DNS

```bash
kubectl run -it --rm dns-test --image=busybox -- nslookup db-0.db-svc
```

#### 5. Verify Unique PVCs

```bash
kubectl get pvc
```

Expected: 3 PVCs: `data-db-0`, `data-db-1`, `data-db-2`.

#### 6. Test Scaling Down

```bash
kubectl scale statefulset db --replicas=1
kubectl get pods -l app=db
kubectl get pvc
```

Expected: `db-2` and `db-1` are deleted. `db-0` remains. PVCs are NOT deleted.

#### 7. Cleanup

```bash
kubectl delete statefulset db
kubectl delete svc db-svc
kubectl delete pvc data-db-0 data-db-1 data-db-2
kind delete cluster --name learning
```

### Verification

- StatefulSet creates Pods sequentially (0, then 1, then 2).
- Each Pod has a unique PVC.
- Scaling down deletes Pods in reverse order but preserves PVCs.
- Headless Service provides DNS resolution to specific Pods.

### Expected Output Snapshot

```text
$ kubectl get pods -l app=db
NAME    READY   STATUS    NODE
db-0    1/1     Running   kind-worker
db-1    1/1     Running   kind-worker
db-2    1/1     Running   kind-worker

$ kubectl get pvc
NAME           STATUS   VOLUME
data-db-0      Bound    pvc-abc
data-db-1      Bound    pvc-def
data-db-2      Bound    pvc-ghi
```

### Related

- Lesson file: [lesson-08-statefulsets.md](../docs/03-workloads/lesson-08-statefulsets.md)

---

<a id="lab-09"></a>

## Lab 9 - DaemonSets

### Objective

Deploy a DaemonSet to a multi-node cluster, verify one Pod per node, and test tolerations for control-plane nodes.

### Prerequisites

- Lesson 9 - DaemonSets.
- A running kind cluster with multiple nodes.
- kubectl installed and configured.

#### Quick Multi-Node Cluster Setup (kind)

```bash
kind delete cluster

cat <<EOF > kind-multi.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
EOF

kind create cluster --config kind-multi.yaml

kubectl get nodes
```

### Steps

#### 1. Deploy a DaemonSet

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-agent
  labels:
    app: log-agent
spec:
  selector:
    matchLabels:
      app: log-agent
  template:
    metadata:
      labels:
        app: log-agent
    spec:
      containers:
      - name: agent
        image: busybox:latest
        command: ["sh", "-c", "echo 'Collecting logs...' && sleep 3600"]
EOF
```

#### 2. Verify Placement

```bash
kubectl get pods -o wide -l app=log-agent
```

Expected: 2 Pods running (one on each worker node). No Pod on the control-plane node.

#### 3. Check DaemonSet Status

```bash
kubectl get daemonset log-agent
```

Expected: `DESIRED 2`, `CURRENT 2`, `READY 2`.

#### 4. Add Toleration for Control Plane

```bash
kubectl delete daemonset log-agent

cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-agent
  labels:
    app: log-agent
spec:
  selector:
    matchLabels:
      app: log-agent
  template:
    metadata:
      labels:
        app: log-agent
    spec:
      tolerations:
      - key: "node-role.kubernetes.io/control-plane"
        operator: "Exists"
        effect: "NoSchedule"
      containers:
      - name: agent
        image: busybox:latest
        command: ["sh", "-c", "echo 'Collecting logs...' && sleep 3600"]
EOF
```

```bash
kubectl get pods -o wide -l app=log-agent
```

Expected: 3 Pods running (one on each node, including control-plane).

#### 5. Cleanup

```bash
kubectl delete daemonset log-agent
kind delete cluster
```

### Verification

- DaemonSet creates one Pod per worker node.
- Control-plane node is skipped without toleration.
- With toleration, DaemonSet runs on all nodes.

### Expected Output Snapshot

```text
$ kubectl get pods -o wide -l app=log-agent
NAME            READY   STATUS    NODE          
log-agent-abc   1/1     Running   kind-worker   
log-agent-xyz   1/1     Running   kind-worker2  

$ kubectl get daemonset log-agent
NAME       DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
log-agent  2         2         2       2            2           <none>          30s
```

### Related

- Lesson file: [lesson-09-daemonsets.md](../docs/03-workloads/lesson-09-daemonsets.md)

---

<a id="lab-10"></a>

## Lab 10 - Jobs and CronJobs

### Objective

Create a Job that intentionally fails and observe the retry mechanism. Test parallel Jobs and create a CronJob.

### Prerequisites

- Lesson 10 - Jobs and CronJobs.
- A running kind cluster.
- kubectl installed and configured.

#### Quick Cluster Setup (kind)

```bash
kind create cluster --name learning
kubectl cluster-info --context kind-learning
```

### Steps

#### 1. Create a Failing Job

```bash
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: failing-batch
spec:
  backoffLimit: 4
  activeDeadlineSeconds: 60
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: worker
        image: busybox:latest
        command: ["sh", "-c", "echo 'Doing work...' && exit 1"]
EOF
```

#### 2. Observe the Retry Mechanism

```bash
kubectl get pods -l job-name=failing-batch --watch
```

Expected: New Pods are created. Old ones stay in `Error` state.

#### 3. Investigate the Job Status

```bash
kubectl get jobs failing-batch
kubectl describe job failing-batch
```

Look at the `Pods Statuses` section for `Failed` counts.

#### 4. Test a Successful Job

```bash
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: success-batch
spec:
  backoffLimit: 3
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: worker
        image: busybox:latest
        command: ["sh", "-c", "echo 'Task completed successfully!' && exit 0"]
EOF
```

```bash
kubectl get jobs success-batch
```

Expected: `COMPLETIONS 1/1`.

#### 5. Test Parallel Jobs

```bash
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: parallel-batch
spec:
  completions: 5
  parallelism: 2
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: worker
        image: busybox:latest
        command: ["sh", "-c", "sleep 5 && echo 'Done' && exit 0"]
EOF
```

```bash
kubectl get pods -l job-name=parallel-batch --watch
```

Expected: Exactly 2 Pods running at any given time until 5 have completed.

#### 6. Create a CronJob

```bash
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hourly-backup
spec:
  schedule: "0 * * * *"
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: backup
            image: busybox:latest
            command: ["sh", "-c", "echo 'Backup completed at \$(date)' && exit 0"]
EOF
```

```bash
kubectl get cronjobs
```

#### 7. Manually Trigger a CronJob

```bash
kubectl create job manual-run --from=cronjob/hourly-backup
kubectl get jobs
```

#### 8. Cleanup

```bash
kubectl delete job failing-batch success-batch parallel-batch manual-run
kubectl delete cronjob hourly-backup
kind delete cluster --name learning
```

### Verification

- Failing Job retries up to `backoffLimit`.
- Successful Job shows `COMPLETIONS 1/1`.
- Parallel Job runs exactly `parallelism` Pods at a time.
- CronJob creates Jobs on schedule.

### Expected Output Snapshot

```text
$ kubectl get jobs
NAME             COMPLETIONS   DURATION   AGE
failing-batch    0/1           60s        60s
success-batch    1/1           5s         30s
parallel-batch   5/5           25s        30s
```

### Related

- Lesson file: [lesson-10-jobs-and-cronjobs.md](../docs/03-workloads/lesson-10-jobs-and-cronjobs.md)

---

<a id="lab-11"></a>

## Lab 11 - Init Containers

### Prerequisite

- Completion of [Lesson 11 - Init Containers](../docs/03-workloads/lesson-11-init-containers.md).
- A running kind cluster.
- kubectl installed and configured.

### Objective

Create a Pod with an Init Container that generates an `index.html` file. The main Nginx container will then serve that file. Then, break the Init Container and observe the `Init:CrashLoopBackOff` state.

### Estimated Time

15 minutes.

---

### Step 1: Create the Init Pod

Create `init-pod.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-demo
spec:
  volumes:
  - name: shared-data
    emptyDir: {}
  initContainers:
  - name: setup-script
    image: busybox:latest
    command: ["sh", "-c", "echo '<h1>Config loaded by Init Container!</h1>' > /work-dir/index.html"]
    volumeMounts:
    - name: shared-data
      mountPath: /work-dir
  containers:
  - name: web-server
    image: nginx:alpine
    volumeMounts:
    - name: shared-data
      mountPath: /usr/share/nginx/html
```

Apply it:

```bash
kubectl apply -f init-pod.yaml
```

### Step 2: Verify the Setup Worked

Wait for the Pod to be Running, then test it:

```bash
kubectl exec init-demo -c web-server -- cat /usr/share/nginx/html/index.html
```

Expected output: `Config loaded by Init Container!`

### Step 3: Break Things on Purpose

Create `broken-init.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: broken-init
spec:
  volumes:
  - name: shared-data
    emptyDir: {}
  initContainers:
  - name: broken-setup
    image: busybox:latest
    command: ["sh", "-c", "echo 'Trying to download config...' && exit 1"]
    volumeMounts:
    - name: shared-data
      mountPath: /work-dir
  containers:
  - name: web-server
    image: nginx:alpine
    volumeMounts:
    - name: shared-data
      mountPath: /usr/share/nginx/html
```

Apply it:

```bash
kubectl apply -f broken-init.yaml
```

### Step 4: Investigate the Failure

Wait about 15 seconds, then run:

```bash
kubectl get pod broken-init
```

Expected output: The STATUS should be `Init:CrashLoopBackOff`.

Run `kubectl describe pod broken-init`. Look at the `Containers:` section. Notice that the `web-server` container isn't even listed yet!

**Your Task:**

- What is the exact STATUS of the `broken-init` pod?
- In the `kubectl describe` output, does the main `web-server` container exist yet?
- Based on the theory of the Pod lifecycle, why hasn't Nginx started?

(Answer: 1. `Init:CrashLoopBackOff`. 2. No, it does not exist. 3. The kubelet enforces a strict rule: the main containers cannot be created until ALL Init Containers have successfully exited with code 0. Because the Init Container exited with 1, the Pod restarted and is trying the Init Container again. Nginx is held hostage).

### Step 5: Cleanup

```bash
kubectl delete pod init-demo broken-init
```

---

### What You Learned

- Init Containers are specialized containers that run to completion before the main application container starts.
- They run sequentially. If Init Container 1 fails, the Pod restarts and tries again.
- The main application container is never created until all Init Containers exit with code 0.
- They share the same Pod namespaces (Network, IPC) and can share files using an `emptyDir` volume.

### Next Steps

Proceed to [Lesson 20 - ConfigMaps and Secrets](../docs/06-configuration/lesson-20-configmaps-and-secrets.md) to learn about injecting configuration into Pods.

---

[Back to Labs](../labs/README.md)

---

<a id="lab-12"></a>

## Lab 12 - Advanced Stateful Workloads (Databases and Message Queues)

### Objective

Deploy a stateful database workload in Kubernetes using a StatefulSet provided by the Bitnami PostgreSQL Helm chart. Verify stable network identity, per-replica persistence, and ordered scaling behavior. Then deploy a small message queue and demonstrate the same StatefulSet conventions for durability and ordering.

### Prerequisites

- Lesson 12 - Advanced Stateful Workloads (Databases and Message Queues).
- Completion of Lessons 1 through 37.
- A running kind cluster.
- `kubectl` and `helm` installed and configured.
- Familiarity with StatefulSets from Lesson 8 and Helm from Module 09.

### Pre-Lab Checklist

Verify the environment is ready before starting.

```bash
kind get clusters
kubectl cluster-info --context kind-learning
helm version --short
kubectl get nodes --context kind-learning
```

Expected output:

```text
learning
kubectl cluster-info is running at https://127.0.0.1:xxxxx
v3.16.0
NAME                     STATUS   ROLES
learning-control-plane   Ready    control-plane
learning-worker          Ready    <none>
```

#### Quick Cluster Setup (kind)

```bash
kind create cluster --name learning
kubectl cluster-info --context kind-learning
```

### Steps

#### 1. Add the Bitnami Repository

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm search repo bitnami/postgresql
```

Expected output lists the `bitnami/postgresql` chart and its latest version.

#### 2. Install the PostgreSQL StatefulSet

```bash
helm install lab38-db bitnami/postgresql \
  --namespace default \
  --set auth.postgresPassword=SuperSecret123 \
  --set primary.replicaCount=3 \
  --set primary.persistence.size=1Gi \
  --set primary.persistence.storageClass=standard
```

The chart renders a StatefulSet, a Headless Service for stable DNS, a Secret holding the password, and a PVC per replica via `volumeClaimTemplates`.

#### 3. Verify the StatefulSet Topology

```bash
kubectl get statefulset
kubectl get pods -l app.kubernetes.io/name=postgresql
kubectl get pvc
kubectl get svc
```

Expected output shows the StatefulSet with 3 Pods, 3 bound PVCs, and headless and client Services.

```bash
kubectl get statefulset lab38-db-postgresql
```

Expected output:

```text
NAME                    READY   AGE
lab38-db-postgresql   3/3     3m
```

```bash
kubectl get pvc
```

Expected output:

```text
NAME                              STATUS   VOLUME
data-lab38-db-postgresql-0       Bound    pvc-abc
data-lab38-db-postgresql-1       Bound    pvc-def
data-lab38-db-postgresql-2       Bound    pvc-ghi
```

#### 4. Verify Stable Network Identity

Each replica Pod gets a stable DNS name in the form `pod-N.service-name.namespace.svc`. Resolve the Headless Service and then an individual Pod.

```bash
kubectl get endpoints lab38-db-postgresql-headless
```

Expected output shows one endpoint IP per replica Pod.

Resolve an individual Pod name from inside the cluster:

```bash
kubectl run dns-test --rm --tty -i --restart='Never' --namespace=default \
  --image=busybox:1.36 \
  --command -- sh -c "nslookup lab38-db-postgresql-0.lab38-db-postgresql-headless"
```

Expected output resolves `lab38-db-postgresql-0` to the first replica IP. This stable network identity is what cluster members use to talk to a specific replica, and it does not change when a Pod restarts.

#### 5. Insert Data and Confirm Persistence

Retrieve the generated password:

```bash
POSTGRES_PASSWORD=$(kubectl get secret lab38-db-postgresql --namespace default -o jsonpath="{.data.postgres-password}" | base64 --decode)
```

Run a temporary client Pod and connect through the Headless Service:

```bash
kubectl run pg-client --namespace default --rm --tty -i --restart='Never' \
  --image=docker.io/bitnami/postgresql:16 \
  --env="PGPASSWORD=$POSTGRES_PASSWORD" \
  --command -- psql -h lab38-db-postgresql-0.lab38-db-postgresql-headless -U postgres -d postgres -p 5432
```

Inside the psql prompt:

```sql
CREATE TABLE important_data (id int, message text);
INSERT INTO important_data VALUES (1, 'This must not be lost');
\q
```

Simulate a Pod crash:

```bash
kubectl delete pod lab38-db-postgresql-0
kubectl get pods -l app.kubernetes.io/name=postgresql
kubectl get pvc
```

The StatefulSet controller recreates the Pod and reattaches the same PVC. Verify the data survived:

```bash
kubectl run pg-client --namespace default --rm --tty -i --restart='Never' \
  --image=docker.io/bitnami/postgresql:16 \
  --env="PGPASSWORD=$POSTGRES_PASSWORD" \
  --command -- psql -h lab38-db-postgresql-0.lab38-db-postgresql-headless -U postgres -d postgres -p 5432
```

Inside psql:

```sql
SELECT * FROM important_data;
\q
```

Expected output shows your row; the persistent disk survived the restart because the StatefulSet reused the same PVC.

#### 6. Scale the StatefulSet and Observe Ordering

Scale down and observe reverse-ordering deletion:

```bash
kubectl scale statefulset lab38-db-postgresql --replicas=1
kubectl get pods -l app.kubernetes.io/name=postgresql -w
```

Expected: Pods terminate from highest ordinal (`-2`) back to lowest, one at a time.

Scale back up and observe ordered startup:

```bash
kubectl scale statefulset lab38-db-postgresql --replicas=3
kubectl get pods -l app.kubernetes.io/name=postgresql -w
```

Expected: Pods start from the lowest ordinal (`-0`) up, only starting the next after the previous is `Ready`. This ordered start and reverse teardown is the key difference from a Deployment.

#### 7. Deploy a Message Queue Workload

Deploy RabbitMQ with the Bitnami Helm chart to demonstrate the same durable-stateful pattern for a message queue.

```bash
helm install lab38-mq bitnami/rabbitmq \
  --namespace default \
  --set auth.username=user \
  --set auth.password=UserPass123 \
  --set persistence.enabled=true \
  --set persistence.storageClass=standard
```

Verify the topology:

```bash
kubectl get statefulset lab38-mq-rabbitmq
kubectl get pods -l app.kubernetes.io/name=rabbitmq
kubectl get pvc -l app.kubernetes.io/name=rabbitmq
```

Expected output shows the RabbitMQ StatefulSet, a running Pod, and a bound PVC.

#### 8. Observe Quorum and Sequencing

Check the RabbitMQ endpoint reachability and the cluster status to confirm the queue is targetable by stable DNS:

```bash
kubectl get endpoints lab38-mq-rabbitmq
kubectl get svc lab38-mq-rabbitmq -o yaml | grep -A3 -E 'headless|clusterIP'
```

For a clustered queue, replicas negotiate quorum over the Headless Service. Delete the RabbitMQ Pod and confirm the queue data is retained:

```bash
kubectl delete pod lab38-mq-rabbitmq-0
kubectl get pods -l app.kubernetes.io/name=rabbitmq
```

Expected: the Pod is recreated with the same PVC, matching the database behavior. This demonstrates that durable message queues follow the same StatefulSet + PVC + Headless Service pattern.

### Cleanup

Remove the Helm releases. Helm does not delete PVCs by default, so remove each PVC explicitly.

```bash
helm uninstall lab38-db --namespace default
helm uninstall lab38-mq --namespace default
kubectl delete pvc -l app.kubernetes.io/name=postgresql
kubectl delete pvc -l app.kubernetes.io/name=rabbitmq
kubectl delete pod dns-test --ignore-not-found
```

Remove the cluster:

```bash
kind delete cluster --name learning
```

### Verification

- StatefulSet creates Pods sequentially (0, then 1, then 2).
- Each replica Pod has a stable DNS name and a unique persistent PVC.
- Pod deletion and re-creation reattach the same PVC, so data survives.
- Scaling up starts the lowest ordinal first; scaling down deletes the highest first.
- The message-queue workload uses the same ordered, durable pattern.

### Expected Output Snapshot

```text
$ kubectl get pods -l app.kubernetes.io/name=postgresql
NAME                    READY   STATUS    RESTARTS
lab38-db-postgresql-0   1/1     Running   1
lab38-db-postgresql-1   1/1     Running   0
lab38-db-postgresql-2   1/1     Running   0

$ kubectl get pvc -l app.kubernetes.io/name=postgresql
NAME                    STATUS   VOLUME
data-lab38-db-postgresql-0   Bound    pvc-abc
data-lab38-db-postgresql-1   Bound    pvc-def
data-lab38-db-postgresql-2   Bound    pvc-ghi
```

### Related

- Lesson file: [lesson-12-advanced-stateful-workloads.md](../docs/03-workloads/lesson-12-advanced-stateful-workloads.md)
- Lesson file: [lesson-08-statefulsets.md](../docs/03-workloads/lesson-08-statefulsets.md)
- Lab 13: [lab-08-statefulsets.md](#lab-08)

---

<a id="lab-13"></a>

## Lab 13 - Networking Fundamentals and the CNI

### Prerequisite

- Completion of [Lesson 13 - Networking Fundamentals and the CNI](../docs/04-networking/lesson-13-networking-fundamentals-and-the-cni.md).
- A running kind cluster.
- kubectl installed and configured.

### Objective

Inspect the actual iptables rules on a kind node, find the load-balancing rules, and then watch them change when a Pod crashes.

### Estimated Time

15 minutes.

---

### Step 1: Create a Deployment and Service

```bash
kubectl create deployment net-app --image=nginx:alpine --replicas=2
kubectl expose deployment net-app --port=80 --target-port=80
```

### Step 2: Enter the Node

Because kind runs nodes as Docker containers, we can exec directly into the Kind node to look at the real Linux iptables rules.

```bash
docker exec -it kind-control-plane bash
```

(You are now inside the Linux node itself, not a Pod).

### Step 3: View the iptables Rules

Let's look at the NAT (Network Address Translation) table and filter for our service.

(Note: kind images might not have iptables installed by default. If so, run `apt-get update && apt-get install -y iptables` first).

```bash
iptables-save | grep net-app
```

Expected output: You will see several chains like `KUBE-SVC-XXXX` and `KUBE-SEP-YYYY`.

Look closely at the output. You will see a rule that looks like this:

```
-A KUBE-SVC-... -m statistic --mode random --probability 0.50000000000 -j KUBE-SEP-...
```

This is kube-proxy load balancing! It says, "With 50% probability, send the packet to SEP (Service Endpoint) 1. Otherwise, send it to SEP 2."

### Step 4: Break Things on Purpose

Keep your shell open in the Kind node. Open a second terminal on your Ubuntu host.

Scale the deployment to 0 replicas:

```bash
kubectl scale deployment net-app --replicas=0
```

Back in the Kind node terminal, run the iptables command again:

```bash
iptables-save | grep net-app
```

**Your Task:**

- After scaling to 0, what happened to the `KUBE-SEP` (Service Endpoint) rules in the iptables output?
- What new rule replaced the old ones? (Look for a rule that says `has no endpoints`).
- Based on how kube-proxy works, what happens to the packets now if a client tries to send traffic to the Service IP?

(Answer: 1. The KUBE-SEP rules were deleted. 2. A rule was added: `-A KUBE-SERVICES -d 10.96.x.x/32 ... -j REJECT --reject-with icmp-port-unreachable`. 3. The kernel matches the REJECT rule and instantly sends back an ICMP port-unreachable message. The client gets a "Connection Refused" error instantly, rather than a timeout).

### Step 5: Cleanup

Type `exit` to leave the Kind node, then clean up the resources:

```bash
exit
kubectl delete deployment net-app
kubectl delete svc net-app
```

---

### What You Learned

- The CNI is the postal service. It creates virtual interfaces (eth0) for Pods and handles IPAM and routing between nodes.
- kube-proxy is the mail sorter. It runs on every node and writes iptables rules.
- When a Service is created, kube-proxy writes `KUBE-SVC` and `KUBE-SEP` chains to perform DNAT.
- If a Service has no Endpoints, kube-proxy writes a REJECT rule so traffic fails instantly.

### Next Steps

Proceed to [Lesson 14 - Services and Cluster Networking](../docs/04-networking/lesson-14-services-and-cluster-networking.md) to learn about Services in depth.

---

[Back to Labs](../labs/README.md)

---

<a id="lab-14"></a>

## Lab 14 - Services and Cluster Networking

### Objective

Deploy an application, expose it via a ClusterIP Service, verify routing, test self-healing, and debug a broken Service with no Endpoints.

### Prerequisites

- Lesson 17 - Services and Cluster Networking.
- A running kind cluster.
- kubectl installed and configured.

#### Quick Cluster Setup (kind)

```bash
kind create cluster --name learning
kubectl cluster-info --context kind-learning
```

### Steps

#### 1. Create the Deployment and Service

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deploy
spec:
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
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
EOF
```

#### 2. Verify the Service and Endpoints

```bash
kubectl get svc web-svc
kubectl get endpoints web-svc
```

Expected: The Service has a ClusterIP. The Endpoints output shows 3 IP addresses.

#### 3. Test Internal Connectivity

```bash
kubectl run test-client --rm -it --image=alpine -- wget -qO- http://web-svc
```

Expected: You see the Nginx welcome page HTML.

#### 4. Test Self-Healing

```bash
# In one terminal, watch the Pods
kubectl get pods -l app=web --watch

# In another terminal, delete a Pod
kubectl delete pod <POD_NAME>
```

The Service instantly routes traffic to the remaining healthy Pods.

#### 5. Test Scaling

```bash
kubectl scale deployment web-deploy --replicas=5
kubectl get endpoints web-svc
```

The Endpoints list now shows 5 IPs.

#### 6. Debug a Broken Service

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: broken-svc
spec:
  type: ClusterIP
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
EOF

kubectl get endpoints broken-svc
```

The Endpoints column shows `<none>` because the selector doesn't match any Pods.

#### 7. Cleanup

```bash
kubectl delete svc web-svc
kubectl delete svc broken-svc
kubectl delete deployment web-deploy
```

### Verification

- Service has a ClusterIP and Endpoints with Pod IPs.
- Traffic to the Service DNS name reaches healthy Pods.
- Deleting a Pod does not break connectivity.
- A Service with a mismatched selector has empty Endpoints.

### Expected Output Snapshot

```text
NAME       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
web-svc    ClusterIP   10.96.0.10      <none>        80/TCP    30s

NAME         ENDPOINTS                                    AGE
web-svc      10.244.0.5:80,10.244.0.6:80,10.244.0.7:80   30s
```

### Related

- Lesson file: [lesson-14-services-and-cluster-networking.md](../docs/04-networking/lesson-14-services-and-cluster-networking.md)

---

<a id="lab-15"></a>

## Lab 15 - Ingress and Ingress Controllers

### Objective

Install an NGINX Ingress Controller in kind, deploy two applications, and route traffic to them based on URL paths and hostnames.

### Prerequisites

- Lesson 15 - Ingress and Ingress Controllers.
- A running kind cluster with port mappings for Ingress.
- kubectl installed and configured.

#### Quick Cluster Setup (kind with Ingress)

```bash
kind delete cluster

cat <<EOF > kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
EOF

kind create cluster --config kind-config.yaml
```

### Steps

#### 1. Install the NGINX Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

Wait for it to be ready:

```bash
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

#### 2. Deploy Two Applications

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app1
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app1
  template:
    metadata:
      labels:
        app: app1
    spec:
      containers:
      - name: app1
        image: hashicorp/http-echo
        args: ["-text=Hello from App 1"]
---
apiVersion: v1
kind: Service
metadata:
  name: app1-svc
spec:
  type: ClusterIP
  selector:
    app: app1
  ports:
  - port: 5678
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app2
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app2
  template:
    metadata:
      labels:
        app: app2
    spec:
      containers:
      - name: app2
        image: hashicorp/http-echo
        args: ["-text=Hello from App 2"]
---
apiVersion: v1
kind: Service
metadata:
  name: app2-svc
spec:
  type: ClusterIP
  selector:
    app: app2
  ports:
  - port: 5678
EOF
```

#### 3. Create Path-Based Ingress

```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /app1
        pathType: Prefix
        backend:
          service:
            name: app1-svc
            port:
              number: 5678
      - path: /app2
        pathType: Prefix
        backend:
          service:
            name: app2-svc
            port:
              number: 5678
EOF
```

#### 4. Test Path-Based Routing

```bash
curl http://localhost/app1
curl http://localhost/app2
```

Expected: "Hello from App 1" and "Hello from App 2".

#### 5. Test Host-Based Routing

```bash
kubectl delete ingress my-ingress

cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: app1.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app1-svc
            port:
              number: 5678
  - host: app2.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app2-svc
            port:
              number: 5678
EOF
```

```bash
curl -H "Host: app1.local" http://localhost
curl -H "Host: app2.local" http://localhost
```

#### 6. Cleanup

```bash
kubectl delete ingress my-ingress
kubectl delete svc app1-svc app2-svc
kubectl delete deployment app1 app2
kind delete cluster
```

### Verification

- Ingress Controller is running in `ingress-nginx` namespace.
- Path-based routing works: `/app1` -> App 1, `/app2` -> App 2.
- Host-based routing works: `Host: app1.local` -> App 1, `Host: app2.local` -> App 2.

### Expected Output Snapshot

```text
$ curl http://localhost/app1
Hello from App 1

$ curl http://localhost/app2
Hello from App 2

$ curl -H "Host: app1.local" http://localhost
Hello from App 1
```

### Related

- Lesson file: [lesson-15-ingress-and-ingress-controllers.md](../docs/04-networking/lesson-15-ingress-and-ingress-controllers.md)

---

<a id="lab-16"></a>

## Lab 16 - Network Policies

### Prerequisite

- Completion of [Lesson 16 - Network Policies](../docs/04-networking/lesson-16-network-policies.md).
- A running kind cluster (kindnetd supports Network Policies natively).
- kubectl installed and configured.

### Objective

Create two namespaces, prove they can talk, and then lock down the backend namespace with a Default Deny policy. Verify that traffic is blocked and understand the Timeout behavior.

### Estimated Time

15 minutes.

---

### Step 1: Create Namespaces

```bash
kubectl create namespace frontend
kubectl create namespace backend
```

Expected output:

```
namespace/frontend created
namespace/backend created
```

### Step 2: Deploy Pods

```bash
kubectl run web --image=nginx:alpine -n backend -l app=api
kubectl run client --image=alpine -n frontend -l app=web -- sleep 3600
```

Expected output:

```
pod/web created
pod/client created
```

### Step 3: Wait for Pods to Run

```bash
kubectl get pods -n frontend -n backend --wait
```

Wait until both pods show `Running` status.

### Step 4: Verify Default Connectivity

Get the IP of the web pod:

```bash
kubectl get pod web -n backend -o wide
```

Note the IP address (e.g., `10.244.1.5`).

Exec into the client pod:

```bash
kubectl exec -it client -n frontend -- sh
```

Inside the pod, run:

```sh
wget -qO- http://<web-pod-ip>
```

Replace `<web-pod-ip>` with the actual IP.

Expected output: The standard Nginx "Welcome to nginx!" HTML output.

Type `exit` to leave the pod.

### Step 5: Apply a Default Deny NetworkPolicy

Create `deny-all.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: backend
spec:
  podSelector: {}
  policyTypes:
  - Ingress
```

Apply it:

```bash
kubectl apply -f deny-all.yaml
```

Expected output:

```
networkpolicy.networking.k8s.io/default-deny-ingress created
```

### Step 6: Verify the Block

Exec back into the client pod:

```bash
kubectl exec -it client -n frontend -- sh
```

Inside the pod, run:

```sh
wget -qO- http://<web-pod-ip>
```

Expected behavior: The command hangs. It does NOT fail instantly. Press Ctrl+C after 5-10 seconds.

**Analysis:**

1. Did it fail instantly (Connection Refused) or did it hang (Timeout)?
2. Why did it behave this way?

(Answer: It hung. Timeout. The CNI inserted iptables rules to DROP the packet. It does not send a rejection response back to the client, so the client waits for an acknowledgement until it times out).

Type `exit` to leave the pod.

### Step 7: Verify NetworkPolicy Exists

```bash
kubectl get networkpolicy -n backend
kubectl describe networkpolicy default-deny-ingress -n backend
```

Expected output:

```
NAME                     POD-SELECTOR   AGE
default-deny-ingress     <none>         2m

Name:         default-deny-ingress
Namespace:    backend
Created on:   2026-08-06 10:00:00 +0000 UTC
Labels:       <none>
Annotations:  <none>
Spec:
  PodSelector:     <none> (Selecting all pods in this namespace)
  Allowing ingress traffic:
    <none> (Selected pods are denied for all ingress traffic)
  Policy Types: Ingress
```

### Step 8: Cleanup

```bash
kubectl delete networkpolicy default-deny-ingress -n backend
kubectl delete namespace frontend backend
```

Expected output:

```
networkpolicy.networking.k8s.io "default-deny-ingress" deleted
namespace "frontend" deleted
namespace "backend" deleted
```

---

### What You Learned

- Kubernetes uses a flat network by default — any Pod can talk to any Pod.
- NetworkPolicies are firewalls that control ingress and egress traffic.
- A Default Deny policy blocks all traffic unless explicitly allowed.
- When a firewall drops a packet, the client experiences a Timeout, not a Connection Refused.
- The CNI plugin (not Kubernetes itself) enforces Network Policies.

### Next Steps

Proceed to [Lesson 19 - Persistent Storage (PVs, PVCs, and StorageClasses)](../docs/05-storage/lesson-19-persistent-storage-pv-pvc-sc.md) to learn about Volumes, Persistent Volumes, and Storage Classes.

---

[Back to Labs](../labs/README.md)

---

<a id="lab-17"></a>

## Lab 17 - End-to-End Traffic Flow and the 502 Bad Gateway

### Objective

In this lab you will deploy an NGINX application behind a ClusterIP Service behind an NGINX Ingress Controller on kind, verify the full end-to-end Layer 4 plus Layer 7 traffic flow, then intentionally break the path between the Service and the Pod to produce a `502 Bad Gateway`. You will then run the full 502 debugging workflow: inspecting the Ingress, checking the Service Endpoints, comparing `targetPort` against `containerPort`, using `curl -v`, and confirming DNS resolution. Finally you will learn to tell a 502 apart from 503, 404, and 504.

### Prerequisites

- A working kind cluster with Ingress support (built in Step 1)
- kubectl installed and configured
- Completion of Lessons 1 through 16
- `curl` available on the host for testing the cluster

### Pre-Lab Checklist

- [ ] kind CLI installed and on your PATH
- [ ] kubectl installed and pointed at the cluster or its kubeconfig
- [ ] Lessons 15 and 16 reviewed, especially the Ingress and Service concepts
- [ ] Ports 80 and 443 are free on the host machine
- [ ] Internet access to download the NGINX Ingress Controller manifest

---

### Step 1: Create a Kind Cluster with Ingress Support

Remove any previous cluster so you start from a clean state:

```bash
kind delete cluster
```

Expected output:

```text
Deleting cluster "kind" ...
```

Create the cluster configuration with the `ingress-ready: true` label on the control-plane node and `extraPortMappings` forwarding host ports 80 and 443 into the node:

```bash
cat <<EOF > kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
```

Create the cluster from that configuration:

```bash
kind create cluster --config kind-config.yaml
kubectl get nodes
```

Expected output:

```text
NAME                 STATUS   ROLES           AGE   VERSION
kind-control-plane   Ready    control-plane   2m    v1.30.0
```

The `ingress-ready=true` label is what the NGINX Ingress Controller manifest for kind uses in its node selector. Without it, the Ingress Controller Pods will never be scheduled.

### Step 2: Install the NGINX Ingress Controller

Install the kind-specific NGINX Ingress Controller manifest. This single manifest includes the namespace, the controller Deployment, the LoadBalancer Service, and the RBAC:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

Expected output begins with:

```text
namespace/ingress-nginx created
serviceaccount/ingress-nginx created
serviceaccount/ingress-nginx-admission created
...
deployment.apps/ingress-nginx-controller created
```

Wait for the controller Pod to become ready:

```bash
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

Expected output:

```text
pod/ingress-nginx-controller-7b9f8b76b4-abc12 condition met
```

Confirm the controller and its default backend are healthy:

```bash
kubectl get pods -n ingress-nginx
```

Expected output:

```text
NAME                                       READY   STATUS      RESTARTS   AGE
ingress-nginx-admission-create-pb9dq       0/1     Completed   0          45s
ingress-nginx-admission-patch-6srm4        0/1     Completed   0          45s
ingress-nginx-controller-7b9f8b76b4-abc12  1/1     Running     0          2m
```

### Step 3: Sample Application YAML (Deployment, ClusterIP Service, Ingress)

Create `full-stack.yaml` with three objects: an NGINX Deployment (`containerPort: 80`), a ClusterIP Service that forwards port 80 to target port 80, and an Ingress that routes path `/` to the Service:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: nginx
        image: nginx:stable-alpine
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-svc
spec:
  type: ClusterIP
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: frontend-ingress
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-svc
            port:
              number: 80
```

Apply it and wait for the rollout to finish:

```bash
kubectl apply -f full-stack.yaml
kubectl rollout status deployment/frontend-app
```

Expected output:

```text
deployment.apps/frontend-app created
service/frontend-svc created
ingress.networking.k8s.io/frontend-ingress created
deployment.apps/frontend-app successfully rolled out
```

### Step 4: Verify the End-to-End Traffic Flow

Test the full flow from the host, through the Ingress, into the Service, and to the Pod:

```bash
curl -v http://localhost/
```

Expected output (trimmed):

```text
*   Trying 127.0.0.1:80...
* Connected to localhost (127.0.0.1) port 80
> GET / HTTP/1.1
> Host: localhost
> User-Agent: ...
< HTTP/1.1 200 OK
< Server: nginx/1.23.x
```

Confirm the traffic path object-by-object. Check that the Ingress points to the right Service and port:

```bash
kubectl describe ingress frontend-ingress
```

Expected output:

```text
Name:             frontend-ingress
Namespace:        default
Address:          localhost
Rules:
  Host        Path  Backends
  ----        ----  --------
  *
  /           frontend-svc:80 (10.244.0.5:80)
```

The `(10.244.0.5:80)` in the backend is the Pod IP the controller resolves from the Service. Confirm the Service is aware of the Pod via Endpoints:

```bash
kubectl get endpoints frontend-svc
```

Expected output:

```text
NAME           ENDPOINTS         AGE
frontend-svc   10.244.0.5:80     3m
```

Confirm the Service resolves via DNS from inside the cluster. Exec into the running Pod and run `nslookup`:

```bash
kubectl exec "$(kubectl get pod -l app=frontend -o jsonpath='{.items[0].metadata.name}')" -- nslookup frontend-svc.default.svc.cluster.local
```

Expected output:

```text
Server:    10.96.0.10
Address:   10.96.0.10#53

Name:      frontend-svc.default.svc.cluster.local
Address:   10.96.0.5
```

The full chain is now verified: Host -> NGINX Ingress (Layer 7) -> ClusterIP Service -> kube-proxy DNAT -> Pod.

### Step 5: Break the Path and Produce a 502 Bad Gateway

Simulate a developer who changed the Service `targetPort` to a port no container is listening on, for example when an application was supposed to move to a new port. Create `broken-svc.yaml` pointing `targetPort` to 8080 while NGINX still listens on 80:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-svc
spec:
  type: ClusterIP
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 8080
```

Apply the broken Service:

```bash
kubectl apply -f broken-svc.yaml
```

Wait roughly 10 seconds for NGINX to reload its upstream configuration, then reproduce the error with verbose output:

```bash
curl -v http://localhost/
```

Expected output (trimmed):

```text
< HTTP/1.1 502 Bad Gateway
< Server: nginx/1.23.x
...
<html>
<head><title>502 Bad Gateway</title></head>
```

You have now reproduced a real production-style `502 Bad Gateway`.

### Step 6: The 502 Debugging Workflow

Work through the flow component by component until you find the broken hop.

#### 6.1 Check the Ingress Backend

```bash
kubectl describe ingress frontend-ingress
```

The backend still correctly points to `frontend-svc:80`. The Ingress and its rule are not the problem.

#### 6.2 Check the Service Endpoints

```bash
kubectl get endpoints frontend-svc
```

Expected output:

```text
NAME           ENDPOINTS         AGE
frontend-svc   10.244.0.5:8080   5m
```

The Endpoints object mirrors the Service `targetPort`, so the registered port flipped from `:80` to `:8080`. The Pod IP is still there because the selector still matches, which rules out a label mismatch. If the Endpoints list were empty, that would mean a different problem (a 503).

#### 6.3 Compare targetPort vs containerPort

Fetch the Service targetPort and the Pod containerPort side by side:

```bash
kubectl get svc frontend-svc -o jsonpath='Service targetPort = {.spec.ports[0].targetPort}{"\n"}'
kubectl get pod -l app=frontend -o jsonpath='Pod containerPort  = {.items[0].spec.containers[0].ports[0].containerPort}{"\n"}'
```

Expected output:

```text
Service targetPort = 8080
Pod containerPort  = 80
```

Here is the bug. NGINX inside the container listens on port 80, but the Service forwards traffic to port 8080, where nothing is listening. The Pod kernel receives the packet on 8080 and refuses the connection, which NGINX reports upstream as a bad gateway.

#### 6.4 Confirm the Upstream Hop Fails from the Pod Network

Verify that port 80 works but port 8080 does not, from a separate shell inside a helper Pod in the same cluster:

```bash
POD_IP=$(kubectl get pod -l app=frontend -o jsonpath='{.items[0].status.podIP}')
kubectl run curl-check --image=curlimages/curl --rm -it --restart=Never -- sh -c "curl -s http://$POD_IP:80 | head -n 1; echo '---'; curl -s http://$POD_IP:8080 | head -n 1"
```

Example output:

```text
Welcome to nginx!
---
```

The first curl succeeds because NGINX listens on 80. The second produces no output because the connection was refused on 8080.

#### 6.5 Confirm DNS Still Resolves

DNS is not the problem either:

```bash
kubectl exec "$(kubectl get pod -l app=frontend -o jsonpath='{.items[0].metadata.name}')" -- nslookup frontend-svc.default.svc.cluster.local
```

The result is the same working resolution from Step 4.

#### 6.6 Conclusion

The flow broke at the Ingress/Pod hop. The Ingress (Layer 7) and the Service routing (Layer 4 via kube-proxy) are intact. The `targetPort` does not match the container listening port, so the upstream connection is refused and NGINX returns `502 Bad Gateway`.

Inspect the controller logs for confirmation if you want the final piece of evidence:

```bash
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller | grep -i "502\|connect() failed" | tail -n 5
```

### Step 7: Fix the Path and Verify

Restore the correct `targetPort` in the Service:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-svc
spec:
  type: ClusterIP
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
```

Apply the fix and wait for NGINX to reload:

```bash
kubectl apply -f full-stack.yaml
sleep 10
curl -v http://localhost/
```

Expected output:

```text
< HTTP/1.1 200 OK
< Server: nginx/1.23.x
```

With the targetPort matching `containerPort`, the full flow works again and the 502 is gone.

### Step 8: Map 502, 503, 404, and 504

These four error classes look similar but indicate a different break.

#### 503 Service Unavailable

A 503 means the Ingress has no upstream Pods at all (empty Endpoints), often a selector mismatch or a crashing Pod. Break it by selecting labels:

```bash
cat <<EOF > empty-svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-svc
spec:
  type: ClusterIP
  selector:
    app: does-not-exist
  ports:
  - port: 80
    targetPort: 80
EOF
kubectl apply -f empty-svc.yaml
kubectl get endpoints frontend-svc
```

Expected output:

```text
NAME           ENDPOINTS   AGE
frontend-svc   <none>      10s
```

Now the request returns 503:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/
```

Expected output:

```text
503
```

Restore the correct selector with the original manifest:

```bash
kubectl apply -f full-stack.yaml
```

#### 404 Not Found

A 404 means the Ingress rule set matched no rule for the requested host or path. The NGINX Ingress Controller returns 404 when the request reaches the controller but there is no matching Ingress rule, for example an unknown Host header:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: unknown.example.com" http://localhost/
```

Expected output:

```text
404
```

#### 504 Gateway Timeout

A 504 means the connection succeeded but the upstream Pod did not answer within the proxy timeout (NGINX default is 60 seconds). It happens when the container itself is hung or saturated. A 502 is a refused connection.

#### Comparison Table

| HTTP Status | Meaning | Kubernetes Cause | Diagnosis |
|-------------|---------|------------------|-----------|
| 404 Not Found | No rule matches the request or host | Path or hostname typo in the Ingress rule | `kubectl describe ingress` |
| 502 Bad Gateway | Upstream refused the connection or returned an invalid response | `targetPort` mismatch or app bound to localhost | Compare `targetPort` vs `containerPort` |
| 503 Service Unavailable | No upstream Pods available | Empty Endpoints (selector mismatch, no readiness) | `kubectl get endpoints` |
| 504 Gateway Timeout | Upstream accepted but did not respond in time | Hung or overloaded container | pod logs and `proxy-read-timeout` |

### Cleanup

Remove the sample workloads and the cluster:

```bash
kubectl delete -f full-stack.yaml
kubectl delete -f broken-svc.yaml
kubectl delete -f empty-svc.yaml
kind delete cluster
```

Expected output:

```text
deployment "frontend-app" deleted
service "frontend-svc" deleted
ingress.networking.k8s.io "frontend-ingress" deleted
Deleting cluster "kind"
```

---

### Lab Questions

1. In Step 4, which commands proved that each of the three hops (Ingress, Service, kube-proxy) was working before you broke anything?
2. When `targetPort` is 8080 and the container listens on 80, why does `kubectl get endpoints frontend-svc` still show an IP?
3. What is the difference between `port` and `targetPort` on a Service, and which one must match the container's listening port?
4. Is a 502 produced when the Endpoints list is empty, or when the upstream connection is refused? Where does a 503 come from instead?
5. If `kubectl get endpoints frontend-svc` returned no entries, which two files would you inspect first?

### Expected Results

After completing this lab:

- You created a kind cluster with `ingress-ready: true` and extra port mappings and installed the NGINX Ingress Controller
- You can name all hops in the end-to-end flow: Ingress -> Service -> kube-proxy -> Pod
- You can reproduce a 502 by mismatching `targetPort` and `containerPort`
- You can run the full 502 debugging workflow: describe ingress, get endpoints, compare ports, `curl -v`, and `nslookup`
- You can tell 502, 503, 404, and 504 apart and map each to its Kubernetes cause

### Key Commands Reference

| Command | Purpose |
|---------|---------|
| `kind create cluster --config kind-config.yaml` | Create a cluster with Ingress support |
| `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml` | Install the NGINX Ingress Controller for kind |
| `curl -v http://localhost/` | Test and verbose the full traffic path |
| `kubectl describe ingress <name>` | Inspect the Ingress backend Service and port |
| `kubectl get endpoints <svc>` | Check if the Service knows about the Pods |
| `kubectl get svc <svc> -o jsonpath='{.spec.ports[0].targetPort}'` | Read the Service targetPort |
| `kubectl get pod -l app=frontend -o jsonpath='{.items[0].spec.containers[0].ports[0].containerPort}'` | Read the container listening port |
| `kubectl exec <pod> -- nslookup <svc>.default.svc.cluster.local` | Confirm Service DNS resolution |
| `kubectl logs -n ingress-nginx deploy/ingress-nginx-controller` | Inspect controller logs for upstream errors |

### Next

- Return to the Lesson 17 concepts in [lesson-17-end-to-end-traffic-flow-and-the-502-bad-gateway.md](../docs/04-networking/lesson-17-end-to-end-traffic-flow-and-the-502-bad-gateway.md)
- Try the Mini Project: Deploy two namespaces and use host-based Ingress rules to assert that 404 appears when a hostname is not defined
- Proceed to [Lab 18 - Service Mesh](#lab-18) to add mTLS and L7 observability on top of this traffic path

---

<a id="lab-18"></a>

## Lab 18 - Service Mesh (Istio and Linkerd)

### Objective

In this lab you will install a lightweight Service Mesh on a running kind cluster, inject sidecar proxies into a sample deployment, verify the sidecar containers with kubectl, enable mTLS, and observe mesh traffic with the mesh-specific command line tools. The lab uses Linkerd stable as the default path because it installs and runs quickly on kind, with Istio noted as an alternative for the same steps.

### Prerequisites

- A running kind cluster
- kubectl installed and configured
- Completion of Lessons 1 through 36

### Pre-Lab Checklist

- [ ] kind cluster running
- [ ] `kubectl get nodes` shows Ready status
- [ ] A default namespace to work in
- [ ] `curl` available for downloading the mesh CLI

---

### Step 1: Install Linkerd CLI and Control Plane

Download the Linkerd CLI and verify the installation:

```bash
curl -sSfL https://run.linkerd.io/install | sh
export PATH=$PATH:$HOME/.linkerd2/bin
linkerd version
```

Expected output:

```text
Client version: stable-2.x.y
Server version: unavailable
```

Install the Linkerd control plane into your kind cluster:

```bash
linkerd install | kubectl apply -f -
```

Wait for the control plane to become healthy and validate it:

```bash
linkerd check
```

The check runs a series of pre- and post-install diagnostics. When all checks pass, the final summary shows:

```text
Status check results are OK
```

### Step 2: Deploy the Sample Application

Create a sample deployment named `sample-app.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: demo
spec:
  selector:
    app: demo
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: demo
  template:
    metadata:
      labels:
        app: demo
    spec:
      containers:
      - name: demo
        image: nginx:stable-alpine
        ports:
        - containerPort: 80
```

Apply it and confirm the Pods are running before injection:

```bash
kubectl apply -f sample-app.yaml
kubectl get pods
```

Expected output (one container per Pod):

```text
NAME                    READY   STATUS    RESTARTS   AGE
demo-7f6d6c5d6c-abc12   1/1     Running   0          12s
demo-7f6d6c5d6c-def34   1/1     Running   0          12s
demo-7f6d6c5d6c-ghi56   1/1     Running   0          12s
```

### Step 3: Inject Sidecars into the Deployment

Enable automatic injection on the `default` namespace so future Pods get a sidecar, and inject into the already-running Deployment:

```bash
kubectl annotate namespace default linkerd.io/inject=enabled
kubectl rollout restart deployment demo
```

Wait for the rollout to finish:

```bash
kubectl rollout status deployment/demo
```

### Step 4: Verify Sidecar Proxy Containers

List the Pods and notice that each now reports two containers:

```bash
kubectl get pods
```

Expected output:

```text
NAME                    READY   STATUS    RESTARTS   AGE
demo-7f6d6c5d6c-abc12   2/2     Running   0          20s
demo-7f6d6c5d6c-def34   2/2     Running   0          20s
demo-7f6d6c5d6c-ghi56   2/2     Running   0          20s
```

Confirm the proxy container name inside the Pod:

```bash
kubectl get pod -l app=demo -o jsonpath='{.items[0].spec.containers[*].name}'
```

Expected output:

```text
demo linkerd-proxy
```

If you chose Istio instead, the equivalent cluster with an exposed port is:

```bash
istioctl proxy-status
```

It lists the control plane and the sync state for each injected Pod.

### Step 5: Run Mesh Verification and View mTLS

Run the Linkerd traffic check to confirm that the data plane proxies are healthy and that all live traffic is being automatically secured:

```bash
linkerd check
```

To confirm the proxies are using mTLS and to observe per-route traffic, install and view the web dashboard and live metrics:

```bash
linkerd viz install | kubectl apply -f -
kubectl -n linkerd-viz rollout status deploy --timeout=120s
linkerd viz top -n default deploy
```

Generate sustained traffic against the demo Service so the top view has data to show:

```bash
kubectl run -it --rm traffic --image=curlimages/curl --restart=Never -- sh -c 'while true; do curl -s http://demo.default.svc:80 >/dev/null; done'
```

Expected output from with `linkerd top`:

```text
ROUTE       SERVICE     START_TIME   SUCCESS   L5D_IN       L5D_OUT
/           demo        20s          100%      1ms          1ms
```

### Step 6: Confirm mTLS Between Proxies

The `linkerd check` post-install also verifies that the proxies can perform mTLS handshakes with the control plane's certificate authority. To demonstrate mTLS between two injected workloads, exec into a Proxy container and confirm the identity:

```bash
kubectl exec deploy/demo -c linkerd-proxy -- /bin/sh -c 'echo ok'
```

For a stronger proof, open the data plane table in the dashboard:

```bash
linkerd viz table
```

It shows the source, destination, workload, and mesh identity (For example, `default:...demo`): which is the certificate identity used for mutual TLS.

### Step 7: Istio Alternative Commands

If you chose Istio, the equivalent sidecar and traffic observability commands are:

```bash
istioctl proxy-config routes deploy/istio-demo
istioctl analyze
istioctl verify-install
istioctl istiod-status
```

### Step 8: Cleanup

Remove the injected namespace annotation, the sample workload, and the entire mesh. First remove the dashboard extensions node, then server (or linkerd) itself:

For Linkerd:

```bash
kubectl delete -f sample-app.yaml
kubectl annotate namespace default linkerd.io/inject-
linkerd uninstall | kubectl delete -f -
```

Re-verify the cluster returns to a clean state:

```bash
kubectl get pods
kubectl get ns
```

For Istio, the equivalent end-to-end teardown is:

```bash
kubectl delete -f sample-app.yaml
kubectl label namespace default istio-injection-
istioctl x uninstall --purge
```

---

### Lab Questions

1. How can you tell that the sidecar proxy was successfully injected into a Pod after completing Step 4?
2. What does the default-namespace annotation/`linkerd x inject` actually modify in the Pod spec when it injects the proxy?
3. Why is the `linkerd check` useful both before and after workload injection?
4. What is the observable difference between a mesh-protected and a non-protected Pipeline deployment?

---

### Expected Results

After completing this lab:

- You can install a lightweight Service mesh (Linkerd) on a kind cluster
- You can inject sidecar proxies into a Deployment and verify them with kubectl
- You can enable and verify mTLS between workloads
- You can observe mesh traffic and proxy status with `linkerd check` and `linkerd viz top`
- You understand the equivalent Istio workflow with `istioctl`

---

### Key Commands Reference

| Command | Purpose |
|---------|---------|
| `linkerd check` | Pre- and post-install health and config validation |
| `kubectl get pods` | Verify sidecar injection (READY `2/2`) |
| `kubectl get pod <pod> -o jsonpath='{.spec.containers[*].name}'` | List containers inside a Pod |
| `linkerd viz top deployment/demo` | Aggregate live L7 traffic by route |
| `linkerd viz table` | Show per-workload mesh and mTLS traffic |
| `istioctl proxy-status` | Istio: review proxy config sync status |

---

### Next

- Return to the [Lesson 18 file](../docs/04-networking/lesson-18-service-mesh-istio-and-linkerd.md) to review the concepts
- Try the Mini Project: Deploy two services and verify that only mesh-injected workloads can communicate when mTLS is set to STRICT
- Proceed to the next lesson to learn about eBPF and Cilium in Module 04

---

<a id="lab-19"></a>

## Lab 19 - Persistent Storage (PVs, PVCs, and StorageClasses)

### Objective

Create a PVC, write data to it, crash the Pod, and verify the data persisted. Understand dynamic provisioning in kind.

### Prerequisites

- Lesson 19 - Persistent Storage (PVs, PVCs, and StorageClasses).
- A running kind cluster.
- kubectl installed and configured.

#### Quick Cluster Setup (kind)

```bash
kind create cluster --name learning
kubectl cluster-info --context kind-learning
```

### Steps

#### 1. Check Available StorageClasses

```bash
kubectl get sc
```

Expected: You should see a `standard` StorageClass (kind's default).

#### 2. Create the PVC

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 1Gi
EOF
```

```bash
kubectl get pvc
```

Expected: PVC transitions from Pending to Bound.

#### 3. Create a Pod That Writes Data

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: storage-app
spec:
  volumes:
  - name: data-volume
    persistentVolumeClaim:
      claimName: my-pvc
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "echo 'Important Database Data' > /data/file.txt && sleep 3600"]
    volumeMounts:
    - name: data-volume
      mountPath: /data
EOF
```

#### 4. Verify the Data

```bash
kubectl exec storage-app -- cat /data/file.txt
```

Expected: `Important Database Data`

#### 5. Simulate a Crash

```bash
kubectl delete pod storage-app
```

The Pod is gone. The data is "floating" on the PV.

#### 6. Recover the Data

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: storage-app-read
spec:
  volumes:
  - name: data-volume
    persistentVolumeClaim:
      claimName: my-pvc
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "cat /data/file.txt && sleep 3600"]
    volumeMounts:
    - name: data-volume
      mountPath: /data
EOF
```

```bash
kubectl logs storage-app-read
```

Expected: `Important Database Data` (the data survived!)

#### 7. Cleanup

```bash
kubectl delete pod storage-app-read
kubectl delete pvc my-pvc
kind delete cluster --name learning
```

### Verification

- PVC binds to a PV dynamically.
- Data written to the mounted volume persists after Pod deletion.
- A new Pod mounting the same PVC sees the previous data.

### Expected Output Snapshot

```text
$ kubectl get pvc
NAME     STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
my-pvc   Bound    pvc-abc123                                 1Gi        RWO            standard       30s

$ kubectl exec storage-app -- cat /data/file.txt
Important Database Data

$ kubectl logs storage-app-read
Important Database Data
```

### Related

- Lesson file: [lesson-19-persistent-storage-pv-pvc-sc.md](../docs/05-storage/lesson-19-persistent-storage-pv-pvc-sc.md)

---

<a id="lab-20"></a>

## Lab 20 - ConfigMaps and Secrets

### Objective

Create a ConfigMap and a Secret. Inject them into a Pod as Environment Variables and Volume mounts. Debug a Pod that fails due to a missing configuration key.

### Prerequisites

- Lesson 23 - ConfigMaps and Secrets.
- A running kind cluster.
- kubectl installed and configured.

#### Quick Cluster Setup (kind)

```bash
kind create cluster --name learning
kubectl cluster-info --context kind-learning
```

### Steps

#### 1. Create the ConfigMap and Secret

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: "info"
  MAX_CONNECTIONS: "100"
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  DB_PASSWORD: c3VwZXJzZWNyZXQ=
EOF
```

#### 2. Create the Pod with Environment Variables

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: config-app
spec:
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "echo LOG_LEVEL=\$LOG_LEVEL && echo DB_PASSWORD=\$DB_PASSWORD && sleep 3600"]
    env:
    - name: LOG_LEVEL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: LOG_LEVEL
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: app-secret
          key: DB_PASSWORD
  restartPolicy: Never
EOF
```

#### 3. Verify Environment Variables

```bash
kubectl logs config-app
```

Expected:

```
LOG_LEVEL=info
DB_PASSWORD=supersecret
```

#### 4. Test Volume Mount

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
data:
  default.conf: |
    server {
      listen 80;
      server_name localhost;
      location / {
        return 200 "Hello from custom Nginx config!";
      }
    }
---
apiVersion: v1
kind: Pod
metadata:
  name: nginx-custom
spec:
  containers:
  - name: nginx
    image: nginx:1.25-alpine
    ports:
    - containerPort: 80
    volumeMounts:
    - name: nginx-config
      mountPath: /etc/nginx/conf.d/
  volumes:
  - name: nginx-config
    configMap:
      name: nginx-config
EOF
```

```bash
kubectl exec nginx-custom -- curl -s localhost
```

Expected: "Hello from custom Nginx config!"

#### 5. Debug a Missing Key

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: config-app-broken
spec:
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "echo \$LOGGING_LEVEL && sleep 3600"]
    env:
    - name: LOGGING_LEVEL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: LOGGING_LEVEL
  restartPolicy: Never
EOF
```

```bash
kubectl get pod config-app-broken
kubectl describe pod config-app-broken
```

The Pod fails with `CreateContainerConfigError`.

#### 6. Cleanup

```bash
kubectl delete pod config-app nginx-custom config-app-broken
kubectl delete configmap app-config nginx-config
kubectl delete secret app-secret
kind delete cluster --name learning
```

### Verification

- ConfigMap and Secret are created.
- Environment variables are injected correctly.
- Volume mount updates Nginx configuration.
- Missing key causes `CreateContainerConfigError`.

### Expected Output Snapshot

```text
$ kubectl logs config-app
LOG_LEVEL=info
DB_PASSWORD=supersecret

$ kubectl exec nginx-custom -- curl -s localhost
Hello from custom Nginx config!

$ kubectl describe pod config-app-broken
Events:
  Warning  Failed  ... CreateContainerConfigError: ... key "LOGGING_LEVEL" not found in ConfigMap "app-config"
```

### Related

- Lesson file: [lesson-20-configmaps-and-secrets.md](../docs/06-configuration/lesson-20-configmaps-and-secrets.md)

---

<a id="lab-21"></a>

## Lab 21 - Resource Management and the OOMKiller

### Objective

Deploy Pods with memory and CPU limits, trigger an OOMKilled event, observe CPU throttling, and verify QoS classes.

### Prerequisites

- Lesson 25 - Resource Management and the OOMKiller.
- A running kind cluster.
- kubectl installed and configured.

#### Quick Cluster Setup (kind)

```bash
kind create cluster --name learning
kubectl cluster-info --context kind-learning
```

### Steps

#### 1. Deploy a Pod That Gets OOMKilled

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: memory-hog
spec:
  containers:
  - name: app
    image: polinux/stress
    resources:
      requests:
        memory: "50Mi"
      limits:
        memory: "100Mi"
    command: ["stress"]
    args: ["--vm", "1", "--vm-bytes", "250M", "--vm-hang", "1"]
EOF
```

```bash
kubectl get pod memory-hog --watch
```

Expected: The Pod cycles through Running, OOMKilled, and CrashLoopBackOff.

#### 2. Debug the OOMKilled

```bash
kubectl describe pod memory-hog | grep -A 5 "Last State"
```

Expected:

```
Last State: Terminated
  Reason: OOMKilled
  Exit Code: 137
```

#### 3. Observe CPU Throttling

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: cpu-hog
spec:
  containers:
  - name: app
    image: polinux/stress
    resources:
      requests:
        cpu: "100m"
      limits:
        cpu: "200m"
    command: ["stress"]
    args: ["--cpu", "2"]
EOF
```

```bash
kubectl top pod cpu-hog
```

The Pod uses 200m CPU (its limit) even though it's trying to use more.

#### 4. Check QoS Classes

```bash
kubectl get pod memory-hog -o jsonpath='{.status.qosClass}'
kubectl get pod cpu-hog -o jsonpath='{.status.qosClass}'
```

Both show `Burstable` because requests != limits.

#### 5. Test Guaranteed QoS

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: guaranteed-app
spec:
  containers:
  - name: app
    image: nginx:1.25-alpine
    resources:
      requests:
        cpu: "100m"
        memory: "128Mi"
      limits:
        cpu: "100m"
        memory: "128Mi"
EOF
```

```bash
kubectl get pod guaranteed-app -o jsonpath='{.status.qosClass}'
```

Shows `Guaranteed` because requests == limits.

#### 6. Cleanup

```bash
kubectl delete pod memory-hog cpu-hog guaranteed-app
kind delete cluster --name learning
```

### Verification

- Pod with memory limit gets OOMKilled with Exit Code 137.
- Pod with CPU limit shows throttled CPU usage.
- QoS classes are correctly assigned (Burstable vs Guaranteed).

### Expected Output Snapshot

```text
$ kubectl describe pod memory-hog | grep -A 5 "Last State"
    Last State: Terminated
      Reason: OOMKilled
      Exit Code: 137

$ kubectl get pod memory-hog -o jsonpath='{.status.qosClass}'
Burstable

$ kubectl get pod guaranteed-app -o jsonpath='{.status.qosClass}'
Guaranteed
```

### Related

- Lesson file: [lesson-21-resource-requests-limits-and-quotas.md](../docs/06-configuration/lesson-21-resource-requests-limits-and-quotas.md)

---

<a id="lab-22"></a>

## Lab 22 - RBAC and Service Accounts

### Prerequisite

- Completion of [Lesson 22 - RBAC and Service Accounts](../docs/07-security/lesson-22-rbac-and-service-accounts.md).
- A running Kubernetes cluster (kind, minikube, k3s, or Docker Desktop).
- kubectl installed and configured.

### Objective

Create a ServiceAccount with restricted RBAC permissions. Give it permission to only list Pods. Then, try to list Secrets from inside a Pod and watch the API Server reject us.

### Estimated Time

15 minutes.

---

### Step 1: Create a Namespace

```bash
kubectl create namespace rbac-test
kubectl config set-context --current --namespace=rbac-test
```

Expected output:

```
namespace/rbac-test created
Context "kind-kind" modified.
```

### Step 2: Create the RBAC Resources

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: pod-reader-sa
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader-role
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader-binding
subjects:
- kind: ServiceAccount
  name: pod-reader-sa
roleRef:
  kind: Role
  name: pod-reader-role
  apiGroup: rbac.authorization.k8s.io
EOF
```

Expected output:

```
serviceaccount/pod-reader-sa created
role.rbac.authorization.k8s.io/pod-reader-role created
rolebinding.rbac.authorization.k8s.io/pod-reader-binding created
```

### Step 3: Verify RBAC Objects

```bash
kubectl get roles,rolebindings,serviceaccounts
```

Expected output:

```
NAME                                     ROLE                                             AGE
role.rbac.authorization.k8s.io/pod-reader-role   Role/pod-reader-role                                       10s

NAME                                                ROLE                   AGE
rolebinding.rbac.authorization.k8s.io/pod-reader-binding   Role/pod-reader-role   10s

NAME                                  SECRETS   AGE
serviceaccount/pod-reader-sa          0         10s
serviceaccount/default                0         15s
```

### Step 4: Create a Pod Using the ServiceAccount

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: curl-pod
spec:
  serviceAccountName: pod-reader-sa
  containers:
  - name: curl
    image: curlimages/curl:latest
    command: ["sleep", "3600"]
EOF
```

Expected output:

```
pod/curl-pod created
```

### Step 5: Wait for the Pod to Run

```bash
kubectl get pod curl-pod --wait
```

Expected output (wait for STATUS to be Running):

```
NAME       READY   STATUS    RESTARTS   AGE
curl-pod   1/1     Running   0          30s
```

### Step 6: Test Allowed Action (List Pods)

```bash
kubectl exec -it curl-pod -- sh
```

Inside the Pod, run:

```sh
TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
CACERT=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
APISERVER=https://kubernetes.default.svc

curl --cacert $CACERT --header "Authorization: Bearer $TOKEN" $APISERVER/api/v1/namespaces/rbac-test/pods
```

Expected output: A JSON response listing the Pods in the `rbac-test` namespace.

### Step 7: Test Denied Action (List Secrets)

Still inside the Pod, run:

```sh
curl --cacert $CACERT --header "Authorization: Bearer $TOKEN" $APISERVER/api/v1/namespaces/rbac-test/secrets
```

Expected output:

```json
{
  "kind": "Status",
  "apiVersion": "v1",
  "metadata": {},
  "status": "Failure",
  "message": "secrets is forbidden: User \"system:serviceaccount:rbac-test:pod-reader-sa\" cannot list resource \"secrets\" in API group \"\" in the namespace \"rbac-test\"",
  "reason": "Forbidden",
  "details": {
    "kind": "secrets",
    "reason": "Forbidden"
  },
  "code": 403
}
```

The API Server rejects the request because the ServiceAccount doesn't have permission to list Secrets.

Type `exit` to leave the Pod.

### Step 8: Use kubectl auth can-i (Pro Method)

```bash
kubectl auth can-i list pods --as=system:serviceaccount:rbac-test:pod-reader-sa -n rbac-test
kubectl auth can-i list secrets --as=system:serviceaccount:rbac-test:pod-reader-sa -n rbac-test
```

Expected output:

```
yes
no
```

This confirms the RBAC rules are working as expected.

### Step 9: Check Pod ServiceAccount

```bash
kubectl get pod curl-pod -o yaml | grep serviceAccountName
```

Expected output:

```
  serviceAccountName: pod-reader-sa
```

---

### Cleanup

```bash
kubectl config set-context --current --namespace=default
kubectl delete namespace rbac-test
```

Expected output:

```
namespace "rbac-test" deleted
```

### What You Learned

- ServiceAccounts are identities for Pods.
- Roles define permissions within a namespace.
- RoleBindings attach Roles to ServiceAccounts.
- The API Server returns 403 Forbidden when RBAC denies a request.
- `kubectl auth can-i` is a powerful tool to test RBAC permissions.

### Next Steps

Proceed to [Lesson 23 - Locking Down the Container (Security Contexts)](../docs/07-security/lesson-23-locking-down-the-container-security-contexts.md) to learn how to restrict what Pods can do at the container level.

---

[Back to Labs](../labs/README.md)

---

<a id="lab-23"></a>

## Lab 23 - Container Security Contexts

### Objective

In this lab you will lock down containers using Security Contexts. You will deliberately deploy a Pod that the kubelet refuses to start because the image defaults to root under `runAsNonRoot: true`, then run a hardened non-root Pod with a read-only filesystem and restricted capabilities, drop all capabilities and re-add only `NET_BIND_SERVICE` so a non-root app can bind to port 80, and finally enforce the same restrictions at the namespace level with Pod Security Admission (PSA). The lab teaches you how Security Contexts are enforced, why they fail fast, and how to build images and manifests that honor them.

### Prerequisites

- A running kind cluster
- kubectl installed and configured
- Completion of Lessons 1 through 22, especially Lesson 22 (RBAC and Service Accounts)
- A registry puller: `docker` or `crictl` for inspecting image metadata

### Pre-Lab Checklist

- [ ] kind cluster running
- [ ] `kubectl get nodes` shows Ready status
- [ ] Cluster is new enough for PSA (kind ships an admission controller that supports it)
- [ ] The default namespace is free of other workloads
- [ ] `docker` or `nerdctl` available to inspect image defaults

---

### Step 1: Create a Pod That Fails With a Root Image Under runAsNonRoot

Create `broken-secure.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: broken-secure
spec:
  securityContext:
    runAsNonRoot: true
  containers:
  - name: app
    image: redis:alpine
```

Note that the `redis:alpine` image does not declare a `USER` in its Dockerfile, so it defaults to root (UID 0). The `runAsNonRoot: true` check is a hard validation done by the kubelet before the container starts. Apply it:

```bash
kubectl apply -f broken-secure.yaml
```

### Step 2: Observe the CreateContainerConfigError

Wait a few seconds and inspect the Pod state:

```bash
kubectl get pod broken-secure
```

Expected output:

```text
NAME            READY   STATUS                  RESTARTS   AGE
broken-secure   0/1     CreateContainerError    0          15s
```

List all events for the exact message:

```bash
kubectl describe pod broken-secure
```

Expected Events output:

```text
Events:
  Type     Reason       Age   From     Message
  ----     ------       ----  ----     -------
  Normal   Scheduled    15s   default  Successfully assigned default/broken-secure to kind-worker
  Warning  FailedCreate 10s   kubelet  Error: container has runAsNonRoot and image will run as root
```

Why this happens: the kubelet acts as a bouncer. Before calling the container runtime it reads the image metadata for the default user. When the image defaults to UID 0 and the Pod demands `runAsNonRoot: true`, the kubelet refuses to start the container and reports `CreateContainerError`. The container never reaches the OCI runtime. Deleting and re-deploying with an explicit user or a fixed image is the fix:

```bash
kubectl delete pod broken-secure
```

### Step 3: Create a Hardened NonRoot Pod With Read-Only Filesystem

Create `secure-pod.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
  containers:
  - name: app
    image: busybox:latest
    command: ["sleep", "3600"]
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

The Pod-level `runAsUser: 1000` overrides the image's default root user, which satisfies the non-root check and lets the container start as a normal user. Apply and wait:

```bash
kubectl apply -f secure-pod.yaml
kubectl get pod secure-app -w
```

Expected output:

```text
NAME         READY   STATUS    RESTARTS   AGE
secure-app   1/1     Running   0          8s
```

### Step 4: Prove the Restrictions With kubectl exec

Enter the container:

```bash
kubectl exec -it secure-app -- sh
```

Verify the user identity:

```sh
id
```

Expected output:

```text
uid=1000 gid=1000 groups=1000
```

Try to write to the root filesystem:

```sh
touch /hacked.txt
```

Expected output (the read-only rootfs rejects the write):

```text
touch: /hacked.txt: Read-only file system
```

Try to bind a privileged port. Port 80 is guarded by the kernel capability `CAP_NET_BIND_SERVICE`, which was dropped along with everything else:

```sh
nc -l -p 80
```

Expected output:

```text
nc: bind: Permission denied
```

Exit the container:

```sh
exit
```

The read-only root filesystem is enforced at the OCI mount level, so every process in the container cannot create files outside mounted volumes. Any app that needs to write temporary data must be given an `emptyDir` (or other writable) volume mounted at the write location, otherwise it fails with `Permission denied` or signals at startup.

### Step 5: Create a Writable tmp Directory

Deploy a minimal app that needs to write temporary files under a read-only rootfs. Create `tmp-writer.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: temp-writer
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "sleep 3600"]
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
    volumeMounts:
    - name: scratch
      mountPath: /tmp
  volumes:
  - name: scratch
    emptyDir: {}
```

Apply and confirm the temporary directory is writable:

```bash
kubectl apply -f tmp-writer.yaml
kubectl exec temp-writer -- touch /tmp/hello.txt
```

Expected output: no error, and the root filesystem stays read-only. The `emptyDir` volume provides the only writable location in a Pod that otherwise has its root filesystem mounted read-only.

### Step 6: Drop ALL Capabilities and Add NET_BIND_SERVICE for Port 80

Non-root processes cannot bind to privileged ports below 1024 because the kernel requires `CAP_NET_BIND_SERVICE`, which is normally only granted to root. There are two production options: run the app on 8080 behind an Ingress that translates 80 to 8080, or restore the single capability under a non-root user.

Deploy an Nginx that runs as UID 101 (the nginx user) on port 80 with only `NET_BIND_SERVICE` added back. Create `nginx-nonroot.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-nonroot
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 101
  containers:
  - name: nginx
    image: nginx:1.25-alpine
    ports:
    - containerPort: 80
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
        add:
        - NET_BIND_SERVICE
    volumeMounts:
    - name: nginx-tmp
      mountPath: /tmp
  volumes:
  - name: nginx-tmp
    emptyDir: {}
```

Apply and confirm the Pod starts:

```bash
kubectl apply -f nginx-nonroot.yaml
kubectl get pod nginx-nonroot
```

Expected output:

```text
NAME             READY   STATUS    RESTARTS   AGE
nginx-nonroot    1/1     Running   0          10s
```

Prove the capability was granted by asking the kernel directly:

```bash
kubectl exec nginx-nonroot -- sh -c 'grep CapEff /proc/self/status'
```

Expected output (0x400 = bit 10 = `CAP_NET_BIND_SERVICE`):

```text
CapEff: 0000000000000400
```

Without the explicit add, the same Nginx would fail to bind to port 80 and crash. The read-only rootfs also requires the `/tmp` emptyDir because Nginx writes its worker pid and temp files under runtime directories.

### Step 7: Enforce With Pod Security Admission

Pod Security Admission (PSA) is built into the kube-apiserver admission controller on a current kind cluster. Create a dedicated namespace and apply the `baseline` level first, then escalate to `restricted` to see a workload rejected:

```bash
kubectl create namespace psa-live
kubectl label namespace psa-live pod-security.kubernetes.io/enforce=baseline
kubectl label namespace psa-live pod-security.kubernetes.io/audit=restricted
kubectl label namespace psa-live pod-security.kubernetes.io/warn=restricted
```

A normal privileged-looking Deployment that does not set `runAsNonRoot` should still pass baseline evaluation. Now harden the enforcement level to `restricted`:

```bash
kubectl label --overwrite namespace psa-live pod-security.kubernetes.io/enforce=restricted
kubectl run pry -n psa-live --image=busybox --restart=Never --command -- sleep 3600
```

Expected: the namespace's admission controller rejects the Pod because it runs as root and lacks the required capabilities, with a warning such as:

```text
Error from server (Forbidden): pods "pry" is forbidden: violates PodSecurity "restricted:latest": running as root is not allowed (no container is set to runAsNonRoot)
```

The `secure-pod.yaml` manifest from Step 3 already satisfies the restricted requirements: `runAsNonRoot: true`, `runAsUser: 1000`, `allowPrivilegeEscalation: false`, and dropped capabilities. Deploy it into the `psa-live` namespace:

```bash
kubectl -n psa-live apply -f secure-pod.yaml
```

Expected output (the Pod passes the restricted admission check and is created):

```text
pod/secure-app created
```

The two layers complement each other. PSA evaluates the Pod at admission time in the API server and rejects anything violating the namespace level before it is stored. The Security Context is applied later, at runtime, by the container runtime via the CRI. Together they make it impossible for developers to opt out of the cluster baseline.

### Cleanup

Remove the Pods created in this lab and the PSA test namespace:

```bash
kubectl delete pod broken-secure secure-app tmp-writer nginx-nonroot --ignore-not-found
kubectl delete ns psa-live
kubectl get pods
```

If you also applied the reference Deployment from `manifests/07-security/security-context.yaml` (which uses `runAsUser: 10001`, `fsGroup: 2000`, seccomp RuntimeDefault, a read-only rootfs, and dropped capabilities with `NET_BIND_SERVICE` added back), delete it as well:

```bash
kubectl delete deploy hardened --ignore-not-found
```

---

### Lab Questions

1. A Pod has `runAsNonRoot: true` without a `runAsUser`, and the image does not declare a user. What Pod status and error message do you expect, and what two ways can you fix it?
2. What does `readOnlyRootFilesystem: true` actually mount as read-only, and what error do apps that write temp files hit? What volume solves it?
3. Why can a non-root process not bind to port 80, and what capability makes it possible?
4. What is the difference between the Pod-level `securityContext` and the container-level `securityContext` in a multi-container Pod?
5. How does a namespace-level PSA label (`pod-security.kubernetes.io/enforce=restricted`) relate to the per-Pod `runAsNonRoot` check, and why should you use both layers?

---

### Expected Results

After completing this lab:

- You can deploy a Pod that uses a root image under `runAsNonRoot: true` and read the `CreateContainerConfigError` from the describe events
- You know why the kubelet refuses to start the container and what `runAsUser` does to bypass it
- You run a non-root, read-only, capability-stripped container and prove it with `kubectl exec` and `id`, plus failed file and port writes
- You can grant exactly one capability (`NET_BIND_SERVICE`) so a non-root app binds to port 80
- You can enforce the same policy at the namespace level with PSA and observe a Pod rejected for running as root

---

### Key Commands Reference

| Command | Purpose |
|---------|---------|
| `kubectl get pod <name>` | Check Pod status (look for `CreateContainerError`) |
| `kubectl describe pod <name>` | Read the kubelet Events message `container has runAsNonRoot and image will run as root` |
| `kubectl exec -it <pod> -- sh` | Enter the container and test writes and binds |
| `kubectl exec <pod> -- id` | Confirm the effective user inside the container |
| `kubectl exec <pod> -- grep CapEff /proc/self/status` | Decode the effective capability set |
| `kubectl label ns <name> pod-security.kubernetes.io/enforce=restricted` | Enforce PSA restricted on a namespace |

---

### Next

- Review the corresponding [Lesson 23 file](../docs/07-security/lesson-23-locking-down-the-container-security-contexts.md) for the field-by-field YAML explanation
- Read the [hardened reference manifest](../manifests/07-security/security-context.yaml) and adapt it for your own images
- Continue to the next lesson on image security, software supply chain, and PSA/Kyverno enforcement

---

<a id="lab-24"></a>

## Lab 24 - Monitoring and Metrics

### Prerequisite

- Completion of [Lesson 24 - Monitoring and Metrics](../docs/08-observability/lesson-24-monitoring-and-metrics.md).
- A running kind cluster.
- kubectl installed and configured.

### Objective

Install the Metrics Server in kind, deploy a CPU-hogging application, and use `kubectl top` to identify the culprit.

### Estimated Time

15 minutes.

---

### Step 1: Install the Metrics Server

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### Step 2: Patch it for Kind

Kind's kubelet uses self-signed certificates that the Metrics Server doesn't trust by default. We must tell it to skip TLS verification (NEVER do this in real production).

```bash
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
```

### Step 3: Wait for it to be Ready

```bash
kubectl get deployment metrics-server -n kube-system
```

Wait until the `READY` column shows `1/1`.

### Step 4: Verify it Works

Wait about 60 seconds for the first scrape to happen, then run:

```bash
kubectl top nodes
```

Expected output: CPU and Memory usage for your control-plane and worker nodes.

### Step 5: Deploy the CPU Hog

Create `hog.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: cpu-hog
  labels:
    app: hog
spec:
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "while true; do echo 'burning CPU'; done"]
    resources:
      requests:
        cpu: "100m"
      limits:
        cpu: "500m"
```

Apply it:

```bash
kubectl apply -f hog.yaml
```

### Step 6: Investigate with kubectl top

Wait about 60 seconds for the metrics to update, then run:

```bash
kubectl top pods
```

**Your Task:**

- What is the CPU usage of the `cpu-hog` pod? (It should be somewhere around 500m, which is 50% of a core, or 500 millicores).
- What command would you run to see the CPU usage of only the `cpu-hog` pod using a label selector?
- Based on the theory, where did the Metrics Server get this real-time data from?

(Answer: 1. ~500m. 2. `kubectl top pod -l app=hog`. 3. The Kubelet's Summary API, which reads the cgroup stats on the node).

### Step 7: Cleanup

```bash
kubectl delete pod cpu-hog
kubectl delete -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

### What You Learned

- The Metrics Server is a cluster-wide aggregator of resource usage data.
- It scrapes the kubelet on every node and exposes real-time CPU/Memory metrics.
- It powers `kubectl top` and the Horizontal Pod Autoscaler (HPA).
- It stores data in-memory only (no historical data).

### Next Steps

Proceed to [Lesson 25 - Logging](../docs/08-observability/lesson-25-logging.md) to learn about aggregating logs in Kubernetes.

---

[Back to Labs](../labs/README.md)

---

<a id="lab-25"></a>

## Lab 25 - Logging

### Prerequisite

- Completion of [Lesson 25 - Logging](../docs/08-observability/lesson-25-logging.md).
- A running kind cluster.
- kubectl installed and configured.

### Objective

Create a multi-container Pod, view logs for a specific container, crash the main container, and retrieve the crash logs using `--previous`.

### Estimated Time

15 minutes.

---

### Step 1: Create the Multi-Container Pod

Create `multi-pod.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-app
spec:
  containers:
  - name: main-app
    image: busybox:latest
    command: ["sh", "-c", "echo 'Main app is running' && sleep 15 && echo 'FATAL: Database connection lost' && exit 1"]
  - name: sidecar-proxy
    image: busybox:latest
    command: ["sh", "-c", "echo 'Sidecar proxy started' && sleep 3600"]
```

Apply it:

```bash
kubectl apply -f multi-pod.yaml
```

### Step 2: Investigate Multi-Container Logs

Wait about 20 seconds (so the main-app has time to crash and restart at least once), then try to run this:

```bash
kubectl logs multi-app
```

Expected output: It will throw an error: `error: a container name must be specified for pod multi-app, choose one of the following: [main-app sidecar-proxy] (or default to one)`.

Now, run it with the container flag:

```bash
kubectl logs multi-app -c sidecar-proxy
kubectl logs multi-app -c main-app
```

### Step 3: Investigate the Crash

Because the `main-app` exits with code 1, it will restart. Wait a few seconds, then run:

```bash
kubectl logs multi-app -c main-app
```

(You will just see "Main app is running" because this is the NEW container's logs. The fatal error is gone).

Now, run the command to get the previous logs:

```bash
kubectl logs multi-app -c main-app --previous
```

**Your Task:**

- What exact output did you see when you ran `kubectl logs multi-app -c main-app --previous`?
- Why was it necessary to use the `--previous` flag to see the error message?
- Based on the theory, where does the kubelet read this "previous" log data from on the worker node?

(Answer: 1. "Main app is running \n FATAL: Database connection lost". 2. Because the current container just restarted, so its log buffer is fresh. The error was printed right before the previous container died. 3. The `/var/log/pods/` directory, specifically the `0.log` file for that container, while the new container writes to `1.log`).

### Step 4: Cleanup

```bash
kubectl delete pod multi-app
```

---

### What You Learned

- Applications must print logs to stdout or stderr.
- The container runtime captures this and saves it as JSON files on the node at `/var/log/pods/`.
- Multi-container Pods: If a Pod has multiple containers, you must specify `-c <container-name>`.
- `--previous` (`-p`): Retrieves the logs of the previous container instance before it restarted. Essential for finding crash root causes.

### Next Steps

Proceed to [Lesson 26 - Probes and Health Checks](../docs/08-observability/lesson-26-probes-and-health-checks.md) to learn about application health checks.

---

[Back to Labs](../labs/README.md)

---

<a id="lab-26"></a>

## Lab 26 - Probes and Health Checks

### Prerequisite

- Completion of [Lesson 26 - Probes and Health Checks](../docs/08-observability/lesson-26-probes-and-health-checks.md).
- A running kind cluster.
- kubectl installed and configured.

### Objective

Deploy an app with a Liveness probe pointing to a bad path. Watch Kubernetes kill and restart it. Understand the difference between Liveness and Readiness probes.

### Estimated Time

15 minutes.

---

### Step 1: Create the Liveness Pod

Create `liveness-pod.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: liveness-demo
spec:
  containers:
  - name: app
    image: nginx:alpine
    livenessProbe:
      httpGet:
        path: /bad-path
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
      failureThreshold: 3
```

Apply it:

```bash
kubectl apply -f liveness-pod.yaml
```

Expected output:

```
pod/liveness-demo created
```

### Step 2: Observe the Crash

Wait about 30 seconds, then run:

```bash
kubectl get pod liveness-demo
```

Expected output: The `RESTARTS` column will increment.

```
NAME            READY   STATUS    RESTARTS   AGE
liveness-demo   1/1     Running   3          45s
```

### Step 3: Investigate the Failure

```bash
kubectl describe pod liveness-demo
```

Scroll to the Events section.

**Your Task:**

What is the exact warning message in the Events?

(Answer: `Warning: Liveness probe failed: HTTP probe failed with statuscode: 404` and `Normal: Killing container with id ... Container liveness probe failed...`)

### Step 4: Explanation

The kubelet makes an `httpGet` request. It expects HTTP status 200-399. Because we pointed to `/bad-path`, Nginx returned a 404. After 3 failures, the kubelet killed the container.

### Step 5: Cleanup

```bash
kubectl delete pod liveness-demo
```

---

### What You Learned

- Liveness Probes check if the app is alive. If they fail, Kubernetes restarts the container.
- Readiness Probes check if the app is ready for traffic. If they fail, the Pod's IP is removed from Service Endpoints.
- Startup Probes are for slow-booting apps. They disable Liveness/Readiness until they pass.
- The kubelet expects HTTP codes 200-399 for a successful probe. A 404 or 500 fails it.

### Next Steps

Proceed to [Lesson 29 - Helm](../docs/09-packaging/lesson-29-helm.md) to learn about packaging Kubernetes applications with Helm.

---

[Back to Labs](../labs/README.md)

---

<a id="lab-27"></a>

## Lab 27 - Observability Deep Dive (Prometheus and Grafana)

### Prerequisite

- Completion of [Lesson 27 - Observability Deep Dive (Prometheus and Grafana)](../docs/08-observability/lesson-27-observability-deep-dive-prometheus-and-grafana.md).
- A running kind cluster.
- kubectl and helm installed.

### Objective

Install the kube-prometheus-stack, explore the dashboards, run PromQL queries, and finish with a custom Flask app that exposes a `/metrics` endpoint consumed by Prometheus via a ServiceMonitor.

### Estimated Time

25 minutes.

---

### Step 1: Add the Helm repo and install the stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
kubectl get pods -n monitoring -w
```

Expected: after one to two minutes all pods in `monitoring` are `Running`, including `prometheus-*`, `grafana-*`, `alertmanager-*`, and the node-exporter DaemonSet.

### Step 2: Access Grafana

```bash
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring
```

Open `http://localhost:3000`. Login: `admin` / `prom-operator`. Open Dashboards -> Browse -> "Kubernetes / Compute Resources / Cluster".

Expected: live CPU/memory graphs of the cluster.

### Step 3: Access Prometheus and run PromQL

In a second terminal:

```bash
kubectl port-forward svc/monitoring-kube-prometheus-prometheus 9090:9090 -n monitoring
```

Open `http://localhost:9090` and run:

```promql
container_cpu_usage_seconds_total
rate(container_cpu_usage_seconds_total[5m])
up
```

Expected: raw counters, a per-second rate, and target up/down series. In Status -> Targets you should see many green `Up` targets.

### Step 4: Deploy an app that exports metrics

Create a small Flask app exposing `/metrics`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: metrics-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: metrics-app
  template:
    metadata:
      labels:
        app: metrics-app
    spec:
      containers:
      - name: app
        image: prom/client_golang-example  # any exporter image works
        ports:
        - name: metrics
          containerPort: 8080
        readinessProbe:
          httpGet:
            path: /metrics
            port: metrics
---
apiVersion: v1
kind: Service
metadata:
  name: metrics-app
  labels:
    app: metrics-app
spec:
  selector:
    app: metrics-app
  ports:
  - name: metrics
    port: 8080
    targetPort: metrics
```

Apply and start the app:

```bash
kubectl apply -f app.yaml
kubectl get pods -l app=metrics-app
```

### Step 5: Create the ServiceMonitor

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: metrics-app
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: metrics-app
  endpoints:
  - port: metrics
    path: /metrics
    interval: 15s
```

```bash
kubectl apply -f servicemonitor.yaml
```

Prompt check in Prometheus: open Status -> Targets and look for the new `metrics-app` target; its state should be `Up`.

### Step 6: Verify custom metrics

In Prometheus, run:

```promql
up{service="metrics-app"}
```

Expected: a series with value `1` for the new target, proving Prometheus is scraping your custom Service.

### Cleanup

```bash
# Ctrl+C in the two port-forward terminals
kubectl delete -f servicemonitor.yaml -f app.yaml
helm uninstall monitoring -n monitoring
kubectl delete namespace monitoring
```

### Summary

You installed the full monitoring stack, drove both Grafana dashboards and PromQL queries, instrumented a Service with a ServiceMonitor, and confirmed Prometheus scrapes your custom target.

---

<a id="lab-28"></a>

## Lab 28 - Centralized Logging (Loki and Promtail)

### Prerequisite

- Completion of [Lesson 28 - Centralized Logging (Loki and Promtail)](../docs/08-observability/lesson-28-centralized-logging-loki-and-promtail.md).
- A running kind cluster.
- kubectl and helm installed.

### Objective

Install Loki, Promtail, and a Grafana pre-configured with a Loki datasource, then hunt a specific error log with LogQL.

### Estimated Time

20 minutes.

---

### Step 1: Install the stack

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install loki grafana/loki --namespace loki --create-namespace --set service.type=ClusterIP
helm install promtail grafana/promtail --namespace loki
helm install my-grafana grafana/grafana --namespace loki \
  --set admin.user=admin --set admin.password=admin \
  --set datasources."datasources\.yaml".apiVersion=1 \
  --set datasources."datasources\.yaml".datasources[0].name=Loki \
  --set datasources."datasources\.yaml".datasources[0].type=loki \
  --set datasources."datasources\.yaml".datasources[0].url=http://loki:3100 \
  --set datasources."datasources\.yaml".datasources[0].access=proxy
kubectl get pods -n loki -w
```

Expected: after a couple of minutes `loki`, `promtail-*` (a DaemonSet), and `my-grafana` are all `Running`.

### Step 2: Explore self logs

```bash
kubectl port-forward svc/my-grafana 3000:80 -n loki
```

Open `http://localhost:3000` (admin/admin). Go to Explore (compass icon), select the Loki data source, and run:

```logql
{namespace="loki"}
```

Expected: logs from the Loki and Promtail pods.

### Step 3: Deploy an error-generating Pod

```bash
kubectl run error-generator --image=busybox:latest \
  --restart=Never -- sh -c "while true; do echo 'ERROR: Database connection lost!'; sleep 5; done"
```

### Step 4: Find the error in Loki

In Grafana Explore run:

```logql
{namespace="default"} |= "ERROR"
```

Expected: the `ERROR: Database connection lost!` lines stream in from the `error-generator` pod.

### Step 5: Inspect Promtail targets

```bash
kubectl port-forward svc/loki-promtail 9080:9080 -n loki
```

Open `http://localhost:9080/targets`. Expected: the local node shows as a target with active log discovery.

### Verification

```bash
kubectl logs error-generator
```

Expected: matches the same `ERROR: Database connection lost!` lines you found in Grafana, confirming Promtail delivered them.

### Cleanup

```bash
# Ctrl+C in the two port-forward terminals
kubectl delete pod error-generator
helm uninstall loki -n loki
helm uninstall promtail -n loki
helm uninstall my-grafana -n loki
kubectl delete namespace loki
```

### Summary

You stood up a full Loki + Promtail + Grafana logging stack, verified Promtail shipped node logs, and located a specific error using a LogQL filter across the cluster.

---

<a id="lab-29"></a>

## Lab 29 - Helm

### Prerequisite

- Completion of [Lesson 29 - Helm](../docs/09-packaging/lesson-29-helm.md).
- A running kind cluster.
- kubectl installed and configured.

### Objective

Install Helm, create a basic chart, deploy it, and then perform a rollback. Understand the difference between raw YAML and Helm-managed deployments.

### Estimated Time

20 minutes.

---

### Step 1: Install Helm CLI

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
helm version
```

Expected output:

```
version.BuildInfo{Version:"v3.x.x", GitCommit:"xxx", GitTreeState:"clean", GoVersion:"go1.x.x"}
```

### Step 2: Generate a Basic Helm Chart

```bash
helm create my-app
cd my-app
```

### Step 3: Simplify the Templates

```bash
rm templates/*.yaml templates/*.tpl
rm -rf templates/tests
rm templates/NOTES.txt
```

### Step 4: Write Your Own Template

Create `templates/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-deployment
  labels:
    app: {{ .Values.appName }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Values.appName }}
  template:
    metadata:
      labels:
        app: {{ .Values.appName }}
    spec:
      containers:
      - name: {{ .Values.appName }}
        image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
        ports:
        - containerPort: 80
```

### Step 5: Write Your Own Values File

```yaml
appName: my-nginx
replicaCount: 2

image:
  repository: nginx
  tag: alpine
```

### Step 6: Test the Rendering (Dry Run)

```bash
helm template my-web .
```

Expected output: A perfectly formed Deployment YAML with your values injected.

### Step 7: Install Your Custom Chart

```bash
helm install my-web .
```

Verify it worked:

```bash
kubectl get deployments
```

Expected output: A deployment named `my-web-deployment` with 2 replicas.

### Step 8: Simulate a Bad Upgrade

```bash
helm upgrade my-web . --set image.tag=broken-tag-123
```

Check the pods:

```bash
kubectl get pods
```

Expected output: A new Pod trying to start, but failing with `ImagePullBackOff`.

### Step 9: Rollback

```bash
helm history my-web
helm rollback my-web 1
```

Check the pods again:

```bash
kubectl get pods
```

Expected output: The broken pod is gone, and the healthy alpine pods are running.

### Step 10: Cleanup

```bash
helm uninstall my-web
cd ..
```

---

### What You Learned

- Helm is the package manager for Kubernetes.
- A Chart is a package containing templates and default values.
- Values are injected into templates to generate the final YAML.
- Helm stores release history as Secrets in the namespace.
- `helm rollback` instantly reverts a failed deployment.

### Next Steps

Proceed to [Lesson 30 - Helm Deep Dive (Writing Production Charts)](../docs/09-packaging/lesson-30-helm-deep-dive-writing-production-charts.md) to learn about the Kubernetes-native alternative to Helm.

---

[Back to Labs](../labs/README.md)

---

<a id="lab-30"></a>

## Lab 30 - Helm Deep Dive (Writing Production Charts)

### Objective

Build a full lifecycle of a production-style Helm chart: scaffold it with `helm create`, understand the template structure, add values, validate it with `helm template`, install it, upgrade it, roll it back, and add a pre-install hook example. By the end you will manage a release through the entire Helm lifecycle and see how hooks execute outside the normal render path.

### Prerequisites

- Completion of [Lesson 30 - Helm Deep Dive (Writing Production Charts)](../docs/09-packaging/lesson-30-helm-deep-dive-writing-production-charts.md).
- A running kind (or equivalent) cluster.
- Helm CLI installed.
- kubectl installed and configured.

### Pre-Lab Checklist

Run each command and confirm the expected output before starting.

```bash
helm version
```

Expected output:

```
version.BuildInfo{Version:"v3.x.x", GitCommit:"xxx", GitTreeState:"clean", GoVersion:"go1.x.x"}
```

```bash
kubectl cluster-info
```

Expected output: The cluster control plane URL and CoreDNS section, confirming the cluster is reachable.

---

### Step 1: Scaffold a Chart with `helm create`

```bash
helm create my-api
cd my-api
```

List the generated structure:

```bash
find . -type f -not -path './.helmignore'
```

Expected output: A standard chart tree that includes `Chart.yaml`, `values.yaml`, `values.schema.json`, a `templates/` folder with `_helpers.tpl`, `deployment.yaml`, `service.yaml`, `ingress.yaml`, a `tests/` folder, `NOTES.txt`, and more.

### Step 2: Understand the Template Structure

View the generated chart layout:

```bash
tree .
```

If `tree` is not installed, list templates directly:

```bash
ls -la templates
```

Expected output:

```
total X
drwxrwxr-x ... .
drwxrwxr-x ... ..
drwxrwxr-x ... tests
-rw-rw-r-- ... _helpers.tpl
-rw-rw-r-- ... deployment.yaml
-rw-rw-r-- ... hpa.yaml
-rw-rw-r-- ... ingress.yaml
-rw-rw-r-- ... NOTES.txt
-rw-rw-r-- ... service.yaml
-rw-rw-r-- ... serviceaccount.yaml
```

The default chart is complete but heavy. For this lab, open `templates/_helpers.tpl` and `templates/deployment.yaml`:

```bash
cat templates/_helpers.tpl
```

Expected output: Named sub-templates that build the standard `app.kubernetes.io/*` label set used across all resources. These helpers are the reason every generated resource shares consistent labels, which tooling such as Prometheus and kube-state-metrics rely on.

### Step 3: Add Values to Build a Clean Structure

Simplify the chart to focus on the core concepts. Remove the generated templates you will not use:

```bash
rm templates/hpa.yaml
rm templates/serviceaccount.yaml
rm templates/ingress.yaml
rm -rf templates/tests
rm templates/NOTES.txt
```

Replace `values.yaml` with a clean, staged structure:

```yaml
replicaCount: 2

image:
  repository: nginx
  tag: alpine

service:
  port: 80

ingress:
  enabled: true
  path: /

env:
  LOG_LEVEL: debug
  DB_HOST: postgres-svc
```

Expected result: a `values.yaml` file whose keys (except the `image` tag) exactly match what the templates render. Value names become the contract between `values.yaml` and the templates.

### Step 4: Understand and Rewrite the Templates

Rewrite `templates/deployment.yaml` with a loop over the `env` map:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-api
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}
    spec:
      containers:
      - name: app
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: {{ .Values.service.port }}
        env:
        {{- range $key, $value := .Values.env }}
        - name: {{ $key }}
          value: {{ $value | quote }}
        {{- end }}
```

Write `templates/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-svc
spec:
  selector:
    app: {{ .Release.Name }}
  ports:
  - port: {{ .Values.service.port }}
    targetPort: {{ .Values.service.port }}
```

Write how a conditional Ingress would be structured. Create `templates/ingress.yaml`:

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ .Release.Name }}-ingress
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: {{ .Values.ingress.path }}
        pathType: Prefix
        backend:
          service:
            name: {{ .Release.Name }}-svc
            port:
              number: {{ .Values.service.port }}
{{- end }}
```

Expected result: three template files where the Deployment, Service, and Ingress all derive names and labels from `.Release.Name`, and only the Ingress is guarded by a conditional.

### Step 5: Render with `helm template`

Dry-run the chart without touching the cluster:

```bash
helm template my-release .
```

Expected output: Rendered `deployment.yaml` and `service.yaml` with `nginx:stable` injected, two environment variables emitted by the `range` loop, an Ingress block present, and no Helm comments left in the YAML.

Validate syntax with the linter:

```bash
helm lint .
```

Expected output:

```
1 chart(s) linted, 0 chart(s) failed
```

Test the conditional by disabling the Ingress:

```bash
helm template my-release . --set ingress.enabled=false
```

Expected output: The rendered output contains the Deployment and Service but no Ingress block, proving the `if` guard works.

### Step 6: Install the Chart with `helm install`

```bash
helm install my-api .
```

Expected output:

```
NAME: my-api
LAST DEPLOYED: <timestamp>
NAMESPACE: default
STATUS: deployed
REVISION: 1
```

Verify the release and its resources:

```bash
helm list
kubectl get deployments
kubectl get ingress
```

Expected output: `helm list` shows the `my-api` release with status `deployed`; `kubectl get deployments` shows one deployment; `kubectl get ingress` shows the `my-api-ingress` because `ingress.enabled` defaults to `true`.

### Step 7: Upgrade the Chart with `helm upgrade`

Change the replica count and image tag, then upgrade the running release:

```bash
helm upgrade my-api . --set replicaCount=3 --set image.tag=perl
```

Expected output: revision bumps to `2`, status `deployed`. Check the change:

```bash
helm history my-api
kubectl get deployments
```

Expected output: `helm history` shows Revisions 1 and 2; the Deployment now runs 3 replicas with the Perl image.

### Step 8: Roll Back the Chart with `helm rollback`

Force a broken image to demonstrate a failed upgrade:

```bash
helm upgrade my-api . --set image.tag=broken-tag-123
```

Expected output: The upgrade succeeds from Helm's perspective, but the new pods cannot pull the image:

```bash
kubectl get pods
```

Expected output: pods stuck in `ImagePullBackOff` for the broken tag.

Roll the release back to the last known good revision:

```bash
helm rollback my-api 2
```

Wait for the rollout to complete, then re-check:

```bash
kubectl rollout status deployment/my-api-api
kubectl get pods
```

Expected output: The `broken-tag-123` pods are replaced and the stable Perl pods return to `Running`, restoring the healthy state.

### Step 9: Add a Pre-Install Hook Example

Create `templates/cleanup-job.yaml` that runs before any other resource is installed:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ .Release.Name }}-pre-install-cleanup
  annotations:
    helm.sh/hook: pre-install
    helm.sh/hook-weight: "5"
    helm.sh/hook-delete-policy: before-hook-creation,hook-succeeded
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: cleanup
        image: busybox:1.36
        command: ["sh", "-c", "echo cleaning stale resources for {{ .Release.Name }}"]
```

Do a dry run to see the hook surfaces separately:

```bash
helm template preinstall-test . --set image.tag=perl
```

Expected output: The Job with the `helm.sh/hook` annotations appears alongside the normal manifests, and it is clearly a `Job` with `restartPolicy: Never`.

Install a new release to trigger the hook:

```bash
helm install preinstall . --set image.tag=perl
```

Expected output: Helm creates the pre-install Job first, waits for it to succeed, then deploys the rest of the resources. Confirm the hook ran:

```bash
kubectl get jobs
kubectl logs -l job-name=preinstall-pre-install-cleanup --tail=5
```

Expected output: a completed Job and the log line `cleanup resources for preinstall`.

---

### Cleanup

Remove the releases and clean up the working directory:

```bash
helm uninstall my-api
helm uninstall preinstall --wait
kubectl get pods
cd ..
```

Expected output: both releases are deleted, their resources are removed, and `kubectl get pods` returns no remaining pods.

---

### What You Learned

- `helm create` scaffolds a complete, ready-to-run chart.
- Templates use built-in objects such as `.Release.Name` and Value-driven conditionals and loops.
- `helm template` renders charts locally for review before anything touches the cluster.
- `helm install`, `helm upgrade`, and `helm rollback` cover the full release lifecycle.
- Helm hooks such as `pre-install` run before the main resources and are the way to attach ordering and clone-up logic.
- `helm uninstall` tears everything down and clears the release state.

### Next Steps

Proceed to [Lesson 43](../docs/14-certifications/lesson-43-cka-exam-masterclass.md) to deepen your operational Kubernetes skills, or review [Lesson 29 - Helm](../docs/09-packaging/lesson-29-helm.md) to reinforce the fundamentals.

---

[Back to Labs](../labs/README.md)

---

<a id="lab-31"></a>

## Lab 31 - GitOps Principles and Practices

### Prerequisite

- Completion of [Lesson 31 - GitOps Principles and Practices](../docs/10-gitops/lesson-31-gitops-principles-and-practices.md).
- A running kind cluster.
- kubectl installed and configured.

### Objective

Install ArgoCD, deploy an app from a public Git repository, and then try to manually break it to watch ArgoCD self-heal.

### Estimated Time

25 minutes.

---

### Step 1: Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Wait for all the ArgoCD pods to be running:

```bash
kubectl get pods -n argocd
```

### Step 2: Access the ArgoCD UI

Get the admin password:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

Open a second terminal window and run this to port-forward the UI:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Open your web browser and go to: `https://localhost:8080`

(Your browser will warn you about a self-signed certificate. Click "Advanced" -> "Proceed to localhost").

- Username: `admin`
- Password: (Paste the password from above)

### Step 3: Create an ArgoCD Application via YAML

Create `argo-app.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    targetRevision: HEAD
    path: guestbook
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

Apply it:

```bash
kubectl apply -f argo-app.yaml
```

### Step 4: Watch it Deploy

Go back to your browser UI. Click on the guestbook application. You will see a visual tree of the Deployment and Service. It should turn green and say "Healthy" and "Synced".

Verify in your terminal:

```bash
kubectl get pods -n default
```

### Step 5: Self-Heal Test (Breaking Things on Purpose)

Scale the deployment:

```bash
kubectl scale deployment guestbook-ui --replicas=5
```

Verify it scaled up:

```bash
kubectl get pods -l app=guestbook-ui
```

(You should temporarily see 5 pods).

Wait for ArgoCD to react (about 10-20 seconds), then run the command again:

```bash
kubectl get pods -l app=guestbook-ui
```

**Your Task:**

- After waiting, how many pods are running now?
- Look at the ArgoCD UI in your browser. Did the UI color or status change temporarily when you scaled it?
- Based on the theory of `selfHeal: true`, explain exactly what ArgoCD did to your manual change.

(Answer: 1. 1 pod. 2. It likely flashed "OutOfSync" briefly. 3. ArgoCD noticed the live cluster had 5 replicas, but Git desired state had 1. Because `selfHeal` was true, it sent a PATCH to scale it back to 1).

### Step 6: Cleanup

```bash
kubectl delete application guestbook -n argocd
kubectl delete namespace argocd
kubectl delete deployment guestbook-ui
kubectl delete svc guestbook-ui
```

---

### What You Learned

- GitOps means your entire cluster configuration lives in a Git repository.
- ArgoCD is a pull-based CD tool that runs inside your cluster.
- It constantly compares Git (Desired State) with the cluster (Live State).
- If `selfHeal` is enabled, ArgoCD automatically overwrites manual changes.
- ArgoCD uses Kubernetes CRDs, meaning an "Application" is just another native Kubernetes object.

### Next Steps

Proceed to [Lesson 32 - CI/CD Pipelines (GitHub Actions and ArgoCD)](../docs/10-gitops/lesson-32-cicd-pipelines-github-actions-and-argocd.md) to compare GitOps tools.

---

[Back to Labs](../labs/README.md)

---

<a id="lab-32"></a>

## Lab 32 - CI/CD Pipelines (GitHub Actions and ArgoCD)

### Prerequisite

- Completion of [Lesson 32 - CI/CD Pipelines (GitHub Actions and ArgoCD)](../docs/10-gitops/lesson-32-cicd-pipelines-github-actions-and-argocd.md).
- A GitHub account and a repository you can push to.
- A kind cluster (optional, for the ArgoCD step).

### Objective

Build the end-to-end GitOps flow: a Flask app, a Dockerfile, a GitHub Actions workflow that builds an image and bumps the Helm values, and ArgoCD-based deployment to a kind cluster.

### Estimated Time

30 minutes.

---

### Step 1: Create the application files

In a new GitHub repository, add:

`app.py`:

```python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello from my CI/CD app!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

`Dockerfile`:

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY . .
RUN pip install flask
EXPOSE 5000
CMD ["python", "app.py"]
```

### Step 2: Add the Helm chart

Create `helm/Chart.yaml` and `helm/values.yaml`:

```yaml
# helm/Chart.yaml
apiVersion: v2
name: myapp
version: 0.1.0
```

```yaml
# helm/values.yaml
replicaCount: 2
image:
  repository: <YOUR_DOCKER_USERNAME>/myapp
  tag: latest
service:
  port: 80
```

### Step 3: Add the GitHub Actions workflow

Create `.github/workflows/deploy.yml` with the workflow from Lesson 32 (build, push to Docker Hub, update `helm/values.yaml` image.tag with `${{ github.sha }}`, commit and push back).

### Step 4: Configure Secrets and permissions

- Add `DOCKER_USERNAME` and `DOCKER_PASSWORD` as repository Secrets (Settings -> Secrets and variables -> Actions).
- In Settings -> Actions -> General -> Workflow permissions, enable "Read and write permissions".

### Step 5: Run the pipeline

Push all files to `main` and open the Actions tab.

Expected: the workflow runs, builds and pushes the image tagged `myapp:<sha>`, updates `helm/values.yaml` `image.tag` to `<sha>`, and pushes a new commit.

Expected after: the Git history contains a commit titled `Update image tag to <sha>`.

### Step 6 (Optional): Deploy with ArgoCD on kind

```bash
kind create cluster --name argocd-lab
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
# Wait for pods, then register the app pointing at the config repo
argocd app create myapp --repo https://github.com/USER/config.git \
  --path helm --dest-server https://kubernetes.default.svc
```

Expected: ArgoCD syncs the Helm chart and the Deployment runs with the new image tag.

### Verification

- `git log --oneline -3` shows the manifest-bump commit.
- (Optional with ArgoCD) `kubectl get deploy -n default` shows a rollout with the new image.

### Cleanup

Delete the kind cluster if you created it:

```bash
kind delete cluster --name argocd-lab
```

### Summary

You authored a CI pipeline that builds an image and bumps a Helm manifest, and watched how ArgoCD pulls that Git change into Kubernetes, completing the GitOps loop without any direct kubectl access from CI.

---

<a id="lab-33"></a>

## Lab 33 - Extending Kubernetes (CRDs and Operators)

### Objective

In this lab you will extend a running kind cluster by teaching the API Server a new object type through a Custom Resource Definition (CRD). You will install a `CronTab` CRD, verify the API Server registers the new endpoint, create a Custom Resource (CR) instance of it, intentionally try to create a CR before the CRD exists to observe the exact API rejection, trigger a schema validation failure with a bad field, and then explore how a real-world operator such as Cert-Manager registers and manages its own CRDs.

### Prerequisites

- A running kind cluster
- kubectl installed and configured
- Completion of Lessons 1 through 32

### Pre-Lab Checklist

- [ ] kind cluster running
- [ ] `kubectl get nodes` shows Ready status
- [ ] kubectl can reach the default namespace
- [ ] Internet access for the optional Cert-Manager step
- [ ] `curl` available for the optional Cert-Manager install

---

### Step 1: Define the CronTab CRD

Create a file named `crontab-crd.yaml`:

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: crontabs.stable.example.com
spec:
  group: stable.example.com
  scope: Namespaced
  names:
    plural: crontabs
    singular: crontab
    kind: CronTab
    shortNames:
    - ct
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              cronSpec:
                type: string
              image:
                type: string
```

Key facts about this manifest:

- `metadata.name` must be `<plural>.<group>`, in this case `crontabs.stable.example.com`.
- `spec.scope: Namespaced` means every instance lives inside a namespace.
- `spec.names.shortNames` registers `ct` as a fast alias for `kubectl`.
- `spec.versions[].schema.openAPIV3Schema` is the OpenAPI v3 schema the API Server uses to validate every `CronTab` CR. It declares `spec.cronSpec` and `spec.image` as strings.

### Step 2: Apply the CRD and Verify the API Server Learned It

Apply the CRD:

```bash
kubectl apply -f crontab-crd.yaml
```

Expected output:

```text
customresourcedefinition.apiextensions.k8s.io/crontabs.stable.example.com created
```

Verify the CRD is registered:

```bash
kubectl get crd
```

Expected output:

```text
NAME                        CREATED AT
crontabs.stable.example.com  ...
```

Wait a few seconds for the API Server to register the new endpoint, then confirm the new API group is discoverable:

```bash
kubectl api-resources | grep crontabs
```

Expected output:

```text
crontabs                                   crontab.stable.example.com/v1        false        CronTab
```

The third column (`false`) means the resource is namespaced. The API Server now accepts `CronTab` objects under the group `stable.example.com/v1`.

### Step 3: Create a CronTab Custom Resource

Create a file named `my-cron.yaml`:

```yaml
apiVersion: stable.example.com/v1
kind: CronTab
metadata:
  name: my-cron
spec:
  cronSpec: "* * * * */5"
  image: my-cron-image:v1
```

Apply it:

```bash
kubectl apply -f my-cron.yaml
```

Expected output:

```text
crontab.stable.example.com/my-cron created
```

List instances using the plural name:

```bash
kubectl get crontabs
```

Expected output:

```text
NAME      AGE
my-cron   10s
```

List instances using the `ct` short name:

```bash
kubectl get ct
```

Expected output:

```text
NAME      AGE
my-cron   10s
```

The CR is now stored in etcd just like any built-in resource.

### Step 4: Create a CR Before the CRD Exists (Expected Rejection)

Clean up first so the CRD is gone, then try to create a CR. Delete the CRD only (keep `my-cron.yaml` on disk):

```bash
kubectl delete -f crontab-crd.yaml
```

Delete the CR instance if it still exists:

```bash
kubectl delete crontab my-cron
```

Now try to apply the CR without the CRD:

```bash
kubectl apply -f my-cron.yaml
```

Expected output and error:

```text
error: unable to recognize "my-cron.yaml": no matches for kind "CronTab" in version "stable.example.com/v1"
```

This is the exact error the API Server returns. The server is strictly typed: it searches its internal registry for a schema matching kind `CronTab` in group `stable.example.com/v1`, finds nothing, and rejects the request. No CR is created because the CRD that defines the schema is missing.

Restore the CRD for the remaining steps:

```bash
kubectl apply -f crontab-crd.yaml
```

### Step 5: Trigger a Schema Validation Failure

Re-apply the valid CR first:

```bash
kubectl apply -f my-cron.yaml
```

Now create a file named `bad-crontab.yaml` with an unknown field under `spec`. The CRD schema does not declare `spec.parallelism`, so the API Server must reject it:

```yaml
apiVersion: stable.example.com/v1
kind: CronTab
metadata:
  name: bad-cron
spec:
  cronSpec: "* * * * *"
  image: my-cron-image:v1
  parallelism: 4
```

Apply it:

```bash
kubectl apply -f bad-crontab.yaml
```

Expected output and error:

```text
The CronTab "bad-cron" is invalid: spec.parallelism: Forbidden: unknown field 'parallelism' in io.k8s.apiextensions-apiserver.pkg.apis.apiextensions.v1.CronTab.spec
```

The OpenAPI v3 schema is enforced. Because the CRD does not declare a `parallelism` property, the API Server rejects the CR and does not store it. This is a validation failure, completely separate from the `no matches for kind` rejection in Step 4.

### Step 6: Inspect the CRD and CR with explain and describe

`kubectl explain` reads the CRD schema and prints the fields kubectl knows about:

```bash
kubectl explain crontab.spec
```

Expected output:

```text
KIND:     CronTab
VERSION:  stable.example.com/v1

RESOURCE: spec <object>

DESCRIPTION:
     <empty>apis
```

To see the full schema, served versions, and scope:

```bash
kubectl describe crd crontabs.stable.example.com
```

Expected output (abbreviated):

```text
Name:         crontabs.stable.example.com
Scope:        Namespaced
Kind:         CronTab
Metadata:
  Creation Timestamp:  ...
Spec:
  Group:  stable.example.com
  Names:
    Kind:       CronTab
    Plural:     crontabs
    Short Names:
      ct
    Singular:   crontab
  Scope:        Namespaced
  Versions:
    Name:  v1
    Served:  true
    Storage:  true
```

### Step 7: Observe That No Controller Exists Yet

The CRD enabled the API Server to store `my-cron`, but nothing reconciles it. List the Pods to confirm the cluster did not create anything from the CR:

```bash
kubectl get pods
```

Expected output:

```text
No resources found in default namespace.
```

A CRD alone is a passive schema. A `CronTab` CR is just data in etcd. The Operator pattern is what adds the reconciliation loop that watches the CR and provisions real Deployments, Services, or other resources based on it. Without an Operator watching `stable.example.com/v1`, nothing acts on the CR.

#### Optional: Cert-Manager as a Real Operator Example

Install Cert-Manager, a popular operator, and inspect the CRDs it registers with the API Server:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml
```

Verify the operator registered its own CRDs:

```bash
kubectl get crd | grep cert-manager
```

Expected output (abbreviated):

```text
certificaterequests.cert-manager.io     2026-...
certificates.cert-manager.io           2026-...
issuers.cert-manager.io                2026-...
orders.acme.cert-manager.io            2026-...
```

Create an issuer-style kind like `Certificate` or `Issuer`, and let the Cert-Manager pods watch it and write the TLS Secret for you. Unlike your `CronTab`, a `Certificate` CR is reconciled: the Cert-Manager operator sees it, obtains the certificate, and creates the Secret.

```bash
kubectl get pods -n cert-manager
```

Expected output (abbreviated):

```text
NAME                                       READY   STATUS    RESTARTS   AGE
cert-manager-xxxx-xxxxx                    1/1     Running   0          25s
cert-manager-cainjector-xxxx-xxxxx         1/1     Running   0          25s
cert-manager-webhook-xxxx-xxxxx            1/1     Running   0          25s
```

Optional cleanup of the Cert-Manager installation:

```bash
kubectl delete -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml
```

### Step 8: Cleanup

Delete the custom resources and the CRD:

```bash
kubectl delete -f my-cron.yaml
kubectl delete -f crontab-crd.yaml
```

Verify the cluster returns to a clean state and the API group registry deregisters the kind:

```bash
kubectl get ct
```

Expected output:

```text
error: the server doesn't have a resource type "ct"
```

Also visible through the full CRD list:

```bash
kubectl get crd | grep crontabs
```

The `crontabs.stable.example.com` row disappears. Deleting the CRD deletes all of its stored Custom Resources cluster-wide.

---

### Lab Questions

1. What exactly happens at the API Server when you `kubectl apply` a Custom Resource (CR) and the corresponding CRD does not exist yet?
2. What is the difference between a CRD and a CR? Use `CronTab` and `my-cron` as examples.
3. `kubectl get ct` works but `kubectl get crontabs` works too. What feature of the CRD makes both work?
4. The CRD schema in this lab does not define `spec.parallelism`. What happens if you apply a CR containing that field?
5. After you create a `CronTab` CR, no Pods appear. Why? What pattern would make them appear?
6. How does Cert-Manager prove the Operator Pattern? Name the CRDs it registers and what a `Certificate` or `Issuer` CR causes the operator to do.

---

### Expected Results

After completing this lab:

- You know how to define a CRD with an OpenAPI v3 schema and a custom API group
- You saw the API register the new kind, including the discoverable `crontabs` plural and `ct` short name
- You reproduced the exact `no matches for kind` error and the exact schema validation rejection
- You confirmed that a CR without a controller is just stored state in etcd
- You installed a real operator (Cert-Manager) and saw it register and reconcile its own CRDs

---

### Key Commands Reference

| Command | Purpose |
|---------|---------|
| `kubectl apply -f crontab-crd.yaml` | Register a new CRD with the API Server |
| `kubectl get crd` | List all Custom Resource Definitions |
| `kubectl api-resources \| grep crontabs` | Confirm the new API group and scope |
| `kubectl apply -f my-cron.yaml` | Create a Custom Resource instance |
| `kubectl get crontabs` / `kubectl get ct` | List CRs using the plural or short name |
| `kubectl explain crontab.spec` | Show the CRD's fields from the schema |
| `kubectl describe crd crontabs.stable.example.com` | Show the CRD's versions, scope, and schema |
| `kubectl get crd \| grep cert-manager` | List the CRDs registered by Cert-Manager |

---

### Next

- Return to the [Lesson 33 file](../docs/11-operators/lesson-33-extending-kubernetes-crds-and-operators.md) to review the concepts
- Apply `kubectl explain crontab` before and after the schema, and add `spec.schedule` with a `required` list to see validation in action
- Try the Mini Project from the lesson: install Cert-Manager, create a `Certificate` CR, and watch the operator create the TLS Secret
- Proceed to Lesson 34 to build an operator of your own with the Operator SDK

---

<a id="lab-34"></a>

## Lab 34 - Operators in Practice

### Objective

In this lab you will learn how Operators extend Kubernetes by building and running a custom CRD plus controller, then installing a battle-tested Operator (the Redis Operator) to manage a real stateful workload. You will observe the reconciliation loop in action and prove that the Operator enforces the desired state after failures.

### Prerequisites

- A running kind cluster
- kubectl installed and configured
- Helm CLI installed
- Completion of Lessons 1 through 33, specifically Lesson 32 on CRDs

### Pre-Lab Checklist

- [ ] kind cluster running
- [ ] `kubectl get nodes` shows Ready status
- [ ] `helm version` returns a valid version
- [ ] Understand the difference between a CRD, a CR, and a controller

---

### Step 1: Create a Simple CRD

A CRD provides the schema for a new API resource. Kubernetes stores instances of it, but nothing reacts to it until a controller watches it.

Create `website-crd.yaml`:

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: websites.example.com
spec:
  group: example.com
  names:
    kind: Website
    listKind: WebsiteList
    singular: website
    plural: websites
    shortNames:
    - web
  scope: Namespaced
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              host:
                type: string
              replicas:
                type: integer
                minimum: 1
                maximum: 10
```

Apply it:

```bash
kubectl apply -f website-crd.yaml
```

Expected output:

```text
customresourcedefinition.apiextensions.k8s.io/websites.example.com created
```

### Step 2: Inspect the CRD

Verify the CRD is registered and explore its schema:

```bash
kubectl get crd websites.example.com
```

Expected output:

```text
NAME                   CREATED AT
websites.example.com   <current-time>
```

Inspect the full schema:

```bash
kubectl describe crd websites.example.com
```

**Your Task:**

- What is the API group for this custom resource?
- What are the short names you can use to list instances of it?
- Is the resource cluster-scoped or namespace-scoped?

### Step 3: Apply a Custom Resource

Create `website-cr.yaml`:

```yaml
apiVersion: example.com/v1
kind: Website
metadata:
  name: shop-demo
spec:
  host: shop.demo.local
  replicas: 2
```

Apply it:

```bash
kubectl apply -f website-cr.yaml
```

Expected output:

```text
website.example.com/shop-demo created
```

List all instances using the short name:

```bash
kubectl get websites
```

Expected output:

```text
NAME        HOST            REPLICAS   AGE
shop-demo   shop.demo.local   2        <age>
```

### Step 4: Observe the Controller Behavior

A CRD alone does nothing. No Pods, Services, or ConfigMaps are created automatically. Verify the cluster is idle:

```bash
kubectl get configmaps,deployments,pods
```

Expected output:

```text
No resources found
```

This proves the CR is inert until a controller watches it. Now deploy a controller that reacts to the `website` custom resource. The controller watches the API Server and reconciles each CR by creating a ConfigMap encoding its declared host. If the ConfigMap is removed, the controller recreates it on the next reconcile.

Create `website-controller.yaml`:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: website-controller
  namespace: default
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: website-controller
rules:
- apiGroups: ["example.com"]
  resources: ["websites"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list", "watch", "create", "update", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: website-controller
subjects:
- kind: ServiceAccount
  name: website-controller
  namespace: default
roleRef:
  kind: ClusterRole
  name: website-controller
  apiGroup: rbac.authorization.k8s.io/v1
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: website-controller
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: website-controller
  template:
    metadata:
      labels:
        app: website-controller
    spec:
      serviceAccountName: website-controller
      containers:
      - name: controller
        image: bitnami/kubectl:1.28
        command:
        - /bin/bash
        - -c
        - |
          while true; do
            for cr in $(kubectl get websites.example.com -o name 2>/dev/null); do
              name="${cr##*/}"
              if ! kubectl get configmap "web-$name" >/dev/null 2>&1; then
                host=$(kubectl get websites.example.com "$name" -o jsonpath='{.spec.host}')
                kubectl create configmap "web-$name" --from-literal=host="$host"
              fi
            done
            sleep 5
          done
```

Apply it:

```bash
kubectl apply -f website-controller.yaml
```

Wait for the controller to reconcile, then verify:

```bash
kubectl get configmap web-shop-demo -o yaml
```

Expected output:

```text
apiVersion: v1
data:
  host: shop.demo.local
kind: ConfigMap
metadata:
  name: web-shop-demo
  ...
```

### Step 5: Watch the Controller Reconcile a Change

Delete the ConfigMap the controller created, then watch the reconciliation loop restore it:

```bash
kubectl delete configmap web-shop-demo
```

Wait five to ten seconds for the next reconcile cycle, then check:

```bash
kubectl get configmaps
```

Expected output:

```text
NAME              DATA   AGE
web-shop-demo     1      <short-age>
```

The ConfigMap came back because the controller continuously compares Live State (no ConfigMap) with Desired State (the CR) and creates the missing piece. Now remove the custom resource and watch the effect:

```bash
kubectl delete website shop-demo
```

The controller creates nothing new because the desired state no longer exists. This mirrors how Operators handle lifecycle management.

### Step 6: Install the Redis Operator

Now use a real, battle-tested Operator to manage a stateful application. Add the OT Container Kit Helm repository and install the Redis Operator:

```bash
helm repo add ot-helm https://ot-container-kit.github.io/helm-charts/
helm repo update
helm install redis-operator ot-helm/redis-operator --namespace redis-operator-system --create-namespace
```

Wait for the Operator Pod to be running:

```bash
kubectl get pods -n redis-operator-system
```

Expected output:

```text
NAME                              READY   STATUS    RESTARTS   AGE
redis-operator-<hash>-<pod>        1/1     Running   0          <age>
```

### Step 7: Create a Redis Cluster and Observe Reconciliation

Create `redis-cluster.yaml`:

```yaml
apiVersion: redis.opstreelabs.in/v1beta2
kind: Redis
metadata:
  name: my-redis
spec:
  redis:
    replicas: 3
    image: redis:7.0-alpine
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 200m
        memory: 256Mi
  kubernetesConfig:
    imagePullPolicy: IfNotPresent
    updateStrategy:
      type: RollingUpdate
```

Apply it:

```bash
kubectl apply -f redis-cluster.yaml
```

Watch the Operator create the Pods automatically:

```bash
kubectl get pods -l app=my-redis -w
```

Press Ctrl+C when all three Pods are `Running`. Then inspect the StatefulSet the Operator created:

```bash
kubectl get statefulset
```

Expected output:

```text
NAME        READY   AGE
my-redis    3/3     <age>
```

Inspect the Operator's view of the custom resource status:

```bash
kubectl describe redis my-redis
```

### Step 8: Confirm the Reconciliation Loop Recovers State

Simulate a crash by deleting a Redis Pod, then watch the StatefulSet controller recreate it:

```bash
kubectl delete pod my-redis-0
kubectl get pods -l app=my-redis -w
```

Press Ctrl+C once all Pods are `Running` again.

Now delete the entire StatefulSet to prove the Operator re-provisions managed resources:

```bash
kubectl delete statefulset my-redis
```

Watch the Pods return:

```bash
kubectl get pods -l app=my-redis -w
```

**Your Task:**

1. What happened when you deleted the `my-redis-0` Pod? Did it come back?
2. What happened when you deleted the entire StatefulSet? Did the Pods come back?
3. Based on the reconciliation loop, explain exactly what the Operator did when you deleted the StatefulSet.

Answer: 1. Yes, the StatefulSet controller recreated it. 2. Yes, the Pods came back. 3. The Operator's reconciliation loop detected that the Live state (zero StatefulSets) did not match the Desired state (the CR still declares 3 replicas). It immediately constructed a new StatefulSet YAML and sent it to the API Server, which recreated the Pods.

### Step 9: Prove the Operator Drives State (Optional)

Scale the Operator to zero to simulate an unavailable Operator, then try to scale the Redis cluster:

```bash
kubectl scale deployment redis-operator -n redis-operator-system --replicas=0
kubectl patch redis my-redis --type='json' -p='[{"op": "replace", "path": "/spec/redis/replicas", "value": 1}]'
kubectl get statefulset my-redis
```

The StatefulSet still shows 3 replicas because the Operator is dead and nothing reconciles the change. Bring the Operator back and watch it converge:

```bash
kubectl scale deployment redis-operator -n redis-operator-system --replicas=1
sleep 30
kubectl get statefulset my-redis
```

Expected output now shows `my-redis` scaled to 1 replica.

### Cleanup

Remove the custom resources and all controllers:

```bash
kubectl delete website shop-demo
kubectl delete configmap web-shop-demo 2>/dev/null
kubectl delete -f website-controller.yaml
kubectl delete -f website-crd.yaml
kubectl delete redis my-redis
helm uninstall redis-operator -n redis-operator-system
kubectl delete namespace redis-operator-system
```

Verify nothing remains:

```bash
kubectl get crd | grep -i example.com
kubectl get pods -n redis-operator-system
```

Both commands should return no results.

---

### Expected Results

After completing this lab:

- You can create a CRD, apply a custom resource, and inspect its schema
- You understand that a CRD is inert until a controller watches it
- You can run a lightweight controller that reconciles desired state
- You can install a real Operator with Helm and let it manage a stateful application
- You can demonstrate how an Operator reconciles state after failures

### Key Commands Reference

| Command | Purpose |
|---------|---------|
| `kubectl apply -f website-crd.yaml` | Register a custom resource definition |
| `kubectl get websites` | List instances of a custom resource |
| `kubectl describe redis my-redis` | Inspect the Operator's status and errors |
| `kubectl get statefulset` | Verify resources the Operator created |
| `kubectl logs -n redis-operator-system <pod>` | Read Operator logs to diagnose issues |

---

### Next

- Return to the [Lesson 34 file](../docs/11-operators/lesson-34-operators-in-practice.md) to review the concepts
- Try the Mini Project: Install the Prometheus Operator via Helm, create a `Prometheus` CR, delete its Pod, and watch it recover
- Proceed to the next lesson to learn about packaging with Helm

---

<a id="lab-35"></a>

## Lab 35 - Building a 3-Tier Web Application

### Objective

In this lab you will deploy a 3-tier application (Database, Backend API, Frontend Web) and wire them together using Kubernetes Services and CoreDNS. You will then intentionally break the backend to practice DNS troubleshooting.

### Prerequisites

- A running kind cluster
- kubectl installed and configured
- Completion of Lessons 1 through 23

### Pre-Lab Checklist

- [ ] kind cluster running
- [ ] `kubectl get nodes` shows Ready status
- [ ] Understand Services and DNS basics

---

### Step 1: Create the Database Tier

Create the DB tier with Redis and a Secret:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
stringData:
  redis-password: "supersecret123"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-db
spec:
  replicas: 1
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
      - name: redis
        image: redis:alpine
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: redis-password
---
apiVersion: v1
kind: Service
metadata:
  name: redis-db
spec:
  selector:
    app: db
  ports:
  - port: 6379
EOF
```

Wait for the Redis pod to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=db --timeout=60s
```

### Step 2: Create the Backend Tier

Create the Backend API Deployment and Service:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: busybox:latest
        command: ["sh", "-c", "while true; do echo 'Backend: Checking DB...'; nc -z -w2 redis-db 6379 && echo 'Backend: DB is reachable!' || echo 'Backend: DB unreachable'; sleep 5; done"]
---
apiVersion: v1
kind: Service
metadata:
  name: backend-api
spec:
  selector:
    app: backend
  ports:
  - port: 80
EOF
```

### Step 3: Create the Frontend Tier

Create the Frontend Deployment, ConfigMap, and Service:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
data:
  index.html: |
    <html><body><h1>Welcome to the Frontend!</h1><p>Try connecting to the backend API.</p></body></html>
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-web
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        volumeMounts:
        - name: config-volume
          mountPath: /usr/share/nginx/html
      volumes:
      - name: config-volume
        configMap:
          name: frontend-config
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-web
spec:
  selector:
    app: frontend
  ports:
  - port: 80
EOF
```

### Step 4: Verify the Connections

Check all pods are running:

```bash
kubectl get pods
```

Wait for all pods to reach Running status:

```bash
kubectl wait --for=condition=ready pod -l app=backend --timeout=60s
kubectl wait --for=condition=ready pod -l app=frontend --timeout=60s
```

Check Backend logs to verify it can reach the DB:

```bash
kubectl logs -l app=backend --tail=5
```

You should see "Backend: DB is reachable!".

Now verify the Frontend can talk to the Backend:

```bash
kubectl exec -it deploy/frontend-web -- wget -qO- http://backend-api
```

You will get a Connection refused error. This is expected because the Backend is running netcat, not a web server. The important thing is that DNS routing worked - it found the Backend Pod.

### Step 5: Examine DNS Resolution

Let's look at how CoreDNS resolves the service names.

Check the endpoints for each service:

```bash
kubectl get endpoints redis-db
kubectl get endpoints backend-api
kubectl get endpoints frontend-web
```

Test DNS resolution from inside a pod:

```bash
kubectl exec -it deploy/frontend-web -- nslookup redis-db
kubectl exec -it deploy/frontend-web -- nslookup backend-api
```

Check the `/etc/resolv.conf` to see CoreDNS configuration:

```bash
kubectl exec -it deploy/frontend-web -- cat /etc/resolv.conf
```

### Step 6: Break Things on Purpose

Apply a broken backend with a typo in the DB name:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: busybox:latest
        command: ["sh", "-c", "while true; do echo 'Backend: Checking DB...'; nc -z -w2 redis-database 6379 && echo 'Backend: DB is reachable!' || echo 'Backend: DB unreachable'; sleep 5; done"]
EOF
```

Wait about 15 seconds for the new Pod to start, then check the logs:

```bash
kubectl logs -l app=backend --tail=10
```

**Your Task:**

- What does the Backend log say now? Is the DB reachable or unreachable?
- Inside the Pod, the `nc` command is failing. What cluster component is failing to resolve the name `redis-database`?
- If this were a real production app written in Python or Node.js, what specific error type would the application likely throw when trying to connect to a non-existent database DNS name?

### Step 7: Fix It

Now fix the backend to use the correct DNS name:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: busybox:latest
        command: ["sh", "-c", "while true; do echo 'Backend: Checking DB...'; nc -z -w2 redis-db 6379 && echo 'Backend: DB is reachable!' || echo 'Backend: DB unreachable'; sleep 5; done"]
EOF
```

Wait for the new pod to start:

```bash
kubectl wait --for=condition=ready pod -l app=backend --timeout=60s
```

Verify it's working again:

```bash
kubectl logs -l app=backend --tail=5
```

### Step 8: Expose the Frontend

Port-forward the frontend service to access it locally:

```bash
kubectl port-forward svc/frontend-web 8080:80
```

Open a browser and go to `http://localhost:8080`. You should see the "Welcome to the Frontend!" page.

Press `Ctrl+C` to stop port-forwarding.

### Step 9: Cleanup

```bash
kubectl delete -f frontend-tier.yaml
kubectl delete -f backend-tier.yaml
kubectl delete -f db-tier.yaml
kubectl delete -f broken-backend.yaml
```

Or delete by label:

```bash
kubectl delete deployments --all
kubectl delete services --all
kubectl delete configmaps --all
kubectl delete secrets db-secret
```

---

### Lab Questions

1. Why does the Backend Pod need to use a Service DNS name instead of a Pod IP address?
2. What would happen to the application if the Redis database Pod crashed but the Deployment has `replicas: 1`?
3. If you deploy the Database in namespace `data-tier` and the Backend in namespace `app-tier`, what FQDN would the Backend use to connect to the Database?
4. How could you prevent the Frontend from directly accessing the Database using Network Policies?

---

### Expected Results

After completing this lab:
- You understand how to wire a 3-tier application together
- You can verify DNS resolution using `nslookup`
- You can troubleshoot DNS failures (NXDOMAIN)
- You know when to use Services vs Pod IPs
- You understand the role of CoreDNS in Kubernetes networking

---

### Key Commands Reference

| Command | Purpose |
|---------|---------|
| `kubectl logs -l app=backend --tail=5` | Check backend logs |
| `kubectl exec -it deploy/<name> -- sh` | Open shell in pod |
| `kubectl get endpoints <svc-name>` | Check service endpoints |
| `nslookup <service-name>` | Test DNS resolution |
| `nc -z -w2 <host> <port>` | Test TCP connectivity |
| `kubectl port-forward svc/<name> <local>:<remote>` | Access service locally |

---

### Next

- Return to the [Lesson 35 file](../docs/12-production/lesson-35-building-a-3-tier-web-application.md) to review the concepts
- Try the advanced task: Deploy a StatefulSet database instead of a Deployment for production-grade storage
- Proceed to the next lesson to learn about Autoscaling

---

<a id="lab-36"></a>

## Lab 36 - Horizontal Pod Autoscaler

### Objective

In this lab you will deploy an application, configure a Horizontal Pod Autoscaler (HPA), generate traffic load, and watch Kubernetes automatically scale Pods up and down based on CPU usage.

### Prerequisites

- A running kind cluster
- kubectl installed and configured
- Metrics Server installed
- Completion of Lessons 1 through 25

### Pre-Lab Checklist

- [ ] kind cluster running
- [ ] Metrics Server installed (`kubectl top nodes` works)
- [ ] Understand HPA basics from Lesson 36

---

### Step 1: Verify Metrics Server

```bash
kubectl top nodes
```

If this works, Metrics Server is running. If not, install it:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
```

Wait 30 seconds and try again.

### Step 2: Deploy the App

Create `hpa-app.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-apache
spec:
  replicas: 1
  selector:
    matchLabels:
      run: php-apache
  template:
    metadata:
      labels:
        run: php-apache
    spec:
      containers:
      - name: php-apache
        image: registry.k8s.io/hpa-example
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 200m
          limits:
            cpu: 500m
```

Apply it:

```bash
kubectl apply -f hpa-app.yaml
```

Wait for it to be Running:

```bash
kubectl wait --for=condition=ready pod -l run=php-apache --timeout=60s
```

### Step 3: Expose the App

```bash
kubectl expose deployment php-apache --port=80
```

### Step 4: Create the HPA

Create `hpa.yaml`:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: php-apache-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-apache
  minReplicas: 1
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

Apply it:

```bash
kubectl apply -f hpa.yaml
```

Check the HPA status:

```bash
kubectl get hpa
```

You should see `TARGETS: 0%/50%` or similar. 0% because there is no traffic right now.

### Step 5: Generate Traffic (The Spike)

Open a second terminal and run:

```bash
kubectl run -i --tty load-generator --rm --image=busybox:latest -- /bin/sh -c "while true; do wget -q -O- http://php-apache; done"
```

Leave this running. It is hammering the app with requests.

### Step 6: Watch the Autoscaler React

Go back to your first terminal. Wait about 60 seconds, then run:

```bash
kubectl get hpa
kubectl get pods -l run=php-apache
```

**Your Task:**

- Look at `kubectl get hpa`. What is the TARGETS percentage now? (It should jump well over 50%).
- Look at `kubectl get pods -l run=php-apache`. Did the number of Pods increase from 1?

### Step 7: Watch Scale Down

Go to your second terminal and press `Ctrl+C` to stop the load generator.

Wait 3-5 minutes, then check:

```bash
kubectl get hpa
kubectl get pods -l run=php-apache
```

**Your Task:**

- What happened to the CPU percentage?
- What happened to the replica count after the cool-down period?

### Step 8: Check HPA Details

```bash
kubectl describe hpa php-apache-hpa
```

Look at the Events section to see the scaling actions.

### Step 9: Cleanup

```bash
kubectl delete hpa php-apache-hpa
kubectl delete deployment php-apache
kubectl delete svc php-apache
```

---

### Lab Questions

1. Why does HPA need `resources.requests.cpu` to be defined?
2. What is the formula HPA uses to calculate the desired number of replicas?
3. Why is there a 5-minute cool-down period for scale-down?
4. How would you scale based on memory usage instead of CPU?
5. What happens if you set `minReplicas: 0` with standard CPU-based HPA?

---

### Expected Results

After completing this lab:
- You can deploy an HPA targeting a Deployment
- You understand how HPA reacts to CPU load
- You know the difference between scale-up and scale-down behavior
- You can debug HPA issues with `kubectl describe hpa`

---

### Key Commands Reference

| Command | Purpose |
|---------|---------|
| `kubectl get hpa` | Show current metrics vs target |
| `kubectl describe hpa <name>` | Debug HPA issues |
| `kubectl top pods` | Verify Metrics Server is working |
| `kubectl get pods -o wide` | See pod scaling in action |

---

### Next

- Return to the [Lesson 36 file](../docs/12-production/lesson-36-horizontal-pod-autoscaler.md) to review the concepts
- Try the advanced task: Configure HPA with memory-based scaling
- Proceed to the next lesson to learn about High Availability and Multi-Zone Deployments

---

<a id="lab-37"></a>

## Lab 37 - Cluster Upgrades and Maintenance

### Objective

In this lab you will safely take a node out of the cluster for maintenance, migrate workload off of it, restore it, and walk through the complete kubeadm upgrade flow. You will demonstrate the cordon, drain, uncordon cycle and understand how a real cluster upgrade sequences the control plane and worker nodes.

### Prerequisites

- A running kind cluster, ideally multi-node with 2 worker nodes (`kind-worker` and `kind-worker2`)
- kubectl installed and configured with the correct context
- Completion of Lesson 37 on cordon, drain, and PodDisruptionBudgets

### Pre-Lab Checklist

- [ ] kind cluster running and `kubectl get nodes` shows all nodes `Ready`
- [ ] Decide which node you will patch (for example `kind-worker`)
- [ ] Confirm no production traffic is running on the lab cluster

---

### Step 1: Deploy an App

Deploy a scaled workload so there is something to migrate:

```bash
kubectl create deployment web-app --image=nginx:alpine --replicas=3
```

Confirm the Pods are running and note which node each Pod lands on:

```bash
kubectl get pods -o wide
```

Expected output shows 3 `web-app` Pods in `Running` status spread across the nodes, for example `kind-worker` and `kind-worker2`.

### Step 2: Cordon the Node

Pretend `kind-worker` needs a Linux security patch. Mark it so it stops accepting new Pods:

```bash
kubectl cordon kind-worker
```

Expected output:

```text
node/kind-worker cordoned
```

Verify the node status:

```bash
kubectl get nodes
```

Expected output shows `kind-worker` as `Ready,SchedulingDisabled`. The node is still `Ready`; it simply will not accept new Pods. Existing Pods keep running.

### Step 3: Attempt a Raw Drain (The Protection)

Try to evict the Pods without any flags:

```bash
kubectl drain kind-worker
```

The command fails with an error because Kubernetes refuses to evict certain Pod types by default. The exact error text depends on your workloads, but it will list unmanaged Pods, DaemonSet Pods, or Pods using emptyDir volumes.

Note: The error deliberately refuses to evict these Pods and instructs you to add `--ignore-daemonsets` and `--delete-emptydir-data` if you are sure.

Examine what lives on the node to understand the protection:

```bash
kubectl get pods -o wide --all-namespaces
```

**Your Task:**

1. Did the raw drain succeed, or did it error out?
2. Which two Pod types is Kubernetes protecting by refusing to evict them?
3. Why does Kubernetes protect these Pods from eviction?

### Step 4: Drain the Node with the Correct Flags

For a normal maintenance window we deliberately bypass the protections because DaemonSet Pods (monitoring, logging, networking agents) are recreated on reboot and any emptyDir data on this node is disposable.

```bash
kubectl drain kind-worker --ignore-daemonsets --delete-emptydir-data
```

Run the Drain using the Eviction API. The Pods are evicted gracefully and the ReplicaSet recreates them on `kind-worker2`. Verify:

```bash
kubectl get pods -o wide
kubectl get nodes
```

**Your Task:**

1. Did the drain command succeed this time?
2. Look at the `NODE` column. Did all `web-app` Pods move to `kind-worker2`?
3. What is the status of `kind-worker` now?

### Step 5: Perform the Node Maintenance

The node is now empty of user workloads, so you can patch your OS or replace hardware. In a local kind or minikube environment this is simulated by simply letting the node sit cordoned and drained.

Since a real OS reboot is outside the scope of the lab, you can simulate the maintenance window by inspecting the node and confirming it has no schedulable workload:

```bash
kubectl describe node kind-worker
```

Scroll to `Taints` and `Non-terminated Pods`. Confirmed node should show the maintenance taint and no user Pods.

### Step 6: Uncordon and Return the Node to the Pool

The patch is applied and the node is ready to accept workload again:

```bash
kubectl uncordon kind-worker
```

Expected output:

```text
node/kind-worker uncordoned
```

Verify the node is schedulable again:

```bash
kubectl get nodes
```

Expected output shows `kind-worker` as `Ready` with no `SchedulingDisabled` marker.

### Step 7: The kubeadm Upgrade Flow (Local Simulation)

A real control plane upgrade cannot run in a kind or minikube environment, which use single-node control planes that do not run the `kubeadm` upgrade tool directly. These commands are shown for reference so you understand the production flow. The sequence always upgrades the control plane first, then the workers.

Check the current Kubernetes version:

```bash
kubectl get nodes -o wide
```

For a reference-based [UPGRADE_TARGET], a platform-node upgrade proceeds through these three stages:

Stage 1, Update the kubeadm binary to the target version:

```text
apt-get update && apt-get install -y kubeadm=UPGRADE_TARGET
```

Stage 2, Run the kubeadm upgrade plan and execute it on the control plane:

```text
kubeadm upgrade plan
kubeadm upgrade apply UPGRADE_TARGET
```

Stage 3, Drain, upgrade kubelet and kubectl, then uncordon on each worker node:

```text
kubectl drain kind-worker --ignore-daemonsets
apt-get update && apt-get install -y kubelet=UPGRADE_TARGET kubectl=UPGRADE_TARGET
systemctl restart kubelet
kubectl uncordon kind-worker
```

Your Task (conceptual):

1. Why must you enter the control plane before the worker nodes?
2. Which command performs each of the three stages: bring-down, package upgrade, bring-up?
3. What is the equivalent of cordon in the worker upgrade flow above?

### Step 8: Cleanup

Remove the deployment created at the start:

```bash
kubectl delete deployment web-app
```

Confirm your cluster is back to its pre-lab state:

```bash
kubectl get nodes
kubectl get pods
```

---

### Lab Questions

1. What is the difference between cordon and drain?
2. Why does drain fail unless you pass `--ignore-daemonsets` and `--delete-emptydir-data`?
3. In the kubeadm flow, why is the control plane upgraded before the worker nodes?
4. What would happen if you forgot to run uncordon after maintenance completed?

---

### Expected Results

After completing this lab:

- You can cordon, drain, and uncordon a node
- You understand the default eviction protections
- You can walk through the kubeadm control plane and worker upgrade sequence
- You know why PodDisruptionBudgets must be checked before draining

---

### Key Commands Reference

| Command | Purpose |
|---------|---------|
| `kubectl cordon <node>` | Stop new Pods from scheduling on a node |
| `kubectl drain <node> --ignore-daemonsets --delete-emptydir-data` | Evict workloads so the node can be maintained |
| `kubectl uncordon <node>` | Allow scheduling again after maintenance |
| `kubectl get nodes` | Show scheduling status of all nodes |
| `kubeadm upgrade plan` | Preview the target cluster upgrade |
| `kubeadm upgrade apply <version>` | Apply the upgrade to the control plane |

---

### Next

- Return to the [Lesson 37 file](../docs/12-production/lesson-37-cluster-upgrades-and-maintenance.md) to review cordon, drain, and PodDisruptionBudget concepts
- Try the Mini Project: define a PodDisruptionBudget with `minAvailable: 3` and observe a drain holding at the PDB
- Proceed to the next lesson to learn about high availability and multi-zone deployments

---

<a id="lab-38"></a>

## Lab 38 - Backups and Disaster Recovery with Velero

### Objective

In this lab you will run MinIO inside your kind cluster as an S3-compatible backup target, install the Velero CLI and the Velero server with the AWS provider, create an on-demand backup of a stateful workload with a PVC-backed Persistent Volume, simulate a disaster by deleting the namespace, and restore everything from the backup. You will also create a scheduled backup with a cron expression to learn how Velero automates disaster recovery.

### Prerequisites

- A running kind cluster
- kubectl installed and configured
- Completion of Lessons 1 through 38
- Understanding of Persistent Volumes, PVCs, and StorageClasses from Module 05

### Pre-Lab Checklist

- [ ] kind cluster running
- [ ] `kubectl get nodes` shows Ready status
- [ ] `wget` or `curl` available for downloading the Velero CLI
- [ ] A terminal session long enough to run a full install and restore cycle
- [ ] At least 2 GB of free disk space for MinIO and the backup data

---

### Step 1: Install the Velero CLI

Download the Velero CLI and move it onto your PATH:

```bash
wget https://github.com/vmware-tanzu/velero/releases/download/v1.11.1/velero-v1.11.1-linux-amd64.tar.gz
tar -xzf velero-v1.11.1-linux-amd64.tar.gz
sudo mv velero-v1.11.1-linux-amd64/velero /usr/local/bin/
velero version
```

Expected output:

```text
Client Version: v1.11.1
Server Version: v1.11.1
```

Replace `v1.11.1` in the URLs with the current Velero release if you prefer a newer version.

### Step 2: Run MinIO In-Cluster as the S3 Target

In production you point backups at managed object storage such as AWS S3. In this lab, run an S3-compatible MinIO server inside the cluster so Velero has a real S3 endpoint to write to.

Create the MinIO manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: minio
  namespace: minio-backup
spec:
  replicas: 1
  selector:
    matchLabels:
      app: minio
  template:
    metadata:
      labels:
        app: minio
    spec:
      containers:
      - name: minio
        image: minio/minio:latest
        args:
        - server
        - /data
        env:
        - name: MINIO_ROOT_USER
          value: minio
        - name: MINIO_ROOT_PASSWORD
          value: minio123
        ports:
        - containerPort: 9000
---
apiVersion: v1
kind: Service
metadata:
  name: minio
  namespace: minio-backup
spec:
  type: ClusterIP
  selector:
    app: minio
  ports:
  - port: 9000
    targetPort: 9000
```

Save the manifest as `minio.yaml` and apply it:

```bash
kubectl apply -f minio.yaml
```

Wait for the MinIO pod to be Ready:

```bash
kubectl wait --for=condition=available deployment/minio -n minio-backup --timeout=5m
kubectl get pods -n minio-backup
```

Expected output:

```text
NAME                    READY   STATUS    RESTARTS   AGE
minio-6f7bf8c6b9-v2x4k   1/1     Running   0          26s
```

Velero will reference this endpoint as the in-cluster hostname `minio.minio-backup.svc:9000`.

### Step 3: Create the Credentials File and Bucket

Create a local credentials file in the AWS format that Velero expects:

```bash
mkdir -p /tmp/velero-lab
cat > /tmp/velero-lab/credentials << 'EOF'
[default]
aws_access_key_id = minio
aws_secret_access_key = minio123
EOF
```

Create the S3 bucket by running the MinIO client as a one-shot pod:

```bash
kubectl run minio-mc --image=minio/mc --restart=Never --attach --rm \
  --command -- sh -c 'mc alias set local http://minio.minio-backup.svc:9000 minio minio123 && mc mb local/velero-backups'
```

Expected output:

```text
Adding local... up-to-date
Bucket created successfully "velero-backups".
```

### Step 4: Install the Velero Server with `velero install`

Install Velero with the AWS provider pointed at MinIO. Path-style S3 URLs are required because MinIO does not use virtual-hosted-style bucket addresses:

```bash
velero install \
    --provider aws \
    --bucket velero-backups \
    --secret-file /tmp/velero-lab/credentials \
    --backup-location-config region=minio,s3ForcePathStyle="true",s3Url=http://minio.minio-backup.svc:9000 \
    --plugins velero/velero-plugin-for-aws:v1.7.1 \
    --use-volume-snapshots=false \
    --use-restic
```

Explanation:

- `--provider aws`: Velero uses the AWS S3 client, which is compatible with any S3 API.
- `--bucket velero-backups`: The S3 bucket created in Step 3.
- `--secret-file`: The credentials file the Velero server mounts as a Secret.
- `--backup-location-config`: Points Velero at the in-cluster MinIO endpoint.
- `s3ForcePathStyle=true`: Required for MinIO and other non-AWS S3-compatible targets.
- `--use-volume-snapshots=false`: Cloud disk snapshots are not available in kind.
- `--use-restic`: Captures Persistent Volume data at the file level through Restic. This is how the PVC data is restored in a later step.
- `--plugins velero/velero-plugin-for-aws:v1.7.1`: The plugin that implements the AWS S3 object storage interface for Velero. It is what lets Velero talk to MinIO.

Plugin and Velero versions must match. Plugin tag versions change between release cycles, and an outdated tag produces `Failed listing backup-locations` errors. Verify what is actually running before assuming the install worked:

```bash
kubectl -n velero get pods -l component=velero
velero plugin list
```

Expected output:

```text
NAME    TYPE
velero.io/aws/backup-storage-location   BackupStorageLocation
velero.io/aws/volume-snapshotter        VolumeSnapshotter
velero.io/aws/restic                    RestoreItemAction
```

Wait for the Velero server to be ready:

```bash
kubectl wait --for=condition=available deployment/velero -n velero --timeout=5m
```

Verify the Backup Storage Location is `Available`:

```bash
velero backup-location get
```

Expected output:

```text
NAME           PROVIDER   BUCKET           PHASE       LAST VALIDATED                 ACCESS MODE
default        aws        velero-backups   Available   2026-08-09 15:05:14 +0000 UTC  [ReadWrite]
```

### Step 5: Deploy a Sample Workload with a PVC

Create a namespace and a workload that writes a file to a Persistent Volume, so the backup must capture both YAML and PV data:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app-data
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: app-pv
  labels:
    type: local
spec:
  storageClassName: manual
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteOnce
  hostPath:
    path: /data/app
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-pvc
  namespace: app-data
spec:
  storageClassName: manual
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  namespace: app-data
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
      - name: app
        image: busybox
        command:
        - /bin/sh
        - -c
        - sleep 3600
        volumeMounts:
        - name: data
          mountPath: /data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: app-pvc
```

Save it as `app-workload.yaml` and apply it. A plain kind cluster has no dynamic storage provisioner, so a static hostPath PV + PVC pair is used to bind immediately:

```bash
kubectl apply -f app-workload.yaml
kubectl get pv app-pv
kubectl get pvc -n app-data
```

Expected output:

```text
NAME     CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM          STORAGECLASS   VOLUME   AGE
app-pv   1Gi        RWO            Retain          Bound    app-data/app-pvc  manual       app-pv   12s

NAME       STATUS   VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
app-pvc   Bound    app-pv   1Gi         ReadWriteOnce  manual         12s
```

Write a marker line to the volume so it can prove the file survived the disaster:

```bash
kubectl wait --for=condition=available deployment/app -n app-data --timeout=5m
kubectl exec deployment/app -n app-data -- sh -c 'echo precious-company-log > /data/journal.txt'
kubectl exec deployment/app -n app-data -- cat /data/journal.txt
```

Expected output:

```text
precious-company-log
```

### Step 6: Create a Velero Backup

Create an on-demand backup of the `app-data` namespace:

```bash
velero backup create app-backup --include-namespaces app-data
```

Expected output:

```text
Backup request "app-backup" submitted successfully.
```

Wait for the backup to finish and inspect it:

```bash
velero backup get app-backup
velero backup describe app-backup --details
```

Wait until the phase reads `Completed`:

```text
Name:         app-backup
Namespace:    velero
Labels:       velero.io/storage-location=default
Status:
  Phase:  Completed
```

The detail view also lists the namespaces and the Restic pod-volume backups that were taken for the PVC. A successful file-level backup of the PVC is recorded as `app-data/app-pvc: <backed-up>`.

### Step 7: Simulate a Disaster

Delete the entire namespace, which removes the Deployment and PVC:

```bash
kubectl delete namespace app-data
```

Confirm the namespace is gone:

```bash
kubectl get namespace app-data
```

Expected output:

```text
Error from server (NotFound): namespace "app-data" not found
```

Because the PV uses `ReclaimPolicy: Retain`, the hostPath volume still exists on the node. Wipe the data directory on the node so the volume is genuinely empty, exactly how a lost cloud disk behaves:

```bash
docker exec kind-control-plane rm -rf /data/app-data
docker exec kind-control-plane ls /data/app-data
```

Expected output:

```text
ls: cannot access '/data/app-data': No such file or directory
```

### Step 8: Restore from Backup

Restore the namespace and everything inside it from the backup taken in Step 5:

```bash
velero restore create app-data-restore \
    --from-backup app-data \
    --include-namespaces app-data
```

Expected output:

```text
Restore request "app-data-restore" submitted successfully.
```

Wait for the restore to complete:

```bash
velero restore get app-data-restore
velero restore describe app-data-restore
```

The describe output reports `Phase: Completed` and lists `Completed` items such as the namespace, PVC, and Deployment.

Verify the namespace, Deployment, PVC, and Pod were recreated:

```bash
kubectl get ns | grep app-data
kubectl get all -n app-data
kubectl get pvc -n app-data
```

Wait for the Pod to be Ready:

```bash
kubectl wait --for=condition=available deployment/app -n app-data --timeout=5m
```

Confirm the Persistent Volume data was restored along with the YAML:

```bash
kubectl exec deployment/app -n app-data -- cat /data/journal.txt
```

Expected output:

```text
precious-company-log
```

### Step 9: Create a Scheduled Backup (Optional)

Automatic backups are more reliable than manual ones. Create a `Schedule` that backs up the `app-data` namespace daily at 2 AM and keeps each backup for 30 days:

```bash
velero schedule create app-nightly --schedule="0 2 * * *" --include-namespaces app-data --ttl 720h
```

Expected output:

```text
Schedule "app-nightly" created from cron expression 0 2 * * *
```

List the schedules:

```bash
velero schedule get
```

Expected output:

```text
NAME         STATUS    CREATED                         SCHEDULE    BACKUP TTL   LAST BACKUP   SELECTOR
app-data     Created   2026-08-09 15:10:00 +0000 UTC   0 2 * * *   720h0m0s     n/a           <none>
```

Backups are only created when the cron expression fires. To confirm automation works, create a temporary schedule that fires every 5 minutes and watch a Backup object appear:

```bash
velero schedule create every-5-min --schedule="*/5 * * * *" --include-namespaces app-data
sleep 310
velero backup get --schedule every-5
```

Once verified, remove the temporary schedule:

```bash
velero schedule delete every-5-min && velero schedule delete app-data
```

### Cleanup

Remove the restore/test schedule, sample workload, MinIO, and the entire Velero installation:

```bash
velero uninstall --yes
kubectl delete namespace velero minio-backup app-data
kubectl delete pv app-pv
rm -f minio.yaml app-workload.yaml /tmp/velero-lab/credentials
rm -rf /tmp/velero-lab
```

Confirm the cluster has returned to a clean state:

```bash
kubectl get all -A
kubectl get ns
```

### Lab Questions

1. Why must `--use-volume-snapshots=false` be used when running Velero on a kind cluster?
2. What is the purpose of `s3ForcePathStyle=true` in the backup location config?
3. What would happen if a backup contained only the namespace YAML but not the Persistent Volume data?
4. How does Velero know where to store backups, and how does it authenticate to MinIO?
5. Why is `velero plugin list` useful after installing, and what breaks when the plugin tag does not match the Velero version?

### Expected Results

After completing this lab:

- You (multiple) can install the Velero CLI and the Velero server into a kind cluster
- You can run an in-cluster MinIO server as an S3-compatible backup target
- You can create a backup of a namespace that contains both YAML and PVC-backed data
- You can delete a namespace, simulate a disaster, and restore the application including its Persistent Volume data
- You can create and inspect a cron-based Velero Schedule
- You understand the Velero plugin model and how plugin tags affect the backup location

### Key Commands Reference

| Command | Purpose |
|---------|---------|
| `velero install ...` | Installs the Velero server with a BackupStorageLocation |
| `velero backup-location get` | Shows the configured BSL and its `Available` phase |
| `velero plugin list` | Lists the plugins loaded by the installed Velero server |
| `velero backup create <name> --include-namespaces <ns>` | Creates an on-demand backup |
| `velero backup describe <name> --details` | Shows backup phase and included resources |
| `velero restore create --from-backup <name> --include-namespaces <ns>` | Restores a namespace from a backup |
| `velero restore get <name>` | Shows the restore phase |
| `velero schedule create <name> --schedule="0 2 * * *"` | Creates a daily 2 AM scheduled backup |
| `velero uninstall --yes` | Removes the Velero installation and its CRDs |

### Next

- Return to the [Lesson 38 file](../docs/12-production/lesson-38-backups-and-disaster-recovery-with-velero.md) to review the concepts
- Try the Mini Project: Create a Velero `Schedule` that backs up the default namespace every 5 minutes, delete a ConfigMap by hand, and restore it from the latest scheduled backup
- Proceed to the next lesson in Module 12 to learn about production hardening and security best practices

---

<a id="lab-39"></a>

## Lab 39 - Multi-Cluster Kubernetes

### Objective

In this lab you will simulate a multi-cluster environment by creating two kind clusters with distinct names, working with their contexts in a single kubeconfig, running workloads on each cluster, and managing those workloads across contexts. Along the way you will see how config sync (GitOps) and true cross-cluster federation differ, and why the latter is not available locally.

### Prerequisites

- Docker running, because we will create multiple kind clusters
- kind installed
- kubectl installed and configured
- Completion of Lessons 1 through 35

### Pre-Lab Checklist

- [ ] Docker daemon is running (`docker info`)
- [ ] kind installed
- [ ] kubectl installed
- [ ] No existing cluster named `cluster-us` or `cluster-eu`

---

### Step 1: Create Two Kind Clusters with Distinct Names

We will simulate a multi-cluster environment by creating two isolated kind clusters, `cluster-us` and `cluster-eu`, each on its own Kubernetes control plane and its own etcd store.

```bash
kind create cluster --name cluster-us
kind create cluster --name cluster-eu
```

Verify both clusters were created:

```bash
kind get clusters
```

Expected Output:

```
cluster-eu
cluster-us
```

Note that each cluster is fully independent. They do not share state, and etcd does not sync between them. This is exactly what a real multi-cluster architecture looks like, just running locally on Docker.

### Step 2: Verify the Contexts Were Added

When kind creates a cluster, it automatically appends a new context to your kubeconfig. Switch into the default cluster with `minikube` or use the `kubectl config get-clusters` command to see what kind added.

List all clusters known to your kubeconfig:

```bash
kubectl config get-clusters
```

Expected Output:

```
kind-cluster-eu
kind-cluster-us
```

Now list the full contexts with their current selection indicator:

```bash
kubectl config get-contexts
```

Expected Output:

```
CURRENT   NAME              CLUSTER           AUTHINFO        NAMESPACE
*         kind-cluster-us   kind-cluster-us   kind-cluster-us
          kind-cluster-eu   kind-cluster-eu   kind-cluster-eu
```

The `*` marks the current context (initially `kind-cluster-us`). Both contexts live in a single kubeconfig, which is how one engineer manages many clusters from one machine.

### Step 3: Work with Multiple Contexts in a Single Kubeconfig

A kubeconfig file (typically `~/.kube/config`) can hold many clusters, users, and contexts. Inspect what kind added:

```bash
kubectl config view
```

Expected Output:

```
apiVersion: v1
clusters:
- cluster:
    server: https://127.0.0.1:...
  name: kind-cluster-us
- cluster:
    server: https://127.0.0.1:...
  name: kind-cluster-eu
contexts:
- context:
    cluster: kind-cluster-us
    user: kind-cluster-us
  name: kind-cluster-us
- context:
    cluster: kind-cluster-eu
    user: kind-cluster-eu
  name: kind-cluster-eu
current-context: kind-cluster-us
kind: Config
preferences: {}
users:
- name: kind-cluster-us
  user:
    client-certificate-data: REDACTED
    client-key-data: REDACTED
    token: REDACTED
```

Because both cluster contexts are in one kubeconfig, you can switch between them without reconfiguring kubectl.

#### Switch Contexts

```bash
kubectl config use-context kind-cluster-eu
```

Expected Output:

```
Switched to context "kind-cluster-eu".
```

Confirm the switch:

```bash
kubectl config current-context
```

Expected Output:

```
kind-cluster-eu
```

#### List Contexts Again

```bash
kubectl config get-contexts
```

Expected Output:

```
CURRENT          NAME              CLUSTER           AAMINFO         NAMESPACE
                  kind-cluster-us   kind-cluster-us   kind-cluster-us
*                 kind-cluster-eu   kind-cluster-eu   kind-cluster-eu
```

The `*` has moved to `kind-cluster-eu`. You are now operating against the EU cluster.

### Step 4: Deploy the Same Manifest to Both Clusters

Because both contexts point into the same kubeconfig, the exact same commands apply to whichever cluster is current. First, ensure we are on `kind-cluster-us`:

```bash
kubectl config use-context kind-cluster-us
```

Deploy a workload to the US cluster:

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web
        image: nginx:alpine
        ports:
        - containerPort: 80
EOF
```

Verify the pods in the US cluster:

```bash
kubectl get pods -l app=web-app
```

Expected Output:

```
NAME                       READY   STATUS    RESTARTS   AGE
web-app-5d7cc8d6d5-9c2xw   1/1     Running   0          20s
web-app-5d7cc8d6d5-pkx7y   1/1     Running   0          20s
```

Now switch to the EU cluster. Note that the EU cluster is empty because it is a separate control plane:

```bash
kubectl config use-context kind-cluster-eu
kubectl get pods
```

Expected Output:

```
No resources found in default namespace.
```

Deploy the same manifest to the EU cluster:

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web
        image: nginx:alpine
        ports:
        - containerPort: 80
EOF
```

Naming the second deployment is optional because the EU cluster is empty; however, give it a distinct name to keep it readable in the output below. If you prefer a unique-name approach, apply this instead:

```bash
kubectl create deployment web-app-eu --image=nginx:alpine --replicas=2
kubectl get pods
```

Expected Output:

```
NAME                          READY   STATUS    RESTARTS   AGE
web-app-eu-7545d5f76c-7sb5d   1/1     Running   0          12s
web-app-eu-7545d5f76c-m9qrz   1/1     Running   0          12s
```

You now have the same logical application running in two independent clusters, each with its own control plane and etcd store.

### Step 5: Demonstrate Cluster Isolation

Because the clusters share only the kubeconfig file (not their data), changes in one cluster do not affect the other.

Delete the deployment from the US cluster only:

```bash
kubectl config use-context kind-cluster-us
kubectl delete deployment web-app
kubectl get pods -l app=web-app
```

Expected Output:

```
No resources found in default namespace.
```

Now switch back to the EU cluster and confirm its workload is untouched:

```bash
kubectl config use-context kind-cluster-eu
kubectl get pods
```

Expected Output:

```
NAME                          READY   STATUS    RESTARTS   AGE
web-app-eu-7545f26f76c-9wxe3   1/1     Running   0          3m
web-app-eu-7545f26f76c-kr2yq   1/1     Running   0          3m
```

This proves that workloads are isolated per control plane. Deleting a Deployment in one cluster had zero effect on the other, which is the core value of a multi-cluster design: reduced blast radius.

### Step 6: Real Federation and Cross-Cluster Networking (Explained)

True federation means a single control plane coordinating multiple clusters and making them interoperable as one logical cluster. This is what the lesson refers to when it addresses "connectivity" and "registration" between clusters. In production this is implemented via:

- ArgoCD Hub + ApplicationSets: a central server reaches the API server of each target cluster using a kubeconfig and keeps them in sync with Git.
- Cluster API: provisions new clusters and registers them.
- Istio multi-cluster: establishes secure east-west traffic between Pods in different clusters over a shared mesh.

All of these rely on network reachability between the control plane (or mesh) and each cluster's API server. Locally, the two lost-kind clusters run in separate Docker containers on your machine with different IPs but no automatic federation. You can demonstrate the networking boundary by listing the API server addresses:

```bash
kubectl config use-context kind-cluster-us
kubectl cluster-info
```

Expected Output (API server address varies):

```
Kubernetes control plane is running at https://127.0.0.1:32769
```

```bash
kubectl config use-context kind-cluster-eu
kubectl cluster-info
```

Expected Output:

```
Kubernetes control plane is running at https://127.0.0.1:32217
```

Each cluster exposes a separate API server endpoint. There is no shared etcd and no automatic replication between them. To deploy the same app to both, you must either run the command twice (as you did here) or introduce an external coordinator such as ArgoCD. We will not install ArgoCD in this lab; the takeaway is the mechanism, not the deployment tool.

### Step 7: Demo GitOps ApplicationSet (Optional)

The production way to keep both clusters identical is declarative GitOps. The single object below asks ArgoCD to generate one Application per cluster:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: multi-cluster-app
  namespace: argocd
spec:
  generators:
  - list:
      elements:
      - cluster: https://cluster-us-api.example.com
        name: us
      - cluster: https://cluster-eu-api.example.com
        name: eu
  template:
    metadata:
      name: 'web-app-{{name}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/example/my-app
        targetRevision: HEAD
        path: manifests
      destination:
        server: '{{cluster}}'
        namespace: default
      syncPolicy:
        automated: {}
```

This YAML is not applied here because it requires a running ArgoCD instance and API servers that are reachable from the Hub. Refer to Lesson 39 for the full ApplicationSet explanation.

### Step 8: Cleanup

Delete the two clusters to free resources:

```bash
kind delete cluster --name cluster-us
kind delete cluster --name cluster-eu
```

Verify both are gone:

```bash
kind get clusters
```

Expected Output:

```
No kind clusters found.
```

Your kubeconfig is cleaned automatically; run the following to confirm the two host contexts are removed:

```bash
kubectl config get-clusters
```

Expected Output: the previous kind entries are no longer present.

---

### Expected Results

After completing this lab you will be able to:

- Create multiple kind clusters with distinct names.
- Verify and inspect contexts in a single kubeconfig.
- Switch between clusters using `kubectl config use-context`.
- Deploy the same manifest to different clusters.
- Demonstrate isolation between clusters.
- Explain why true cross-cluster federation and networking require external tools.

---

### Key Commands Reference

| Command | Purpose |
|---------|---------|
| `kind create cluster --name <name>` | Create an isolated cluster |
| `kind get clusters` | List all kind clusters |
| `kubectl config get-contexts` | List all contexts in the kubeconfig |
| `kubectl config use-context <name>` | Switch the active cluster |
| `kubectl config view` | Show the full kubeconfig |
| `kubectl cluster-info` | Show the API server endpoint |

---

### Next

- Return to the [Lesson 39 file](../docs/12-production/lesson-39-multi-cluster-kubernetes.md) to review the concepts
- Try the Mini Project: register two kind clusters into a small ArgoCD-managed namespace
- Proceed to the next lesson to learn about capacity planning and cost optimization
- Continue to the certificate: a kubeconfig with many clusters is a core CKA skill

---

<a id="lab-40"></a>

## Lab 40 - Progressive Delivery with Argo Rollouts

### Prerequisites

- Lesson 40 completed.
- A running kind cluster.
- kubectl configured.

### Objective

Deploy an app with a canary strategy, push a good and then a broken update, and observe automatic rollback behavior with Argo Rollouts.

### Step 1 - Install the Argo Rollouts Controller

```bash
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
```

Verify:

```bash
kubectl get pods -n argo-rollouts
```

Expected output (a running controller pod, similar to):

```text
NAME                                READY   STATUS    RESTARTS   AGE
argo-rollouts-xxxxx                 1/1     Running   0          30s
```

### Step 2 - Install the CLI

```bash
curl -sLO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64
chmod +x kubectl-argo-rollouts-linux-amd64
sudo mv kubectl-argo-rollouts-linux-amd64 /usr/local/bin/kubectl-argo-rollouts
kubectl argo rollouts version
```

### Step 3 - Create a Canary Rollout

```bash
cat <<EOF | kubectl apply -f -
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: my-app-rollout
spec:
  replicas: 4
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: nginx:alpine
  strategy:
    canary:
      steps:
      - setWeight: 20
      - pause: {duration: 10s}
      - setWeight: 40
      - pause: {duration: 10s}
      - setWeight: 60
      - pause: {duration: 10s}
      - setWeight: 80
      - pause: {duration: 10s}
EOF
```

### Step 4 - Watch the Initial Rollout

```bash
kubectl argo rollouts get rollout my-app-rollout --watch
```

Expected output: the rollout progresses through steps and ends `Healthy` at weight 100. Ctrl+C to exit.

### Step 5 - A Good Update

```bash
kubectl argo rollouts set image my-app-rollout app=nginx:1.25-alpine
kubectl argo rollouts get rollout my-app-rollout --watch
```

Watch it step 20 -> 40 -> 60 -> 80 -> 100. Ctrl+C.

### Step 6 - A Broken Update and Abort

```bash
kubectl argo rollouts set image my-app-rollout app=nginx:broken-tag-123
```

In a second terminal, abort:

```bash
kubectl argo rollouts abort my-app-rollout
```

### Step 7 - Observations

Check what happened on abort:

```bash
kubectl get replicasets -l app=my-app
kubectl argo rollouts get rollout my-app-rollout
```

Expected behavior:

- The broken Canary ReplicaSet is scaled to 0.
- The Stable ReplicaSet (nginx:1.25-alpine) is scaled back to 4 and serves 100% of traffic.
- Only the small canary percentage ever saw the broken image.

### Cleanup

```bash
kubectl delete rollout my-app-rollout
kubectl delete namespace argo-rollouts
```

[Back to Labs](../labs/README.md)

---

<a id="lab-41"></a>

## Lab 41 - The SRE Troubleshooting Masterclass

### Objective

In this lab you will deploy a multi-tier application with multiple, overlapping, compounding failures. You will use the SRE 5-step methodology to find and fix each issue systematically.

### Prerequisites

- A running kind cluster
- kubectl installed and configured
- Completion of Lessons 1 through 26

### Pre-Lab Checklist

- [ ] kind cluster running
- [ ] `kubectl get nodes` shows Ready status
- [ ] Understand the 5-step troubleshooting methodology

---

### Step 1: Deploy the Broken App

Create `broken-app.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-config
data:
  DB_HOST: "redis-db"
---
apiVersion: v1
kind: Secret
metadata:
  name: db-pass
type: Opaque
stringData:
  password: "mysecretpassword"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-db
spec:
  replicas: 1
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
      - name: redis
        image: redis:7.0-alpine-broken-tag  # FAILURE 1: Bad Image Tag
---
apiVersion: v1
kind: Service
metadata:
  name: redis-db
spec:
  selector:
    app: db
  ports:
  - port: 6379
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: busybox:latest
        command: ["sh", "-c", "while true; do echo 'Pinging DB...'; nc -z -w2 $DB_HOST 6379 && echo 'DB is UP!' || (echo 'DB is DOWN!' && exit 1); sleep 5; done"]
        env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: web-config
              key: DB_HOST_MISSING  # FAILURE 2: Missing ConfigMap Key
```

Apply it:

```bash
kubectl apply -f broken-app.yaml
```

### Step 2: Start the Investigation (Phase 1)

Wait about 10 seconds, then run:

```bash
kubectl get pods
```

You will see a mess. Let's start with the database since the frontend depends on it.

Run:

```bash
kubectl describe pod -l app=db
```

Scroll to the Events section.

**Your Task (Phase 1):**

- What is the STATUS of the `redis-db` pod?
- What is the exact error message in the Events section at the bottom of `kubectl describe`?
- What is the root cause of this specific failure? How do we fix it?

### Step 3: Investigate the Frontend (Phase 2)

Now check the frontend:

```bash
kubectl describe pod -l app=web
```

**Your Task (Phase 2):**

- What is the STATUS of the `web-frontend` pod?
- What error message do you see in the Events?
- What is the root cause?

### Step 4: Apply the Fixes

Open your `broken-app.yaml` file and make these two changes:

1. Under the `redis-db` Deployment, change the image to a valid tag:
   `image: redis:7.0-alpine`
2. Under the `web-frontend` Deployment, change the configMap key to match the actual key:
   `key: DB_HOST`

Save the file, then apply the changes:

```bash
kubectl apply -f broken-app.yaml
```

### Step 5: Verify the Recovery

Wait about 15 seconds, then run:

```bash
kubectl get pods
```

**Your Task:**

- What is the STATUS of the `redis-db` pod now?
- What is the STATUS of the `web-frontend` pod now?
- Run `kubectl logs -l app=web --tail=5`. What is the web frontend printing to the logs?

### Step 6: Add a Third Failure (Advanced)

Now let's add a third failure. Create `broken-app-advanced.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 64Mi
          limits:
            memory: 64Mi  # FAILURE 3: Memory limit too low
---
apiVersion: v1
kind: Service
metadata:
  name: api-server
spec:
  selector:
    app: api
  ports:
  - port: 80
```

Apply it:

```bash
kubectl apply -f broken-app-advanced.yaml
```

Wait 30 seconds, then check:

```bash
kubectl get pods -l app=api
kubectl describe pod -l app=api
```

**Your Task:**

- What is the STATUS of the `api-server` pod?
- What does the Events section say?
- What is the exit code?
- How do you fix this?

### Step 7: Fix the Third Failure

Increase the memory limit:

```bash
kubectl patch deployment api-server -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","resources":{"limits":{"memory":"128Mi"}}}]}}}}'
```

Wait 15 seconds, then verify:

```bash
kubectl get pods -l app=api
```

### Step 8: Cleanup

```bash
kubectl delete -f broken-app.yaml
kubectl delete -f broken-app-advanced.yaml
```

---

### Lab Questions

1. What are the three types of failures you encountered in this lab?
2. For each failure, which step of the 5-step methodology helped you find the root cause?
3. Why is it important to use `kubectl logs <pod> --previous` when a Pod is in CrashLoopBackOff?
4. What would happen if you deleted the broken Pod instead of fixing the YAML first?

---

### Expected Results

After completing this lab:
- You can apply the 5-step troubleshooting methodology
- You can identify ImagePullBackOff, CreateContainerConfigError, and OOMKilled
- You know how to read Events to find root causes
- You understand the importance of not deleting evidence

---

### Key Commands Reference

| Command | Purpose |
|---------|---------|
| `kubectl get pods` | Step 1: Assess the state |
| `kubectl describe pod <name>` | Step 2: Read the Events |
| `kubectl logs <pod> --previous` | Step 3: Read crash logs |
| `kubectl get endpoints <svc>` | Step 4: Check Service routing |
| `kubectl auth can-i <verb> <resource>` | Step 5: Check RBAC |

---

### Next

- Return to the [Lesson 27 file](../docs/13-troubleshooting/lesson-41-sre-troubleshooting-masterclass.md) to review the concepts
- Try the Mini Project: Create your own broken YAML with 3 errors and fix them
- Proceed to the next lesson to learn about networking and cluster-level troubleshooting

---

<a id="lab-42"></a>

## Lab 42 - Node Pressure and Evictions

### Objective

In this lab you will induce real memory pressure on a small, memory-constrained kind node, deploy a memory-hog workload, and watch the kubelet set node conditions and evict Pods to save the node. You will capture the node conditions, the eviction events, and the evicted Pod's terminal state, then clean up everything you created.

### Prerequisites

- A running kind cluster with a small, memory-constrained worker node
- kubectl installed and configured
- Completion of Lessons 1 through 28, especially Lesson 25 (Resource Requests, Limits, and Quotas) and Lesson 27 (SRE Troubleshooting)

### Pre-Lab Checklist

- [ ] `kind` CLI installed
- [ ] `kubectl` installed and configured
- [ ] Docker or your container runtime is running
- [ ] You understand QoS Classes (Guaranteed, Burstable, BestEffort) and the difference between eviction and OOMKilled

---

### Step 1: Create a Memory-Constrained Cluster

A default kind node has too much memory to trigger pressure conveniently. Create a specially configured kind cluster that limits the node's memory so the thresholds are reachable with a small workload.

Create `kind-node-pressure.yaml`:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraEnv:
  - name: KUBELET_KUBECONFIG_ARGS
    value: "--eviction-hard=memory.available<10Mi"
```

Create the cluster:

```bash
kind create cluster --config kind-node-pressure.yaml
```

Verify the cluster and the single node:

```bash
kubectl get nodes
kubectl get nodes -o wide
```

Expected output (the exact IP and version values vary):

```text
NAME                 STATUS   ROLES           AGE   VERSION
node-pressure-test   Ready    control-plane   41s   v1.30.0
```

### Step 2: Inspect the Healthy Node Conditions

Before inducing pressure, record the node's baseline health.

```bash
kubectl describe node node-pressure-test
```

Look at the `Conditions:` and `Allocatable:` sections. In a healthy state the conditions look like this:

```text
Conditions:
  Type             Status  LastHeartbeatTime
  ----             ------  -----------------
  MemoryPressure   False   ...
  DiskPressure     False   ...
  PIDPressure      False   ...
  Ready            True    ...
```

Also record how much memory the node reports as allocatable:

```bash
kubectl describe node node-pressure-test | grep -A 8 Allocatable
```

Note the value under `memory`. This is the budget the scheduler can offer to Pods, and it is the baseline against which pressure thresholds are measured.

### Step 3: Create a Low-Risk Baseline Pod

Deploy a stable, low-priority Pod to observe how the node reacts when pressure arrives. Create `baseline.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: baseline
spec:
  replicas: 1
  selector:
    matchLabels:
      app: baseline
  template:
    metadata:
      labels:
        app: baseline
    spec:
      containers:
      - name: sleeper
        image: busybox:latest
        command: ["sh", "-c", "sleep 3600"]
        resources:
          requests:
            cpu: 10m
            memory: 16Mi
          limits:
            memory: 32Mi
```

Apply it and confirm it runs:

```bash
kubectl apply -f baseline.yaml
kubectl get pods -l app=baseline -w
```

Expected output shows the Pod go from `ContainerCreating` to `Running`:

```text
NAME                       READY   STATUS    RESTARTS   AGE
baseline-                     0/1     ContainerCreating   0     2s
baseline-                     1/1     Running             0     6s
```

Check its QoS class:

```bash
kubectl get pod -l app=baseline -o jsonpath='{.items[0].status.qosClass}'
```

Because request and limit are set, this Pod is `Burstable`.

### Step 4: Deploy the Memory Hog

Now create a memory hog. The kubelet is configured with a hard eviction threshold of `memory.available < 10Mi`, so this workload will push the node over the line.

Create `memory-hog.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: memory-hog
spec:
  replicas: 1
  selector:
    matchLabels:
      app: memory-hog
  template:
    metadata:
      labels:
        app: memory-hog
    spec:
      containers:
      - name: hogger
        image: polinux/stress
        command:
        - stress
        - --vm
        - "2"
        - --vm-bytes
        - "1G"
        - --vm-hang
        - "60"
```

Apply it:

```bash
kubectl apply -f memory-hog.yaml
```

Wait a few seconds for the stress tool to start consuming RAM:

```bash
sleep 15
kubectl get pods
```

You should see the `memory-hog` Pod running, and shortly after you may see it flip to `Evicted` or `OOMKilled` as the node runs out of memory.

### Step 5: Observe the Node Condition Flip to MemoryPressure

While the hog is active, check the node conditions again.

```bash
kubectl describe node node-pressure-test
```

In the `Conditions:` section you should now see `MemoryPressure` set to `True`:

```text
Conditions:
  Type             Status  LastHeartbeatTime
  ----             ------  -----------------
  MemoryPressure   True    ...
  DiskPressure     False   ...
  PIDPressure      False   ...
```

While a node is under pressure, the scheduler also stops placing new Pods on it. This is the kubelet flagging that this node cannot safely accept more workloads.

### Step 6: Find the Eviction Events

The kubelet records an event each time it evicts a Pod. Find those events cluster-wide.

```bash
kubectl get events --all-namespaces
```

Or filter only for evictions:

```bash
kubectl get events -A | grep -i evict
```

Expected output includes lines similar to:

```text
LOWEST    2m10s   Normal    Evicted    pod/memory-hog-...    The node was low on resource: memory. Container hogger was evicted...
```

### Step 7: Inspect the Evicted Pod's Terminal Status

Look at the evicted Pod directly to see its reason and QoS class.

```bash
kubectl get pods -l app=memory-hog
kubectl describe pod -l app=memory-hog
```

In `kubectl describe`, the Pod's status shows `Reason: Evicted` in the `Status` section, and the `Events` section shows that the kubelet evicted it because the node was out of memory.

### Step 8: Let the Node Recover and Confirm the Condition Clears

The ReplicaSet controller notices the evicted Pod and tries to place a replacement. If it keeps landing on the same pressured node, it can be evicted again; if the hog continues, the pressure may persist. To let the node recover, remove the hog, then re-check conditions.

```bash
kubectl delete deployment memory-hog
sleep 15
kubectl describe node node-pressure-test
```

In the `Conditions:` section, `MemoryPressure` should have returned to `False` now that the hog is gone.

### Step 9: Cleanup

Remove every resource created in this lab.

```bash
kubectl delete -f baseline.yaml
kubectl delete -f memory-hog.yaml
kind delete cluster --name node-pressure-test
```

Confirm the last command output:

```text
Deleting cluster "node-pressure-test" ...
```

---

### Lab Questions

1. Which QoS class is evicted first when a node hits memory pressure, and why?
2. What is the difference between a Pod being `Evicted` and a container being `OOMKilled`?
3. What does the scheduler do when a node reports `MemoryPressure=True`?
4. Why might an evicted Pod be recreated and immediately evicted again?

---

### Expected Results

After completing this lab:

- You can create a memory-constrained kind node for safe testing
- You can induce memory pressure and observe the node condition flip to `True`
- You can read eviction events and inspect an evicted Pod's status
- You understand the difference between eviction and OOMKilled

---

### Key Commands Reference

| Command | Purpose |
|---------|---------|
| `kubectl describe node <name>` | Read node conditions and allocatable resources |
| `kubectl get events -A \| grep -i evict` | Find Pods the kubelet evicted |
| `kubectl get pod <name> -o jsonpath='{.status.qosClass}'` | Show a Pod's QoS class |
| `kubectl describe pod <name>` | Inspect an evicted Pod's reason and events |
| `kind delete cluster --name <name>` | Tear down the test cluster |

---

### Next

- Return to the [Lesson 42 file](../docs/13-troubleshooting/lesson-42-node-pressure-and-evictions.md) to review the concepts
- Try the Mini Project: deploy a Guaranteed QoS Pod alongside the hog and confirm it survives while the BestEffort Pod is evicted first
- Proceed to the next lesson to learn about troubleshooting networking and cluster-level issues

---

<a id="lab-43"></a>

## Lab 43 - CKA Exam Masterclass (Speed and Shortcut Techniques)

### Prerequisite

- Completion of [Lesson 43 - CKA Exam Masterclass (Speed and Shortcut Techniques)](../docs/14-certifications/lesson-43-cka-exam-masterclass.md).
- A Linux terminal (Ubuntu) with bash and vim.
- A running kind cluster.
- kubectl installed and configured.

### Objective

Configure your terminal exactly as you would on exam day, then race to create, expose, and inspect workloads using only imperative commands and the `$do` flag. Reach the "60-Second Challenge" at the end.

### Estimated Time

15 minutes.

---

### Step 1: Configure .vimrc

```bash
cat <<EOF > ~/.vimrc
set expandtab
set tabstop=2
set shiftwidth=2
set autoindent
set smartindent
set nu
set ic
EOF
```

Expected: editing `~/.vimrc` writes the settings; any vim session afterward uses 2-space indentation and shows line numbers.

### Step 2: Configure .bashrc aliases and exports

```bash
cat <<EOF >> ~/.bashrc

alias k='kubectl'
alias kg='kubectl get'
alias kgp='kubectl get pods'
alias kgs='kubectl get svc'
alias kgd='kubectl get deploy'
alias kgns='kubectl get ns'
alias kgn='kubectl get nodes'
alias kd='kubectl describe'
alias kdp='kubectl describe pod'
alias krm='kubectl delete'
export do='--dry-run=client -o yaml'
export now='--force --grace-period 0'
EOF
source ~/.bashrc
```

Verify the aliases are active:

```bash
alias k
export | grep ' do='
```

Expected output: show both the `k` alias and the `do` export.

### Step 3: Context switching check

```bash
kubectl config get-contexts
kubectl config current-context
```

Expected output: the list of available contexts and the active one. In the exam you will switch before every task.

### Step 4: Imperative generators

Create a namespace, Deployment, and Service entirely from the CLI:

```bash
k create ns exam-lab
k create deploy my-app --image=nginx --replicas=3 -n exam-lab
k expose deploy my-app --port=80 --target-port=80 --type=NodePort -n exam-lab
kubectl get pods -n exam-lab
```

Expected output: three Pods running and a NodePort Service `my-app`.

### Step 5: The $do flag

Generate manifests into files without typing any YAML:

```bash
k create deploy my-app --image=nginx --replicas=3 $do > deploy.yaml
cat deploy.yaml
```

Expected output: a full, schema-valid Deployment YAML printed to the screen, with nothing created in the cluster yet (verify with `kubectl get deploy -n exam-lab`, which shows no Deployment).

### Step 6: Edit the generated YAML and apply

Open the generated file in vim, add a CPU/memory limit to the container, save, and apply:

```bash
vim deploy.yaml
kubectl apply -f deploy.yaml -n exam-lab
kubectl get deploy -n exam-lab
```

Apply the deployment.

### Step 7: The 60-Second Challenge

Time yourself. Create a Deployment with 4 replicas, expose it as a NodePort Service, and generate a ConfigMap, all using imperative commands and the `$do` flag:

```bash
time (
  k create ns speed-test
  k create deploy speed-app --image=nginx --replicas=4 -n speed-test $do > speed-deploy.yaml
  k apply -f speed-deploy.yaml -n speed-test
  k create cm speed-config --from-literal=loglevel=debug -n speed-test
  k expose deploy speed-app --port=80 --target-port=80 --type=NodePort -n speed-test
  k get po,svc -n speed-test
)
```

Goal: the whole script finishes in under 60 seconds. Practice until it does.

### Verification

```bash
kubectl get pods,svc,cm -n speed-test --no-headers
kubectl get pods -n exam-lab  # confirm the lab resources are Running
```

### Cleanup

```bash
kubectl delete ns exam-lab speed-test lab-test
```

### Summary

You set up the `.vimrc` and `.bashrc` speed layer, generated manifests with `$do` without touching the API server, switched contexts, and completed the 60-Second Challenge. Replicate this routine before any exam task.

---

<a id="lab-44"></a>

## Lab 44 - Cluster Architecture and the Kubeconfig File

### Prerequisite

- Completion of [Lesson 44 - Cluster Architecture and the Kubeconfig File](../docs/14-certifications/lesson-44-cluster-architecture-and-the-kubeconfig-file.md).
- A running kind cluster (context `kind-prod-mindset`).

### Objective

Inspect a real kubeconfig, manipulate contexts and namespaces, deliberately break the config, and restore it. Finish with a second kind cluster to practice multi-context switching.

### Estimated Time

20 minutes.

---

### Step 1: Inspect the generated kubeconfig

```bash
cat ~/.kube/config
kubectl config view
kubectl config get-contexts
```

Expected: the `clusters`, `users`, and `contexts` sections are visible; the active context (kind show with `*`) is `kind-prod-mindset`.

### Step 2: Change the default namespace of the current context

```bash
kubectl config set-context --current --namespace=kube-system
kubectl get pods
kubectl config set-context --current --namespace=default
```

Expected: `kubectl get pods` lists kube-system Pods without `-n`.

### Step 3: Break the config and observe the failure

```bash
sed -i 's|https://127.0.0.1:[0-9]*|https://192.168.99.99:6443|g' ~/.kube/config
kubectl get nodes
```

Expected output: `Unable to connect to the server: dial tcp 192.168.99.99:6443: ...` (refused or i/o timeout). It fails because the context points to `192.168.99.99`, where no API server exists.

### Step 4: Restore the config from kind

```bash
kind get kubeconfig --name prod-mindset > ~/.kube/config
kubectl get nodes
```

Expected: control plane node listed, command succeeds.

### Step 5: Add a second cluster (multi-context)

```bash
kind create cluster --name dev-cluster
kubectl config get-contexts
```

Expected: two contexts now present: `kind-prod-mindset` and `kind-dev-cluster`.

### Step 6: Switch and verify isolation

```bash
kubectl config use-context kind-dev-cluster
kubectl run test-pod --image=nginx
kubectl get pods

kubectl config use-context kind-prod-mindset
kubectl get pods
```

Expected: `test-pod` exists only in the dev context; switching back to prod-mindset shows no `test-pod`.

### Step 7: Cleanup

```bash
kubectl config use-context kind-dev-cluster
kubectl delete pod test-pod
kind delete cluster --name dev-cluster
kubectl config delete-context kind-dev-cluster
kubectl config current-context
```

Expected: only `kind-prod-mindset` remains and is current.

### Summary

You read a real kubeconfig, pinned a default namespace per context, introduced and diagnosed a broken `server` URL, restored it, and switched between two independent clusters to confirm workloads isolate by context.

---

<a id="lab-45"></a>

## Lab 45 - etcd Backup and Restore

### Prerequisite

- Completion of [Lesson 45 - etcd Backup and Restore](../docs/14-certifications/lesson-45-etcd-backup-and-restore.md).
- A running kind cluster with an etcd Pod in `kube-system`.
- kubectl installed and configured.

### Objective

Take a live snapshot of the etcd database inside a kind control-plane container, verify its integrity, and rehearse the exact restore sequence you will use on the CKA exam.

### Estimated Time

15 minutes.

---

### Step 1: Find the etcd Pod

```bash
kubectl get pods -n kube-system | grep etcd
```

Expected: a Pod named `etcd-<cluster>-control-plane` (e.g. `etcd-prod-mindset-control-plane`) is Running.

### Step 2: Take a snapshot inside the etcd container

```bash
kubectl exec -it etcd-$(kubectl get pods -n kube-system -l component=etcd -o jsonpath='{.items[0].metadata.name}') -n kube-system -- sh
```

Inside the shell, run:

```sh
ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd-backup.db \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key
```

Expected output:

```
{"level":"info","ts":... "caller":"snapshot/v3_snapshot.go":... "msg":"saved snapshot at path /tmp/etcd-backup.db"}
```

### Step 3: Verify the snapshot

```sh
ETCDCTL_API=3 etcdctl snapshot status /tmp/etcd-backup.db -w table
```

Expected: a table with `HASH`, `REVISION`, `TOTAL KEYS`, and `SIZE`. A valid hash proves the backup is not corrupted.

Exit the container:

```sh
exit
```

### Step 4: Copy the snapshot to the host

```bash
kubectl cp kube-system/etcd-$(kubectl get pods -n kube-system -l component=etcd -o jsonpath='{.items[0].metadata.name}'):/tmp/etcd-backup.db /tmp/etcd-backup.db
ls -lh /tmp/etcd-backup.db
```

Expected: the snapshot file appears on your workstation, confirming you can move it off the node (the production equivalent of uploading it to S3/GCS).

### Step 5: Rehearse the restore (exam walkthrough)

On the CKA the restore sequence is:

1. Move static manifests out so the kubelet stops the control plane:
   ```bash
   mv /etc/kubernetes/manifests/*.yaml /tmp/
   ```
2. Restore to a new data directory:
   ```bash
   ETCDCTL_API=3 etcdctl snapshot restore /tmp/etcd-backup.db --data-dir=/var/lib/etcd-restored
   ```
3. Edit the etcd manifest's `hostPath` to point at `/var/lib/etcd-restored`.
4. Move the manifests back:
   ```bash
   mv /tmp/*.yaml /etc/kubernetes/manifests/
   ```
5. Verify the cluster recovers.

Do not attempt the full restore on a kind cluster; it frequently breaks the node's bootstrap because the kubelet manages the Static Pod. Practice the command sequence here, and perform real restores in a dedicated staging VM or cloud cluster.

### Verification

```bash
kubectl get nodes
kubectl get pods -n kube-system | grep etcd
```

Expected: the cluster still answers and etcd is Running after your snapshot exercise.

### Cleanup

```bash
rm -f /tmp/etcd-backup.db
```

### Summary

You located the etcd Static Pod, took and verified a live snapshot with `ETCDCTL_API=3`, copied it off the node, and rehearsed the exact CKA restore sequence without destroying your kind cluster.

---

<a id="lab-46"></a>

## Lab 46 - Final Capstone Assessment and Portfolio Project

### Prerequisites

- Lesson 46 completed.
- All previous labs 1 through 46 attempted.
- A GitHub account for the portfolio project.

### Objective

Validate readiness for senior roles with a 5-question assessment, then build the portfolio repository that becomes your new resume.

### Part A - Prefer the Assessment

Answer the following without looking back at earlier lessons.

1. A Pod is in `CrashLoopBackOff`. You run `kubectl logs <pod>` and see the app started fine. Why do you need `kubectl logs <pod> --previous`?
2. You deploy an HPA, but it shows `<unknown>/50%` for the target. What are the two most likely reasons?
3. You delete a PVC, but it stays in `Terminating` forever. Why is this happening, and how do you fix it?
4. How does ArgoCD detect and fix "Configuration Drift" if an engineer manually runs `kubectl edit`?
5. Why do we use a Headless Service (`clusterIP: None`) for a StatefulSet instead of a normal ClusterIP Service?

#### Check

| Q | Expected Idea |
|---|---------------|
| 1 | Fresh logs on the current container; `--previous` reads the crashed instance's logs (stack trace / `OOMKilled`). |
| 2 | (a) Metrics Server not present or unreachable; (b) missing `resources.requests.cpu` so the HPA has no baseline. |
| 3 | The `kubernetes.io/pvc-protection` finalizer waits for a consumer Pod to terminate or a stuck `Retain` PV/disk. Fix: `kubectl patch pvc <name> -p '{"metadata":{"finalizers":null}}'`. |
| 4 | ArgoCD polls Git, compares to live state, flags it Out of Sync; with `selfHeal` it patches the cluster back to the Git state. |
| 5 | A headless Service exposes per-Pod DNS A records so StatefulSet peers (`db-0`, `db-1`) can address each other directly instead of random load balancing. |

### Part B - The Portfolio Project

1. Create a new public GitHub repository named e.g. `kubernetes-platform-demo`.
2. Add your Helm chart from Lesson 30.
3. Add your GitHub Actions workflow from Lesson 32.
4. Write a `README.md` explaining the architecture (reuse the diagram from Lesson 46), listing the stack: GitHub Actions, ArgoCD, Argo Rollouts, Prometheus, Grafana, Loki, Istio, Cilium.
5. Push a sanitized GitOps directory (no proprietary code or secrets).

### Success Criteria

- You can answer all 5 questions correctly without notes.
- Your repository renders the full platform architecture and includes a runnable Helm chart plus a CI workflow linked to ArgoCD.

### Cleanup

No cluster cleanup is required for this lab; it is portfolio and interview preparation.

[Back to Labs](../labs/README.md)
