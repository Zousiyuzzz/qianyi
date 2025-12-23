# AI 图生图功能

## 功能概述

这是一个基于 Stable Diffusion 的图生图 AI 功能，允许用户上传参考图片并生成全新的创意图像。

## 主要特性

### 🎨 核心功能
- **图片上传**: 支持 JPG、PNG 格式，最大 10MB
- **参数调节**: 完整的生成参数控制
- **实时预览**: 生成过程实时状态显示
- **历史记录**: 保存和管理生成历史

### ⚙️ 技术参数
- **生成步数**: 10-50 步，控制生成质量
- **CFG Scale**: 1-20，控制提示词遵循程度
- **图像尺寸**: 多种预设尺寸选择
- **采样器**: Euler、DPM++、DDIM 等
- **随机种子**: 可固定种子获得可重复结果

### 🎯 用户体验
- **现代化界面**: 参考 DeepSeek 设计风格
- **响应式布局**: 支持桌面和移动端
- **配额管理**: 每日生成次数限制
- **批量操作**: 支持历史记录批量管理

## 技术架构

### 前端技术栈
- **Vue.js 2.x**: 核心框架
- **Ant Design Vue**: UI 组件库
- **Less**: CSS 预处理器
- **Axios**: HTTP 请求库

### 后端 API 接口

#### 图生图生成
```http
POST /ai/image-to-image
Content-Type: multipart/form-data

Parameters:
- image: 上传的参考图片
- prompt: 正面提示词
- negative_prompt: 负面提示词
- steps: 生成步数
- cfg_scale: CFG 比例
- size: 图像尺寸
- sampler: 采样器类型
- seed: 随机种子
- model: AI 模型
```

#### 生成状态查询
```http
GET /ai/status/{taskId}

Response:
{
  "success": true,
  "data": {
    "status": "processing|completed|failed",
    "progress": 75,
    "image_url": "https://...",
    "seed": 123456789
  }
}
```

#### 历史记录
```http
GET /ai/history?page=1&size=20

Response:
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 1,
        "prompt": "一只可爱的小猫",
        "thumbnail": "https://...",
        "createTime": "2024-01-15 14:30:25"
      }
    ],
    "total": 100
  }
}
```

## 使用指南

### 1. 上传参考图片
- 点击上传区域选择图片
- 支持拖拽上传
- 自动验证文件格式和大小

### 2. 设置生成参数
- **提示词**: 描述想要生成的内容
- **负面提示词**: 描述不想要的内容
- **技术参数**: 根据需求调整质量和速度

### 3. 开始生成
- 点击"开始生成"按钮
- 实时查看生成进度
- 生成完成后可下载或重新生成

### 4. 管理历史记录
- 查看历史生成结果
- 重新使用历史参数
- 批量下载或删除

## 配置说明

### 环境变量
```bash
# AI 服务配置
VUE_APP_AI_API_BASE_URL=http://localhost:8080
VUE_APP_AI_MODEL_DEFAULT=stable-diffusion-xl

# 配额配置
VUE_APP_DAILY_QUOTA=100
VUE_APP_MAX_FILE_SIZE=10485760
```

### 模型配置
```javascript
// 支持的模型列表
const models = [
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    description: '高质量图像生成模型'
  },
  {
    id: 'stable-diffusion-v1-5',
    name: 'Stable Diffusion v1.5',
    description: '经典稳定扩散模型'
  }
]
```

## 开发说明

### 项目结构
```
src/views/tools/ai/
├── index.vue          # 主页面组件
├── README.md          # 功能说明文档
└── components/        # 子组件（可选）
```

### 组件设计
- **单一职责**: 每个组件专注于特定功能
- **可复用性**: 参数配置和历史记录可独立使用
- **可扩展性**: 支持添加新的 AI 模型和功能

### 样式规范
- **设计系统**: 遵循 Ant Design 设计规范
- **响应式**: 使用 Less 变量和媒体查询
- **主题化**: 支持深色/浅色主题切换

## 部署说明

### 构建命令
```bash
# 开发环境
npm run serve

# 生产构建
npm run build

# 代码检查
npm run lint
```

### 部署要求
- Node.js >= 14
- 现代浏览器支持
- 后端 AI 服务可用

## 更新日志

### v1.0.0 (2024-01-15)
- ✨ 初始版本发布
- 🎨 图生图核心功能
- 📱 响应式界面设计
- 🔧 完整的参数控制
- 📊 历史记录管理

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码变更
4. 发起 Pull Request

## 许可证

MIT License 