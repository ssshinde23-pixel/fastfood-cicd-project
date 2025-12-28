#!/bin/bash
set -e

echo "▶️ ===== STARTING APPLICATION ====="

# Navigate to application directory (update if your folder name changes)
cd /home/ubuntu/fastfood-cicd-project

# Install production dependencies
echo "📦 Installing production dependencies..."
npm install --production

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Start application with PM2
echo "🚀 Starting Fast Food App with PM2..."
pm2 start server.js \
    --name fastfood-app \
    --time \
    --instances 1 \
    --max-memory-restart 500M \
    --log /var/log/fastfood-app.log \
    --error /var/log/fastfood-app-error.log

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot (user = ubuntu, home = /home/ubuntu)
echo "⚙️ Configuring PM2 startup..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Display PM2 status
echo "📊 Application Status:"
pm2 list
pm2 info fastfood-app

echo "✅ Application started successfully!"
echo "🌐 Access at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"