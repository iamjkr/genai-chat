# GenAI Chat Application

A production-ready AI-powered chatbot application with comprehensive DevOps pipeline using Docker, Kubernetes, and Jenkins for deployment on AWS EC2.

## 🏗️ Architecture

```
Frontend (React) ←→ Backend (FastAPI) ←→ AI APIs (Groq, etc.)
      ↓                    ↓
   Docker Container    Docker Container
      ↓                    ↓
        Kubernetes Cluster
               ↓
           AWS EC2 Instance
```

## ✨ Features

- 🤖 **Smart AI Integration**: Multiple AI providers with fallback system
- 💬 **Real-time Chat**: Modern chat interface with message history
- 🎨 **Modern UI**: Dark theme with Material-UI components
- 🔄 **High Availability**: Kubernetes orchestration with auto-scaling
- 🐳 **Containerized**: Docker containers for consistent deployments
- 🚀 **CI/CD Pipeline**: Jenkins automation for build, test, and deploy
- � **Monitoring**: Health checks and logging
- 🔒 **Security**: Best practices with secrets management

## 🚀 Quick Start

### Option 1: Local Development
```bash
git clone https://github.com/iamjkr/genai-chat.git
cd genai-chat
./scripts/dev-setup.sh
```

### Option 2: AWS Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for complete AWS deployment guide.

### Option 3: Docker Compose
```bash
git clone https://github.com/iamjkr/genai-chat.git
cd genai-chat
docker compose up --build
```

## 📁 Project Structure

```
genai-chat/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Backend container
│   └── .env                # Environment variables
├── frontend/               # React frontend
│   ├── src/                # Source code
│   ├── package.json        # Node dependencies
│   ├── Dockerfile          # Frontend container
│   └── nginx.conf          # Nginx configuration
├── k8s/                    # Kubernetes manifests
│   ├── namespace.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── services.yaml
│   └── ingress.yaml
├── scripts/                # Deployment scripts
│   ├── setup-aws-ec2.sh    # AWS EC2 setup
│   ├── deploy-k8s.sh       # Kubernetes deployment
│   └── dev-setup.sh        # Local development
├── docker-compose.yml      # Local development
├── Jenkinsfile             # CI/CD pipeline
└── DEPLOYMENT.md           # Deployment guide
```

## 🔧 Configuration

### Environment Variables
Create `backend/.env`:
```env
ENV=development
GROQ_API_KEY=your_groq_api_key_here
```

