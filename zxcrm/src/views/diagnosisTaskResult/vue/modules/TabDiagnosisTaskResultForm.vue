<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="删除标识（0：未删除1：已删除）" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="delFlag">
              <a-input v-model="model.delFlag" placeholder="请输入删除标识（0：未删除1：已删除）"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="前侧任务表id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="diagnosisTaskId">
              <a-input v-model="model.diagnosisTaskId" placeholder="请输入前侧任务表id"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="抖音前侧任务id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="taskId">
              <a-input v-model="model.taskId" placeholder="请输入抖音前侧任务id"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="视频id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="videoId">
              <a-input v-model="model.videoId" placeholder="请输入视频id"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="素材id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="materialId">
              <a-input v-model="model.materialId" placeholder="请输入素材id"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="任务状态允许值: PENDING SUCCESS FAILED" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="status">
              <a-input v-model="model.status" placeholder="请输入任务状态允许值: PENDING SUCCESS FAILED"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="是否AD优质素材，允许值 YES AD优质;NO AD非优质;UNKNOWN 无检测结果" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isAdHighQualityMaterial">
              <a-input v-model="model.isAdHighQualityMaterial" placeholder="请输入是否AD优质素材，允许值 YES AD优质;NO AD非优质;UNKNOWN 无检测结果"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="是否千川优质素材，允许值 YES 千川优质;NO 千川非优质; UNKNOWN 无检测结果" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isEcpHighQualityMaterial">
              <a-input v-model="model.isEcpHighQualityMaterial" placeholder="请输入是否千川优质素材，允许值 YES 千川优质;NO 千川非优质; UNKNOWN 无检测结果"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="是否低效，允许值 YES 低效;NO 非低效;UNKNOWN 无检测结果" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isInefficientMaterial">
              <a-input v-model="model.isInefficientMaterial" placeholder="请输入是否低效，允许值 YES 低效;NO 非低效;UNKNOWN 无检测结果"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="是否首发，允许值 YES 首发:NO 非首发;UNKNOWN 无检测结果" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isFirstPublishMaterial">
              <a-input v-model="model.isFirstPublishMaterial" placeholder="请输入是否首发，允许值 YES 首发:NO 非首发;UNKNOWN 无检测结果"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="非AD优质素材的原因" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="notAdHighQualityReason">
              <a-textarea v-model="model.notAdHighQualityReason" rows="4" placeholder="请输入非AD优质素材的原因" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="非千川优质素材的原因" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="notEcpHighQualityReason">
              <a-textarea v-model="model.notEcpHighQualityReason" rows="4" placeholder="请输入非千川优质素材的原因" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="创建任务状态（0：成功1：失败）" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="taskState">
              <a-input v-model="model.taskState" placeholder="请输入创建任务状态（0：成功1：失败）"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="失败code" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="errCode">
              <a-input v-model="model.errCode" placeholder="请输入失败code"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="失败原因" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="errMessage">
              <a-textarea v-model="model.errMessage" rows="4" placeholder="请输入失败原因" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction, getAction } from '@/api/manage'
  import { validateDuplicateValue } from '@/utils/util'

  export default {
    name: 'TabDiagnosisTaskResultForm',
    components: {
    },
    props: {
      //表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    data () {
      return {
        model:{
         },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        validatorRules: {
        },
        url: {
          add: "/diagnosisTaskResult/tabDiagnosisTaskResult/add",
          edit: "/diagnosisTaskResult/tabDiagnosisTaskResult/edit",
          queryById: "/diagnosisTaskResult/tabDiagnosisTaskResult/queryById"
        }
      }
    },
    computed: {
      formDisabled(){
        return this.disabled
      },
    },
    created () {
       //备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model));
    },
    methods: {
      add () {
        this.edit(this.modelDefault);
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.visible = true;
      },
      submitForm () {
        const that = this;
        // 触发表单验证
        this.$refs.form.validate(valid => {
          if (valid) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            httpAction(httpurl,this.model,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }
         
        })
      },
    }
  }
</script>