<template>
    <div class="menu-debug">
        <a-card title="菜单调试页面" :bordered="false">
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-card title="菜单数据" size="small">
                        <a-button @click="refreshMenuData" style="margin-bottom: 10px;">刷新菜单数据</a-button>
                        <div style="max-height: 400px; overflow-y: auto;">
                            <pre>{{ JSON.stringify(menuData, null, 2) }}</pre>
                        </div>
                    </a-card>
                </a-col>
                <a-col :span="12">
                    <a-card title="路由数据" size="small">
                        <div style="max-height: 400px; overflow-y: auto;">
                            <pre>{{ JSON.stringify(routeData, null, 2) }}</pre>
                        </div>
                    </a-card>
                </a-col>
            </a-row>

            <a-divider />

            <a-row :gutter="16">
                <a-col :span="24">
                    <a-card title="问题菜单项" size="small">
                        <a-table :columns="columns" :dataSource="problemMenus" :pagination="false" size="small">
                            <template slot="component" slot-scope="text">
                                <span
                                    :style="{ color: text === 'test' || text === 'undefined' || text === 'null' ? 'red' : 'black' }">
                                    {{ text }}
                                </span>
                            </template>
                        </a-table>
                    </a-card>
                </a-col>
            </a-row>

            <a-divider />

            <a-row :gutter="16">
                <a-col :span="24">
                    <a-card title="调试操作" size="small">
                        <a-space>
                            <a-button @click="testRoute('/moneyManager/Refund')">测试 Refund 路由</a-button>
                            <a-button @click="testRoute('/moneyManager/Preparation')">测试 Preparation 路由</a-button>
                            <a-button @click="clearConsole">清除控制台</a-button>
                            <a-button @click="exportMenuData">导出菜单数据</a-button>
                        </a-space>
                    </a-card>
                </a-col>
            </a-row>
        </a-card>
    </div>
</template>

<script>
import { generateIndexRouter } from '@/utils/util'

export default {
    name: 'MenuDebug',
    data() {
        return {
            menuData: [],
            routeData: [],
            problemMenus: [],
            columns: [
                {
                    title: '菜单名称',
                    dataIndex: 'name',
                    key: 'name',
                },
                {
                    title: '路径',
                    dataIndex: 'path',
                    key: 'path',
                },
                {
                    title: '组件',
                    dataIndex: 'component',
                    key: 'component',
                    scopedSlots: { customRender: 'component' }
                },
                {
                    title: '问题类型',
                    dataIndex: 'problem',
                    key: 'problem',
                }
            ]
        }
    },
    mounted() {
        this.refreshMenuData()
    },
    methods: {
        refreshMenuData() {
            // 获取菜单数据
            this.menuData = this.$store.getters.permissionList || []

            // 生成路由数据
            try {
                this.routeData = generateIndexRouter(this.menuData)
            } catch (error) {
                console.error('路由生成失败:', error)
            }

            // 查找问题菜单项
            this.findProblemMenus()

            // console.log('菜单数据已刷新，共 ' + this.menuData.length + ' 个菜单项')
        },

        findProblemMenus() {
            this.problemMenus = []
            this.scanMenus(this.menuData)
        },

        scanMenus(menus, parentPath = '') {
            for (let menu of menus) {
                const currentPath = parentPath + '/' + (menu.name || menu.path)

                // 检查组件路径
                if (!menu.component || menu.component.trim() === '') {
                    this.problemMenus.push({
                        name: menu.name || '未命名',
                        path: menu.path || '无路径',
                        component: menu.component || '空',
                        problem: '组件路径为空'
                    })
                } else if (menu.component === 'test' || menu.component === 'undefined' || menu.component === 'null') {
                    this.problemMenus.push({
                        name: menu.name || '未命名',
                        path: menu.path || '无路径',
                        component: menu.component,
                        problem: '无效组件路径'
                    })
                }

                // 递归检查子菜单
                if (menu.children && menu.children.length > 0) {
                    this.scanMenus(menu.children, currentPath)
                }
            }
        },

        testRoute(path) {
            // console.log('测试路由:', path)
            this.$router.push(path).catch(err => {
                console.error('路由跳转失败:', err)
            })
        },

        clearConsole() {
            console.clear()
            // console.log('控制台已清除')
        },

        exportMenuData() {
            const dataStr = JSON.stringify(this.menuData, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(dataBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'menu-data.json'
            link.click()
            URL.revokeObjectURL(url)
        }
    }
}
</script>

<style lang="less" scoped>
.menu-debug {
    padding: 24px;

    .ant-card {
        margin-bottom: 16px;
    }

    pre {
        background: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
        font-size: 12px;
        max-height: 400px;
        overflow-y: auto;
    }
}
</style>