### API Keys Setup
1. Get Groq API key from [console.groq.com](https://console.groq.com)
2. Add to environment variables or Kubernetes secrets

## 🛠️ Development

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## 🐳 Docker Commands

### Build Images
```bash
# Backend
docker build -t genai-chat-backend ./backend

# Frontend
docker build -t genai-chat-frontend ./frontend
```

### Run Containers
```bash
# Using Docker Compose
docker compose up --build

# Individual containers
docker run -p 8000:8000 genai-chat-backend
docker run -p 80:80 genai-chat-frontend
```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (kind, minikube, or cloud)
- kubectl configured
- Docker images pushed to registry

### Deploy
```bash
# Quick deployment
./scripts/deploy-k8s.sh your-domain.com

# Manual deployment
kubectl apply -f k8s/
```

### Useful Commands
```bash
# Check status
kubectl get pods -n genai-chat

# View logs
kubectl logs -f deployment/backend-deployment -n genai-chat

# Scale application
kubectl scale deployment backend-deployment --replicas=3 -n genai-chat
```

## 🔄 CI/CD Pipeline

The Jenkins pipeline automatically:
1. **Builds** Docker images
2. **Tests** applications
3. **Scans** for security issues
4. **Deploys** to Kubernetes
5. **Performs** health checks

### Setup Jenkins
1. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for complete setup
2. Configure credentials for Docker Hub and Kubernetes
3. Create pipeline job pointing to this repository

## 📊 Monitoring

### Health Checks
- Backend: `http://your-domain/api/health`
- Frontend: `http://your-domain/`

### Logs
```bash
# Application logs
kubectl logs -f deployment/backend-deployment -n genai-chat

# Nginx logs
kubectl logs -f deployment/frontend-deployment -n genai-chat
```

## 🔒 Security

- Container security scanning
- Kubernetes RBAC
- Secrets management
- Network policies
- SSL/TLS encryption

## 🚀 Production Deployment

For production deployment on AWS EC2 with full CI/CD pipeline, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick AWS Setup
1. Launch EC2 instance (t3.large recommended)
2. Run setup script: `./scripts/setup-aws-ec2.sh`
3. Configure Jenkins and deploy: `./scripts/deploy-k8s.sh`

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Integration tests
docker compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📈 Scaling

### Horizontal Pod Autoscaler
```bash
kubectl autoscale deployment backend-deployment --cpu-percent=70 --min=2 --max=10 -n genai-chat
```

### Manual Scaling
```bash
kubectl scale deployment backend-deployment --replicas=5 -n genai-chat
```

## 🔧 Troubleshooting

### Common Issues
1. **Pod crashes**: Check logs with `kubectl logs`
2. **Image pull errors**: Verify Docker registry credentials
3. **Service not accessible**: Check ingress and service configurations
4. **Build failures**: Verify Jenkins configuration and credentials

### Debug Commands
```bash
# Check cluster status
kubectl get nodes
kubectl get pods --all-namespaces

# Describe resources
kubectl describe pod <pod-name> -n genai-chat
kubectl describe service <service-name> -n genai-chat
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](http://your-domain/api/docs)
- [GitHub Repository](https://github.com/iamjkr/genai-chat)
   npm run dev
   ```

4. Open browser to: http://localhost:5173

## AI API Integration

### OpenAI Integration (Recommended)
1. Get a free API key from [OpenAI](https://platform.openai.com/)
2. Edit `backend/main.py`:
   ```python
   AI_PROVIDERS = [
       {
           "name": "OpenAI Compatible (Free)",
           "url": "https://api.openai.com/v1/chat/completions",
           "headers": {"Authorization": "Bearer YOUR_ACTUAL_API_KEY_HERE"},
           "enabled": True  # Change to True
       }
   ]
   ```

### Hugging Face Integration (Free Alternative)
1. Get a free token from [Hugging Face](https://huggingface.co/settings/tokens)
2. Edit `backend/main.py`:
   ```python
   {
       "name": "Hugging Face Inference",
       "url": "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
       "headers": {"Authorization": "Bearer YOUR_HF_TOKEN_HERE"},
       "enabled": True  # Change to True
   }
   ```

### Free AI Alternatives
- **Together AI**: Free tier with various models
- **Replicate**: Free credits for AI models
- **Cohere**: Free tier for text generation
- **Anthropic Claude**: Free tier available

## API Endpoints

- `GET /` - Health check
- `GET /api/status` - Check AI provider status
- `POST /api/chat` - Send chat message
  ```json
  {
    "message": "Hello, how are you?",
    "conversation_history": []
  }
  ```

## Demo Mode

The chatbot runs in demo mode with intelligent rule-based responses when no AI APIs are configured. It can discuss:
- Python programming
- Machine Learning & AI
- Data Science
- Web Development
- General technical topics

## Customization

### Adding New AI Providers
1. Add provider config to `AI_PROVIDERS` in `backend/main.py`
2. Implement API call logic in `call_ai_api()` function
3. Test with your API credentials

### Styling
- Modify theme in `frontend/src/App.jsx`
- Update CSS in `frontend/src/index.css`
- Customize Material-UI components

### Features to Add
- User authentication
- Chat history persistence
- File upload support
- Voice input/output
- Multiple chat rooms
- AI model selection

## Architecture

```
chatbot/
├── backend/
│   ├── main.py              # FastAPI server with AI integration
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx         # Main React component
    │   ├── main.jsx        # React entry point
    │   ├── index.css       # Global styles
    │   └── components/
    │       └── ChatMessage.jsx  # Chat message component
    ├── package.json        # Node.js dependencies
    └── index.html         # HTML template
```

## Troubleshooting

### Backend Issues
- **Port already in use**: Change port in uvicorn command
- **Module not found**: Ensure virtual environment is activated
- **API key errors**: Check AI provider configuration

### Frontend Issues
- **npm install fails**: Update Node.js to latest version
- **CORS errors**: Ensure backend CORS is properly configured
- **Build fails**: Check for syntax errors in JSX files

## Development

### Running Both Servers
Backend (Terminal 1):
```bash
cd D:\FastAPI\chatbot\backend
uvicorn main:app --reload --port 8001
```

Frontend (Terminal 2):
```bash
cd D:\FastAPI\chatbot\frontend
npm run dev
```

### Production Deployment
1. Build frontend: `npm run build`
2. Serve static files from FastAPI or use CDN
3. Configure environment variables for API keys
4. Use production ASGI server (gunicorn + uvicorn)

## License

MIT License - feel free to use and modify for your projects!
