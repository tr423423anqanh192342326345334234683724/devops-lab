cat << 'EOF' > Jenkinsfile
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
                sh '''
                # Chạy container test nối trực tiếp vào mạng minikube (mạng chung với Jenkins)
                docker run --rm -d --name test-temp-${BUILD_NUMBER} --network minikube ${APP_IMAGE}

                # Đợi container khởi động
                sleep 3

                # Test trực tiếp qua container name nội bộ
                curl -f http://test-temp-${BUILD_NUMBER}:3000/ || exit 1

                # Dọn dẹp container test
                docker stop test-temp-${BUILD_NUMBER}
                '''
            }
        }

        stage('4. Deploy to Kubernetes') {
            steps {
                sh '''
                minikube image load ${APP_IMAGE}
                kubectl set image deployment/web-deployment web-container=${APP_IMAGE}
                kubectl rollout status deployment/web-deployment --timeout=60s
                '''
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