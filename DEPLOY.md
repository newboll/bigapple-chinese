# 部署到 Vercel（免费静态前端）

本配置把 React 前端单独构建成静态站部署到 Vercel，API 仍代理到现有豆包运行时。
适合演示/预览；正式业务请走独立后端部署方案。

## 步骤

1. 打开 https://vercel.com ，用 GitHub 账号 `newboll` 登录
2. 点 **Add New → Project**
3. 选中 `newboll/bigapple-chinese` 仓库，点 **Import**
4. 配置：
   - Framework Preset: **Other**
   - Root Directory: 默认（仓库根目录）
   - Build Command: 默认 `npm install && npm run build:client`（已在 vercel.json 里写好）
   - Output Directory: **`dist/client`**
   - Install Command: 默认
5. 点 **Deploy**，等 2-3 分钟构建完成
6. 拿到 `https://bigapple-chinese-xxx.vercel.app` 的地址

## 注意

- 书籍封面、翻页图已打包在静态文件里（`client/public/books/`）
- 登录、下单、后台管理这些需要写库的功能暂时还走豆包后端；如出现跨域报错，属于预期
- 如果 Vercel 构建报 Output Directory 不对，把 Output Directory 改成 `dist` 再试
- 代理规则写在 `vercel.json` 里，指向当前线上后端

