# 张子健个人网站 Demo

AI 产品经理个人作品集 Demo，重点展示 Agent 平台、AI 基础设施、业务结果与 Vibe Coding 能力。

## 本地运行

最简单的方式：双击 `启动本地网站.command`，脚本会启动服务并自动打开浏览器。

也可以在终端运行：

```bash
npm install
npm run dev
```

不要直接打开项目根目录的 `index.html`。它是 Vite 开发入口，需要由开发服务器编译。

## 直接双击离线查看

生成可直接打开的单文件 Demo：

```bash
npm run build:standalone
```

随后双击项目根目录的 `打开Demo.html`。

## 生产构建

```bash
npm run build
```

生产文件位于 `dist/`。仓库推送到 `main` 后，GitHub Actions 会自动部署 GitHub Pages。

## 内容维护

- `src/content.ts`：关键数据、项目与经历
- `src/App.tsx`：页面结构与交互内容
- `CONTENT_TODO.md`：后续内容采集模板
- `public/portrait.png`：当前个人肖像

当前 Vibe Coding Lab 是本地静态交互，尚未连接真实大模型。
