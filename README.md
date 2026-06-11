# 张子健个人履历网站

AI 产品经理个人履历网站。首屏展示 Agent 平台与 AI 基础设施视觉，正文严格按照简历的基本信息、教育背景、个人优势、工作经历、创业经历和实习经历顺序展开。

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

- `src/content.ts`：简历全文、经历结构与素材映射
- `src/App.tsx`：页面结构与交互内容
- `src/HeroScene.tsx`：首屏 Three.js / Canvas 场景
- `src/assets.ts`：线上与离线单文件的素材地址解析
- `CONTENT_TODO.md`：后续内容采集模板
- `public/portrait.png`：当前个人肖像
