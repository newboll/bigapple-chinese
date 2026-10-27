# Big Apple Chinese — 大苹果汉语电子绘本商城

面向海外华裔儿童与中文学习者的分级电子绘本商城（bigapplechinese.com）。
作者：Huali Xiong（熊华丽）；插画：Wenpei Lin（林文佩）；新加坡 Big Apple Chinese 出版。

## 功能

- C 端商城：首页 Banner、按级别（LAB / L1–L6）分类选书、搜索、书籍详情
- 3D 翻页阅读器：真实翻书动画、试读锁定、进度与缩放
- 购物车 / Stripe 结算、会员注册登录、我的订单、我的电子书
- 阅读时长统计（服务端累计、跨设备同步）
- 管理后台 `/admin`：RBAC 四级角色权限、书籍管理（上传 PDF 自动拆页）、订单管理、会员管理、数据看板、操作日志、登录审计
- 中英双语 i18n，响应式适配

## 技术栈

- 前端：React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- 后端：NestJS
- 共享类型：shared/

## 本地启动

要求 Node.js >= 22、npm >= 10。

```bash
npm install
npm run dev:server   # 后端，默认端口 3000
npm run dev:client   # 前端，默认端口 5173
```

生产构建：

```bash
npm run build:prod
npm start
```

## 目录结构

```
client/    React 前端（含绘本页面图片 client/public/books/）
server/    NestJS 后端
shared/    前后端共享类型
scripts/   启动与构建脚本
```

## License

Copyright © Big Apple Chinese. All rights reserved.
