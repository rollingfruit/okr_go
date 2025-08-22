#!/bin/bash

# Environment Variables Checker
echo "🔍 Checking OKR Application Environment..."
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
    echo ""
    echo "📋 Current .env configuration:"
    echo "─────────────────────────────"
    
    # Read and display env variables (masked for security)
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ $key =~ ^#.*$ ]] || [[ -z $key ]]; then
            echo "$key$value"
            continue
        fi
        
        # Mask sensitive values
        if [[ $key == *"KEY"* ]]; then
            if [ ${#value} -gt 10 ]; then
                masked="${value:0:10}...${value: -4}"
                echo "$key=$masked"
            else
                echo "$key=***HIDDEN***"
            fi
        else
            echo "$key=$value"
        fi
    done < .env
    
    echo "─────────────────────────────"
    echo ""
    
    # Test environment loading
    echo "🧪 Testing environment variable loading..."
    if command -v go >/dev/null 2>&1; then
        go run -c '
package main

import (
    "fmt"
    "os"
    "github.com/joho/godotenv"
)

func main() {
    godotenv.Load()
    
    apiKey := os.Getenv("OPENAI_API_KEY")
    baseURL := os.Getenv("OPENAI_BASE_URL")
    model := os.Getenv("OPENAI_MODEL")
    
    fmt.Println("Environment variables loaded by Go:")
    
    if apiKey != "" {
        masked := apiKey[:10] + "..." + apiKey[len(apiKey)-4:]
        fmt.Printf("✅ OPENAI_API_KEY: %s\n", masked)
    } else {
        fmt.Println("❌ OPENAI_API_KEY: NOT SET")
    }
    
    if baseURL != "" {
        fmt.Printf("✅ OPENAI_BASE_URL: %s\n", baseURL)
    } else {
        fmt.Println("⚠️  OPENAI_BASE_URL: Using default")
    }
    
    if model != "" {
        fmt.Printf("✅ OPENAI_MODEL: %s\n", model)
    } else {
        fmt.Println("⚠️  OPENAI_MODEL: Using default")
    }
}' 2>/dev/null || echo "⚠️  Go environment test skipped (Go not available)"
    else
        echo "⚠️  Go not found, skipping environment test"
    fi
else
    echo "❌ .env file not found!"
    echo ""
    echo "📝 To create .env file:"
    echo "cp .env.example .env"
    echo "# Then edit .env with your OpenAI API key"
fi

echo ""
echo "🔧 Usage:"
echo "./run-dev.sh    - Start development server"
echo "./run-web.sh    - Start production server"
echo ""