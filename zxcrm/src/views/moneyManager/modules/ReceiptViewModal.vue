<template>
    <a-modal title="回单查看" :visible="visible" @cancel="close" width="80%" footer={null}>
        <div v-if="previewUrl">
            <iframe :src="previewUrl" style="width:100%;height:80vh;border:none;"></iframe>
        </div>

        <div v-else style="text-align:center;color:#999;padding:40px;">
            暂无回单
        </div>
    </a-modal>
</template>

<script>
export default {
    name: 'ReceiptViewModal',
    props: {
        url: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            visible: false,
            previewUrl: '' // 处理后的最终 iframe URL
        }
    },
    watch: {
        // 监听父传的 URL，动态生成可预览链接
        url(newVal) {
            if (!newVal) {
                this.previewUrl = ''
                return
            }

            // 如果已带参数就追加 &，否则 ?
            if (newVal.indexOf('?') > -1) {
                this.previewUrl = newVal + '&response-content-disposition=inline'
            } else {
                this.previewUrl = newVal + '?response-content-disposition=inline'
            }
        }
    },

    methods: {
        show() {
            // 打开弹窗时刷新 previewUrl
            this.visible = true

            if (!this.url) {
                this.previewUrl = ''
                return
            }

            if (this.url.indexOf('?') > -1) {
                this.previewUrl = this.url + '&response-content-disposition=inline'
            } else {
                this.previewUrl = this.url + '?response-content-disposition=inline'
            }
        },

        close() {
            this.visible = false
        }
    }
}
</script>
