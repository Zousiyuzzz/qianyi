<template>
  <a-modal :title="'上传素材'" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel"
    :width="600">
    <a-form ref="form" :model="model" :rules="validatorRules" :label-col="labelCol" :wrapper-col="wrapperCol"
      :disabled="formDisabled">
      <a-form-item label="渠道标识" name="channelSign">
        <a-select v-model="channelSign" placeholder="请选择渠道标识" style="width: 100%">
          <a-select-option v-for="sign in channelSigns" :key="sign" :value="sign">
            {{ channelSignsmap[sign] }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="广告账户" name="advertisedId">
        <j-search-select-tag placeholder="请选择广告账户" v-model="advertisedId"
          :dict="`tab_accountinfo,account_name,account_id,del_flag = '0' and channel_sign = '${channelSign}'`" async />
      </a-form-item>
      <a-form-item label="上传视频">
        <a-upload :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload" :multiple="true">
          <a-button>
            <a-icon type="upload" /> 选择视频文件
          </a-button>
        </a-upload>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
  name: 'TabMaterialmanageForm',
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
        advertisedId: [{ required: true, message: '请选择广告账户' }]
      },
      url: {
        upload: '/materialManage/videoUpload'
      },
      fileList: [],
      uploading: false,
      advertisedId: undefined,
      channelSign: '',
      channelSigns: ['DY-JLGG', 'DY-JLQC'],
      channelSignsmap: {
        'DY-JLGG': '字节-巨量广告',
        'DY-JLQC': '字节-巨量千川'
      }
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
      this.advertisedId = undefined
      this.channelSign = ''
    },
    async handleOk() {
      try {
        const { fileList, advertisedId, channelSign } = this

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
        fileList.forEach(file => {
          formData.append('file', file)
        })

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
    }
  }
}
</script>

<style scoped>
.ant-form-item {
  margin-bottom: 16px;
}
</style>