<template>
    <div class="ai-image-generator">
        <a-card class="main-card" :bordered="false">
            <div class="page-header">
                <div class="header-content">
                    <div class="title-section">
                        <h1 class="page-title">
                            <a-icon type="robot" class="title-icon" />
                            AI 图生图
                        </h1>
                        <p class="page-subtitle">基于输入图片生成全新的创意图像</p>
                    </div>
                    <div class="header-actions">
                        <a-button type="primary" @click="showGenerateModal = true">
                            <a-icon type="robot" />
                            生成
                        </a-button>
                    </div>
                </div>
            </div>

            <a-row :gutter="24" class="main-content">
                <!-- 新增：左侧历史图片列表 -->
                <a-col :span="5" class="history-list-col">
                    <div style="padding: 8px 12px 0 12px;">
                        <a-input v-model="aiImagePromptQuery" placeholder="输入提示词查询" allow-clear
                            style="margin-bottom: 8px; width: 100%;" />
                    </div>
                    <div class="history-list-wrapper">
                        <a-list :data-source="aiImageList" :loading="aiImageListLoading" :renderItem="renderAiImageItem"
                            :split="false" class="ai-image-list">
                            <template #footer>
                                <div v-if="hasMoreAiImage" class="load-more">
                                    <a-button type="link" @click="loadMoreAiImageList"
                                        :loading="aiImageListLoading">加载更多</a-button>
                                </div>
                            </template>
                        </a-list>
                    </div>
                </a-col>

                <!-- 右侧：详细信息展示区 -->
                <a-col :span="19">
                    <a-card title="生成详情" :bordered="false" class="result-card">
                        <div class="result-content">
                            <div v-if="!selectedAiImage" class="empty-result">
                                <div class="empty-content">
                                    <a-icon type="picture" class="empty-icon" />
                                    <p class="empty-text">点击左侧图片查看详细信息</p>
                                </div>
                            </div>
                            <div v-else class="generated-content">
                                <div class="result-content-horizontal">
                                    <div class="detail-image-side">
                                        <img :src="getApiImageUrl(selectedAiImage.binaryDataBase64 ? 'data:image/png;base64,' + selectedAiImage.binaryDataBase64 : selectedAiImage.imageInput)"
                                            alt="生成结果" class="result-image-side" />
                                    </div>
                                    <div class="detail-info-side">
                                        <a-descriptions title="详细信息" :column="1" size="small">
                                            <a-descriptions-item label="ID">{{ selectedAiImage.id
                                            }}</a-descriptions-item>
                                            <!-- <a-descriptions-item label="创建人">{{ selectedAiImage.createBy
                                                }}</a-descriptions-item> -->
                                            <a-descriptions-item label="创建时间">{{ selectedAiImage.createTime
                                            }}</a-descriptions-item>
                                            <a-descriptions-item label="生成模式"
                                                v-if="selectedAiImage.reqKey === 'i2i_portrait_photo'">{{
                                                    selectedAiImage.genMode
                                                }}</a-descriptions-item>
                                            <a-descriptions-item label="状态">{{ parseMainStateText(selectedAiImage.state)
                                                }}</a-descriptions-item>
                                            <a-descriptions-item label="prompt">{{ selectedAiImage.prompt
                                            }}</a-descriptions-item>
                                            <a-descriptions-item label="图片URL">{{
                                                `${imagePrefix}/${selectedAiImage.imageInput}`
                                            }}</a-descriptions-item>
                                            <a-descriptions-item label="生成数量">{{ selectedAiImage.quantity
                                            }}</a-descriptions-item>
                                            <a-descriptions-item label="scale">{{ selectedAiImage.scale
                                            }}</a-descriptions-item>
                                            <a-descriptions-item label="seed">{{ selectedAiImage.seed
                                            }}</a-descriptions-item>
                                            <a-descriptions-item label="gpen"
                                                v-if="selectedAiImage.reqKey === 'i2i_portrait_photo'">{{
                                                    selectedAiImage.gpen
                                                }}</a-descriptions-item>
                                            <a-descriptions-item label="高清处理"
                                                v-if="selectedAiImage.reqKey === 'i2i_portrait_photo'">{{
                                                    selectedAiImage.gpen
                                                }}</a-descriptions-item>
                                            <a-descriptions-item label="宽"
                                                v-if="selectedAiImage.reqKey === 'i2i_portrait_photo'">{{
                                                    selectedAiImage.width
                                                }}</a-descriptions-item>
                                            <a-descriptions-item label="高"
                                                v-if="selectedAiImage.reqKey === 'i2i_portrait_photo'">{{
                                                    selectedAiImage.height
                                                }}</a-descriptions-item>
                                            <a-descriptions-item label="skin"
                                                v-if="selectedAiImage.reqKey === 'i2i_portrait_photo'">{{
                                                    selectedAiImage.skin
                                                }}</a-descriptions-item>
                                            <a-descriptions-item label="skinUnifi"
                                                v-if="selectedAiImage.reqKey === 'i2i_portrait_photo'">{{
                                                    selectedAiImage.skinUnifi
                                                }}</a-descriptions-item>
                                        </a-descriptions>
                                    </div>
                                </div>
                                <h2 style="margin-top: 20px;margin-bottom: -10px;">生成记录</h2>
                                <div v-if="detailImages.length" class="sub-image-list-wrapper">
                                    <div class="sub-image-list-vertical">
                                        <div v-for="(img, idx) in detailImages" :key="img.id || idx"
                                            class="sub-image-item-vertical">
                                            <img :src="getApiImageUrl(img.binaryDataBase64 ? 'data:image/png;base64,' + img.binaryDataBase64 : (img.localImageUrl || img.imageUrl))"
                                                class="sub-image-pic-vertical" @click="previewSubImage(img)"
                                                style="cursor: pointer;" />
                                            <div class="sub-image-info-vertical">
                                                <div class="sub-info-row"><b>ID:</b> {{ img.id }}</div>
                                                <div class="sub-info-row"><b>状态:</b> {{ parseStateText(img.state) }}
                                                </div>
                                                <div class="sub-info-row"><b>图片URL:</b> {{ img.imageUrl }}</div>
                                                <div class="sub-info-row"><b>本地图片:</b> {{ img.localImageUrl }}</div>
                                                <div class="sub-info-row"><b>原输入:</b>
                                                    <template
                                                        v-if="selectedAiImage.reqKey === 'seededit_v3.0' && isJson(img.llmResult)">
                                                        {{ parseOri_prompt(img.llmResult) }}
                                                    </template>
                                                </div>
                                                <div class="sub-info-row"><b>输入改写:</b>
                                                    <template
                                                        v-if="selectedAiImage.reqKey === 'seededit_v3.0' && isJson(img.llmResult)">
                                                        {{ parseOri_vlm_input(img.llmResult) }}
                                                    </template>
                                                </div>
                                                <div class="sub-info-row"><b>输出改写:</b>
                                                    <template
                                                        v-if="selectedAiImage.reqKey === 'seededit_v3.0' && isJson(img.llmResult)">
                                                        {{ parseSeedEditV3Result(img.llmResult) }}
                                                    </template>
                                                </div>
                                                <div class="sub-info-row" v-if="img.errorMsg"><b>失败原因:</b> {{
                                                    img.errorMsg }}</div>
                                                <div class="sub-info-row"><b>耗时:</b> {{ img.timeElapsed }}</div>
                                                <div class="sub-info-row"><b>创建人:</b> {{ img.createBy }}</div>
                                                <div class="sub-info-row"><b>创建时间:</b> {{ img.createTime }}</div>
                                            </div>
                                            <button class="sub-image-download-btn"
                                                @click="downloadSubImage(img)">下载图片</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a-card>
                </a-col>
            </a-row>
        </a-card>

        <!-- 历史记录模态框 -->
        <a-modal v-model="historyVisible" title="生成历史" width="800px" :footer="null">
            <div class="history-content">
                <a-list :data-source="historyList" :loading="historyLoading" item-layout="horizontal">
                    <a-list-item slot="renderItem" slot-scope="item">
                        <a-list-item-meta>
                            <img slot="avatar" :src="item.thumbnail" class="history-thumbnail" />
                            <template slot="title">
                                <span>{{ item.prompt }}</span>
                            </template>
                            <template slot="description">
                                <span>{{ item.createTime }}</span>
                            </template>
                        </a-list-item-meta>
                        <template slot="actions">
                            <a-button type="link" @click="viewHistory(item)">查看</a-button>
                            <a-button type="link" @click="downloadHistory(item)">下载</a-button>
                        </template>
                    </a-list-item>
                </a-list>
            </div>
        </a-modal>

        <!-- 图片信息模态框 -->
        <a-modal v-model="infoVisible" title="图片信息" width="600px" :footer="null">
            <a-descriptions :column="1">
                <a-descriptions-item label="图片尺寸">
                    {{ imageInfo.size }}
                </a-descriptions-item>
                <a-descriptions-item label="文件大小">
                    {{ imageInfo.fileSize }}
                </a-descriptions-item>
                <a-descriptions-item label="生成模型">
                    {{ imageInfo.model }}
                </a-descriptions-item>
                <a-descriptions-item label="生成时间">
                    {{ imageInfo.generateTime }}
                </a-descriptions-item>
            </a-descriptions>
        </a-modal>

        <!-- 生成类型弹窗 -->
        <a-modal v-model="showGenerateModal" title="选择生成类型" width="70%" :footer="null">
            <a-tabs :active-key="generateType" @change="val => generateType = val">
                <a-tab-pane key="portrait" tab="人像写真">
                    <a-form :model="portraitForm" layout="horizontal" @submit.prevent>
                        <a-form-item label="上传图片">
                            <a-upload :before-upload="handlePortraitBeforeUpload" :file-list="portraitForm.fileList"
                                :show-upload-list="false" accept="image/*">
                                <a-button icon="upload">选择图片</a-button>
                            </a-upload>
                            <div v-if="portraitForm.imageUrl" style="margin-top:10px;">
                                <img :src="portraitForm.imageUrl"
                                    style="max-width: 180px; max-height: 180px; border-radius: 8px;" />
                            </div>
                        </a-form-item>
                        <a-form-item label="生图提示词"
                            :help="'用于编辑图像的提示词。建议：长度<=120字符，过长有概率出图异常或不生效；编辑指令用自然语言；每次编辑用单指令更好；局部编辑时描述精准，尤其多个实体时要清楚描述对谁做什么；编辑效果不明显时可调整scale，数值越大越贴近指令执行；尽量用清晰高分辨率底图，豆包模型效果更好。\n示例：添加/删除实体：添加/删除xxx（删除图上的女孩/添加一道彩虹）；修改实体：把xxx改成xxx（把手里的鸡腿变成汉堡）；修改风格：改成xxx风格（改成漫画风格）；修改色彩：把xxx改成xx颜色（把衣服改成粉色的）；修改动作：修改表情动作（让他哭/笑/生气）；修改环境背景：背景换成xxx，在xxx（背景换成海边/在星空下）'">
                            <a-textarea v-model="portraitForm.prompt" placeholder="如：演唱会现场的合照，闪光灯拍摄"
                                :auto-size="{ minRows: 2, maxRows: 4 }" />
                        </a-form-item>
                        <a-form-item label="生成宽度">
                            <a-input-number v-model="portraitForm.width" :min="512" :max="2048" :step="1"
                                style="width:100%" placeholder="请输入宽度，范围512-2048" />
                        </a-form-item>
                        <a-form-item label="生成高度">
                            <a-input-number v-model="portraitForm.height" :min="512" :max="2048" :step="1"
                                style="width:100%" placeholder="请输入高度，范围512-2048" />
                        </a-form-item>
                        <a-form-item label="高清处理(gpen)">
                            <a-select v-model="portraitForm.gpen" style="width:100%">
                                <a-select-option v-for="v in [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]"
                                    :key="v" :value="v">{{ v
                                    }}</a-select-option>
                            </a-select>
                            <div class="ant-form-extra">越高人脸清晰度越高，建议默认0.4</div>
                        </a-form-item>
                        <a-form-item label="美颜效果(skin)">
                            <a-select v-model="portraitForm.skin" style="width:100%">
                                <a-select-option v-for="v in [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]"
                                    :key="v" :value="v">{{ v
                                    }}</a-select-option>
                            </a-select>
                            <div class="ant-form-extra">越高美颜效果越明显，建议默认0.3</div>
                        </a-form-item>
                        <a-form-item label="匀肤效果(skinUnifi)">
                            <a-select v-model="portraitForm.skinUnifi" style="width:100%">
                                <a-select-option v-for="v in [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]"
                                    :key="v" :value="v">{{ v
                                    }}</a-select-option>
                            </a-select>
                            <div class="ant-form-extra">越高均匀肤色去除瑕疵效果越明显，建议默认0</div>
                        </a-form-item>
                        <a-form-item label="参考模式(genMode)">
                            <a-select v-model="portraitForm.genMode" style="width:100%">
                                <a-select-option value="creative">creative（提示词模式，仅参考性别特征）</a-select-option>
                                <a-select-option value="reference">reference（全参考，含背景）</a-select-option>
                                <a-select-option value="reference_char">reference_char（仅参考人物特征）</a-select-option>
                            </a-select>
                            <div class="ant-form-extra">creative: 只参考性别特征；reference: 参考人物和背景；reference_char: 仅参考人物特征
                            </div>
                        </a-form-item>
                        <a-form-item label="随机种子(seed)"
                            :help="'随机种子，作为确定扩散初始状态的基础，默认-1（随机）。若随机种子为相同正整数且其他参数均一致，则生成内容极大概率效果一致。默认值：-1'">
                            <a-input v-model="portraitForm.seed" placeholder="-1为随机，正整数可复现" />
                        </a-form-item>
                        <a-form-item label="生成数量">
                            <a-input-number v-model="portraitForm.quantity" :min="1" :max="10" :step="1"
                                style="width:100%" placeholder="生成数量，1-10" />
                        </a-form-item>
                        <a-form-item>
                            <a-button type="primary" @click="submitPortraitForm"
                                :loading="portraitForm.loading">提交</a-button>
                        </a-form-item>
                    </a-form>
                </a-tab-pane>
                <a-tab-pane key="seedEdit" tab="seedEdit3.0">
                    <a-form :model="seedEditForm" layout="horizontal" @submit.prevent>
                        <a-form-item label="上传图片">
                            <a-upload :before-upload="handleSeedEditBeforeUpload" :file-list="seedEditForm.fileList"
                                :show-upload-list="false" accept="image/*">
                                <a-button icon="upload">选择图片</a-button>
                            </a-upload>
                            <div v-if="seedEditForm.imageUrl" style="margin-top:10px;">
                                <img :src="seedEditForm.imageUrl"
                                    style="max-width: 180px; max-height: 180px; border-radius: 8px;" />
                            </div>
                        </a-form-item>
                        <a-form-item label="生图提示词"
                            :help="'用于编辑图像的提示词。建议：长度<=120字符，过长有概率出图异常或不生效；编辑指令用自然语言；每次编辑用单指令更好；局部编辑时描述精准，尤其多个实体时要清楚描述对谁做什么；编辑效果不明显时可调整scale，数值越大越贴近指令执行；尽量用清晰高分辨率底图，豆包模型效果更好。\n示例：添加/删除实体：添加/删除xxx（删除图上的女孩/添加一道彩虹）；修改实体：把xxx改成xxx（把手里的鸡腿变成汉堡）；修改风格：改成xxx风格（改成漫画风格）；修改色彩：把xxx改成xx颜色（把衣服改成粉色的）；修改动作：修改表情动作（让他哭/笑/生气）；修改环境背景：背景换成xxx，在xxx（背景换成海边/在星空下）'">
                            <a-textarea v-model="seedEditForm.prompt" placeholder="请输入编辑指令，如：把衣服改成粉色的"
                                :auto-size="{ minRows: 2, maxRows: 4 }" />
                        </a-form-item>
                        <a-form-item label="随机种子(seed)"
                            :help="'随机种子，作为确定扩散初始状态的基础，默认-1（随机）。若随机种子为相同正整数且其他参数均一致，则生成内容极大概率效果一致。默认值：-1'">
                            <a-input v-model="seedEditForm.seed" placeholder="输入-1为随机，正整数可复现" />
                        </a-form-item>
                        <a-form-item label="scale" :help="'文本描述影响的程度，该值越大代表文本描述影响程度越大，且输入图片影响程度越小。默认值：0.5，取值范围[0,1]'">
                            <a-input-number v-model="seedEditForm.scale" :min="0" :max="1" :step="0.1"
                                style="width:100%" placeholder="建议默认0.5，范围0-1" />
                        </a-form-item>
                        <a-form-item label="生成数量">
                            <a-input-number v-model="seedEditForm.quantity" :min="1" :max="10" :step="1"
                                style="width:100%" placeholder="生成数量，1-10" />
                        </a-form-item>
                        <a-form-item>
                            <a-button type="primary" @click="submitSeedEditForm"
                                :loading="seedEditForm.loading">提交</a-button>
                        </a-form-item>
                    </a-form>
                </a-tab-pane>
            </a-tabs>
        </a-modal>
        <!-- 预览图片模态框 -->
        <a-modal v-model="subImagePreviewVisible" footer={null} :width="800" :centered="true">
            <img :src="subImagePreviewUrl"
                style="width:100%;max-height:80vh;object-fit:contain;display:block;margin:auto;" />
        </a-modal>
    </div>
