#!/bin/bash

# Development Mode Script
echo "🔧 Starting Development Mode..."
echo "📝 This script watches for frontend changes and rebuilds automatically"
echo ""

# Function to build frontend
build_frontend() {
    echo "🔄 Rebuilding frontend..."
    cd frontend
    npm run build
    cd ..
    echo "✅ Frontend rebuilt at $(date)"
}

# Function to check if frontend source is newer than dist
check_frontend_changes() {
    if [ "frontend/src" -nt "frontend/dist" ]; then
        return 0  # needs rebuild
    fi
    return 1  # no rebuild needed
}

# Initial build
echo "📦 Initial frontend build..."
build_frontend

# Start web server in background
echo "🚀 Starting web server..."
echo "📋 Environment configuration will be displayed when server starts..."
go run cmd/web/main.go &
WEB_SERVER_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development mode..."
    kill $WEB_SERVER_PID 2>/dev/null
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

echo "🌐 Web server running at: http://localhost:8080"
echo "👀 Watching for frontend changes..."
echo "🔧 Press Ctrl+C to stop"
echo ""

# Watch for changes (simple polling)
while true; do
    if check_frontend_changes; then
        build_frontend
        echo "💡 Web server will serve updated files automatically"
    fi
    sleep 2
done