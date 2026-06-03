# AquaMind Frontend

AquaMind 前端基于 React、TypeScript、Ant Design、Axios、Zustand 和 Vite 构建，为水生生物图像识别与智能咨询系统提供浏览器端操作界面。

## 软件安装说明

### 环境要求

- Node.js 18 及以上版本。
- npm。
- 后端服务已启动，默认地址为 `http://localhost:8000`。

### 安装步骤

进入前端目录：

```powershell
cd D:\bysj\AquaMind\frontend
```

安装依赖：

```powershell
npm install
```

检查 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000
```

启动开发服务：

```powershell
npm run dev
```

浏览器访问：

```text
http://localhost:8001
```

构建生产版本：

```powershell
npm run build
```

预览生产构建：

```powershell
npm run preview
```

## 软件使用说明

### 登录与注册

打开前端地址后，未登录用户会进入登录页面。新用户可以先注册账号，再使用账号密码登录。登录成功后，系统进入控制台首页。

### AI 对话

控制台默认显示 AI 对话页面。用户可以新建对话、切换历史对话、选择模型，并输入水生生物相关问题。对话支持图片附件，回答中可展示知识库引用来源。

### 图像识别

进入“图像识别”页面后，上传图片即可调用后端 YOLO 模型进行检测。系统会展示识别结果、置信度、标注图片和历史记录。用户可以查看或删除历史识别结果。

### 知识库

进入“知识库”页面后，可以上传文档并添加标签。系统支持文档列表查看、标签筛选、知识检索、文档详情查看、原文下载和删除。知识库内容会用于增强 AI 对话回答。

### 个人中心

用户可以在个人中心查看和维护个人资料。

### 用户管理

管理员账号登录后可访问用户管理页面，对系统用户进行查看和管理。普通用户不会显示该菜单。
