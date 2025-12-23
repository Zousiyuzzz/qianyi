<template>
    <div class="wrap">
        <div class="wrap-header">
            <div class="header-num">{{ `请输入账户ID(${currentCount}/${maxNum})` }}</div>
            <div class="header-btn" @click="clear">清空</div>
        </div>
        <div class="tooltip">
            请录入属于此项目的账户ID，多账户请换行（即每个账户ID一行）
        </div>
        <div class="wrap-body">
            <div class="body-content">
                <div v-for="(item, index) in value" :key="index + '_content'" class="body-item body-content-item"
                    :class="{ 'duplicate-item': duplicateIndexes.includes(index) && item.trim() !== '' }">
                    <div style="width: 40px;display: flex;justify-content: center;align-items: center;">
                        {{ index + 1 }}
                    </div>
                    <div class="body-item-inner">
                        <input type="text" v-model="value[index]" placeholder="请输入广告主ID，按回车换行" class="input-item"
                            @keyup.enter="handleEnter(index, $event)" @paste="handlePaste(index, $event)">
                        <div class="neu-delete-btn" @click="deleteItem(index)">
                            <span class="delete-icon">×</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="wrap-footer" v-if="duplicateIndexes.length > 0">
            <div>第{{duplicateIndexes.map(i => i + 1).join(', ')}}行重复</div>
            <div class="footer-btn" @click="deduplication">一键清除</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AccountIdInput',
    props: {
        value: {
            type: Array,
            default: () => ['']
        },
        maxNum: {
            type: Number,
            default: 2000
        }
    },
    computed: {
        currentCount() {
            return this.value.filter(item => item.trim() !== '').length
        },
        duplicateIndexes() {
            const seen = new Map()
            const duplicates = new Set()

            this.value.forEach((item, index) => {
                const val = item.trim()
                if (val === '') return

                if (seen.has(val)) {
                    seen.get(val).push(index)
                    duplicates.add(index)
                } else {
                    seen.set(val, [index])
                }
            })

            return Array.from(duplicates)
        }
    },
    methods: {
        clear() {
            this.$emit('input', [''])
            this.$nextTick(() => {
                const inputs = this.$el.querySelectorAll('.input-item')
                if (inputs[0]) {
                    inputs[0].focus()
                }
            })
        },
        deleteItem(index) {
            if (this.value.length <= 1) return
            const newValue = [...this.value]
            newValue.splice(index, 1)
            this.$emit('input', newValue)
        },
        handleEnter(index, event) {
            event.preventDefault()
            if (this.value.length >= this.maxNum) {
                alert(`已达到最大数量限制（${this.maxNum}个）`)
                return
            }

            const newValue = [...this.value]
            newValue.splice(index + 1, 0, '')
            this.$emit('input', newValue)

            this.$nextTick(() => {
                const inputs = this.$el.querySelectorAll('.input-item')
                if (inputs[index + 1]) {
                    inputs[index + 1].focus()
                }
            })
        },
        deduplication() {
            const seen = new Set()
            const newValue = this.value.map(item => {
                const trimmed = item.trim()
                if (trimmed === '') return item
                if (seen.has(trimmed)) return ''
                seen.add(trimmed)
                return item
            })
            this.$emit('input', newValue.filter(item => item !== ""))
            this.$nextTick(() => {
                const inputs = this.$el.querySelectorAll('.input-item')
                if (inputs[inputs.length - 1]) {
                    inputs[inputs.length - 1].focus()
                }
            })
        },
        handlePaste(index, event) {
            event.preventDefault();
            const pastedText = event.clipboardData.getData('text');
            this.$emit('paste', pastedText, index)
        }
    }
}
</script>

<style lang="less" scoped>
.wrap {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background: #fff;
    width: 100%;
    // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.wrap-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fafafa;
    border-bottom: 1px solid #d9d9d9;
    border-radius: 8px 8px 0 0;
    font-size: 14px;
    font-weight: 500;
}

.header-num {
    color: #333;
}

.header-btn {
    color: #255cc2;
    cursor: pointer;
    font-weight: 400;
    transition: color 0.2s;

    &:hover {
        color: #1a4a9e;
    }
}

.tooltip {
    background: #e6f7ff;
    color: #595959;
    padding: 8px 16px;
    font-size: 12px;
    border-bottom: 1px solid #d9d9d9;
}

.wrap-body {
    display: flex;
    height: 500px;
    overflow: auto;
    background: #fff;
}

.body-index {
    max-height: 20px;
    width: 40px;
    padding: 12px 0;
    text-align: center;
    color: #8c8c8c;
    font-size: 12px;
}

.body-content {
    max-height: 20px;
    flex: 1;
    padding: 12px 16px 12px 0;
}

.body-item {
    height: 40px;
    display: flex;
    align-items: center;
    font-size: 14px;
    justify-content: center;
}

.body-content-item {
    border-radius: 4px;
    margin-bottom: 4px;
    transition: background 0.2s;

    &:hover {
        background: #f5f5f5;
    }
}

.body-item-inner {
    display: flex;
    align-items: center;
    width: 100%;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 0 8px;
    transition: border-color 0.2s, background 0.2s;

    &:hover {
        border-color: #255cc2;
    }
}

.input-item {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    padding: 8px;
    font-size: 14px;
    color: #333;

    &::placeholder {
        color: #bfbfbf;
        opacity: 1;
    }
}

.neu-delete-btn {
    display: none;
    width: 24px;
    height: 24px;
    // background: #f5f5f5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    margin-left: 8px;

    .delete-icon {
        font-size: 16px;
        color: #8c8c8c;
    }

    &:hover {
        background: #ff4d4f;

        .delete-icon {
            color: #fff;
        }
    }
}

.body-content-item:hover .neu-delete-btn {
    display: flex;
}

.duplicate-item .body-item-inner {
    background: #fff1f0;
    border-color: #ff4d4f;

    .input-item {
        background: #fff1f0;
    }
}

.wrap-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: #fafafa;
    border-top: 1px solid #d9d9d9;
    border-radius: 0 0 8px 8px;
    font-size: 12px;
    color: #595959;
}

.footer-btn {
    color: #255cc2;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
        color: #1a4a9e;
    }
}
</style>