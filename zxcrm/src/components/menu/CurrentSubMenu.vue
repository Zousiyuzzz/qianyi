<template>
    <div class="current-sub-menu">
        <div class="menu-content">
            <div v-if="parentMenu && parentMenu.children && parentMenu.children.length > 0">
                <a-menu :theme="theme" mode="inline" :selectedKeys="selectedKeys" :openKeys="openKeys"
                    @select="onMenuSelect" @openChange="onOpenChange">
                    <!-- 使用模板方式渲染多层级菜单 -->
                    <template v-for="item in parentMenu.children">
                        <!-- 第一层菜单 -->
                        <a-sub-menu v-if="item.children && item.children.length > 0" :key="item.path">
                            <span slot="title">
                                <a-icon v-if="item.meta && item.meta.icon" :type="item.meta.icon" />
                                <span>{{ item.meta ? item.meta.title : item.name }}</span>
                            </span>

                            <!-- 第二层菜单 -->
                            <template v-for="subItem in item.children">
                                <a-sub-menu v-if="subItem.children && subItem.children.length > 0" :key="subItem.path">
                                    <span slot="title">
                                        <a-icon v-if="subItem.meta && subItem.meta.icon" :type="subItem.meta.icon" />
                                        <span>{{ subItem.meta ? subItem.meta.title : subItem.name }}</span>
                                    </span>

                                    <!-- 第三层菜单 -->
                                    <template v-for="thirdItem in subItem.children">
                                        <a-sub-menu v-if="thirdItem.children && thirdItem.children.length > 0"
                                            :key="thirdItem.path">
                                            <span slot="title">
                                                <a-icon v-if="thirdItem.meta && thirdItem.meta.icon"
                                                    :type="thirdItem.meta.icon" />
                                                <span>{{ thirdItem.meta ? thirdItem.meta.title : thirdItem.name
                                                    }}</span>
                                            </span>

                                            <!-- 第四层菜单 -->
                                            <template v-for="fourthItem in thirdItem.children">
                                                <a-sub-menu v-if="fourthItem.children && fourthItem.children.length > 0"
                                                    :key="fourthItem.path">
                                                    <span slot="title">
                                                        <a-icon v-if="fourthItem.meta && fourthItem.meta.icon"
                                                            :type="fourthItem.meta.icon" />
                                                        <span>{{ fourthItem.meta ? fourthItem.meta.title :
                                                            fourthItem.name }}</span>
                                                    </span>

                                                    <!-- 第五层菜单 -->
                                                    <template v-for="fifthItem in fourthItem.children">
                                                        <a-menu-item :key="fifthItem.path"
                                                            :class="{ 'active': selectedSubMenu && selectedSubMenu.path === fifthItem.path }">
                                                            <a-icon v-if="fifthItem.meta && fifthItem.meta.icon"
                                                                :type="fifthItem.meta.icon" />
                                                            <span>{{ fifthItem.meta ? fifthItem.meta.title :
                                                                fifthItem.name }}</span>
                                                        </a-menu-item>
                                                    </template>
                                                </a-sub-menu>
                                                <a-menu-item v-else :key="fourthItem.path"
                                                    :class="{ 'active': selectedSubMenu && selectedSubMenu.path === fourthItem.path }">
                                                    <a-icon v-if="fourthItem.meta && fourthItem.meta.icon"
                                                        :type="fourthItem.meta.icon" />
                                                    <span>{{ fourthItem.meta ? fourthItem.meta.title : fourthItem.name
                                                        }}</span>
                                                </a-menu-item>
                                            </template>
                                        </a-sub-menu>
                                        <a-menu-item v-else :key="thirdItem.path"
                                            :class="{ 'active': selectedSubMenu && selectedSubMenu.path === thirdItem.path }">
                                            <a-icon v-if="thirdItem.meta && thirdItem.meta.icon"
                                                :type="thirdItem.meta.icon" />
                                            <span>{{ thirdItem.meta ? thirdItem.meta.title : thirdItem.name }}</span>
                                        </a-menu-item>
                                    </template>
                                </a-sub-menu>
                                <a-menu-item v-else :key="subItem.path"
                                    :class="{ 'active': selectedSubMenu && selectedSubMenu.path === subItem.path }">
                                    <a-icon v-if="subItem.meta && subItem.meta.icon" :type="subItem.meta.icon" />
                                    <span>{{ subItem.meta ? subItem.meta.title : subItem.name }}</span>
                                </a-menu-item>
                            </template>
                        </a-sub-menu>
                        <a-menu-item v-else :key="item.path"
                            :class="{ 'active': selectedSubMenu && selectedSubMenu.path === item.path }">
                            <a-icon v-if="item.meta && item.meta.icon" :type="item.meta.icon" />
                            <span>{{ item.meta ? item.meta.title : item.name }}</span>
                        </a-menu-item>
                    </template>
                </a-menu>
            </div>
            <div v-else>
                <a-empty description="暂无子菜单" size="small" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CurrentSubMenu',
    props: {
        parentMenu: {
            type: Object,
            default: null
        },
        theme: {
            type: String,
            default: 'light'
        }
    },
    data() {
        return {
            selectedSubMenu: null,
            selectedKeys: [],
            openKeys: [] // 控制子菜单展开状态
        }
    },
    watch: {
        parentMenu: {
            handler(newVal) {
                if (newVal && newVal.children && newVal.children.length > 0) {
                    // 根据当前路由自动选择对应的子菜单
                    this.updateSelectedMenuByRoute()
                } else {
                    this.selectedSubMenu = null
                    this.selectedKeys = []
                }
            },
            immediate: true
        },
        // 监听路由变化，自动更新选中的菜单 
        '$route': {
            handler(newRoute) {
                this.updateSelectedMenuByRoute()
            },
            immediate: true
        }
    },
    mounted() {
        // 确保组件挂载时也刷新菜单状态
        this.$nextTick(() => {
            this.updateSelectedMenuByRoute()
        })
    },
    methods: {
        // 根据当前路由更新选中的菜单
        updateSelectedMenuByRoute() {
            if (!this.parentMenu || !this.parentMenu.children) return

            const currentPath = this.$route.path
            const selectedMenu = this.findMenuByPathRecursive(this.parentMenu.children, currentPath)
            if (selectedMenu) {
                // 如果找到匹配的菜单，检查是否需要跳转到其最下面层级
                const deepestMenu = this.findDeepestFirstMenu([selectedMenu])
                if (deepestMenu && deepestMenu.path !== selectedMenu.path) {
                    // 如果最下面层级的菜单与当前选中的不同，跳转到最下面层级
                    this.selectedSubMenu = deepestMenu
                    this.selectedKeys = [deepestMenu.path]
                    this.$emit('subMenuSelect', deepestMenu)
                    this.updateOpenKeys(deepestMenu)
                    // 执行路由跳转
                    this.$router.push(deepestMenu.path).catch(err => {
                        console.warn('路由跳转失败:', err)
                    })
                } else {
                    // 如果已经是叶子节点，直接使用
                    this.selectedSubMenu = selectedMenu
                    this.selectedKeys = [selectedMenu.path]
                    this.$emit('subMenuSelect', selectedMenu)
                    this.updateOpenKeys(selectedMenu)
                }
            } else {
                // 如果没有找到匹配的菜单，选择最下面层级的第一个菜单
                const firstMenu = this.findDeepestFirstMenu(this.parentMenu.children)
                if (firstMenu) {
                    this.selectedSubMenu = firstMenu
                    this.selectedKeys = [firstMenu.path]
                    this.$emit('subMenuSelect', firstMenu)
                    this.updateOpenKeys(firstMenu)

                    // 执行路由跳转
                    this.$router.push(firstMenu.path).catch(err => {
                        console.warn('路由跳转失败:', err)
                    })
                }
            }
        },

        // 更新展开状态
        updateOpenKeys(selectedMenu) {
            const newOpenKeys = []

            // 查找选中菜单的所有父级菜单路径
            const findParentPaths = (menus, targetPath, parentPaths = []) => {
                for (let menu of menus) {
                    if (menu.path === targetPath) {
                        // 找到目标菜单，返回所有父级路径
                        return [...parentPaths]
                    }
                    if (menu.children && menu.children.length > 0) {
                        const found = findParentPaths(menu.children, targetPath, [...parentPaths, menu.path])
                        if (found) return found
                    }
                }
                return null
            }

            const parentPaths = findParentPaths(this.parentMenu.children, selectedMenu.path)
            if (parentPaths) {
                this.openKeys = parentPaths
            }
        },

        // 递归查找菜单
        findMenuByPathRecursive(menus, path) {
            for (let menu of menus) {
                if (menu.path === path) {
                    return menu
                }
                if (menu.children && menu.children.length > 0) {
                    const found = this.findMenuByPathRecursive(menu.children, path)
                    if (found) return found
                }
            }
            return null
        },

        // 查找第一个可用的菜单（没有子菜单的菜单）
        findFirstAvailableMenu(menus) {
            for (let menu of menus) {
                if (!menu.children || menu.children.length === 0) {
                    return menu
                }
                if (menu.children && menu.children.length > 0) {
                    const found = this.findFirstAvailableMenu(menu.children)
                    if (found) return found
                }
            }
            return null
        },

        // 查找最下面层级的第一个菜单项（无论是否有子菜单）
        findDeepestFirstMenu(menus) {
            if (!menus || menus.length === 0) return null

            // 获取第一个菜单项
            const firstMenu = menus[0]

            // 如果第一个菜单项有子菜单，递归查找其最下面层级的第一个
            if (firstMenu.children && firstMenu.children.length > 0) {
                return this.findDeepestFirstMenu(firstMenu.children)
            }

            // 如果第一个菜单项没有子菜单，返回它
            return firstMenu
        },

        onMenuSelect(obj) {
            const selectedMenu = this.findMenuByPathRecursive(this.parentMenu.children, obj.key)
            if (selectedMenu) {
                // 检查是否需要跳转到最下面层级
                const deepestMenu = this.findDeepestFirstMenu([selectedMenu])
                const targetMenu = deepestMenu || selectedMenu

                this.selectedSubMenu = targetMenu
                this.selectedKeys = [targetMenu.path]
                this.$emit('subMenuSelect', targetMenu)

                // 更新展开状态
                this.updateOpenKeys(targetMenu)

                // 添加路由跳转
                this.$router.push(targetMenu.path).catch(err => {
                    console.warn('路由跳转失败:', err)
                })
            }
        },

        // 处理菜单展开/收起
        onOpenChange(openKeys) {
            this.openKeys = openKeys
        },

        findMenuByPath(path) {
            if (!this.parentMenu || !this.parentMenu.children) return null
            return this.findMenuByPathRecursive(this.parentMenu.children, path)
        },

        clearSelection() {
            this.selectedSubMenu = null
            this.selectedKeys = []
            this.$emit('clearSelection')
        }
    }
}
</script>

