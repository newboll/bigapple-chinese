# Big Apple Chinese 大苹果汉语 - 电子书商城

## 项目概览

面向海外少儿汉语学习者的电子书商城网站，品牌名「Big Apple Chinese 大苹果汉语」，作者 Huali Xiong（熊华丽），插画 Wenpei Lin（林文佩），新加坡出版。

## 设计规范

### 品牌色彩（国际化简洁风格）
- 背景色：`#FFFFFF` 纯白为基底，`#F9FAFB` 浅灰区分区块
- 文字主色：`#111827` - 近黑深灰
- 文字次色：`#6B7280` - 中性灰
- 文字弱色：`#9CA3AF` - 浅灰
- 主色/品牌红（苹果红）：`#E11D48` - 仅作点缀（按钮、标签、强调）
- 主色 hover：`#BE123C`
- 成功绿：`#059669`
- 边框：`#E5E7EB`
- 分隔线：`#F3F4F6`

### 字体
- 字体栈：Inter, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif
- 标题：字重 600-700，字距正常，简洁现代
- 正文：字重 400，行高 1.6
- 价格/数字：tabular-nums
- 拼音：清晰可读，字号略小

### 间距规范
- 内容区最大宽度：1200px，居中
- 页面区块间距：py-20 (80px) / 移动端 py-12
- Section 标题与内容间距：mb-10
- 卡片间距：gap-5 (grid) / gap-4 (移动端)
- 卡片内边距：p-5

### 圆角
- 卡片圆角：lg（8px）
- 按钮圆角：md（6px），少量 full 用于 CTA
- 图片圆角：md（6px）

### 阴影
- 卡片：极浅阴影 `shadow-sm` (0 1px 2px 0 rgb(0 0 0 / 0.05))
- hover：`shadow-md`，轻微上浮
- 浮层/弹窗：`shadow-lg`

### Level 级别配色（克制版）
- Level AB: `#EC4899`（柔和粉）
- Level One: `#EF4444`（品牌红）
- Level Two: `#F59E0B`（琥珀）
- Level Three: `#10B981`（翠绿）
- Level Four: `#3B82F6`（蓝）
- Level Five: `#8B5CF6`（紫）
- Level Six: `#1F2937`（深灰）

级别标签：浅色底 + 对应彩色文字 + 无描边，圆角 md，字号 xs

### 设计风格
- 大量留白、克制配色、干净排版
- 无渐变、无卡通装饰、无花哨动效
- 微交互：hover 轻微阴影加深 + 上移 1px
- 响应式：移动端优先，桌面端适配
- 红苹果 Logo 保留，作为品牌标识

## 技术架构

### 数据方案
- **前端 mock 驱动**：书籍、用户、订单、购物车全部使用前端 mock 数据 + localStorage 持久化
- 原因：用户明确要求 mock/演示数据，保证流程跑通即可，不需要真实后端
- 5 本真实书使用本地 PDF 文件，其余约 195 本为占位数据

### 核心模块
- `src/data/` - mock 数据（books, users, orders）
- `src/store/` - 状态管理（购物车、用户）
- `src/components/` - 通用组件
- `src/pages/` - 页面组件

### 路由
- `/` - 首页
- `/books` - 书城（分级浏览 + 搜索）
- `/book/:id` - 书籍详情
- `/reader/:id` - 翻页阅读器（全屏独立布局）
- `/cart` - 购物车
- `/checkout` - 结算
- `/order-success` - 支付成功
- `/account/login` - 登录
- `/account/register` - 注册
- `/account/orders` - 我的订单
- `/account/books` - 我的电子书

## 真实书籍数据

5 本真实书的页面图片位于 `public/books/pages/<bookId>/`（p01.jpg~p12.jpg）：
- wojianjian - 《我看见》Level AB
- huaguoqi - 《画国旗》Level One
- chongwudian - 《宠物店》Level One
- wenlu - 《问路》Level Three
- xiaobaobaoxiaole - 《小宝宝笑了》Level Four

封面（p01.jpg）用于书籍卡片和详情页，全部 12 页用于翻页阅读器。
阅读器使用图片逐页渲染 + CSS 3D 翻页动画，不依赖 PDF.js。
其余约 195 本为占位数据，使用渐变封面。

- 货币：新加坡元 SGD，价格前缀 S$
- 作者：Huali Xiong 熊华丽
- 绘者：Wenpei Lin 林文佩
- 出版社：Big Apple Chinese, Singapore
