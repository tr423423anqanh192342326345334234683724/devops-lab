
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

                # Khởi chạy container độc lập
                docker run -d --name "$TEST_CONTAINER" "$APP_IMAGE"

                # Đợi ứng dụng Node.js khởi động
                sleep 3

                # Test trực tiếp bằng Node bên trong container
                docker exec "$TEST_CONTAINER" node -e '
                  const http = require("http");
                  http.get("http://127.0.0.1:3000/", (res) => {
                    if (res.statusCode === 200) {
                      console.log("Healthcheck HTTP 200 OK");
                      process.exit(0);
                    } else {
                      console.error("Healthcheck status:", res.statusCode);
                      process.exit(1);
                    }
                  }).on("error", (err) => {
                    console.error("Healthcheck error:", err.message);
                    process.exit(1);
                  });
                '
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