</template>

<script>
import aiApi from '@/api/ai'
import aiImageGenerationApi from '@/api/aiImageGeneration'

const IMAGE_PREFIX = process.env.VUE_APP_API_BASE_URL

export default {
    name: 'AIImageGenerator',
    data() {
        return {
            // 表单数据
            formData: {
                prompt: '',
                negativePrompt: '',
                steps: 25,
                cfgScale: 7,
                size: '512x512',
                sampler: 'euler',
                seed: -1,
                model: 'stable-diffusion-xl'
            },

            // 图片相关
            inputImage: '',
            generatedImage: '',
            fileInput: null,
            uploadedFile: null,

            // 状态
            generating: false,
            historyVisible: false,
            infoVisible: false,
            taskId: null,

            // 生成信息
            generationTime: '',
            generationSeed: '',
            estimatedTime: '30秒',

            // 历史记录
            historyList: [],
            historyLoading: false,

            // 图片信息
            imageInfo: {
                size: '',
                fileSize: '',
                model: '',
                generateTime: ''
            },

            // 模型列表
            modelList: [],

            // 新增：AI图片历史列表相关
            aiImageList: [],
            aiImageListLoading: false,
            aiImageListPage: 1,
            aiImageListPageSize: 10,
            aiImageListTotal: 0,
            hasMoreAiImage: true,
            selectedAiImage: null,
            aiImagePromptQuery: '',
            // imagePrefix: "http://192.168.8.104:8080/jeecg-boot",
            imagePrefix: "http://crm.zxmember.com/jeecg-boot/",
            detailImages: [], // 子表图片数组
            showGenerateModal: false,
            generateType: 'portrait',
            portraitForm: {
                fileList: [],
                imageFile: null,
                imageUrl: '',
                prompt: '',
                width: '',
                height: '',
                gpen: 0.4,
                skin: 0.3,
                skinUnifi: 0,
                genMode: 'creative',
                seed: '-1',
                quantity: 1,
                loading: false
            },
            seedEditForm: {
                fileList: [],
                imageFile: null,
                imageUrl: '',
                prompt: '',
                seed: '-1',
                scale: 0.5,
                quantity: 1,
                loading: false
            },
            // 预览相关
            subImagePreviewVisible: false,
            subImagePreviewUrl: '',
        }
    },

    computed: {
        canGenerate() {
            return this.inputImage && this.formData.prompt.trim()
        },
        // 拼接图片URL
        getApiImageUrl() {
            const prefix = this.imagePrefix
            return (img) => {
                if (!img) return ''
                if (img.startsWith('data:image')) return img
                if (img.startsWith('http')) return img
                return prefix + (img.startsWith('/') ? img : '/' + img)
            }
        }
    },

    async mounted() {
        this.fileInput = this.$refs.fileInput
        // await this.loadModels()
        // await this.loadQuota()
        this.loadAiImageList()
    },

    watch: {
        aiImagePromptQuery: {
            handler: function (val) {
                if (this._aiImagePromptDebounce) clearTimeout(this._aiImagePromptDebounce)
                this._aiImagePromptDebounce = setTimeout(() => {
                    this.loadAiImageList(true)
                }, 500)
            }
        }
    },

    methods: {
        // 触发文件上传
        triggerUpload() {
            this.fileInput.click()
        },

        // 处理图片上传
        handleImageUpload(event) {
            const file = event.target.files[0]
            if (!file) return

            // 验证文件类型和大小
            if (!file.type.startsWith('image/')) {
                this.$message.error('请选择图片文件')
                return
            }

            if (file.size > 10 * 1024 * 1024) {
                this.$message.error('图片大小不能超过10MB')
                return
            }

            // 保存文件对象
            this.uploadedFile = file

            // 读取图片
            const reader = new FileReader()
            reader.onload = (e) => {
                this.inputImage = e.target.result
            }
            reader.readAsDataURL(file)
        },

        // 删除图片
        removeImage() {
            this.inputImage = ''
            this.uploadedFile = null
            this.fileInput.value = ''
        },

        // 生成图片
        async generateImage() {
            if (!this.canGenerate) return

            // 检查配额
            // if (this.quota.remaining <= 0) {
            //     this.$message.error('今日生成次数已用完，请明天再试')
            //     return
            // }

            this.generating = true
            this.generatedImage = ''

            try {
                // 准备表单数据
                const formData = new FormData()
                formData.append('image', this.uploadedFile)
                formData.append('prompt', this.formData.prompt)
                formData.append('negative_prompt', this.formData.negativePrompt)
                formData.append('steps', this.formData.steps)
                formData.append('cfg_scale', this.formData.cfgScale)
                formData.append('size', this.formData.size)
                formData.append('sampler', this.formData.sampler)
                formData.append('seed', this.formData.seed)
                formData.append('model', this.formData.model)

                // 调用API
                const response = await aiApi.generateImage(formData)

                if (response.success) {
                    this.taskId = response.data.task_id

                    // 轮询生成状态
                    await this.pollGenerationStatus()

                    this.$message.success('图片生成成功！')

                    // 更新配额
                    // await this.loadQuota()

                    // 添加到历史记录
                    this.addToHistory()
                } else {
                    throw new Error(response.message || '生成失败')
                }

            } catch (error) {
                this.$message.error(error.message || '生成失败，请重试')
                console.error('生成失败:', error)
            } finally {
                this.generating = false
                this.taskId = null
            }
        },

        // 轮询生成状态
        async pollGenerationStatus() {
            const maxAttempts = 60 // 最多轮询60次，每次5秒
            let attempts = 0

            while (attempts < maxAttempts) {
                try {
                    const response = await aiApi.getGenerationStatus(this.taskId)

                    if (response.success) {
                        const status = response.data.status

                        if (status === 'completed') {
                            this.generatedImage = response.data.image_url
                            this.generationTime = new Date().toLocaleString()
                            this.generationSeed = response.data.seed || this.formData.seed
                            break
                        } else if (status === 'failed') {
                            throw new Error(response.data.error || '生成失败')
                        } else if (status === 'processing') {
                            // 更新预计时间
                            const progress = response.data.progress || 0
                            const remainingTime = Math.ceil((100 - progress) / 10) * 5
                            this.estimatedTime = `${remainingTime}秒`
                        }
                    }

                    // 等待5秒后再次查询
                    await new Promise(resolve => setTimeout(resolve, 5000))
                    attempts++

                } catch (error) {
                    console.error('轮询状态失败:', error)
                    throw error
                }
            }

            if (attempts >= maxAttempts) {
                throw new Error('生成超时，请重试')
            }
        },

        // 加载模型列表
        async loadModels() {
            try {
                const response = await aiApi.getModels()
                if (response.success) {
                    this.modelList = response.data
                }
            } catch (error) {
                console.error('加载模型列表失败:', error)
            }
        },

        // 加载用户配额
        async loadQuota() {
            try {
                const response = await aiApi.getQuota()
                if (response.success) {
                    this.quota = response.data
                }
            } catch (error) {
                console.error('加载配额信息失败:', error)
            }
        },

        // 重新生成
        regenerateImage() {
            this.generateImage()
        },

        // 下载图片
        downloadImage() {
            if (!this.generatedImage) return

            const link = document.createElement('a')
            link.href = this.generatedImage
            link.download = `ai-generated-${Date.now()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        },

        // 显示图片信息
        showImageInfo() {
            this.imageInfo = {
                size: this.formData.size,
                fileSize: '2.5MB',
                model: 'Stable Diffusion XL',
                generateTime: this.generationTime
            }
            this.infoVisible = true
        },

        // 显示历史记录
        showHistory() {
            this.historyVisible = true
            this.loadHistory()
        },

        // 加载历史记录
        async loadHistory() {
            this.historyLoading = true
            try {
                const response = await aiApi.getHistory({
                    page: 1,
                    size: 20
                })

                if (response.success) {
                    this.historyList = response.data.records || []
                } else {
                    throw new Error(response.message || '加载失败')
                }
            } catch (error) {
                this.$message.error('加载历史记录失败')
                console.error('加载历史记录失败:', error)
            } finally {
                this.historyLoading = false
            }
        },

        // 添加到历史记录
        addToHistory() {
            this.historyList.unshift({
                id: Date.now(),
                prompt: this.formData.prompt,
                thumbnail: this.generatedImage,
                createTime: new Date().toLocaleString()
            })
        },

        // 查看历史记录
        viewHistory(item) {
            this.generatedImage = item.thumbnail
            this.formData.prompt = item.prompt
            this.historyVisible = false
        },

        // 下载历史记录
        downloadHistory(item) {
            const link = document.createElement('a')
            link.href = item.thumbnail
            link.download = `ai-generated-${item.id}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        },

        // 新增：加载AI图片历史列表
        async loadAiImageList(reset = false) {
            if (reset) {
                this.aiImageListPage = 1
                this.aiImageList = []
                this.hasMoreAiImage = true
            }
            if (!this.hasMoreAiImage) return
            this.aiImageListLoading = true
            try {
                const params = {
                    pageNo: this.aiImageListPage,
                    pageSize: this.aiImageListPageSize,
                    column: 'createTime',
                    order: 'desc'
                }
                if (this.aiImagePromptQuery && this.aiImagePromptQuery.trim()) {
                    const q = this.aiImagePromptQuery.trim();
                    params.prompt = `*${q}*`;
                }
                const res = await aiImageGenerationApi.getList(params)
                if (res && res.success && res.result) {
                    const records = res.result.records || []
                    this.aiImageList = this.aiImageList.concat(records)
                    this.aiImageListTotal = res.result.total
                    this.hasMoreAiImage = this.aiImageList.length < this.aiImageListTotal
                    this.aiImageListPage++
                } else {
                    this.hasMoreAiImage = false
                }
                // console.log(this.aiImageList, 'this.aiImageListthis.aiImageList')

            } catch (e) {
                this.hasMoreAiImage = false
            } finally {
                this.aiImageListLoading = false
            }
        },
        // 新增：滚动加载
        loadMoreAiImageList() {
            this.loadAiImageList()
        },
        // 新增：渲染AI图片项
        renderAiImageItem(item) {
            return (
                <a-list-item
                    class={{ 'ai-image-list-item': true, 'selected': this.selectedAiImage && this.selectedAiImage.id === item.id }}
                    onClick={() => this.selectAiImage(item)}
                >
                    <img
                        src={this.getApiImageUrl(item.binaryDataBase64 ? 'data:image/png;base64,' + item.binaryDataBase64 : item.imageInput)}
                        class="ai-image-thumb"
                        alt="图片"
                    />
                    <div class="ai-image-info">
                        <div class="ai-image-prompt">{item.prompt}</div>
                        <div class="ai-image-time">{item.createTime}</div>
                    </div>
                </a-list-item>
            )
        },
        // 新增：选择AI图片
        async selectAiImage(item) {
            this.selectedAiImage = null
            this.detailImages = []
            if (item && item.id) {
                // 查询主表详情，只用接口返回的数据，深拷贝，彻底分离
                try {
                    const mainRes = await aiImageGenerationApi.getList({ id: item.id })
                    if (mainRes && mainRes.success && mainRes.result && mainRes.result.records && mainRes.result.records.length > 0) {
                        this.selectedAiImage = JSON.parse(JSON.stringify(mainRes.result.records[0]))
                    } else {
                        // 查不到主表详情则不显示
                        return
                    }
                } catch (e) {
                    // 查不到主表详情则不显示
                    return
                }
                // 查询子表图片
                try {
                    const res = await aiImageGenerationApi.getDetails(item.id)
                    if (res && res.success && res.result) {
                        this.detailImages = res.result
                    }
                } catch (e) {
                    this.detailImages = []
                }
            }
        },
        downloadSelectedImage() {
            const item = this.selectedAiImage
            if (!item) return
            let url = this.getApiImageUrl(item.binaryDataBase64 ? 'data:image/png;base64,' + item.binaryDataBase64 : item.imageInput)
            let filename = item.id ? `ai-image-${item.id}.png` : 'ai-image.png'
            if (url.startsWith('data:image')) {
                // base64下载
                const a = document.createElement('a')
                a.href = url
                a.download = filename
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
            } else {
                // 普通图片下载
                const a = document.createElement('a')
                a.href = url
                a.download = filename
                a.target = '_blank'
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
            }
        },
        handlePortraitBeforeUpload(file) {
            this.portraitForm.fileList = [file];
            this.portraitForm.imageFile = file;
            const reader = new FileReader();
            reader.onload = e => {
                this.portraitForm.imageUrl = e.target.result;
                // 读取图片宽高
                const img = new window.Image();
                img.onload = () => {
                    this.portraitForm.width = img.width;
                    this.portraitForm.height = img.height;
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
            return false; // 阻止自动上传
        },
        async submitPortraitForm() {
            if (!this.portraitForm.imageFile) {
                this.$message.error('请上传图片');
                return;
            }
            this.portraitForm.loading = true;
            const formData = new FormData();
            formData.append('imageFile', this.portraitForm.imageFile);
            // 替换 prompt 内的双引号为单引号
            const prompt = this.portraitForm.prompt ? this.portraitForm.prompt.replace(/\"/g, "'") : '';
            formData.append('prompt', prompt);
            formData.append('width', this.portraitForm.width);
            formData.append('height', this.portraitForm.height);
            formData.append('gpen', this.portraitForm.gpen);
            formData.append('skin', this.portraitForm.skin);
            formData.append('skinUnifi', this.portraitForm.skinUnifi);
            formData.append('genMode', this.portraitForm.genMode);
            formData.append('seed', this.portraitForm.seed);
            formData.append('quantity', this.portraitForm.quantity);
            // 自动设置reqKey
            formData.append('reqKey', this.generateType === 'portrait' ? 'i2i_portrait_photo' : 'seededit_v3.0');
            try {
                const res = await this.$http.post('/AiImageGeneration/add', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (res && res.success) {
                    this.$message.success('提交成功！');
                    this.showGenerateModal = false;
                    this.loadAiImageList(true); // 提交成功后刷新历史列表
                } else {
                    this.$message.error(res.message || '提交失败');
                }
            } catch (e) {
                this.$message.error('提交失败');
            } finally {
                this.portraitForm.loading = false;
            }
        },
        handleSeedEditBeforeUpload(file) {
            this.seedEditForm.fileList = [file];
            this.seedEditForm.imageFile = file;
            const reader = new FileReader();
            reader.onload = e => {
                this.seedEditForm.imageUrl = e.target.result;
            };
            reader.readAsDataURL(file);
            return false;
        },
        async submitSeedEditForm() {
            if (!this.seedEditForm.imageFile) {
                this.$message.error('请上传图片');
                return;
            }
            this.seedEditForm.loading = true;
            const formData = new FormData();
            formData.append('imageFile', this.seedEditForm.imageFile);
            // 替换 prompt 内的双引号为单引号
            const prompt = this.seedEditForm.prompt ? this.seedEditForm.prompt.replace(/\"/g, "'") : '';
            formData.append('prompt', prompt);
            formData.append('seed', this.seedEditForm.seed);
            formData.append('scale', this.seedEditForm.scale);
            formData.append('quantity', this.seedEditForm.quantity);
            formData.append('reqKey', 'seededit_v3.0');
            try {
                const res = await this.$http.post('/AiImageGeneration/add', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (res && res.success) {
                    this.$message.success('提交成功！');
                    this.showGenerateModal = false;
                    this.loadAiImageList(true); // 提交成功后刷新历史列表
                } else {
                    this.$message.error(res.message || '提交失败');
                }
            } catch (e) {
                this.$message.error('提交失败');
            } finally {
                this.seedEditForm.loading = false;
            }
        },
        // 解析子表图片状态
        parseStateText(state) {
            if (state === 1 || state === '1') return '生成中';
            if (state === 2 || state === '2') return '生成失败';
            if (state === 3 || state === '3') return '生成成功';
            return state;
        },
        // 解析主表状态
        parseMainStateText(state) {
            if (state === 1 || state === '1') return '生成中';
            if (state === 2 || state === '2') return '生成失败';
            if (state === 3 || state === '3') return '生成成功';
            if (state === 4 || state === '4') return '部分生成成功';
            return state;
        },
        // 下载生成记录图片
        downloadSubImage(img) {
            let url = this.getApiImageUrl(img.binaryDataBase64 ? 'data:image/png;base64,' + img.binaryDataBase64 : (img.localImageUrl || img.imageUrl));
            let filename = img.id ? `ai-image-${img.id}.png` : 'ai-image.png';
            if (url.startsWith('data:image')) {
                // base64下载
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                // 普通图片下载，先fetch转blob再下载，避免新开窗口
                fetch(url, { mode: 'cors' })
                    .then(res => res.blob())
                    .then(blob => {
                        const blobUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(blobUrl);
                    });
            }
        },
        // 预览相关
        previewSubImage(img) {
            this.subImagePreviewUrl = this.getApiImageUrl(img.binaryDataBase64 ? 'data:image/png;base64,' + img.binaryDataBase64 : (img.localImageUrl || img.imageUrl));
            this.subImagePreviewVisible = true;
        },
        // 新增：判断字符串是否为JSON
        isJson(str) {
            // console.log(str, 'strstrstrstrstrstrstrstrstrstrstrstrstrstrstrstrstr')
            if (!str || typeof str !== 'string') return false;
            try {
                const obj = JSON.parse(str);
                return typeof obj === 'object' && obj !== null;
            } catch (e) {
                return false;
            }
        },
        parseSeedEditV3Result(str) {
            try {
                var obj = JSON.parse(str);
                return (obj && obj.params && obj.params.vlm_output) ? obj.params.vlm_output : '[无解析结果]';
            } catch (e) {
                return '[解析失败]';
            }
        },
        parseOri_prompt(str) {
            try {
                var obj = JSON.parse(str);
                return (obj && obj.params && obj.params.ori_prompt) ? obj.params.ori_prompt : '[无解析结果]';
            } catch (e) {
                return '[解析失败]';
            }
        },
        parseOri_vlm_input(str) {
            try {
                var obj = JSON.parse(str);
                return (obj && obj.params && obj.params.vlm_input) ? obj.params.vlm_input : '[无解析结果]';
            } catch (e) {
                return '[解析失败]';
            }
        },
    }
}
</script>

<style lang="less" scoped>
.ai-image-generator {
    min-height: 100vh;
    background: #f5f5f5;
    padding: 24px;

    .main-card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .page-header {
        margin-bottom: 32px;

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .title-section {
                .page-title {
                    font-size: 28px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin: 0 0 8px 0;
                    display: flex;
                    align-items: center;

                    .title-icon {
                        margin-right: 12px;
                        color: #1890ff;
                        font-size: 24px;
                    }
                }

                .page-subtitle {
                    color: #666;
                    margin: 0;
                    font-size: 16px;
                }
            }

            .header-actions {
                display: flex;
                align-items: center;
                gap: 16px;

                .quota-info {
                    .quota-text {
                        font-size: 14px;
                        color: #666;

                        .quota-number {
                            font-weight: 600;
                            color: #1890ff;
                        }
                    }
                }

                .ant-btn {
                    height: 40px;
                    padding: 0 20px;
                    border-radius: 8px;
                }
            }
        }
    }

    .main-content {
        height: 1000px;
        min-height: 1000px;
        max-height: 1000px;

        .history-list-col {
            border-right: 1px solid #f0f0f0;
            padding-right: 0;
            display: flex;
            flex-direction: column;
            height: 100%;

            .history-list-wrapper {
                flex: 1 1 0;
                min-height: 0;
                overflow-y: auto;
                background: #fafbfc;
                padding: 8px 0;
            }

            .ai-image-list {
                .ai-image-list-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 12px;
                    cursor: pointer;
                    border-radius: 6px;
                    margin-bottom: 4px;
                    transition: background 0.2s;

                    &.selected {
                        background: #e6f7ff;
                    }

                    &:hover {
                        background: #f0f5ff;
                    }

                    .ai-image-thumb {
                        width: 48px;
                        height: 48px;
                        object-fit: cover;
                        border-radius: 6px;
                        margin-right: 12px;
                        border: 1px solid #eee;
                    }

                    .ai-image-info {
                        flex: 1;

                        .ai-image-prompt {
                            font-size: 13px;
                            color: #333;
                            font-weight: 500;
                            margin-bottom: 2px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            max-width: 120px;
                        }

                        .ai-image-time {
                            font-size: 12px;
                            color: #999;
                        }
                    }
                }
            }

            .load-more {
                text-align: center;
                margin: 8px 0;
            }
        }

        .input-card,
        .result-card {
            height: 100%;
            max-height: 100%;
            display: flex;
            flex-direction: column;

            .ant-card-body {
                flex: 1 1 0;
                min-height: 0;
                overflow-y: auto;
            }

            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

            .ant-card-head {
                border-bottom: 1px solid #f0f0f0;
                padding: 0 24px;

                .ant-card-head-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1a1a1a;
                }
            }

            .ant-card-body {
                padding: 24px;
            }
        }

        .upload-section {
            margin-bottom: 32px;

            .upload-area {
                border: 2px dashed #d9d9d9;
                border-radius: 12px;
                padding: 48px 24px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;

                &:hover {
                    border-color: #1890ff;
                    background: #f6ffed;
                }

                .upload-content {
                    .upload-icon {
                        font-size: 48px;
                        color: #d9d9d9;
                        margin-bottom: 16px;
                    }

                    .upload-text {
                        font-size: 16px;
                        color: #1a1a1a;
                        margin: 0 0 8px 0;
                    }

                    .upload-hint {
                        font-size: 14px;
                        color: #999;
                        margin: 0;
                    }
                }
            }

            .image-preview {
                position: relative;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

                .preview-image {
                    width: 100%;
                    height: 300px;
                    object-fit: cover;
                }

                .image-actions {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    display: flex;
                    gap: 8px;

                    .ant-btn {
                        background: rgba(255, 255, 255, 0.9);
                        border: none;
                        border-radius: 6px;
                        height: 32px;
                        padding: 0 12px;

                        &:hover {
                            background: rgba(255, 255, 255, 1);
                        }
                    }
                }
            }
        }

        .params-section {
            margin-bottom: 32px;

            .section-title {
                font-size: 16px;
                font-weight: 600;
                color: #1a1a1a;
                margin: 0 0 20px 0;
            }

            .ant-form-item-label>label {
                font-weight: 500;
                color: #333;
            }

            .ant-slider {
                margin: 8px 0;
            }
        }

        .generate-section {
            text-align: center;

            .generate-btn {
                height: 48px;
                padding: 0 32px;
                font-size: 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);

                &:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
                }
            }
        }

        .result-content {
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;

            .empty-result {
                text-align: center;

                .empty-content {
                    .empty-icon {
                        font-size: 64px;
                        color: #d9d9d9;
                        margin-bottom: 16px;
                    }

                    .empty-text {
                        font-size: 18px;
                        color: #666;
                        margin: 0 0 8px 0;
                    }

                    .empty-hint {
                        font-size: 14px;
                        color: #999;
                        margin: 0;
                    }
                }
            }

            .generating-content {
                text-align: center;

                .loading-content {
                    .loading-text {
                        font-size: 16px;
                        color: #666;
                        margin: 16px 0 8px 0;
                    }

                    .progress-info {
                        .ant-typography {
                            color: #999;
                            font-size: 14px;
                        }
                    }
                }
            }

            .generated-content {
                width: 100%;

                .image-container {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    margin-bottom: 24px;
                    width: 100%;
                    background: #f8f8f8;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

                    .result-image-large {
                        width: 100%;
                        height: auto;
                        display: block;
                        object-fit: contain;
                        background: #fff;
                        border-radius: 0;
                        max-height: 800px;
                        margin: 0 auto;
                    }
                }

                .generation-info {
                    .ant-descriptions-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: #1a1a1a;
                        margin-bottom: 16px;
                    }
                }
            }
        }
    }

    .history-content {
        .history-thumbnail {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
        }
    }
}

