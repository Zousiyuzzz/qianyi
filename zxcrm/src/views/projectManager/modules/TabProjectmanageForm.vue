<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="客户" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="customerId">
              <JSearchSelectTag placeholder="请选择客户" v-model:value="model.customerId"
                dict="tab_customerManage,customer_name,id,del_flag = '0'" async :allowClear="false">
              </JSearchSelectTag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="项目名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="proName">
              <a-input v-model="model.proName" placeholder="请输入项目名称"></a-input>
            </a-form-model-item>
          </a-col>
          <!-- <a-col :span="24">
            <a-form-model-item label="原用名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="proAbbr">
              <a-input v-model="model.proAbbr" placeholder="请输入原用名"></a-input>
            </a-form-model-item>
          </a-col> -->

          <!-- <a-col :span="24">
            <a-form-model-item label="产品" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="productIds">
              <div style="display: flex; align-items: center;">
                <j-multi-select-tag v-model="model.productIds" :options="productOptions" placeholder="请选择产品">
                </j-multi-select-tag>
                <div
                  style="width: 100px; height: 32px; display: flex; align-items: center; justify-content: center; background-color: #1890ff; color: white; border-radius: 4px; cursor: pointer; margin-left: 8px; transition: background-color 0.3s;"
                  @click="addProduct" @mouseover="this.style.backgroundColor = '#40a9ff'"
                  @mouseout="this.style.backgroundColor = '#1890ff'">新增产品
                </div>
              </div>
            </a-form-model-item>
          </a-col> -->
          <a-col :span="24">
            <a-form-model-item label="渠道" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="businessId">
              <JSearchSelectTag placeholder="请选择渠道" v-model:value="model.businessId"
                dict="tab_business,business_name,id,del_flag = '0'" async>
              </JSearchSelectTag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="合作方式" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="collaborationMode">
              <j-dict-select-tag placeholder="请选择合作方式" v-model="model.collaborationMode"
                dictCode="projectt_hezuotype"></j-dict-select-tag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" v-if="showPaymentMethod">
            <a-form-model-item label="结算方式" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="paymentMethod">
              <j-dict-select-tag placeholder="请选择结算方式" v-model="model.paymentMethod"
                dictCode="project_paymentMethod"></j-dict-select-tag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="运营方式" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="operationType">
              <j-dict-select-tag placeholder="请选择运营方式" v-model="model.operationType"
                dictCode="project_operation_type"></j-dict-select-tag>
            </a-form-model-item>
          </a-col>
          <!-- <a-col :span="24">
            <a-form-model-item label="合作状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="cooperationStatus">
              <j-dict-select-tag placeholder="请选择合作状态" v-model="model.cooperationStatus"
                dictCode="project_cooperation_status"></j-dict-select-tag>
            </a-form-model-item>
          </a-col> -->
          <a-col :span="24">
            <a-form-model-item label="AE" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="aePerson">
              <JSearchSelectTag placeholder="请选择AE名称" v-model:value="model.aePerson" :dictOptions="aedictOptions"
                :allowClear="false">
              </JSearchSelectTag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="运营" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="operationPerson">
              <JSearchSelectTag placeholder="请选择运营名称" v-model:value="model.operationPerson" :dictOptions="yydictOptions"
                :allowClear="false">
              </JSearchSelectTag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="商务" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="businessPerson">
              <JSearchSelectTag placeholder="请选择商务名称" v-model:value="model.businessPerson" :dictOptions="swdictOptions"
                :allowClear="false">
              </JSearchSelectTag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" v-if="showRepayDay">
            <a-form-model-item label="应回款天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="repayDay">
              <a-input-number v-model="model.repayDay" placeholder="请输入应回款天数" :min="31" :precision="0"
                style="width: 100%"></a-input-number>
            </a-form-model-item>
          </a-col>
          <a-col :span="24"
            v-if="['1914143493126811650', '1920665887672848385', '1914143660794114050', '1914143599871848449', '1914143555756158977'].includes(String(model.businessId))">
            <a-form-model-item label="邮箱配置" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <div class="email-config-wrapper">
                <a-button v-if="(model.email && model.email.trim()) || (model.cc && model.cc.trim())" type="link" danger
                  icon="delete" @click="clearEmailConfig" class="clear-email-btn">
                  清空
                </a-button>
                <div v-if="(model.email && model.email.trim()) || (model.cc && model.cc.trim())" class="email-display">
                  <div v-if="model.email && model.email.trim()" class="email-item">
                    <a-icon type="mail" class="email-icon" />
                    <span class="email-label">邮箱：</span>
                    <span class="email-value">{{ model.email }}</span>
                  </div>
                  <div v-if="model.cc && model.cc.trim()" class="email-item cc-email-item">
                    <a-icon type="copy" class="email-icon" />
                    <span class="email-label">抄送：</span>
                    <div class="cc-email-list-display">
                      <span v-for="(email, index) in ccEmailList" :key="index" class="cc-email-tag">
                        {{ email }}
                      </span>
                    </div>
                  </div>
                </div>
                <a-button type="dashed" icon="plus" @click="openEmailModal" class="add-email-btn">
                  {{ (model.email && model.email.trim()) || (model.cc && model.cc.trim()) ? '修改邮箱' : '添加邮箱' }}
                </a-button>
              </div>
            </a-form-model-item>
          </a-col>
          <!-- <a-col :span="24">
            <a-form-model-item label="项目开始时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="beginDate">
              <j-date placeholder="请选择项目开始时间" v-model="model.beginDate" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="项目结束时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="endDate">
              <j-date placeholder="请选择项目结束时间" v-model="model.endDate" style="width: 100%" />
            </a-form-model-item>
          </a-col> -->
        </a-row>
      </a-form-model>
    </j-form-container>
    <!-- Add Product Modal -->
    <a-modal v-model:visible="productModalVisible" title="新增产品" @ok="handleProductModalOk"
      @cancel="handleProductModalCancel">
      <a-form-model ref="productForm" :model="productModel" :rules="productValidatorRules">
        <a-form-model-item label="产品名称" prop="productName">
          <a-input v-model="productModel.productName" placeholder="请输入产品名称" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <!-- Email Config Modal -->
    <a-modal v-model:visible="emailModalVisible" title="邮箱配置" :width="600" @ok="handleEmailModalOk"
      @cancel="handleEmailModalCancel" :confirmLoading="emailModalLoading" okText="保存" cancelText="取消">
      <a-form-model ref="emailForm" :model="emailFormData" :rules="emailValidatorRules" :labelCol="{ span: 6 }"
        :wrapperCol="{ span: 16 }">
        <a-form-model-item label="直签类别" prop="isDirect">
          <a-radio-group style="border-radius: 30px ;" v-model="emailFormData.isDirect"
            @change="handleEmailModalIsDirectChange" class="is-direct-tabs">
            <a-radio-button :value="'Y'">
              <a-icon type="ant-cloud" />
              执象直签
            </a-radio-button>
            <a-radio-button :value="'N'">
              <a-icon type="ant-cloud" />
              博拉直签
            </a-radio-button>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item label="邮箱" prop="email">
          <a-input v-model="emailFormData.email" placeholder="请输入邮箱地址，例如：example@company.com" :maxLength="100"
            prefix-icon="mail">
            <a-icon slot="prefix" type="mail" style="color: rgba(0,0,0,.25)" />
          </a-input>
          <div class="form-tip">请输入有效的邮箱地址</div>
        </a-form-model-item>
        <a-form-model-item label="抄送邮箱" prop="cc">
          <div class="cc-email-list">
            <div v-for="(email, index) in emailFormData.ccList" :key="index" class="cc-email-item">
              <a-input v-model="emailFormData.ccList[index]"
                :placeholder="`请输入第${index + 1}个抄送邮箱，例如：cc${index + 1}@company.com`" :maxLength="100"
                class="cc-email-input">
                <a-icon slot="prefix" type="copy" style="color: rgba(0,0,0,.25)" />
              </a-input>
              <a-button v-if="emailFormData.ccList.length > 1" type="link" danger icon="delete"
                @click="removeCcEmail(index)" class="remove-btn">
                删除
              </a-button>
              <a-button v-else type="link" disabled icon="delete" class="remove-btn">
                删除
              </a-button>
            </div>
            <a-button v-if="emailFormData.ccList.length < 10" type="dashed" icon="plus" @click="addCcEmail"
              class="add-cc-btn">
              添加邮箱
            </a-button>
            <div v-else class="max-tip">最多只能添加10个邮箱</div>
          </div>
          <div class="form-tip">每行输入一个邮箱地址，最多支持10个邮箱</div>
        </a-form-model-item>

      </a-form-model>
    </a-modal>
  </a-spin>