<style lang="less" scoped>
.current-sub-menu {
    height: 100%;
    display: flex;
    flex-direction: column;

    .menu-header {
        padding: 12px 16px;
        border-bottom: 1px solid #e8e8e8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fafafa;

        h3 {
            margin: 0;
            font-size: 14px;
            font-weight: 500;
            color: #1890ff;
        }

        .ant-btn {
            padding: 0;
            height: auto;
            line-height: 1;
        }
    }

    .menu-content {
        flex: 1;
        overflow-y: auto;

        // 隐藏滚动条
        &::-webkit-scrollbar {
            width: 0;
            height: 0;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background: transparent;
        }

        .ant-menu {
            border-right: none;

            .ant-menu-item {

                &.active,
                &.ant-menu-item-selected {
                    color: #1890ff !important;
                    background-color: #e6f7ff !important;
                    border-color: #91d5ff;
                }
            }

            // 多层级菜单样式优化
            .ant-menu-submenu {

                // 子菜单标题样式
                .ant-menu-submenu-title {
                    padding-left: 16px;

                    // 层级指示器
                    &::before {
                        content: '';
                        display: inline-block;
                        width: 4px;
                        height: 4px;
                        background-color: #d9d9d9;
                        border-radius: 50%;
                        margin-right: 8px;
                        transition: all 0.3s;
                    }

                    &:hover::before {
                        background-color: #1890ff;
                    }
                }

                // 子菜单内容样式
                .ant-menu-sub {
                    background-color: #fafafa;

                    .ant-menu-item {
                        padding-left: 32px;

                        &.active,
                        &.ant-menu-item-selected {
                            color: #1890ff !important;
                            background-color: #e6f7ff !important;
                            border-color: #91d5ff;
                        }

                        // 第三层级
                        .ant-menu-sub .ant-menu-item {
                            padding-left: 48px;

                            &.active,
                            &.ant-menu-item-selected {
                                color: #fff !important;
                                background-color: #1890ff !important;
                                border-color: #1890ff;
                            }
                        }

                        // 第四层级
                        .ant-menu-sub .ant-menu-sub .ant-menu-item {
                            padding-left: 64px;

                            &.active,
                            &.ant-menu-item-selected {
                                color: #fff !important;
                                background-color: #1890ff !important;
                                border-color: #1890ff;
                            }
                        }

                        // 第五层级
                        .ant-menu-sub .ant-menu-sub .ant-menu-sub .ant-menu-item {
                            padding-left: 80px;

                            &.active,
                            &.ant-menu-item-selected {
                                color: #fff !important;
                                background-color: #1890ff !important;
                                border-color: #1890ff;
                            }
                        }
                    }
                }
            }

            // 菜单项样式
            .ant-menu-item {
                padding-left: 16px;
                transition: all 0.3s;

                &:hover {
                    background-color: #f5f5f5;
                }

                // 图标样式
                .anticon {
                    margin-right: 8px;
                    font-size: 14px;
                }
            }
        }
    }

    .menu-footer {
        padding: 8px 16px;
        border-top: 1px solid #f0f0f0;
        background-color: #fafafa;

        .selected-info {
            p {
                margin: 0;
                font-size: 12px;

                small {
                    color: #999;
                }
            }
        }
    }
}
</style>