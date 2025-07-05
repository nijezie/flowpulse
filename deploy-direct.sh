#!/bin/bash
# Direct deployment script

echo "🚀 Deploying FlowPulse directly to Vercel..."

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy
echo "Starting deployment..."
vercel --prod

echo "✅ Deployment complete!"
echo "Don't forget to add your environment variables in the Vercel dashboard"