</template>

<script>
import { duplicateCheck } from '@/api/api'
import { httpAction } from '@/api/manage'
import { queryDepartTreeList } from '@/api/api'
import { values } from 'xe-utils/methods'

export default {
  name: 'TabProjectmanageForm',
  components: {},
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data() {
    return {
      swdictOptions: [],
      yydictOptions: [],
      aedictOptions: [],
      foundNodes: '',
      productOptions: [],
      validatorRules: {
        // uniqueId: [{ requiredd: true, message: '请输入项目唯一标识' }, { validator: this.validateUniqueId }],
        // proAbbr: [{ required: true, message: '请输入原用名' }, { validator: this.validateProAbbr }],
        proName: [{ required: true, message: '请输入项目名称' }, { validator: this.validateUniqueId }],
        // customerId: [{ required: true, message: '请选择客户' }],
        // productIds: [{ required: true, message: '请选择产品' }],
        businessId: [{ required: true, message: '请选择渠道' }],
        operationType: [{ required: true, message: '请选择运营方式' }],
        aePerson: [{ required: true, message: '请选择AE' }],
        businessPerson: [{ required: true, message: '请选择商务' }],
        // paymentMethod: [{ required: true, message: '请选择结算方式' }],
        collaborationMode: [{ required: true, message: '请选择合作方式' }],
      },
      productValidatorRules: {
        productName: [{ required: true, message: '请输入产品名称' }]
      },
      emailValidatorRules: {},
      model: {},
      productModel: {
        productName: ''
      },
      emailModalVisible: false,
      emailModalLoading: false,
      emailFormData: {
        email: '',
        ccList: [''],
        isDirect: ''
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
      productModalVisible: false,
      url: {
        add: "/projectmanage/add",
        edit: "/projectmanage/edit",
        queryById: "/projectmanage/queryById",
        addProduct: "/productManage/add"
      },
      userList: [],
      fetching: true,
      channelList: [],
      channelFectching: true
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    showPaymentMethod() {
      return this.model.collaborationMode == 1
    },
    showRepayDay() {
      return this.model.collaborationMode == 1 || this.model.collaborationMode == 2
    },
    isDirectValue() {
      return this.model.isDirect === 'Y' || this.model.isDirect === 1 || this.model.isDirect === true || this.model.isDirect === '1'
    },
    ccEmailList() {
      if (!this.model.cc || !this.model.cc.trim()) {
        return []
      }
      // 按逗号分割，去除空值
      return this.model.cc.split(',').map(email => email.trim()).filter(email => email)
    }
  },
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model));
    // 初始化时邮箱、抄送、直签类型设置为空
    this.modelDefault.email = '';
    this.modelDefault.cc = '';
    this.modelDefault.isDirect = '';
    this.getProductList()
    this.getDeparts()
    // 初始化邮箱验证规则
    this.emailValidatorRules = {
      email: [
        { validator: this.validateEmail, trigger: 'blur' }
      ],
      cc: [
        { validator: this.validateCcEmailList, trigger: 'blur' }
      ]
    }
  },
  methods: {
    // 在树形数据中查找指定多个ID的对象及其所有子节点，只返回id数组
    findNodesByIds(treeData, targetIds) {
      const resultSet = new Set(); // 使用Set来避免重复
      const idSet = new Set(targetIds);

      const traverse = (nodes) => {
        if (!nodes || !Array.isArray(nodes)) return;

        for (const node of nodes) {
          // 如果当前节点是目标节点，添加它和它的所有子节点
          if (idSet.has(node.id)) {
            resultSet.add(node.id);
            // 递归添加所有子节点
            if (node.children && Array.isArray(node.children)) {
              addAllChildren(node.children, resultSet);
            }
          } else {
            // 递归遍历子节点
            if (node.children && Array.isArray(node.children)) {
              traverse(node.children);
            }
          }
        }
      };

      // 递归添加所有子节点的ID
      const addAllChildren = (children, resultSet) => {
        for (const child of children) {
          resultSet.add(child.id);
          if (child.children && Array.isArray(child.children)) {
            addAllChildren(child.children, resultSet);
          }
        }
      };

      traverse(treeData);
      return Array.from(resultSet); // 转换回数组
    },

    // 在树形数据中查找指定多个ID的对象（包含路径信息）
    findNodesByIdsWithPath(treeData, targetIds) {
      const result = [];
      const idSet = new Set(targetIds);

      const traverse = (nodes, path = []) => {
        if (!nodes || !Array.isArray(nodes)) return;

        for (const node of nodes) {
          const currentPath = [...path, node.title];

          if (idSet.has(node.id)) {
            result.push({
              ...node,
              path: currentPath.join(' > ')
            });
          }

          // 递归遍历子节点
          if (node.children && Array.isArray(node.children)) {
            traverse(node.children, currentPath);
          }
        }
      };

      traverse(treeData);
      return result;
    },
    getDeparts() {
      queryDepartTreeList().then((res) => {
        if (res.success) {
          let treeData = []
          for (let i = 0; i < res.result.length; i++) {
            let temp = res.result[i]
            treeData.push(temp)
          }
          // console.log(JSON.stringify(treeData, null, 2))

          // 查找指定ID的对象示例

          //ae 1955216782652645378
          //商务 1955203485702369281
          //运营 1955216725303926786
          let shangwuids = []
          let aeiids = []
          let yunyunids = []

          //商务
          httpAction('/sys/dictItem/list', {
            pageNo: 1,
            pageSize: 100,
            dictId: '1955203485702369281',
            field: 'id,,itemText,itemValue,action'
          }, "GET").then((res) => {
            if (res.success) {
              shangwuids = res.result.records.map(item => {
                return item.itemValue
              })  // 保持为数组，不要join
              const swfoundNodes = this.findNodesByIds(treeData, shangwuids);
              httpAction('/sys/user/getUerByDepIds', {
                ids: swfoundNodes.join(',')  // 在这里join
              }, 'post').then((res) => {
                if (res.success) {
                  this.swdictOptions = res.result.map(item => {
                    return {
                      text: item.realname,
                      value: item.id  // 修复：使用 item.id
                    }
                  })
                } else {
                  this.$message.warning(res.message);
                }
              }).finally(() => {
                this.confirmLoading = false;
              })
            } else {
              this.$message.warning(res.message);
            }
          })

          //AE
          httpAction('/sys/dictItem/list', {
            pageNo: 1,
            pageSize: 100,
            dictId: '1955216782652645378',
            field: 'id,,itemText,itemValue,action'
          }, "GET").then((res) => {
            if (res.success) {
              aeiids = res.result.records.map(item => {
                return item.itemValue
              })  // 保持为数组，不要join
              // console.log('AE部门ID:', aeiids)
              const aefoundNodes = this.findNodesByIds(treeData, aeiids);
              // console.log('找到的AE节点:', aefoundNodes)
              httpAction('/sys/user/getUerByDepIds', {
                ids: aefoundNodes.join(',')  // 在这里join
              }, 'post').then((res) => {
                if (res.success) {
                  this.aedictOptions = res.result.map(item => {
                    return {
                      text: item.realname,
                      value: item.id
                    }
                  })
                } else {
                  this.$message.warning(res.message);
                }
              }).finally(() => {
                this.confirmLoading = false;
              })
            } else {
              this.$message.warning(res.message);
            }
          })

          //运营
          httpAction('/sys/dictItem/list', {
            pageNo: 1,
            pageSize: 100,
            dictId: '1955216725303926786',
            field: 'id,,itemText,itemValue,action'
          }, "GET").then((res) => {
            if (res.success) {
              yunyunids = res.result.records.map(item => {
                return item.itemValue
              })  // 保持为数组，不要join
              // console.log('运营部门ID:', yunyunids)
              const yyfoundNodes = this.findNodesByIds(treeData, yunyunids);
              // console.log('找到的运营节点:', yyfoundNodes)
              httpAction('/sys/user/getUerByDepIds', {
                ids: yyfoundNodes.join(',')  // 在这里join
              }, 'post').then((res) => {
                if (res.success) {
                  this.yydictOptions = res.result.map(item => {
                    return {
                      text: item.realname,
                      value: item.id
                    }
                  })
                } else {
                  this.$message.warning(res.message);
                }
              }).finally(() => {
                this.confirmLoading = false;
              })
            } else {
              this.$message.warning(res.message);
            }
          })






          // 查找指定ID的对象（包含路径信息）
          // const foundNodesWithPath = this.findNodesByIdsWithPath(treeData, targetIds);
        }
      })
    },
    add() {
      this.edit(this.modelDefault);
    },
    edit(record) {
      this.model = Object.assign({}, record);
      // 编辑时，如果合作方式为1或2且存在repayDay，则加30显示
      if ((this.model.collaborationMode == 1 || this.model.collaborationMode == 2) && this.model.repayDay) {
        // this.model.repayDay = this.model.repayDay + 30;
      }
      // 确保isDirect为空字符串（如果没有值）
      if (this.model.isDirect === undefined || this.model.isDirect === null) {
        this.model.isDirect = '';
      }
      this.visible = true;
    },
    addProduct() {
      this.productModalVisible = true;
      this.productModel.productName = '';
      if (this.$refs.productForm) {
        this.$refs.productForm.resetFields();
      }
    },
    handleProductModalOk() {
      this.$refs.productForm.validate(valid => {
        if (valid) {
          this.confirmLoading = true;
          httpAction(this.url.addProduct, this.productModel, 'post').then((res) => {
            if (res.success) {
              this.$message.success('产品添加成功');
              this.productModalVisible = false;
              this.getProductList();
            } else {
              this.$message.warning(res.message);
            }
          }).finally(() => {
            this.confirmLoading = false;
          })
        }
      });
    },
    handleProductModalCancel() {
      this.productModalVisible = false;
      this.productModel.productName = '';
      if (this.$refs.productForm) {
        this.$refs.productForm.resetFields();
      }
    },
    getProductList() {
      httpAction('/productManage/list', {
        pageNo: 1,
        pageSize: 10000
      }, "GET").then((res) => {
        if (res.success) {
          this.productOptions = res.result.records.map(item => {
            return {
              value: item.id,
              label: item.productName
            }
          })
        } else {
          this.$message.warning(res.message);
        }
      }).finally(() => { })
    },
    fetchChannel() {
      this.channelList = [];
      this.channelFectching = true;
      httpAction('/business/list', {
        pageNo: 1,
        pageSize: 100
      }, "GET").then((res) => {
        if (res.success) {
          this.channelList = res.result.records || []
          this.channelFectching = false
        } else {
          this.$message.warning(res.message);
        }
      }).finally(() => { })
    },
    fetchUser() {
      this.userList = [];
      this.fetching = true;
      httpAction('/sys/user/list', {
        pageNo: 1,
        pageSize: 999999
      }, "GET").then((res) => {
        if (res.success) {
          this.userList = res.result.records || []
          this.fetching = false
        } else {
          this.$message.warning(res.message);
        }
      }).finally(() => { })
    },
    submitForm() {
      const that = this;
      this.$refs.form.validate(valid => {
        if (valid) {
          // 合作方式不为1时，结算方式传99
          if (this.model.collaborationMode != 1) {
            this.model.paymentMethod = '99';
          }
          // 处理应回款天数字段
          if (this.model.collaborationMode == 1 || this.model.collaborationMode == 2) {
            // 合作方式为1或2时，传给后端时减30
            if (this.model.repayDay) {
              // this.model.repayDay = this.model.repayDay - 30;
            }
          } else {
            // 合作方式不为1或2时，不传递应回款天数字段
            delete this.model.repayDay;
          }
          // 如果渠道不是指定值，清空邮箱配置
          const allowedBusinessIds = ['1914143493126811650', '1920665887672848385', '1914143660794114050', '1914143599871848449', '1914143555756158977'];
          if (!allowedBusinessIds.includes(String(this.model.businessId))) {
            this.model.email = '';
            this.model.cc = '';
            this.model.isDirect = 'Y';
          }
          that.confirmLoading = true;
          let httpurl = '';
          let method = '';
          if (!this.model.id) {
            httpurl += this.url.add;
            method = 'post';
          } else {
            httpurl += this.url.edit;
            method = 'put';
          }
          httpAction(httpurl, this.model, method).then((res) => {
            if (res.success) {
              that.$message.success(res.message);
              that.$emit('ok');
            } else {
              that.$message.warning(res.message);
            }
          }).finally(() => {
            that.confirmLoading = false;
          })
        }
      })
    },
    validateUniqueId(rule, value, callback) {
      var params = {
        tableName: 'tab_projectManage',
        fieldName: 'pro_name',
        fieldVal: value,
        dataId: this.model.id
      };
      duplicateCheck(params).then((res) => {
        if (res.success) {
          callback()
        } else {
          callback("项目名称已存在!")
        }
      })
    },
    // 邮箱相关方法
    openEmailModal() {
      // 打开弹窗时，将当前model中的邮箱数据填充到表单
      const ccValue = this.model.cc || '';
      // 将逗号分隔的字符串拆分成数组
      let ccList = [];
      if (ccValue.trim()) {
        ccList = ccValue.split(',').map(email => email.trim()).filter(email => email);
      }
      // 如果为空，至少保留一个空行
      if (ccList.length === 0) {
        ccList = [''];
      }

      const isDirect = this.model.isDirect || '';
      const email = this.model.email || '';

      this.emailFormData = {
        email: email,
        ccList: ccList,
        isDirect: isDirect
      };
      this.emailModalVisible = true;
      // 重置表单验证状态
      this.$nextTick(() => {
        if (this.$refs.emailForm) {
          this.$refs.emailForm.clearValidate();
        }
      });
    },
    handleEmailModalOk() {
      this.$refs.emailForm.validate(valid => {
        if (valid) {
          // 验证通过，将数据保存到model中
          this.model.email = this.emailFormData.email ? this.emailFormData.email.trim() : '';

          // 将邮箱数组用英文逗号拼接成字符串，过滤掉空值
          const validEmails = this.emailFormData.ccList
            .map(email => email.trim())
            .filter(email => email);
          this.model.cc = validEmails.join(',');

          // 保存直签类别（如果为空则设置为空字符串）
          this.model.isDirect = this.emailFormData.isDirect || '';

          this.emailModalVisible = false;
          this.$message.success('邮箱配置已保存');
        }
      });
    },
    handleEmailModalCancel() {
      this.emailModalVisible = false;
      // 重置表单数据
      this.emailFormData = {
        email: '',
        ccList: [''],
        isDirect: ''
      };
      if (this.$refs.emailForm) {
        this.$refs.emailForm.resetFields();
      }
    },
    // 添加抄送邮箱行
    addCcEmail() {
      if (this.emailFormData.ccList.length < 10) {
        this.emailFormData.ccList.push('');
      }
    },
    // 删除抄送邮箱行
    removeCcEmail(index) {
      if (this.emailFormData.ccList.length > 1) {
        this.emailFormData.ccList.splice(index, 1);
      }
    },
    // 清空邮箱配置
    clearEmailConfig() {
      this.$confirm({
        title: '确认清空',
        content: '确定要清空邮箱配置吗？',
        onOk: () => {
          this.model.email = '';
          this.model.cc = '';
          this.model.isDirect = '';
          this.$message.success('邮箱配置已清空');
        }
      });
    },
    // 是否直签变化处理
    handleIsDirectChange(e) {
      // radio-group的值会通过v-model自动更新到model.isDirect
      // 值已经是字符串'Y'或'N'，不需要额外处理
    },
    // 邮箱弹窗中直签类别变化处理
    handleEmailModalIsDirectChange(e) {
      // radio-group的值会通过v-model自动更新到emailFormData.isDirect
      if (this.emailFormData.isDirect === 'Y') {
        // 选择执象直签，自动填充默认邮箱
        this.emailFormData.email = 'office@zxmember.com';
        this.emailFormData.ccList = ['chongzhi@bolaa.com'];
      } else if (this.emailFormData.isDirect === 'N') {
        // 选择博拉直签，清空邮箱和抄送邮箱
        this.emailFormData.email = '';
        this.emailFormData.ccList = [''];
      }
      // 清除验证状态，避免显示之前的验证错误
      this.$nextTick(() => {
        if (this.$refs.emailForm) {
          this.$refs.emailForm.clearValidate();
        }
      });
    },
    // 邮箱格式验证
    validateEmail(rule, value, callback) {
      if (!value || value.trim() === '') {
        // 邮箱不是必填项，可以为空
        callback();
        return;
      }
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(value.trim())) {
        callback();
      } else {
        callback('请输入有效的邮箱地址');
      }
    },
    // 抄送邮箱格式验证
    validateCcEmails(rule, value, callback) {
      if (!value || value.trim() === '') {
        // 抄送邮箱不是必填项，可以为空
        callback();
        return;
      }
      // 支持逗号、分号、空格分隔
      const emails = value.split(/[,;\s]+/).filter(email => email.trim() !== '');

      // 限制最多10个邮箱
      if (emails.length > 10) {
        callback('最多只能输入10个邮箱地址');
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      for (let i = 0; i < emails.length; i++) {
        const email = emails[i].trim();
        if (!emailRegex.test(email)) {
          callback(`第${i + 1}个邮箱地址格式不正确：${email}`);
          return;
        }
      }
      callback();
    },
    // 抄送邮箱列表格式验证
    validateCcEmailList(rule, value, callback) {
      // 验证ccList数组中的每个邮箱
      if (!this.emailFormData.ccList || this.emailFormData.ccList.length === 0) {
        callback();
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const validEmails = this.emailFormData.ccList.filter(email => email && email.trim());

      // 限制最多10个邮箱
      if (validEmails.length > 10) {
        callback('最多只能输入10个邮箱地址');
        return;
      }

      // 验证每个邮箱格式
      for (let i = 0; i < validEmails.length; i++) {
        const email = validEmails[i].trim();
        if (!emailRegex.test(email)) {
          callback(`第${i + 1}个邮箱地址格式不正确：${email}`);
          return;
        }
      }

      // 检查是否有重复的邮箱（不区分大小写）
      const emailMap = new Map();
      for (let i = 0; i < validEmails.length; i++) {
        const email = validEmails[i].trim().toLowerCase();
        if (emailMap.has(email)) {
          const firstIndex = emailMap.get(email) + 1;
          const currentIndex = i + 1;
          callback(`第${firstIndex}个和第${currentIndex}个邮箱地址重复：${validEmails[i].trim()}`);
          return;
        }
        emailMap.set(email, i);
      }

      callback();
    },
    // validateProAbbr(rule, value, callback) {
    //   var params = {
    //     tableName: 'tab_projectManage',
    //     fieldName: 'pro_abbr',
    //     fieldVal: value,
    //     dataId: this.model.id
    //   };
    //   duplicateCheck(params).then((res) => {
    //     if (res.success) {
    //       callback()
    //     } else {
    //       callback("原用名已存在!")
    //     }
    //   })
    // },
  },
  watch: {
    'model.collaborationMode'(val) {
      if (val == 1) {
        this.$set(this.validatorRules, 'paymentMethod', [{ required: true, message: '请选择结算方式' }])
      } else {
        this.$delete(this.validatorRules, 'paymentMethod')
        this.model.paymentMethod = undefined
      }

      // 管理应回款天数的验证规则
      if (val == 1 || val == 2) {
        this.$set(this.validatorRules, 'repayDay', [{ required: true, message: '请输入应回款天数' }, { type: 'number', min: 31, message: '应回款天数必须大于等于31' }])
      } else {
        this.$delete(this.validatorRules, 'repayDay')
        this.model.repayDay = undefined
      }
    },
    'model.businessId'(newVal, oldVal) {
      // 监听渠道变化，如果切换渠道且新渠道不是指定值，清空邮箱配置
      const allowedBusinessIds = ['1914143493126811650', '1920665887672848385', '1914143660794114050', '1914143599871848449', '1914143555756158977'];
      if (oldVal !== undefined && oldVal !== null && !allowedBusinessIds.includes(String(newVal))) {
        this.model.email = '';
        this.model.cc = '';
        this.model.isDirect = 'Y';
      }
    }
  }
}
</script>

