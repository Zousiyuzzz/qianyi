<template>
    <div class="dict-name-display">
        <span class="name-text" :title="displayText">
            {{ displayText }}
        </span>
    </div>
</template>

<script>
import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'

export default {
    name: "JDictNameDisplay",
    props: {
        dictCode: {
            type: String,
            required: true
        },
        value: {
            type: [String, Number],
            default: ''
        },
        placeholder: {
            type: String,
            default: '暂无数据'
        }
    },
    data() {
        return {
            dictOptions: []
        }
    },
    watch: {
        dictCode: {
            immediate: true,
            handler() {
                this.initDictData()
            },
        },
        value: {
            immediate: true,
            handler() {
                // 当value变化时，重新计算显示文本
            }
        }
    },
    computed: {
        displayText() {
            if (!this.value) {
                return this.placeholder
            }

            // 在字典选项中查找对应的文本
            const option = this.dictOptions.find(item =>
                item.value === this.value ||
                item.value === this.value.toString()
            )

            return option ? (option.text || option.label) : this.value
        }
    },
    methods: {
        initDictData() {
            // 优先从缓存中读取字典配置
            if (getDictItemsFromCache(this.dictCode)) {
                this.dictOptions = getDictItemsFromCache(this.dictCode);
                return
            }

            // 根据字典Code, 初始化字典数组
            ajaxGetDictItems(this.dictCode, null).then((res) => {
                if (res.success) {
                    this.dictOptions = res.result;
                }
            })
        },
        setCurrentDictOptions(dictOptions) {
            this.dictOptions = dictOptions
        },
        getCurrentDictOptions() {
            return this.dictOptions
        }
    }
}
</script>

<style scoped>
.dict-name-display {
    display: inline-block;
    width: 100%;
    background-color: rgba(255, 255, 255, 0);
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
}

.name-text {
    display: inline-block;
    width: 100%;
    /* font-size: 14px; */
    /* font-weight: bold; */
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: transparent;
    border: none;
    outline: none;
}

/* 当没有数据时的样式 */
.dict-name-display:empty::before {
    content: attr(data-placeholder);
    background-color: rgba(255, 255, 255, 1);
    font-style: italic;
}
</style>
