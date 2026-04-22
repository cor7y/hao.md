# 吴昊个人网站

预览：[https://cor7y.github.io/hao.md/](https://cor7y.github.io/hao.md/)

## AI 对话部署 (Vercel)

### 环境变量

在 Vercel Project Settings → Environment Variables 中配置：

- `LLM_PROVIDER` — `anthropic` 或 `openai`
- `ANTHROPIC_API_KEY` — Anthropic API Key
- `ANTHROPIC_MODEL` — Anthropic 模型名
- `OPENAI_API_KEY` — OpenAI API Key
- `OPENAI_MODEL` — OpenAI 模型名
- `ALLOWED_ORIGIN` — 允许的跨域来源（可选，默认 `*`）

### 本地开发

```
npm install
npx vercel dev
```

需先安装 Vercel CLI 并登录：

```
npm i -g vercel
vercel login
```

### 部署到 Vercel

1. 把仓库 import 到 Vercel（vercel.com → New Project → 选本仓库）
2. Framework Preset 选 "Other"（纯静态 + Functions）
3. 在 Project Settings → Environment Variables 里配上面那些变量
4. Deploy。之后每次 `git push` 自动部署

### 验证清单

- 打开站点，浮窗按钮点开有聊天界面
- 问"你是谁" → 正常回答
- 问"今天天气" → 拒答话术
- F12 Network 看 `/api/chat` 返回 `text/event-stream`