<style scoped lang="less">
.email-config-wrapper {
  width: 100%;
  position: relative;

  .clear-email-btn {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0;
    height: auto;
    z-index: 1;
  }

  .email-display {
    margin-bottom: 12px;
    padding: 12px;
    background-color: #f5f5f5;
    border-radius: 4px;
    border: 1px solid #e8e8e8;

    .email-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .email-icon {
        margin-right: 8px;
        color: #1890ff;
        font-size: 14px;
      }

      .email-label {
        font-weight: 500;
        color: #666;
        margin-right: 8px;
        min-width: 50px;
      }

      .email-value {
        color: #333;
        word-break: break-all;
        flex: 1;
      }

      // 抄送邮箱特殊样式
      &.cc-email-item {
        align-items: flex-start;
        flex-wrap: wrap;

        .email-icon {
          align-self: center; // 图标垂直居中，与普通邮箱项对齐
        }

        .email-label {
          flex-shrink: 0;
          align-self: center; // 标签垂直居中，与普通邮箱项对齐
        }

        .cc-email-list-display {
          flex: 1;
          min-width: 100%; // 占据整行，让邮箱列表换行显示
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: flex-start;
          margin-top: 4px; // 与标签保持一点间距

          .cc-email-tag {
            display: inline-block;
            padding: 4px 12px;
            background-color: #e6f7ff;
            border: 1px solid #91d5ff;
            border-radius: 4px;
            color: #1890ff;
            font-size: 13px;
            line-height: 1.5;
            word-break: break-all;
          }
        }
      }
    }
  }

  .add-email-btn {
    width: 100%;
    height: 40px;
    border-style: dashed;
    border-color: #1890ff;
    color: #1890ff;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      border-color: #40a9ff;
      color: #40a9ff;
      background-color: #e6f7ff;
    }

    .anticon {
      margin-right: 4px;
    }
  }
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
  line-height: 1.5;
}

