pipeline {
    agent any

    environment {
        APP_IMAGE = "devops-lab-app:v${BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('2. Build Docker Image') {
            steps {
                sh "docker build -t ${APP_IMAGE} ."
            }
        }

        stage('3. Run Health Check & Test') {
            steps {
                sh "docker run --rm -d --name test-temp-${BUILD_NUMBER} -p 3999:3000 ${APP_IMAGE}"
                sh "sleep 3"
                sh "curl -f http://localhost:3999/health || curl -f http://localhost:3999/ || exit 1"
                sh "docker stop test-temp-${BUILD_NUMBER}"
            }
        }

        stage('4. Deploy to Kubernetes') {
            steps {
                sh "minikube image load ${APP_IMAGE}"
                sh "kubectl set image deployment/web-deployment web-container=${APP_IMAGE}"
                sh "kubectl rollout status deployment/web-deployment --timeout=60s"
            }
        }
    }

    post {
        always {
            sh "docker ps -q -f name=test-temp-${BUILD_NUMBER} | xargs -r docker stop"
        }
        success {
            echo "Deploy Kubernetes phiên bản ${APP_IMAGE} thành công rực rỡ!"
        }
        failure {
            echo "Pipeline thất bại, Kubernetes vẫn giữ nguyên bản cũ an toàn."
        }
    }
}