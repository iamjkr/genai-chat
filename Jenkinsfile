pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_REPO = 'iamjkr'
        IMAGE_TAG = "${BUILD_NUMBER}"
        KUBECONFIG = credentials('kubeconfig')
        DOCKER_CREDENTIALS = credentials('docker-hub-credentials')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup') {
            steps {
                script {
                    def commitHash = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    env.COMMIT_HASH = commitHash
                    env.IMAGE_TAG = "${BUILD_NUMBER}-${commitHash}"
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    script {
                        def backendImage = docker.build("${DOCKER_REPO}/genai-chat-backend:${IMAGE_TAG}")
                        docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIALS}") {
                            backendImage.push()
                            backendImage.push("latest")
                        }
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    script {
                        def frontendImage = docker.build("${DOCKER_REPO}/genai-chat-frontend:${IMAGE_TAG}")
                        docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIALS}") {
                            frontendImage.push()
                            frontendImage.push("latest")
                        }
                    }
                }
            }
        }
        
        stage('Test Backend') {
            steps {
                dir('backend') {
                    sh '''
                        python -m pip install --upgrade pip
                        pip install -r requirements.txt
                        pip install pytest pytest-cov
                        # Add your test commands here
                        # pytest tests/ --cov=./ --cov-report=xml
                    '''
                }
            }
        }
        
        stage('Security Scan') {
            parallel {
                stage('Backend Security') {
                    steps {
                        dir('backend') {
                            sh '''
                                pip install safety
                                safety check --json --output safety-report.json || true
                            '''
                        }
                    }
                }
                stage('Frontend Security') {
                    steps {
                        dir('frontend') {
                            sh '''
                                npm audit --json > audit-report.json || true
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Update K8s Manifests') {
            steps {
                script {
                    sh """
                        sed -i 's|image: ${DOCKER_REPO}/genai-chat-backend:.*|image: ${DOCKER_REPO}/genai-chat-backend:${IMAGE_TAG}|g' k8s/backend-deployment.yaml
                        sed -i 's|image: ${DOCKER_REPO}/genai-chat-frontend:.*|image: ${DOCKER_REPO}/genai-chat-frontend:${IMAGE_TAG}|g' k8s/frontend-deployment.yaml
                    """
                }
            }
        }
        
        stage('Deploy to K8s') {
            when {
                anyOf {
                    branch 'master'
                    branch 'main'
                }
            }
            steps {
                script {
                    sh '''
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/backend-configmap.yaml
                        kubectl apply -f k8s/backend-secret.yaml
                        kubectl apply -f k8s/backend-deployment.yaml
                        kubectl apply -f k8s/backend-service.yaml
                        kubectl apply -f k8s/frontend-deployment.yaml
                        kubectl apply -f k8s/frontend-service.yaml
                        kubectl apply -f k8s/ingress.yaml
                        
                        # Wait for deployments to be ready
                        kubectl rollout status deployment/backend-deployment -n genai-chat --timeout=300s
                        kubectl rollout status deployment/frontend-deployment -n genai-chat --timeout=300s
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    sh '''
                        # Wait for services to be ready
                        sleep 30
                        
                        # Check backend health
                        kubectl exec -n genai-chat deployment/backend-deployment -- curl -f http://localhost:8000/health
                        
                        # Check frontend
                        kubectl exec -n genai-chat deployment/frontend-deployment -- wget --spider http://localhost:80/
                    '''
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline executed successfully!'
            // Add notification here (Slack, email, etc.)
        }
        failure {
            echo 'Pipeline failed!'
            // Add notification here
        }
    }
}