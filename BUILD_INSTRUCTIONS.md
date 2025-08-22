# OKR任务看板 构建说明

## 构建脚本说明

### 1. 跨平台构建 (推荐)
```bash
./build-cross-platform.sh
```
- 先构建 Windows 版本，再构建 macOS 版本
- Windows: `build/bin/OKR任务看板-windows-amd64.exe`
- macOS: `build/bin/OKR任务看板-macos-m1.app`

### 2. macOS 开发模式构建
```bash
./build-mac-dev.sh
```
- 启用开发者工具
- 自动处理权限和签名
- 输出: `build/bin/OKR任务看板-dev.app`

### 3. 手动构建命令

#### Windows 版本
```bash
~/bin/wails build -platform windows/amd64 -clean -o "OKR任务看板-windows.exe"
```

#### macOS 版本 (开发模式)
```bash
~/bin/wails build -platform darwin/arm64 -clean -devtools
```

## 运行说明

### Windows
直接双击 `OKR任务看板-windows-amd64.exe` 运行

### macOS
1. **推荐方式**: 
   ```bash
   open "build/bin/OKR任务看板-dev.app"
   ```

2. **右键菜单**: 右键点击应用 → 选择"打开"

3. **如果被 macOS 阻止**:
   - 进入"系统偏好设置" → "安全性与隐私" → "通用"
   - 点击应用旁边的"仍要打开"按钮
   - 或者临时禁用 Gatekeeper:
     ```bash
     sudo spctl --master-disable
     ```

## 技术细节

### 解决的问题
1. **Windows 平台兼容性**: 正确设置 GOOS/GOARCH 环境变量
2. **macOS 开发者模式**: 启用 devtools，使用 ad-hoc 签名
3. **权限问题**: 自动设置正确的文件权限
4. **隔离属性**: 自动清除 quarantine 属性

### 配置优化
- `wails.json`: 添加了 Windows 主题配置和 macOS 签名配置
- 使用 `-devtools` 标志启用开发者工具
- 使用 `identity: "-"` 进行 ad-hoc 签名

### 依赖要求
- Go 1.22+
- Wails v2.10.2
- Node.js (用于前端构建)
- macOS: Xcode Command Line Tools (可选，用于代码签名)

## 故障排除

### 如果 Wails 不在 PATH 中
```bash
# 安装到用户目录
mkdir -p ~/bin && GOBIN=~/bin go install github.com/wailsapp/wails/v2/cmd/wails@latest

# 检查版本
~/bin/wails version
```

### 如果前端构建失败
```bash
cd frontend
npm install
npm run build
```

### 如果 Go 模块有问题
```bash
go mod tidy
go clean -modcache
```