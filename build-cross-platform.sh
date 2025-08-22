#!/bin/bash

# Cross-platform build script for OKR Task Board
echo "🚀 Building OKR Task Board for multiple platforms..."

# Ensure wails is in PATH
export PATH=~/bin:$PATH

# Clean previous builds
rm -rf build/bin/*

# Build for Windows (AMD64) first - more reliable
echo "📦 Building for Windows (AMD64)..."
~/bin/wails build -platform windows/amd64 -clean -o "OKR任务看板-windows-amd64.exe"

if [ $? -eq 0 ]; then
    echo "✅ Windows build successful"
else
    echo "❌ Windows build failed"
    exit 1
fi

# Build for macOS (Apple Silicon M1) - Development mode compatible
echo "📦 Building for macOS (Apple Silicon M1)..."
~/bin/wails build -platform darwin/arm64 -clean -devtools

# Rename the macOS app to the specified name
if [ -d "build/bin/okr_go.app" ]; then
    mv build/bin/okr_go.app "build/bin/OKR任务看板-macos-m1.app"
    
    # Fix permissions for macOS
    chmod +x "build/bin/OKR任务看板-macos-m1.app/Contents/MacOS/"*
    chmod -R 755 "build/bin/OKR任务看板-macos-m1.app"
    
    # Remove quarantine attributes for development
    xattr -c "build/bin/OKR任务看板-macos-m1.app" 2>/dev/null || true
    
    echo "✅ macOS build successful (development mode)"
else
    echo "❌ macOS build failed"
fi

echo "✅ Build completed!"
echo "📁 Built applications:"
ls -la build/bin/
echo ""
echo "📊 File sizes:"
du -h build/bin/*

echo ""
echo "🔧 Platform-specific instructions:"
echo "Windows: Double-click OKR任务看板-windows-amd64.exe to run"
echo "macOS: Right-click app -> Open (or use: open 'build/bin/OKR任务看板-macos-m1.app')"