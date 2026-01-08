pipeline {
    agent any
    
    tools {
        nodejs 'node-20'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📦 ===== STAGE 1: CHECKOUT ====='
                echo '📥 Cloning repository from GitHub...'
                git branch: 'main', url: 'https://github.com/ssshinde23-pixel/fastfood-cicd-project.git'
                echo '✅ Repository cloned successfully!'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '⚙️ ===== STAGE 2: INSTALL DEPENDENCIES ====='
                echo '📦 Installing Node.js dependencies...'
                sh '''
                    node --version
                    npm --version
                    npm install
                '''
                echo '✅ Dependencies installed successfully!'
            }
        }
        
        stage('Run Tests') {
            steps {
                echo '🧪 ===== STAGE 3: RUN TESTS ====='
                echo '🔍 Running application tests...'
                sh 'npm test'
                echo '✅ All tests passed!'
            }
        }
        
        stage('Build Information') {
            steps {
                echo '🔨 ===== STAGE 4: BUILD INFORMATION ====='
                echo '📝 Adding build metadata...'
                script {
                    sh """
                        echo "Build Number: ${env.BUILD_NUMBER}"
                        echo "Build Date: \$(date)"
                        echo "Git Commit: \$(git rev-parse --short HEAD)"
                        sed -i 's/1.0/1.0.${env.BUILD_NUMBER}/g' index.html
                    """
                }
                echo '✅ Build information updated!'
            }
        }
        
        stage('Deploy Application') {
            steps {
                echo '🚀 ===== STAGE 5: DEPLOY ====='
                echo '📂 Deploying to production directory...'
                script {
                    sh '''
                        # Create deployment directory
                        sudo mkdir -p /var/www/fastfood-app
                        
                        # Create and set permissions for log file
                        sudo touch /var/log/fastfood-app.log
                        sudo chown jenkins:jenkins /var/log/fastfood-app.log
                        sudo chmod 664 /var/log/fastfood-app.log
                        
                        # Backup existing deployment if exists
                        if [ -d "/var/www/fastfood-app" ] && [ "$(ls -A /var/www/fastfood-app)" ]; then
                            echo "💾 Creating backup of previous version..."
                            sudo cp -r /var/www/fastfood-app /var/www/fastfood-app.backup.$(date +%Y%m%d_%H%M%S)
                        fi
                        
                        # Copy new files
                        echo "📁 Copying application files..."
                        sudo rm -rf /var/www/fastfood-app/*
                        sudo cp -r * /var/www/fastfood-app/
                        sudo chown -R jenkins:jenkins /var/www/fastfood-app
                        
                        # Install production dependencies
                        cd /var/www/fastfood-app
                        echo "📦 Installing production dependencies..."
                        npm install --production
                        
                        # Kill all processes on port 3000
                        echo "💣 ABSOLUTE NUCLEAR KILL: Destroying ALL port 3000 processes..."
                        sudo -u jenkins pm2 kill || true
                        sudo -u ubuntu pm2 kill || true
                        sudo pm2 kill || true
                        sleep 2
                        
                        # Multiple kill attempts
                        for i in {1..5}; do
                            echo "🔫 Kill attempt $i/5..."
                            sudo fuser -k -9 3000/tcp 2>/dev/null || true
                            sudo lsof -ti:3000 | xargs -r sudo kill -9 2>/dev/null || true
                            sudo pkill -9 -f "node.*server.js" 2>/dev/null || true
                            sudo pkill -9 -f "pm2" 2>/dev/null || true
                            sudo killall -9 node 2>/dev/null || true
                            
                            sleep 2
                            
                            # Check if port is free
                            if ! sudo lsof -ti:3000 >/dev/null 2>&1; then
                                echo "✅ Port 3000 is FREE after attempt $i!"
                                break
                            fi
                        done
                        
                        echo "🔍 Final port verification..."
                        sleep 3
                        if sudo lsof -ti:3000 >/dev/null 2>&1; then
                            echo "⚠️ WARNING: Port 3000 still in use!"
                            sudo lsof -i:3000
                        else
                            echo "✅ Port 3000 is 100% FREE - Ready to deploy!"
                        fi
                        
                        # Start application with PM2
                        echo "▶️ Starting application with PM2..."
                        pm2 start server.js --name fastfood-app --time --max-memory-restart 500M --log /var/log/fastfood-app.log --error /var/log/fastfood-app.log --merge-logs
                        pm2 save --force
                        
                        # Wait for app to start
                        sleep 5
                        
                        # Show status
                        echo "📊 Application Status:"
                        pm2 list
                        pm2 info fastfood-app
                    '''
                }
                echo '✅ Application deployed successfully!'
            }
        }
        
        stage('Health Check') {
            steps {
                echo '💚 ===== STAGE 6: HEALTH CHECK ====='
                echo '🔍 Verifying deployment...'
                script {
                    sh '''
                        # Check PM2 status
                        echo "🔍 Checking PM2 process status..."
                        if pm2 list | grep -q "fastfood-app.*online"; then
                            echo "✅ PM2 process is running"
                        else
                            echo "❌ PM2 process is not running!"
                            exit 1
                        fi
                        
                        # Check if port is listening
                        echo "🔍 Checking if application is listening on port 3000..."
                        if sudo lsof -ti:3000 >/dev/null 2>&1; then
                            echo "✅ Application is listening on port 3000"
                        else
                            echo "❌ Application is not listening on port 3000!"
                            exit 1
                        fi
                        
                        # Perform HTTP health check
                        echo "🔍 Performing health check on /health endpoint..."
                        MAX_ATTEMPTS=15
                        ATTEMPT=1
                        
                        while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
                            HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health)
                            
                            if [ "$HTTP_CODE" = "200" ]; then
                                echo "✅ Health check passed! (HTTP $HTTP_CODE)"
                                
                                echo "📋 Health Check Response:"
                                curl -s http://localhost:3000/health | python3 -m json.tool
                                echo ""
                                
                                echo "🍔 Testing menu endpoint..."
                                MENU_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/menu)
                                if [ "$MENU_CODE" = "200" ]; then
                                    echo "✅ Menu endpoint is working! (HTTP $MENU_CODE)"
                                else
                                    echo "⚠️ Menu endpoint returned HTTP $MENU_CODE"
                                fi
                                echo ""
                                
                                echo "🎉 All validation checks passed!"
                                exit 0
                            else
                                echo "⏳ Attempt $ATTEMPT/$MAX_ATTEMPTS - Health check returned HTTP $HTTP_CODE, retrying in 2 seconds..."
                                sleep 2
                                ATTEMPT=$((ATTEMPT + 1))
                            fi
                        done
                        
                        echo "❌ Health check failed after $MAX_ATTEMPTS attempts!"
                        echo "📋 PM2 logs:"
                        pm2 logs fastfood-app --lines 20 --nostream
                        exit 1
                    '''
                }
                echo '✅ Application is healthy and running!'
            }
        }
    }
    
    post {
        always {
            echo '🧹 ===== CLEANUP ====='
            echo '📊 Pipeline execution completed'
            echo "⏱️ Duration: ${currentBuild.durationString.replace(' and counting', '')}"
        }
        
        success {
            echo '🎉 ===== PIPELINE SUCCESS ====='
            echo "✅ Build Number: ${env.BUILD_NUMBER}"
            echo '✅ All stages completed successfully!'
            echo '================================'
            script {
                def publicIP = sh(script: 'curl -s ifconfig.me', returnStdout: true).trim()
                echo "🌐 Application URL: http://${publicIP}:3000"
                echo "💚 Health Check: http://${publicIP}:3000/health"
                echo "📋 API Menu: http://${publicIP}:3000/api/menu"
            }
            echo '================================'
            script {
                sh '''
                    echo "📊 Final PM2 Status:"
                    pm2 list
                '''
            }
        }
        
        failure {
            echo '❌ ===== PIPELINE FAILED ====='
            echo "❌ Build Number: ${env.BUILD_NUMBER}"
            echo '❌ Pipeline execution failed!'
            echo '📋 Check the logs above for error details'
            script {
                sh '''
                    echo "📋 PM2 Error Logs:"
                    pm2 logs fastfood-app --err --lines 30 --nostream || true
                '''
            }
        }
    }
}