#!/bin/bash
set -e

echo "🔧 ===== INSTALLING DEPENDENCIES ====="

# Update package lists
echo "📦 Updating package lists..."
apt-get update -y

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Install PM2 globally for process management
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2 process manager..."
    npm install -g pm2
else
    echo "✅ PM2 already installed: $(pm2 --version)"
fi

# Install other useful tools
echo "📥 Installing additional tools..."
apt-get install -y curl wget

echo "✅ All dependencies installed successfully!"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PM2 version: $(pm2 --version)"