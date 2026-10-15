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
                echo "Spinning up temporary container for testing..."
                sh '''
                    # Bật container tạm để test
                    docker run -d --name test-app-${IMAGE_TAG} -p 3005:3000 ${IMAGE_NAME}:${IMAGE_TAG}
                    sleep 3
                    # Gửi request kiểm tra endpoint /health
                    curl -s -f http://localhost:3005/health || (docker rm -f test-app-${IMAGE_TAG} && exit 1)
                    # Dọn dẹp container test
                    docker rm -f test-app-${IMAGE_TAG}
                '''
                echo "Health check passed successfully!"
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
