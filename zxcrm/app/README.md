# 执象云枢 CRM 投放系统移动端（uni-app / Vue2）

本目录基于现有 Vue2 CRM 投放系统，提供钉钉 + 阿里云风格的移动端壳应用：

- **技术栈**：uni-app + Vue2（HBuilderX/cli 均可构建）。
- **功能保持一致**：通过 WebView 直连现有 H5 路由，所有页面、表单、审批与权限与 Web 版同步。
- **体验优化**：新增移动端主页、功能导航、资金与返利、系统中心等场景化入口，便于常用功能的触达。

## 目录说明
- `pages.json`：页面路由与 TabBar 配置，符合 uni-app 规范。
- `manifest.json`：应用元信息，可根据包名、签名进行调整。
- `common/config.js`：统一的 H5 基础地址与功能路由映射，完整映射 Web 菜单（报表、客户、项目、资金、渠道、工具、监控、在线开发、系统管理等），支持通过 `VUE_APP_H5_BASE_URL` 覆盖。
- `pages/*`：移动端页面（首页、功能导航、资金、系统、H5 WebView 承载页）。
- `components/ModuleCard.vue`：统一的卡片式入口组件，采用钉钉/阿里云的简洁风格。
- `static/tab/*`：TabBar 图标（SVG），可替换为品牌色或自定义 Base64 图标。

## 使用
1. 确认 Web 版 CRM 可正常访问，记录 H5 基础地址（如 `https://crm.example.com/#`）。
2. 在构建/运行时指定环境变量：
   ```bash
   export VUE_APP_H5_BASE_URL="https://crm.example.com/#"
   ```
3. 通过 HBuilderX 或 uni-app cli 运行/打包：
   ```bash
   # H5 预览
   npm run dev:h5

   # App 打包
   npm run build:app-plus
   ```

## 说明
- WebView 页面会直接打开对应的 H5 路由，确保与 Web 端的权限和交互完全一致。
- 如需原生化特定流程，可逐步将对应模块替换为原生 Vue 组件，保留配置与接口调用逻辑。
