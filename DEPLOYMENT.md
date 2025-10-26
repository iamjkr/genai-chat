# GenAI Chat Application - Deployment Guide

## Overview

This guide covers deploying the GenAI Chat application on AWS EC2 using Docker, Kubernetes, and Jenkins for CI/CD.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Jenkins       │    │   Kubernetes    │    │   Docker        │
│   (CI/CD)       │───▶│   (Orchestration)│───▶│   (Containers)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub        │    │   AWS EC2       │    │   Docker Hub    │
│   (Source)      │    │   (Infrastructure)  │    │   (Registry)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

- AWS Account with EC2 access
- Domain name (optional, can use IP)
- Docker Hub account
- GitHub repository

## 🚀 Quick Start

### 1. Launch AWS EC2 Instance

**Recommended Instance Type:** t3.large (2 vCPU, 8GB RAM)
**OS:** Ubuntu 22.04 LTS
**Storage:** 30GB GP3
**Security Groups:** Open ports 80, 443, 8080, 22

### 2. Setup EC2 Instance

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone the repository
git clone https://github.com/iamjkr/genai-chat.git
cd genai-chat

# Make scripts executable
chmod +x scripts/*.sh

# Run the setup script
./scripts/setup-aws-ec2.sh
```

### 3. Configure Jenkins

1. Access Jenkins at `http://your-ec2-ip:8080`
2. Get initial password:
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
3. Install suggested plugins + additional plugins:
   - Docker Pipeline
   - Kubernetes
   - GitHub Integration

### 4. Setup Docker Hub Credentials

1. In Jenkins, go to "Manage Jenkins" → "Manage Credentials"
2. Add new credential (Username/Password):
   - ID: `docker-hub-credentials`
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password

### 5. Create Jenkins Pipeline

1. Create new Pipeline job
2. Configure GitHub repository
3. Set Pipeline script from SCM
4. Point to your repository's Jenkinsfile

### 6. Deploy Application

Option A: Using Jenkins Pipeline
```bash
# Trigger build in Jenkins dashboard
```

Option B: Manual Deployment
```bash
# Set your environment variables
export DOCKER_USERNAME=your-docker-username
export DOCKER_PASSWORD=your-docker-password
export GROQ_API_KEY=your-groq-api-key

# Deploy to Kubernetes
./scripts/deploy-k8s.sh your-domain.com
```

## 🔧 Configuration

### Environment Variables

Create `/backend/.env` file:
```env
ENV=production
GROQ_API_KEY=your_groq_api_key_here
# Add other API keys as needed
```

### Kubernetes Secrets

Update API keys in `k8s/backend-secret.yaml`:
```bash
# Encode your API key
echo -n "your-api-key" | base64

# Update the secret file
GROQ_API_KEY: "your-base64-encoded-key"
```

### Domain Configuration

Update `k8s/ingress.yaml` with your domain:
```yaml
spec:
  rules:
  - host: your-domain.com  # Replace with your domain
```

## 🛠️ Local Development

For local development and testing:

```bash
# Setup local environment
./scripts/dev-setup.sh

# Access application
# Frontend: http://localhost
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 📊 Monitoring & Management

### View Application Status
```bash
kubectl get pods -n genai-chat
kubectl get services -n genai-chat
kubectl get ingress -n genai-chat
```

### View Logs
```bash
# Backend logs
kubectl logs -f deployment/backend-deployment -n genai-chat

# Frontend logs
kubectl logs -f deployment/frontend-deployment -n genai-chat
```

### Scale Application
```bash
# Scale backend
kubectl scale deployment backend-deployment --replicas=3 -n genai-chat

# Scale frontend
kubectl scale deployment frontend-deployment --replicas=3 -n genai-chat
```

## 🔒 Security Considerations

### SSL/TLS Setup

For production, set up SSL certificates:

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Security Best Practices

1. **Use secrets for sensitive data**
2. **Enable RBAC in Kubernetes**
3. **Regular security updates**
4. **Network policies**
5. **Image scanning**

## 🔄 CI/CD Pipeline

The Jenkins pipeline automatically:

1. **Builds** Docker images
2. **Tests** application
3. **Scans** for security vulnerabilities
4. **Deploys** to Kubernetes
5. **Performs** health checks

### Pipeline Stages

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Checkout   │───▶│    Build    │───▶│    Test     │
└─────────────┘    └─────────────┘    └─────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Deploy    │◀───│  Security   │◀───│   Update    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Pod CrashLoopBackOff
```bash
kubectl describe pod <pod-name> -n genai-chat
kubectl logs <pod-name> -n genai-chat
```

#### 2. Image Pull Errors
- Check Docker Hub credentials
- Verify image names in deployment files

#### 3. Ingress Not Working
```bash
kubectl get ingress -n genai-chat
kubectl describe ingress genai-chat-ingress -n genai-chat
```

#### 4. Jenkins Build Failures
- Check Jenkins logs
- Verify Docker and Kubernetes connectivity
- Check credentials configuration

### Health Checks

```bash
# Check cluster health
kubectl get nodes
kubectl get pods --all-namespaces

# Check application health
curl http://your-domain/api/health

# Check services
kubectl get services -n genai-chat
```

## 📈 Scaling & Performance

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: genai-chat
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Resource Monitoring

```bash
# Install metrics server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# View resource usage
kubectl top nodes
kubectl top pods -n genai-chat
```

## 🔄 Updates & Maintenance

### Rolling Updates
```bash
# Update image version
kubectl set image deployment/backend-deployment backend=iamjkr/genai-chat-backend:v2.0 -n genai-chat

# Check rollout status
kubectl rollout status deployment/backend-deployment -n genai-chat

# Rollback if needed
kubectl rollout undo deployment/backend-deployment -n genai-chat
```

### Backup & Recovery
```bash
# Backup Kubernetes resources
kubectl get all -n genai-chat -o yaml > backup.yaml

# Backup persistent data (if any)
kubectl exec -n genai-chat deployment/backend-deployment -- pg_dump > db_backup.sql
```

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review Kubernetes and Jenkins logs
- Ensure all prerequisites are met
- Verify network connectivity and security groups

## 🎯 Next Steps

1. **Set up monitoring** with Prometheus and Grafana
2. **Implement logging** with ELK stack
3. **Add more tests** to the CI/CD pipeline
4. **Set up alerting** for critical issues
5. **Implement backup strategies**