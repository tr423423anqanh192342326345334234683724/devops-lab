pipeline {
    agent any

    environment {
        APP_IMAGE = "devops-lab-app:v${BUILD_NUMBER}"
        DEPLOYMENT = "web-deployment"
        CONTAINER_NAME = "web-container"
        TEST_CONTAINER = "test-temp-${BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('2. Build Docker Image') {
            steps {
                sh '''
                set -eu
                docker build -t "$APP_IMAGE" .
                '''
            }
        }

        stage('3. Run Health Check & Test') {
            steps {
                sh '''
                set -eu
                cleanup() {
                    docker rm -f "$TEST_CONTAINER" >/dev/null 2>&1 || true
                }
                trap cleanup EXIT

                # Khởi chạy container test vào thẳng mạng minikube
                docker run -d --name "$TEST_CONTAINER" --network minikube "$APP_IMAGE"

                # Đợi container khởi động
                sleep 3

                # Lấy trực tiếp IP nội bộ trong mạng minikube
                TEST_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$TEST_CONTAINER")
                echo "Testing container at IP: $TEST_IP"

                # Gọi curl trực tiếp qua IP
                curl -fsS "http://${TEST_IP}:3000/" >/dev/null || exit 1
                echo "Healthcheck passed successfully!"
                '''
            }
        }

        stage('4. Deploy to Kubernetes') {
            steps {
                sh '''
                set -eu
                echo "Loading image $APP_IMAGE into Minikube..."
                minikube image load "$APP_IMAGE"

                echo "Updating deployment..."
                kubectl set image "deployment/$DEPLOYMENT" "$CONTAINER_NAME=$APP_IMAGE"

                echo "Waiting for rollout to complete..."
                kubectl rollout status "deployment/$DEPLOYMENT" --timeout=60s
                '''
            }
        }
    }

    post {
        always {
            sh '''
            docker rm -f "$TEST_CONTAINER" >/dev/null 2>&1 || true
            '''
        }
        success {
            echo "Deploy Kubernetes phiên bản ${APP_IMAGE} thành công rực rỡ!"
        }
        failure {
            echo "Pipeline thất bại. Hãy kiểm tra rollout và trạng thái ứng dụng."
        }
    }
}