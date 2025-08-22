# OKR 任务看板 - 安装指南

## 🍎 macOS 用户安装说明

### ⚠️ 重要提示
由于这是一个未经 Apple 公证的应用，macOS Gatekeeper 会阻止运行。这是正常的安全机制。

### 🚀 快速解决方案

#### 方法一：右键打开（强烈推荐）
1. **右键点击** `OKR任务看板-macos-m1.app` 
2. 选择 **"打开"**
3. 在弹出的安全警告中点击 **"打开"**
4. 应用将启动并被系统信任

#### 方法二：系统设置允许
1. 双击应用（会被阻止）
2. 打开 **"系统设置"** → **"隐私与安全性"**
3. 在 **"安全性"** 部分找到被阻止的应用
4. 点击 **"仍要打开"**

#### 方法三：终端命令（技术用户）
```bash
# 切换到应用所在目录
cd /path/to/app/directory

# 移除隔离标记
xattr -d com.apple.quarantine "OKR任务看板-macos-m1.app"

# 确保执行权限
chmod +x "OKR任务看板-macos-m1.app/Contents/MacOS/OKR任务看板"

# 启动应用
open "OKR任务看板-macos-m1.app"
```

### 🔧 如果仍然无法运行

```bash
# 重新签名应用（需要 Xcode 命令行工具）
codesign --force --deep --sign - "OKR任务看板-macos-m1.app"

# 然后再次尝试打开
open "OKR任务看板-macos-m1.app"
```

---

## 🪟 Windows 用户安装说明

### 正常启动
直接双击 `OKR任务看板-windows-amd64.exe` 即可运行。

### Windows Defender 警告处理
如果遇到 Windows Defender SmartScreen 警告：
1. 点击 **"更多信息"**
2. 点击 **"仍要运行"**

---

## ⚙️ 配置 OpenAI API

### 环境变量方式（推荐）
```bash
# macOS/Linux
export OPENAI_API_KEY="your-api-key-here"
export OPENAI_BASE_URL="https://api.openai.com/v1"  # 可选
export OPENAI_MODEL="gpt-3.5-turbo"                 # 可选

# Windows
set OPENAI_API_KEY=your-api-key-here
```

### 支持的 AI 服务
- OpenAI GPT-3.5/GPT-4
- Claude API（通过兼容接口）
- 本地 Ollama 部署
- 其他 OpenAI 兼容服务

---

## 📂 数据存储位置

### macOS
```
~/Library/Application Support/.okr_go/data.db
```

### Windows  
```
%APPDATA%\.okr_go\data.db
```

---

## 🔍 故障排除

### 应用启动失败
1. 检查是否按照上述步骤正确打开
2. 确认系统版本：macOS 10.15+ 或 Windows 10+
3. 检查磁盘空间是否充足

### AI 功能无法使用
1. 确认网络连接正常
2. 检查 API 密钥是否正确设置
3. 验证 API 配额是否充足

### 数据丢失
数据保存在本地 SQLite 数据库中，卸载应用不会删除数据。

---

## 📞 技术支持

如遇到其他问题，请检查：
1. 系统兼容性
2. 网络连接
3. API 配置

---

## 🔒 安全说明

此应用未经 Apple 公证的原因：
- 这是一个开源项目，没有付费的 Apple 开发者证书
- 代码完全透明，可在源码中查看所有功能
- 不包含任何恶意代码或隐私收集功能
- 所有数据均保存在本地，不会上传到外部服务器