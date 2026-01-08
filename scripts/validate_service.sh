#!/bin/bash

echo "💚 ===== VALIDATING SERVICE ====="

# Wait for PM2 to fully start
echo "⏳ Waiting 25 seconds for application to stabilize..."
sleep 25

# Check if PM2 process exists and get status
PM2_LIST=$(pm2 jlist 2>/dev/null)

if echo "$PM2_LIST" | grep -q '"name":"fastfood-app"'; then
    echo "✅ PM2 process found!"
    
    # Check if it's online (not errored/stopped)
    if echo "$PM2_LIST" | grep '"name":"fastfood-app"' | grep -q '"status":"online"'; then
        echo "✅ Application status: ONLINE"
        echo "🎉 Deployment successful!"
        
        # Get public IP dynamically from EC2 metadata
        PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
        
        if [ "$PUBLIC_IP" != "localhost" ]; then
            echo "🌐 Application URL: http://$PUBLIC_IP:3000"
        else
            echo "🌐 Application URL: http://localhost:3000"
        fi
        
        pm2 list
        exit 0
    else
        echo "⚠️ Application exists but not online!"
        pm2 list
        pm2 logs fastfood-app --lines 30 --nostream
        exit 1
    fi
else
    echo "❌ PM2 process not found!"
    pm2 list
    exit 1
fi