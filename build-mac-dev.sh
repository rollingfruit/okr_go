#!/bin/bash

# macOS Development Mode Build Script
echo "🍎 Building OKR Task Board for macOS (Development Mode)..."

# Ensure wails is in PATH
export PATH=~/bin:$PATH

# Clean previous builds
rm -rf build/bin/*

# Build for macOS with development tools enabled
echo "📦 Building for macOS (Apple Silicon M1) with development tools..."
~/bin/wails build -platform darwin/arm64 -clean -devtools

# Get the built app name
APP_NAME="build/bin/okr_go.app"
FINAL_NAME="build/bin/OKR任务看板-dev.app"

if [ -d "$APP_NAME" ]; then
    echo "🔧 Post-processing macOS development app..."
    
    # Rename the app
    mv "$APP_NAME" "$FINAL_NAME"
    
    # Fix permissions for development
    echo "🔐 Setting development permissions..."
    chmod +x "$FINAL_NAME/Contents/MacOS/"*
    chmod -R 755 "$FINAL_NAME"
    
    # Remove all extended attributes including quarantine
    echo "🧹 Removing quarantine and extended attributes..."
    xattr -c "$FINAL_NAME" 2>/dev/null || true
    
    # Add development signature (ad-hoc)
    echo "✍️ Adding development signature..."
    codesign --force --deep --sign - --entitlements /dev/null "$FINAL_NAME" 2>/dev/null || {
        echo "⚠️ Warning: Could not sign app. This is normal for development builds."
    }
    
    # Make it executable directly
    echo "⚡ Making app directly executable..."
    chmod +x "$FINAL_NAME"
    
    echo "✅ macOS development app ready: $FINAL_NAME"
    echo "📊 App size: $(du -h "$FINAL_NAME" | cut -f1)"
    
    echo ""
    echo "🚀 How to run the development app:"
    echo "Method 1 (Recommended): open '$FINAL_NAME'"
    echo "Method 2: Right-click app -> Open"
    echo "Method 3: Double-click app (may show security warning first time)"
    echo ""
    echo "🔒 If macOS blocks the app:"
    echo "1. Go to System Preferences -> Security & Privacy -> General"
    echo "2. Click 'Open Anyway' next to the blocked app message"
    echo "3. Or run: sudo spctl --master-disable (disables Gatekeeper temporarily)"
    
else
    echo "❌ Build failed - app not found"
    exit 1
fi