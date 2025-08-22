
### **AI-Powered OKR 任务看板：开发文档**

**版本:** 1.0
**日期:** 2025-08-22

#### 1\. 项目概述

一个跨平台（Windows & macOS）的桌面任务看板应用。用户输入高级目标，应用通过 AI（LLM）自动将其拆分为结构化的 OKR 任务，并以看板形式呈现。应用核心由 Go 语言构建，UI 采用现代 Web 技术。

#### 2\. 核心技术栈

  * **后端 & 框架:** Go + Wails v2
  * **前端:** React + TailwindCSS
  * **数据存储:** SQLite (嵌入式数据库)
  * **AI 服务:** 任何 OpenAI 兼容的 API

#### 3\. 项目结构

```
/project-root
├── go.mod
├── main.go               # 应用入口，Wails 初始化
├── app.go                # Go 后端核心 App 结构体，暴露给前端的方法
|
├── /models               # 数据模型定义
│   └── models.go         # Go Structs (OKRPlan, Objective, Task 等)
|
├── /services             # 业务逻辑服务
│   ├── ai_service.go     # 封装 LLM API 调用、Prompt 构建
│   └── task_service.go   # 任务的 CRUD 业务逻辑
|
└── /database             # 数据持久化
    └── repository.go     # SQLite 数据库操作 (初始化、增删改查)
|
└── /frontend             # 所有前端代码
    ├── package.json
    ├── src/
    │   ├── main.jsx      # React 入口
    │   ├── App.jsx       # 根组件
    │   └── /components/  # React UI 组件
    │       ├── InitialInputView.jsx
    │       ├── KanbanBoardView.jsx
    │       ├── TaskCard.jsx
    │       └── SidebarView.jsx
    └── wailsjs/          # Wails 自动生成的 Go-JS Bridge (无需手动修改)
```

#### 4\. 后端设计 (Go)

##### 4.1. 数据模型 (`models.go`)

```go
// Task 代表一个可执行的子任务
type Task struct {
    ID      string `json:"id"`
    Content string `json:"content"`
    Status  string `json:"status"` // "todo", "in_progress", "done"
}

// Objective 代表一个高阶目标
type Objective struct {
    ID    string `json:"id"`
    Title string `json:"title"`
    Tasks []Task `json:"tasks"`
}

// OKRPlan 是 AI 分析后生成的完整计划
type OKRPlan struct {
    Objectives []Objective `json:"objectives"`
}
```

##### 4.2. Wails API 接口 (`app.go`)

以下 Go 方法将暴露给前端 JavaScript 调用。

| 方法名 | 参数 | 返回值 | 描述 |
| :--- | :--- | :--- | :--- |
| `ProcessOKR` | `text string` | `(OKRPlan, error)` | 接收用户输入，调用 AI 服务拆分并保存任务。 |
| `GetInitialPlan` | - | `(OKRPlan, error)` | 应用启动时加载已存在的任务数据。 |
| `UpdateTask` | `task Task` | `error` | 更新单个任务（内容、状态等）。 |
| `SetWindowOnTop` | `enabled bool` | - | 设置或取消应用窗口置顶。 |

#### 5\. 前端设计 (React)

  * **`InitialInputView.jsx`**: 应用启动后展示的大输入框界面，用于接收用户的总体任务。
  * **`KanbanBoardView.jsx`**: 核心任务看板。包含 `todo`, `in_progress`, `done` 三列，用于展示和管理 `TaskCard`。
  * **`TaskCard.jsx`**: 代表单个任务的卡片。支持点击编辑、状态更新（如拖拽）。
  * **`SidebarView.jsx`**: 左侧抽屉式面板，用于回顾用户最初的输入或 OKR 整体大纲。
  * **与后端通信**: 所有对后端的调用都通过 Wails 提供的 `window.go.main.App` 对象进行，例如：
    ```javascript
    import { ProcessOKR, UpdateTask } from '../wailsjs/go/main/App';

    // 调用 Go 方法
    async function handleGenerate() {
      const plan = await ProcessOKR(userInput);
      // 更新 React 状态...
    }
    ```

#### 6\. 核心工作流：AI 拆分任务

1.  **[Frontend]** 用户在 `InitialInputView` 中输入目标，点击“生成”。
2.  **[Frontend]** `InitialInputView` 调用 `await ProcessOKR(userInput)`。
3.  **[Backend]** `app.go` 中的 `ProcessOKR` 方法被触发。
4.  **[Backend]** `ai_service` 构建一个包含指令和用户输入的 Prompt，并向 LLM API 发送 HTTP 请求。
      * **关键:** Prompt 必须强制 LLM 以预定义的 JSON 格式（匹配 `OKRPlan` 结构）返回结果。
5.  **[Backend]** `ai_service` 解析返回的 JSON 数据。
6.  **[Backend]** `task_service` 调用 `repository` 将解析后的 `OKRPlan` 数据持久化到 SQLite 数据库。
7.  **[Backend]** `ProcessOKR` 方法将 `OKRPlan` 数据返回给前端。
8.  **[Frontend]** React 组件接收到数据，更新 state，UI 从 `InitialInputView` 切换到 `KanbanBoardView`，并渲染出所有任务卡片。

#### 7\. 开发与构建

  * **环境依赖:**

      * Go (v1.18+)
      * Node.js (LTS)
      * Wails CLI

  * **开发模式 (热重载):**

    ```bash
    wails dev
    ```

  * **生产构建:**

    ```bash
    # 为当前平台构建
    wails build

    # 交叉编译 (例如在 macOS 上为 Windows 构建)
    一个脚本同时编译出mac与win
    ```

-----