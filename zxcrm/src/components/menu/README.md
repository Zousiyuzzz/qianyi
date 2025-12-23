# 多层级菜单组件说明

## 功能特性

### 1. 支持多层级菜单
- 支持最多5层菜单嵌套
- 使用模板方式渲染，更稳定可靠
- 避免递归组件的上下文问题

### 2. 组件结构

#### index.js (主菜单组件)
- 新增 `renderSubMenuRecursive` 方法
- 递归处理多层级菜单
- 保持向后兼容性

#### CurrentSubMenu.vue (子菜单组件)
- 使用模板方式实现多层级菜单
- 支持5层菜单嵌套
- 避免 Ant Design Vue 的上下文错误

### 3. 使用方法

#### 主菜单组件
```javascript
// 在renderItem方法中调用
return menu.children && !menu.alwaysShow ? 
  this.renderSubMenuRecursive(menu, 5, 1) : 
  this.renderMenuItem(menu)
```

#### 子菜单组件
```vue
<!-- 第一层菜单 -->
<a-sub-menu v-if="item.children && item.children.length > 0" :key="item.path">
  <!-- 第二层菜单 -->
  <template v-for="subItem in item.children">
    <a-sub-menu v-if="subItem.children && subItem.children.length > 0" :key="subItem.path">
      <!-- 第三层菜单 -->
      <!-- 继续嵌套... -->
    </a-sub-menu>
  </template>
</a-sub-menu>
```

### 4. 性能优化

- 限制最大层级为5层
- 使用模板方式，避免递归组件的性能问题
- 清晰的代码结构，易于维护

### 5. 注意事项

- 确保菜单数据结构正确
- 每个菜单项必须有唯一的 `path` 属性
- 建议不要超过5层，以保持良好的用户体验

## 示例菜单结构

```json
{
  "path": "/financeReport/index",
  "meta": { "title": "财务报表" },
  "children": [
    {
      "path": "/mediaRebate/index",
      "meta": { "title": "返点管理" },
      "children": [
        {
          "path": "/mediaRebate/DY/index",
          "meta": { "title": "巨量引擎" },
          "children": [
            {
              "path": "/mediaRebate/DY/duizhang/index",
              "meta": { "title": "对账结算" }
            }
          ]
        }
      ]
    }
  ]
}
```

## 样式特性

### 1. 层级指示器
- 每个子菜单标题前有圆点指示器
- 悬停时指示器变为蓝色
- 清晰的视觉层级区分

### 2. 缩进设计
- 第一层：16px
- 第二层：32px  
- 第三层：48px
- 第四层：64px
- 第五层：80px

### 3. 交互效果
- 平滑的过渡动画
- 悬停背景色变化
- 选中状态高亮显示

## 技术实现

### 1. 模板方式 vs 递归组件
- **模板方式**：更稳定，无上下文问题，易于调试
- **递归组件**：代码更简洁，但可能有上下文问题

### 2. 层级处理
- 使用 `v-if` 判断是否有子菜单
- 使用 `v-for` 循环渲染同级菜单
- 最多支持5层嵌套

### 3. 状态管理
- 自动处理菜单展开/收起
- 自动选中当前路由对应的菜单
- 支持菜单状态持久化

## 更新日志

- 2024: 新增多层级菜单支持
- 限制最大层级为5层
- 使用模板方式实现，避免上下文错误
- 优化样式和用户体验
