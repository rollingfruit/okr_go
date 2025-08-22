# OKR 任务看板

一个跨平台（Windows & macOS）的桌面任务看板应用。用户输入高级目标，应用通过 AI（LLM）自动将其拆分为结构化的 OKR 任务，并以看板形式呈现。

## 功能特点

- 🤖 **AI 智能拆分**: 使用 OpenAI 兼容的 API 将大目标拆分为可执行的小任务
- 📋 **看板管理**: 直观的拖拽式任务管理界面
- ✏️ **任务编辑**: 实时编辑任务内容和状态
- 📌 **窗口置顶**: 支持将应用窗口设置为置顶显示
- 💾 **本地存储**: 使用 SQLite 本地数据库，无需联网即可查看已有任务
- 🔄 **目标回顾**: 侧边栏展示原始目标，方便回顾和重新规划

## 技术栈

- **后端**: Go + Wails v2
- **前端**: React + TailwindCSS
- **数据库**: SQLite (嵌入式)
- **AI 服务**: OpenAI 兼容的 API

## 安装要求

- Go 1.21+
- Node.js (LTS)
- Wails CLI v2

## 开发环境设置

1. **安装 Wails CLI**:
   ```bash
   go install github.com/wailsapp/wails/v2/cmd/wails@latest
   ```

2. **克隆项目**:
   ```bash
   git clone <repository-url>
   cd okr_go
   ```

3. **安装依赖**:
   ```bash
   # Go 依赖
   go mod tidy
   
   # 前端依赖
   cd frontend
   npm install
   cd ..
   ```

4. **配置环境变量**:
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，设置你的 OpenAI API Key
   ```

5. **开发模式运行**:
   ```bash
   wails dev
   ```

## 生产构建

### 单平台构建
```bash
wails build
```

### 跨平台构建
```bash
./build-cross-platform.sh
```

这将生成以下可执行文件：
- `OKR任务看板-macos-intel.app` (macOS Intel)
- `OKR任务看板-macos-arm64.app` (macOS Apple Silicon)
- `OKR任务看板-windows.exe` (Windows)

## 配置说明

### 环境变量

- `OPENAI_API_KEY`: OpenAI API 密钥（必需）
- `OPENAI_BASE_URL`: API 基础 URL（可选，默认为 OpenAI）
- `OPENAI_MODEL`: 使用的模型（可选，默认为 gpt-3.5-turbo）

### 支持的 AI 服务

应用支持任何 OpenAI 兼容的 API，包括：
- OpenAI GPT
- Claude API
- Ollama 本地部署
- 其他兼容服务

## 使用说明

1. **输入目标**: 在启动界面输入本周目标和总体目标
2. **AI 拆分**: 点击"开始 AI 拆分"，等待 AI 处理
3. **任务管理**: 在看板界面拖拽任务卡片更改状态
4. **编辑任务**: 点击任务卡片上的编辑按钮修改内容
5. **目标回顾**: 点击左上角菜单按钮查看原始目标
6. **重新规划**: 在侧边栏点击"重新规划目标"开始新的规划

## 数据存储

应用数据存储在用户主目录下的 `.okr_go/data.db` 文件中：
- macOS: `~/Library/Application Support/.okr_go/data.db`
- Windows: `%USERPROFILE%\.okr_go\data.db`

## 故障排除

### 常见问题

1. **AI 拆分失败**:
   - 检查网络连接
   - 确认 API Key 是否正确
   - 检查 API 配额是否充足

2. **应用无法启动**:
   - 确认系统权限设置
   - 检查杀毒软件是否拦截

3. **任务数据丢失**:
   - 检查数据库文件是否存在
   - 确认文件读写权限

## 开发说明

### 项目结构
```
/okr_go
├── go.mod                 # Go 模块定义
├── main.go               # 应用入口
├── app.go                # Wails 应用结构体
├── wails.json            # Wails 配置
├── /models              # 数据模型
├── /services            # 业务逻辑
├── /database            # 数据库操作
└── /frontend            # React 前端
    ├── package.json
    ├── src/
    │   ├── App.jsx
    │   └── /components/
    └── dist/            # 构建输出
```

### 添加新功能

1. **后端 API**: 在 `app.go` 中添加新方法
2. **数据模型**: 在 `models/models.go` 中定义结构体
3. **业务逻辑**: 在 `services/` 目录下实现
4. **前端组件**: 在 `frontend/src/components/` 中创建

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！