.result-content-horizontal {
    display: flex;
    align-items: flex-start;
    gap: 32px;
    width: 100%;

    .detail-image-side {
        flex: none;
        width: 400px;
        min-width: 320px;
        max-width: 480px;
        background: #f8f8f8;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;

        .result-image-side {
            width: 100%;
            height: auto;
            display: block;
            object-fit: contain;
            background: #fff;
            border-radius: 0;
            max-height: 800px;
            margin: 0 auto;
        }
    }

    .detail-info-side {
        flex: 1;
        min-width: 0;

        .ant-descriptions {
            background: #fff;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        }
    }
}

@media (max-width: 900px) {
    .result-content-horizontal {
        flex-direction: column;

        .detail-image-side {
            width: 100%;
            max-width: 100%;
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .ai-image-generator {
        padding: 16px;

        .page-header {
            .header-content {
                flex-direction: column;
                align-items: flex-start;
                gap: 16px;

                .header-actions {
                    width: 100%;
                    text-align: center;
                }
            }
        }

        .main-content {
            .ant-col {
                margin-bottom: 24px;
            }
        }
    }
}

.sub-image-list-wrapper {
    margin-top: 32px;
    padding: 10px;
    overflow-y: auto;

    .sub-image-list-vertical {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;

        .sub-image-item-vertical {
            width: calc(25% - 18px);
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 20px 14px 14px 14px;
            transition: box-shadow 0.25s cubic-bezier(.4, 0, .2, 1); // 移除transform的transition
            will-change: box-shadow; // 只保留box-shadow
            border: 1px solid #f0f0f5;

            &:hover {
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.13), 0 1.5px 6px rgba(0, 0, 0, 0.08);
                // transform: translateY(-4px) scale(1.035); // 移除缩放和位移
                z-index: 2;
            }

            .sub-image-pic-vertical {
                width: 100%;
                height: 180px;
                object-fit: contain;
                border-radius: 10px;
                background: #f8f8fa;
                margin-bottom: 14px;
                box-shadow: 0 0 0 rgba(0, 0, 0, 0);
                transition: box-shadow 0.18s;
            }

            .sub-image-info-vertical {
                width: 100%;
                font-size: 13px;
                color: #222;

                .sub-info-row {
                    margin-bottom: 3px;
                    word-break: break-all;
                }

                b {
                    color: #888;
                    font-weight: 500;
                }
            }
        }
    }
}

@media (max-width: 1200px) {
    .sub-image-list-wrapper .sub-image-list-vertical .sub-image-item-vertical {
        width: calc(33.333% - 16px);
    }
}

@media (max-width: 900px) {
    .sub-image-list-wrapper .sub-image-list-vertical .sub-image-item-vertical {
        width: calc(50% - 12px);
    }
}

@media (max-width: 600px) {
    .sub-image-list-wrapper .sub-image-list-vertical .sub-image-item-vertical {
        width: 100%;
    }
}

// 生成记录下载按钮样式
.sub-image-download-btn {
    width: 100%;
    margin-top: 8px;
    background: #fff;
    color: #333;
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 6px 0;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}

.sub-image-download-btn:hover {
    background: #f5f5f5;
    color: #222;
}
</style>
