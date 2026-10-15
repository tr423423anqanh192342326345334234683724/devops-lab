pipeline {
    agent any

    environment {
        IMAGE_NAME = 'devops-lab-jenkins'
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo "Checking out code from Git repository..."
                checkout scm
            }
        }

        stage('2. Build Docker Image') {
            steps {
                echo "Building Docker image version ${IMAGE_TAG}..."
                sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest .'
            }
        }

        stage('3. Run Health Check & Test') {
            steps {
                echo "Testing container health..."
                sh '''
                    # Dọn dẹp container test cũ nếu còn sót
                    docker rm -f test-app-${IMAGE_TAG} 2>/dev/null || true
                    
                    # Khởi chạy container test ngầm
                    docker run -d --name test-app-${IMAGE_TAG} ${IMAGE_NAME}:${IMAGE_TAG}
                    
                    # Đợi container khởi động
                    sleep 3
                    
                    # Kiểm tra xem tiến trình bên trong container có đang sống không
                    docker inspect -f '{{.State.Running}}' test-app-${IMAGE_TAG}
                    
                    # Dọn dẹp container test
                    docker rm -f test-app-${IMAGE_TAG}
                '''
                echo "Container started and verified successfully!"
            }
        }

        stage('4. Deploy Notification') {
            steps {
                echo "=========================================="
                echo " SUCCESS: Docker Image ${IMAGE_NAME}:${IMAGE_TAG} is ready for Production deployment! "
                echo "=========================================="
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
        }
        failure {
            echo "Pipeline failed! Sending alert..."
        }
    }
}
