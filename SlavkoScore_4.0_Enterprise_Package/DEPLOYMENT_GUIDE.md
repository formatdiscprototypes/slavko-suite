# SlavkoScore 4.0 - Deployment Guide

> Complete deployment instructions for production environments

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Performance Optimization](#performance-optimization)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Hardening](#security-hardening)

---

## Prerequisites

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **CPU** | 4 cores | 8+ cores |
| **RAM** | 16 GB | 32+ GB |
| **Storage** | 50 GB | 100+ GB |
| **GPU** | Optional | NVIDIA GPU (8GB+ VRAM) |

### Software Requirements

- Python 3.11+
- Docker 24.0+
- Docker Compose 2.20+
- (Optional) Kubernetes 1.28+
- (Optional) Ollama 0.1.0+

---

## Local Development

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/slavko-score
cd slavko-score

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -e .

# Install Ollama (if not already installed)
curl -fsSL https://ollama.com/install.sh | sh
```

### Configuration

```bash
# Create configuration file
cat > config/settings.yaml << EOF
ollama:
  host: http://localhost:11434
  model: deepseek-r1

scoring:
  pass_threshold: 70
  warn_threshold: 50

monitoring:
  enable_metrics: true
  enable_tracing: true
EOF
```

### Running the Service

```bash
# Start Ollama
ollama serve

# Pull required models
ollama pull deepseek-r1
ollama pull phi3-vision
ollama pull qwen2.5:14b

# Start SlavkoScore API
python -m slavko_score.api

# Access the dashboard
open http://localhost:8000
```

---

## Docker Deployment

### Build Docker Image

```bash
# Build from Dockerfile
docker build -t slavko-score:4.0 .

# Or use Docker Compose
docker-compose build
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: slavko-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
    restart: unless-stopped
    networks:
      - slavko-network

  slavko-score:
    build: .
    image: slavko-score:4.0
    container_name: slavko-score-api
    ports:
      - "8000:8000"
    environment:
      - OLLAMA_HOST=http://ollama:11434
      - OLLAMA_MODEL=deepseek-r1
      - SCORE_PASS_THRESHOLD=70
    depends_on:
      - ollama
    restart: unless-stopped
    networks:
      - slavko-network
    volumes:
      - ./config:/app/config
      - ./logs:/app/logs

  redis:
    image: redis:7-alpine
    container_name: slavko-redis
    ports:
      - "6379:6379"
    networks:
      - slavko-network
    restart: unless-stopped

volumes:
  ollama_data:

networks:
  slavko-network:
    driver: bridge
```

### Running with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f slavko-score

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Kubernetes Deployment

### Namespace Setup

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: slavko-score
```

### ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: slavko-config
  namespace: slavko-score
data:
  OLLAMA_HOST: "http://ollama:11434"
  OLLAMA_MODEL: "deepseek-r1"
  SCORE_PASS_THRESHOLD: "70"
  SCORE_WARN_THRESHOLD: "50"
```

### Ollama Deployment

```yaml
# k8s/ollama.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
  namespace: slavko-score
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      containers:
      - name: ollama
        image: ollama/ollama:latest
        ports:
        - containerPort: 11434
        resources:
          requests:
            memory: "8Gi"
            cpu: "2"
          limits:
            memory: "16Gi"
            cpu: "4"
        volumeMounts:
        - name: ollama-data
          mountPath: /root/.ollama
      volumes:
      - name: ollama-data
        persistentVolumeClaim:
          claimName: ollama-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: ollama
  namespace: slavko-score
spec:
  selector:
    app: ollama
  ports:
  - port: 11434
    targetPort: 11434
```

### SlavkoScore Deployment

```yaml
# k8s/slavko-score.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: slavko-score
  namespace: slavko-score
spec:
  replicas: 3
  selector:
    matchLabels:
      app: slavko-score
  template:
    metadata:
      labels:
        app: slavko-score
    spec:
      containers:
      - name: slavko-score
        image: slavko-score:4.0
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: slavko-config
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: slavko-score
  namespace: slavko-score
spec:
  selector:
    app: slavko-score
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

### Deploying to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n slavko-score

# View logs
kubectl logs -f deployment/slavko-score -n slavko-score

# Scale deployment
kubectl scale deployment slavko-score --replicas=5 -n slavko-score
```

---

## Cloud Deployment

### AWS Deployment

```bash
# Using EKS
eksctl create cluster \
  --name slavko-score \
  --region us-west-2 \
  --nodes 3 \
  --node-type t3.xlarge

# Deploy using Kubernetes manifests
kubectl apply -f k8s/

# Set up ALB
kubectl apply -f k8s/ingress-aws.yaml
```

### GCP Deployment

```bash
# Using GKE
gcloud container clusters create slavko-score \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-4

# Deploy using Kubernetes manifests
kubectl apply -f k8s/

# Set up Cloud Load Balancing
kubectl apply -f k8s/ingress-gcp.yaml
```

### Azure Deployment

```bash
# Using AKS
az aks create \
  --resource-group slavko-rg \
  --name slavko-score \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3

# Deploy using Kubernetes manifests
kubectl apply -f k8s/
```

---

## Performance Optimization

### GPU Acceleration

```yaml
# docker-compose.gpu.yml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
```

### Caching Strategy

```python
# Enable Redis caching
REDIS_URL = "redis://localhost:6379"
CACHE_TTL = 3600  # 1 hour
```

### Load Balancing

```yaml
# nginx.conf
upstream slavko_score {
    least_conn;
    server slavko-score-1:8000;
    server slavko-score-2:8000;
    server slavko-score-3:8000;
}

server {
    listen 80;
    location / {
        proxy_pass http://slavko_score;
        proxy_set_header Host $host;
    }
}
```

---

## Monitoring & Logging

### Prometheus Metrics

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'slavko-score'
    static_configs:
      - targets: ['slavko-score:8000']
    metrics_path: '/metrics'
```

### Grafana Dashboard

```bash
# Import dashboard
curl -X POST http://localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @grafana/dashboard.json
```

### Log Aggregation

```yaml
# filebeat.yml
filebeat.inputs:
- type: container
  paths:
    - /var/lib/docker/containers/*/*.log
  processors:
  - add_docker_metadata:

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
```

---

## Security Hardening

### Network Policies

```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: slavko-score-netpol
  namespace: slavko-score
spec:
  podSelector:
    matchLabels:
      app: slavko-score
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: slavko-score
    ports:
    - protocol: TCP
      port: 8000
```

### TLS Configuration

```yaml
# k8s/ingress-tls.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: slavko-score-ingress
  namespace: slavko-score
spec:
  tls:
  - hosts:
    - slavko.example.com
    secretName: slavko-tls
  rules:
  - host: slavko.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: slavko-score
            port:
              number: 80
```

---

## Troubleshooting

### Common Issues

```bash
# Check logs
docker-compose logs -f

# Restart services
docker-compose restart

# Clear cache
redis-cli FLUSHALL

# Rebuild image
docker-compose build --no-cache
```

---

## Support

- **Documentation**: https://docs.slavko.ai
- **Issues**: https://github.com/your-org/slavko-score/issues
- **Email**: support@slavko.ai

---

**Built with S.L.A.V.K.O.™ – Deterministic AI. Sovereign Control.**