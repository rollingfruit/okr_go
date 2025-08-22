# OKR任务看板 Web版本使用指南

## 概述

现在您的OKR项目支持两种运行模式：
1. **Wails桌面应用** - 适用于Windows和Mac桌面环境
2. **Web浏览器版本** - 适用于Mac开发调试，通过浏览器访问

## 核心特性

✅ **同一数据库** - Web版本和Wails版本使用相同的SQLite数据库，数据完全同步  
✅ **相同UI** - 前端代码完全一致，确保体验统一  
✅ **自动适配** - 前端会自动检测运行环境（Wails或Web）  
✅ **开发友好** - 支持前端热重载和开发模式  

## 运行方式

### 1. 快速启动Web版本
```bash
./run-web.sh
```
然后在浏览器打开: http://localhost:8080

### 2. 开发模式（自动重载）
```bash
./run-dev.sh
```
- 自动监听前端文件变化
- 自动重新构建前端
- 无需重启服务器

### 3. 手动启动
```bash
# 构建前端
cd frontend && npm run build && cd ..

# 启动Web服务器
go run web_server.go
```

## 前端修改同步机制

### 文件结构
```
frontend/
├── src/                 # 源代码（修改这里）
│   ├── App.jsx         # 主应用组件
│   ├── components/     # UI组件
│   └── webjs/         # Web API封装
├── dist/              # 构建输出（Web版本使用）
└── wailsjs/          # Wails绑定（桌面版本使用）
```

### 同步流程
1. **修改前端代码** → `frontend/src/` 目录
2. **构建** → `npm run build` 生成 `frontend/dist/`
3. **Wails版本** → 重新构建Wails应用
4. **Web版本** → 重启Web服务器或使用开发模式

### 自动环境检测
前端代码会自动检测运行环境：
```javascript
// 检测是否在Wails环境
if (window.go) {
    // 使用Wails API
    window.go.main.App.ProcessOKR(...)
} else {
    // 使用Web API
    fetch('/api/process-okr', ...)
}
```

## API对照表

| 功能 | Wails方法 | Web API端点 |
|------|----------|-------------|
| 处理OKR | `ProcessOKR()` | `POST /api/process-okr` |
| 获取计划 | `GetInitialPlan()` | `GET /api/initial-plan` |
| 更新任务 | `UpdateTask()` | `POST /api/update-task` |
| 获取用户输入 | `GetLatestUserInput()` | `GET /api/user-input` |

## 开发工作流

### 场景1：修改UI组件
1. 修改 `frontend/src/components/*.jsx`
2. **开发模式**: 文件自动重新构建
3. **手动模式**: 运行 `npm run build`
4. 刷新浏览器查看Web版本
5. 重新构建Wails应用查看桌面版本

### 场景2：修改业务逻辑
1. 修改 `frontend/src/App.jsx` 或组件逻辑
2. 构建前端：`npm run build`
3. Web版本：重启服务器或刷新页面
4. Wails版本：重新构建应用

### 场景3：修改后端API
1. 修改 `app.go`（Wails）或 `web_server.go`（Web）
2. 保持API接口一致性
3. 重启对应的服务

## 数据库同步

**重要**: Web版本和Wails版本使用同一个SQLite数据库文件：
```
~/.okr_go/data.db
```

这意味着：
- 在Web版本中创建的OKR计划，在Wails版本中可以看到
- 在Wails版本中更新的任务，在Web版本中会同步
- 完全的数据一致性

## 故障排除

### Web版本无法启动
```bash
# 检查端口占用
lsof -i :8080

# 重新构建前端
cd frontend && npm install && npm run build

# 检查Go模块
go mod tidy
```

### 前端修改不生效
```bash
# 强制重新构建
rm -rf frontend/dist
cd frontend && npm run build

# 清除浏览器缓存
# Chrome: Ctrl+Shift+R (强制刷新)
```

### 数据不同步
```bash
# 检查数据库文件位置
ls -la ~/.okr_go/data.db

# 确保两个版本使用相同的数据库路径
```

## 模式指示器

前端会在右上角显示当前运行模式：
- **Wails Mode** - 在Wails桌面应用中
- **Web Mode** - 在浏览器中

## 最佳实践

1. **开发阶段**: 使用Web版本进行快速迭代
2. **测试阶段**: 同时测试Web版本和Wails版本
3. **发布前**: 确保两个版本功能完全一致
4. **代码修改**: 优先考虑跨平台兼容性

## 构建脚本对照

| 用途 | 脚本 | 说明 |
|------|------|------|
| Web开发 | `./run-dev.sh` | 开发模式，自动重载 |
| Web生产 | `./run-web.sh` | 生产模式，单次构建 |
| Wails桌面 | `./build-cross-platform.sh` | 跨平台构建 |
| Mac开发 | `./build-mac-dev.sh` | Mac开发者模式 |

通过这种双模式设计，您可以：
- **Mac平台**: 使用Web版本进行开发和调试
- **Windows平台**: 使用编译好的exe文件正常使用
- **数据同步**: 两个版本之间数据完全共享
- **代码统一**: 一套前端代码，两种运行方式