// 是否直签tabs样式
.is-direct-tabs {
  display: flex;
  width: 100%;

  .ant-radio-button-wrapper {
    flex: 1;
    height: 40px;
    line-height: 38px;
    padding: 0 24px;
    font-size: 14px;
    transition: all 0.3s;
    text-align: center;

    .anticon {
      margin-right: 6px;
      font-size: 14px;
    }

    &:first-child {
      border-radius: 4px 0 0 4px;
    }

    &:last-child {
      border-radius: 0 4px 4px 0;
    }

    &:hover {
      color: #1890ff;
      border-color: #1890ff;
    }

    &.ant-radio-button-wrapper-checked {
      background-color: #1890ff;
      border-color: #1890ff;
      color: #fff;
      box-shadow: -1px 0 0 0 #1890ff;

      &:hover {
        background-color: #40a9ff;
        border-color: #40a9ff;
        color: #fff;
      }

      .anticon {
        color: #fff;
      }
    }
  }
}

// 抄送邮箱列表样式
.cc-email-list {
  width: 100%;

  .cc-email-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 8px;

    &:last-of-type {
      margin-bottom: 0;
    }

    .cc-email-input {
      flex: 1;
    }

    .remove-btn {
      flex-shrink: 0;
      padding: 0 8px;
      height: 32px;
    }
  }

  .add-cc-btn {
    width: 100%;
    height: 36px;
    margin-top: 8px;
    border-style: dashed;
    border-color: #1890ff;
    color: #1890ff;
    transition: all 0.3s;

    &:hover {
      border-color: #40a9ff;
      color: #40a9ff;
      background-color: #e6f7ff;
    }
  }

  .max-tip {
    margin-top: 8px;
    text-align: center;
    color: #999;
    font-size: 12px;
  }
}

:deep(.is-direct-tabs .ant-radio-button-wrapper) {
  border-radius: 100px !important;
}

:deep(.ant-radio-button-wrapper::before) {
  display: none !important;
}

// 邮箱弹窗样式优化
:deep(.ant-modal-body) {
  .ant-form-item {
    margin-bottom: 20px;
  }

  .ant-input-affix-wrapper {
    transition: all 0.3s;

    &:hover {
      border-color: #40a9ff;
    }

    &:focus,
    &.ant-input-affix-wrapper-focused {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }

  .ant-input {
    transition: all 0.3s;

    &:hover {
      border-color: #40a9ff;
    }

    &:focus {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
}
</style>