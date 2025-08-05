#!/bin/bash

# MemoryQR Production Deployment Script
# Kullanım: ./deploy-production.sh

echo "🚀 MemoryQR Production Deployment Starting..."

# 1. Dependencies yükleme
echo "📦 Installing dependencies..."
pnpm install --prod

# 2. Database'i production için hazırlama
echo "🗄️ Setting up production database..."
pnpm db:generate
pnpm db:push

# 3. Build işlemi
echo "🔨 Building application..."
pnpm build

# 4. Production sunucusunu başlatma
echo "🌐 Starting production server..."
pnpm start

echo "✅ Deployment completed!"
echo "🌍 Application is running at: http://localhost:3000"
