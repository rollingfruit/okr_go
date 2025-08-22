#!/bin/bash

# Web Server Startup Script for OKR Task Board
echo "🌐 Starting OKR Task Board Web Server..."

# Check if frontend dist exists, if not build it
if [ ! -d "frontend/dist" ]; then
    echo "📦 Frontend not built, building now..."
    cd frontend
    npm install
    npm run build
    cd ..
else
    echo "✅ Frontend already built"
fi

# Check if we need to rebuild frontend (if source is newer than dist)
if [ "frontend/src" -nt "frontend/dist" ]; then
    echo "🔄 Frontend source updated, rebuilding..."
    cd frontend
    npm run build
    cd ..
fi

# Start the web server
echo "🚀 Starting Go web server..."
echo "📍 URL: http://localhost:8080"
echo "📊 Same database as Wails app - changes sync!"
echo "🔧 Press Ctrl+C to stop the server"
echo ""

go run cmd/web/main.go