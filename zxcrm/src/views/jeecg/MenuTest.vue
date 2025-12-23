<template>
    <div class="menu-test">
        <a-card title="菜单测试页面" :bordered="false">
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-card title="当前路由信息" size="small">
                        <p><strong>当前路径:</strong> {{ $route.path }}</p>
                        <p><strong>路由名称:</strong> {{ $route.name }}</p>
                        <p><strong>路由参数:</strong> {{ JSON.stringify($route.params) }}</p>
                        <p><strong>查询参数:</strong> {{ JSON.stringify($route.query) }}</p>
                    </a-card>
                </a-col>
                <a-col :span="12">
                    <a-card title="菜单状态信息" size="small">
                        <p><strong>选中的父菜单:</strong> {{ selectedParentMenu ? (selectedParentMenu.meta ?
                            selectedParentMenu.meta.title : selectedParentMenu.name) : '无' }}</p>
                        <p><strong>父菜单路径:</strong> {{ selectedParentMenu ? selectedParentMenu.path : '无' }}</p>
                        <p><strong>子菜单数量:</strong> {{ selectedParentMenu && selectedParentMenu.children ?
                            selectedParentMenu.children.length : 0 }}</p>
                    </a-card>
                </a-col>
            </a-row>

            <a-divider />

            <a-row :gutter="16">
                <a-col :span="24">
                    <a-card title="测试操作" size="small">
                        <a-space>
                            <a-button @click="testRouteChange('/system/user')">跳转到用户管理</a-button>
                            <a-button @click="testRouteChange('/system/role')">跳转到角色管理</a-button>
                            <a-button @click="testRouteChange('/dashboard/analysis')">跳转到分析页</a-button>
                            <a-button @click="testTreeMenu">测试树结构菜单</a-button>
                            <a-button @click="clearMenuState">清除菜单状态</a-button>
                            <a-button @click="refreshPage">刷新页面</a-button>
                        </a-space>
                    </a-card>
                </a-col>
            </a-row>

            <a-divider />

            <a-row :gutter="16">
                <a-col :span="24">
                    <a-card title="菜单层级测试" size="small">
                        <p>这个页面用于测试多层级菜单的显示和状态持久化功能。</p>
                        <p>请尝试：</p>
                        <ul>
                            <li>点击顶部菜单，观察左侧子菜单是否正确显示</li>
                            <li>点击左侧子菜单，观察路由是否正确跳转</li>
                            <li>使用浏览器前进后退按钮，观察菜单状态是否正确保持</li>
                            <li>刷新页面，观察菜单状态是否正确恢复</li>
                            <li>测试多层级菜单的展开和收起功能</li>
                        </ul>
                    </a-card>
                </a-col>
            </a-row>
        </a-card>
    </div>
</template>

<script>
export default {
    name: 'MenuTest',
    data() {
        return {
            selectedParentMenu: null
        }
    },
    mounted() {
        // 获取当前选中的父菜单（从父组件传递）
        this.$nextTick(() => {
            if (this.$parent && this.$parent.selectedParentMenu) {
                this.selectedParentMenu = this.$parent.selectedParentMenu
            }
        })
    },
    methods: {
        testRouteChange(path) {
            this.$router.push(path)
        },
        testTreeMenu() {
            // 模拟测试树结构菜单
            this.$message.info('测试树结构菜单功能')

            // 如果有父菜单且第一个子菜单是树结构，自动跳转到其第一个子菜单
            if (this.selectedParentMenu && this.selectedParentMenu.children && this.selectedParentMenu.children.length > 0) {
                const firstChild = this.selectedParentMenu.children[0]
                if (firstChild && firstChild.children && firstChild.children.length > 0) {
                    const firstGrandChild = this.findFirstAvailableMenu(firstChild.children)
                    if (firstGrandChild) {
                        this.$router.push(firstGrandChild.path)
                    }
                }
            }
        },
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
        clearMenuState() {
            localStorage.removeItem('selectedParentMenu')
            this.$message.success('菜单状态已清除')
        },
        refreshPage() {
            window.location.reload()
        }
    }
}
</script>

<style lang="less" scoped>
.menu-test {
    padding: 24px;

    .ant-card {
        margin-bottom: 16px;
    }
}
</style>