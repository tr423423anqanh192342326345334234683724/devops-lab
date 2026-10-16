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

            docker run -d \
                --name "$TEST_CONTAINER" \
                --network minikube \
                "$APP_IMAGE"

            TEST_IP=$(docker inspect \
                --format '{{(index .NetworkSettings.Networks "minikube").IPAddress}}' \
                "$TEST_CONTAINER")

            if [ -z "$TEST_IP" ]; then
                echo "Không lấy được IP của container test"
                docker logs "$TEST_CONTAINER" || true
                exit 1
            fi

            echo "Testing container at $TEST_IP:3000"

            attempt=0
            until curl -fsS "http://${TEST_IP}:3000/" >/dev/null; do
                attempt=$((attempt + 1))

                if [ "$attempt" -ge 15 ]; then
                    echo "Health check failed"
                    docker logs "$TEST_CONTAINER" || true
                    exit 1
                fi

                sleep 2
            done

            echo "Health check passed"
            curl -fsS "http://${TEST_IP}:3000/"
            echo
        '''
    }
}

        stage('4. Verify Kubernetes Access') {
            steps {
                sh '''
                    set -eu

                    kubectl get deployment "$DEPLOYMENT"
                    kubectl get nodes
                '''
            }
        }

        stage('5. Deploy to Kubernetes') {
            steps {
                sh '''
                    set -eu

                    # Xác nhận Minikube profile tồn tại
                    minikube profile list

                    # Đưa image vào cluster
                    minikube image load "$APP_IMAGE"

                    # Lưu lại cấu hình hiện tại để rollback nếu cần
                    OLD_IMAGE=$(kubectl get deployment "$DEPLOYMENT" \
                        -o jsonpath="{.spec.template.spec.containers[?(@.name==\\"$CONTAINER_NAME\\")].image}")

                    if [ -z "$OLD_IMAGE" ]; then
                        echo "Không tìm thấy container $CONTAINER_NAME"
                        exit 1
                    fi

                    echo "Previous image: $OLD_IMAGE"

                    # Cập nhật Deployment
                    kubectl set image \
                        "deployment/$DEPLOYMENT" \
                        "$CONTAINER_NAME=$APP_IMAGE"

                    # Chờ rollout và rollback nếu thất bại
                    if ! kubectl rollout status \
                        "deployment/$DEPLOYMENT" \
                        --timeout=120s; then

                        echo "Rollout failed. Rolling back..."
                        kubectl rollout undo "deployment/$DEPLOYMENT"
                        kubectl rollout status \
                            "deployment/$DEPLOYMENT" \
                            --timeout=120s || true

                        exit 1
                    fi

                    echo "Deployment updated successfully"
                    kubectl get pods
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
            echo "Deploy Kubernetes phiên bản ${APP_IMAGE} thành công!"
        }

        failure {
            echo "Pipeline thất bại. Hãy kiểm tra rollout và trạng thái ứng dụng."
        }
    }
}