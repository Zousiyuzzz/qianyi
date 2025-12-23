# 账户主体管理页面

## 功能概述

账户主体管理页面用于管理不同广告平台（快手、巨量、腾讯）的账户主体信息，基于实际的数据库字段结构设计。

## 页面结构

### 主要组件
- `index.vue` - 主页面，包含tabs导航、查询表单、数据表格
- `modules/AccountSubjectModal.vue` - 新增/编辑账户主体的模态框
- `components/superSearch.vue` - 超级查询组件

### 功能特性

1. **多平台支持**
   - 快手：磁力引擎、磁力金牛、大健康、磁力聚星
   - 巨量：巨量广告、巨量千川、巨量本地推、巨量星图
   - 腾讯：广点通

2. **查询功能**
   - 基础查询：账户主体名称、渠道名称、项目名称、合作方式
   - 高级查询：平台标识、渠道标识、项目唯一标识、返点模板名称、创建人、更新人
   - 超级查询：支持多条件组合查询

3. **数据管理**
   - 新增账户主体
   - 编辑账户主体信息
   - 查看详情
   - 删除账户主体
       - 批量操作（删除）
   - 数据导入导出

4. **表格字段**
   - 主键ID
   - 账户主体名称
   - 渠道名称
   - 平台标识
   - 渠道标识
   - 项目名称
   - 合作方式（0:预付 1:垫付 3:服务费）
   - 返点模板名称
   - 项目唯一标识
   - 创建人
   - 创建日期
   - 更新人
   - 更新日期

## 数据库字段说明

| 字段名 | 字段类型 | 说明 |
|--------|----------|------|
| id | string | 主键ID |
| subjectName | string | 账户主体名称 |
| channelName | string | 渠道名称 |
| channelPlatform | string | 平台标识 |
| channelSign | string | 渠道标识 |
| collaborationMode | string | 合作方式（0:预付1:垫付3:服务费） |
| createBy | string | 创建人 |
| createTime | string | 创建日期 |
| delFlag | string | 删除标识（0：未删除1：已删除） |
| proId | string | 项目ID |
| proName | string | 项目名称 |
| rebateTeptId | string | 返点模板id |
| rebateTeptName | string | 返点模板名称 |
| uniqueId | string | 项目唯一标识 |
| updateBy | string | 更新人 |
| updateTime | string | 更新日期 |

## API接口

### 主要接口
- `POST /accountSubject/list` - 获取账户主体列表
- `POST /accountSubject/add` - 新增账户主体
- `PUT /accountSubject/edit` - 编辑账户主体
- `DELETE /accountSubject/delete` - 删除账户主体
- `POST /accountSubject/deleteBatch` - 批量删除

- `GET /accountSubject/exportXls` - 导出Excel
- `POST /accountSubject/importExcel` - 导入Excel

## 使用说明

1. **切换平台**：点击顶部的tabs可以切换不同的广告平台
2. **查询数据**：使用查询表单进行条件筛选
3. **新增主体**：点击"新增主体"按钮打开新增模态框
4. **编辑主体**：点击表格中的"编辑"按钮修改主体信息
5. **批量操作**：选择多条记录后可以进行批量删除操作
6. **数据导出**：点击"导出"按钮下载Excel文件
7. **数据导入**：点击"导入"按钮上传Excel文件

## 注意事项

- 账户主体名称、渠道名称、平台标识、渠道标识、项目名称、合作方式、项目唯一标识为必填字段
- 合作方式支持：0(预付)、1(垫付)、3(服务费)
- 支持Excel导入导出功能
- 支持按渠道标识进行数据过滤
