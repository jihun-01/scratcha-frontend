#!/bin/sh

# Set default environment variables
if [ -z "$VITE_API_URL" ]; then
    export VITE_API_URL="http://210.109.80.247:8001"
fi

if [ -z "$ENVIRONMENT" ]; then
    export ENVIRONMENT="production"
fi

if [ -z "$DNS_SERVER" ]; then
    export DNS_SERVER="10.96.0.10"
fi

echo "Frontend starting..."
echo "API URL: $VITE_API_URL"
echo "Environment: $ENVIRONMENT"
echo "DNS Server: $DNS_SERVER"

# Kubernetes environment DNS configuration
if [[ "$VITE_API_URL" == *"svc.cluster.local"* ]]; then
    # Update DNS resolver in nginx config
    sed -i "s|resolver 10.96.0.10 valid=30s;|resolver $DNS_SERVER valid=30s;|g" /etc/nginx/nginx.conf
    
    # Update nginx proxy settings
    sed -i "s|http://210.109.80.247:8001|$VITE_API_URL|g" /etc/nginx/nginx.conf
    echo "Kubernetes internal service proxy configured: $VITE_API_URL"
else
    # External service configuration
    sed -i "s|http://210.109.80.247:8001|$VITE_API_URL|g" /etc/nginx/nginx.conf
fi

# Start nginx
exec nginx -g "daemon off;"
