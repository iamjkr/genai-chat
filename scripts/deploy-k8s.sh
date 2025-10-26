#!/bin/bash

# Kubernetes Deployment Script for GenAI Chat Application

set -e

NAMESPACE="genai-chat"
DOMAIN="${1:-genai-chat.local}"

echo "=== Deploying GenAI Chat Application to Kubernetes ==="
echo "Domain: $DOMAIN"
echo "Namespace: $NAMESPACE"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
if ! command_exists kubectl; then
    echo "Error: kubectl is not installed"
    exit 1
fi

if ! command_exists docker; then
    echo "Error: docker is not installed"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info >/dev/null 2>&1; then
    echo "Error: Cannot connect to Kubernetes cluster"
    exit 1
fi

# Create namespace
echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Create Docker registry secret (if credentials are provided)
if [ ! -z "$DOCKER_USERNAME" ] && [ ! -z "$DOCKER_PASSWORD" ]; then
    echo "Creating Docker registry secret..."
    kubectl create secret docker-registry docker-registry-secret \
        --docker-server=docker.io \
        --docker-username=$DOCKER_USERNAME \
        --docker-password=$DOCKER_PASSWORD \
        --docker-email=$DOCKER_EMAIL \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
fi

# Update API keys in secret (if provided)
if [ ! -z "$GROQ_API_KEY" ]; then
    echo "Updating backend secrets..."
    GROQ_API_KEY_B64=$(echo -n "$GROQ_API_KEY" | base64 -w 0)
    sed -i "s/your-base64-encoded-groq-api-key/$GROQ_API_KEY_B64/g" k8s/backend-secret.yaml
fi

# Update ingress domain
echo "Updating ingress domain..."
sed -i "s/genai-chat.local/$DOMAIN/g" k8s/ingress.yaml

# Deploy ConfigMap and Secrets
echo "Deploying ConfigMap and Secrets..."
kubectl apply -f k8s/backend-configmap.yaml
kubectl apply -f k8s/backend-secret.yaml

# Deploy Backend
echo "Deploying Backend..."
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Deploy Frontend
echo "Deploying Frontend..."
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Deploy Ingress
echo "Deploying Ingress..."
kubectl apply -f k8s/ingress.yaml

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl rollout status deployment/backend-deployment -n $NAMESPACE --timeout=300s
kubectl rollout status deployment/frontend-deployment -n $NAMESPACE --timeout=300s

# Check pod status
echo "Checking pod status..."
kubectl get pods -n $NAMESPACE

# Check services
echo "Checking services..."
kubectl get services -n $NAMESPACE

# Check ingress
echo "Checking ingress..."
kubectl get ingress -n $NAMESPACE

# Health check
echo "Performing health check..."
sleep 30

# Try to access the health endpoint
if kubectl exec -n $NAMESPACE deployment/backend-deployment -- curl -f http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
fi

# Get application URL
INGRESS_IP=$(kubectl get ingress genai-chat-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "localhost")
if [ "$INGRESS_IP" = "localhost" ]; then
    INGRESS_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}' 2>/dev/null || echo "localhost")
fi

echo ""
echo "=== Deployment Complete! ==="
echo ""
echo "Application URLs:"
echo "Frontend: http://$DOMAIN"
echo "Backend API: http://$DOMAIN/api"
echo "Backend Docs: http://$DOMAIN/api/docs"
echo ""
if [ "$DOMAIN" = "genai-chat.local" ]; then
    echo "For local testing, add this to your /etc/hosts file:"
    echo "$INGRESS_IP genai-chat.local"
fi
echo ""
echo "Useful commands:"
echo "View pods: kubectl get pods -n $NAMESPACE"
echo "View logs: kubectl logs -f deployment/backend-deployment -n $NAMESPACE"
echo "View ingress: kubectl get ingress -n $NAMESPACE"
echo "Delete app: kubectl delete namespace $NAMESPACE"