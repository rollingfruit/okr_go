#!/bin/bash

# Safe macOS build script with signature and permission fixes
echo "🚀 Building OKR Task Board for macOS (Safe Mode)..."

# Ensure wails is in PATH
export PATH=~/bin:$PATH

# Clean previous builds
rm -rf build/bin/*

# Build for macOS (Apple Silicon M1)
echo "📦 Building for macOS (Apple Silicon M1)..."
wails build -platform darwin/arm64 -clean

# Get the built app name
APP_NAME="build/bin/okr_go.app"
FINAL_NAME="build/bin/OKR任务看板-macos-m1.app"

if [ -d "$APP_NAME" ]; then
    echo "🔧 Post-processing macOS app..."
    
    # Rename the app
    mv "$APP_NAME" "$FINAL_NAME"
    
    # Fix permissions
    echo "🔐 Fixing permissions..."
    chmod +x "$FINAL_NAME/Contents/MacOS/"*
    chmod -R 755 "$FINAL_NAME"
    
    # Remove quarantine attributes (if any)
    echo "🧹 Removing quarantine attributes..."
    xattr -c "$FINAL_NAME" 2>/dev/null || true
    
    # Re-sign with ad-hoc signature
    echo "✍️ Re-signing application..."
    codesign --force --deep --sign - "$FINAL_NAME" 2>/dev/null || {
        echo "⚠️ Warning: Could not re-sign app. Xcode command line tools may not be installed."
    }
    
    echo "✅ macOS app ready: $FINAL_NAME"
    echo "📊 App size: $(du -h "$FINAL_NAME" | cut -f1)"
    
    echo ""
    echo "🔍 Installation instructions:"
    echo "1. Right-click the app and select 'Open'"
    echo "2. In the warning dialog, click 'Open'"
    echo "3. Or use terminal: open '$FINAL_NAME'"
    
else
    echo "❌ Build failed - app not found"
    exit 1
fi