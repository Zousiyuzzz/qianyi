<template>
    <a-drawer :title="'上传素材'" :visible="visible" :width="600" @close="handleCancel">
        <a-form ref="form" :model="model" :rules="validatorRules" :label-col="labelCol" :wrapper-col="wrapperCol"
            :disabled="formDisabled">
            <!-- 渠道标识 -->
            <a-form-item label="渠道标识" name="channelSign">
                <a-select v-model="channelSign" placeholder="请选择渠道标识" style="width: 100%">
                    <a-select-option v-for="sign in channelSigns" :key="sign" :value="sign">
                        {{ channelSignsmap[sign] }}
                    </a-select-option>
                </a-select>
            </a-form-item>

            <!-- 广告账户 -->
            <a-form-item label="广告账户" name="advertisedId">
                <j-search-select-tag placeholder="请选择广告账户" v-model="advertisedId"
                    :dict="`tab_accountinfo,account_name,account_id,del_flag = '0' and channel_sign = '${channelSign}'`"
                    async />
            </a-form-item>

            <!-- 素材名称 -->
            <a-form-item label="素材名称" name="materialName">
                <a-input v-model="materialName" placeholder="请输入素材名称" />
            </a-form-item>

            <!-- 素材分组 -->
            <a-form-item label="素材分组" name="materialGroup">
                <a-select v-model="materialGroup" placeholder="请选择素材分组" style="width: 100%">
                    <a-select-option value="group1">分组1</a-select-option>
                    <a-select-option value="group2">分组2</a-select-option>
                </a-select>
            </a-form-item>

            <!-- 素材标签 -->
            <a-form-item label="素材标签" name="materialTags">
                <a-select v-model="materialTags" mode="tags" placeholder="请选择或输入素材标签" style="width: 100%">
                    <a-select-option value="tag1">标签1</a-select-option>
                    <a-select-option value="tag2">标签2</a-select-option>
                </a-select>
            </a-form-item>

            <!-- 上传视频 -->
            <a-form-item label="上传视频">
                <a-upload :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload" :multiple="true">
                    <a-button>
                        <a-icon type="upload" /> 选择视频文件
                    </a-button>
                </a-upload>
            </a-form-item>

            <!-- 视频时长 -->
            <a-form-item label="视频时长" name="videoDuration">
                <a-checkbox-group v-model="videoDuration">
                    <a-checkbox value="18:23">18:23</a-checkbox>
                    <a-checkbox value="24:30">24:30</a-checkbox>
                    <a-checkbox value="31:40">31:40</a-checkbox>
                    <a-checkbox value="41:49">41:49</a-checkbox>
                    <a-checkbox value="50+">50+</a-checkbox>
                </a-checkbox-group>
            </a-form-item>

            <!-- 视频封面 -->
            <a-form-item label="视频封面">
                <a-upload :file-list="coverFileList" :remove="handleCoverRemove" :before-upload="beforeCoverUpload">
                    <a-button>
                        <a-icon type="upload" /> 按秒取帧或手动取帧
                    </a-button>
                </a-upload>
            </a-form-item>
        </a-form>

        <div class="drawer-footer">
            <a-button @click="handleCancel">取消</a-button>
            <a-button type="primary" :loading="confirmLoading" @click="handleOk">提交素材</a-button>
        </div>
    </a-drawer>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
    name: 'qiance',
    props: {
        disabled: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    data() {
        return {
            visible: false,
            model: {},
            labelCol: { xs: { span: 24 }, sm: { span: 6 } },
            wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
            confirmLoading: false,
            validatorRules: {
                channelSign: [{ required: true, message: '请选择渠道标识' }],
                advertisedId: [{ required: true, message: '请选择广告账户' }],
                materialName: [{ required: true, message: '请输入素材名称' }]
            },
            url: {
                upload: '/materialManage/videoUpload'
            },
            fileList: [],
            coverFileList: [],
            uploading: false,
            advertisedId: undefined,
            channelSign: '',
            channelSigns: ['DY-JLGG', 'DY-JLQC'],
            channelSignsmap: {
                'DY-JLGG': '字节-巨量广告',
                'DY-JLQC': '字节-巨量千川'
            },
            materialName: '',
            materialGroup: undefined,
            materialTags: [],
            videoDuration: []
        }
    },
    computed: {
        formDisabled() {
            return this.disabled
        }
    },
    watch: {
        channelSign(nv, ov) {
            if (nv !== ov || nv === '') {
                this.advertisedId = ''
            }
        }
    },
    created() {
        this.modelDefault = JSON.parse(JSON.stringify(this.model))
    },
    methods: {
        add() {
            this.model = JSON.parse(JSON.stringify(this.modelDefault))
            this.visible = true
        },
        edit(record) {
            this.model = Object.assign({}, record)
            this.visible = true
        },
        handleCancel() {
            this.visible = false
            this.fileList = []
            this.coverFileList = []
            this.advertisedId = undefined
            this.channelSign = ''
            this.materialName = ''
            this.materialGroup = undefined
            this.materialTags = []
            this.videoDuration = []
        },
        async handleOk() {
            try {
                await this.$refs.form.validate()
                const { fileList, coverFileList, advertisedId, channelSign, materialName, materialGroup, materialTags, videoDuration } = this

                if (!advertisedId || !channelSign) {
                    this.$message.error('请同时选择广告账户和渠道标识')
                    return
                }

                if (fileList.length === 0) {
                    this.$message.error('请至少选择一个视频文件')
                    return
                }

                this.confirmLoading = true
                this.uploading = true
                const formData = new FormData()
                formData.append('channelSign', channelSign)
                formData.append('advertiserId', Number(advertisedId))
                formData.append('materialName', materialName)
                formData.append('materialGroup', materialGroup || '')
                formData.append('materialTags', JSON.stringify(materialTags))
                formData.append('videoDuration', JSON.stringify(videoDuration))
                fileList.forEach(file => {
                    formData.append('file', file)
                })
                if (coverFileList.length > 0) {
                    formData.append('cover', coverFileList[0])
                }

                const uploadRes = await httpAction(this.url.upload, formData, 'POST')
                if (uploadRes.success) {
                    this.$message.success('上传成功')
                    this.$emit('ok')
                    this.handleCancel()
                } else {
                    this.$message.warning(uploadRes.message)
                }
            } catch (error) {
                this.$message.error('操作失败')
            } finally {
                this.uploading = false
                this.confirmLoading = false
            }
        },
        handleRemove(file) {
            const index = this.fileList.indexOf(file)
            const newFileList = this.fileList.slice()
            newFileList.splice(index, 1)
            this.fileList = newFileList
        },
        beforeUpload(file) {
            const allowedTypes = [
                'video/mp4',
                'video/mpeg',
                'video/3gpp',
                'video/avi',
                'video/x-m4v'
            ]
            const isValidType = allowedTypes.includes(file.type)
            const isUnderSizeLimit = file.size / 1024 / 1024 <= 500

            if (!isValidType) {
                this.$message.error('文件必须为 MP4, MPEG, 3GP, AVI 或 M4V 格式')
                return false
            }
            if (!isUnderSizeLimit) {
                this.$message.error('文件大小必须小于或等于 500MB')
                return false
            }

            this.fileList = [...this.fileList, file]
            return false
        },
        handleCoverRemove(file) {
            const index = this.coverFileList.indexOf(file)
            const newCoverFileList = this.coverFileList.slice()
            newCoverFileList.splice(index, 1)
            this.coverFileList = newCoverFileList
        },
        beforeCoverUpload(file) {
            const allowedTypes = ['image/jpeg', 'image/png']
            const isValidType = allowedTypes.includes(file.type)
            const isUnderSizeLimit = file.size / 1024 / 1024 <= 5

            if (!isValidType) {
                this.$message.error('封面文件必须为 JPEG 或 PNG 格式')
                return false
            }
            if (!isUnderSizeLimit) {
                this.$message.error('封面文件大小必须小于或等于 5MB')
                return false
            }

            this.coverFileList = [file]
            return false
        }
    }
}
</script>

<style scoped>
.ant-form-item {
    margin-bottom: 16px;
}

.drawer-footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    background: #fff;
}

.drawer-footer .ant-btn {
    margin-left: 8px;
}
</style>