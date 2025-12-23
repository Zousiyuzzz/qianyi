<template>
    <div>
        <a-modal :title="'查看结果'" :width="1200" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk"
            @cancel="handleCancel" :okButtonProps="{ disabled: selectedRowKeys.length === 0 }" okText="采纳"
            cancelText="关闭">
            <!-- 查询区域 -->
            <div class="table-page-search-wrapper" style="margin-bottom: 16px;">
                <a-form layout="inline" @keyup.enter.native="searchQuery">
                    <a-row :gutter="24">
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="视频标题">
                                <a-input placeholder="请输入视频标题" v-model="queryParam.title"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="策略名称">
                                <a-input placeholder="请输入策略名称"
                                    v-model="queryParam.strategyDetailStrategyName"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="采纳状态">
                                <a-select v-model="queryParam.statusCode" placeholder="请选择采纳状态" allowClear>
                                    <a-select-option value="true">已采纳</a-select-option>
                                    <a-select-option value="false">未采纳</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                                <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                                <a-button type="primary" @click="searchReset" icon="reload"
                                    style="margin-left: 8px">重置</a-button>
                            </span>
                        </a-col>
                    </a-row>
                </a-form>
            </div>

            <!-- 已选择提示 -->
            <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;" v-if="selectedRowKeys.length > 0">
                <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
                    selectedRowKeys.length }}</a> 个视频
                <a style="margin-left: 24px" @click="onClearSelected">清空</a>
            </div> -->

            <!-- 宫格展示区域 -->
            <div class="video-grid">
                <div v-for="item in dataSource" :key="item.id" class="video-card"
                    :class="{ 'selected': selectedRowKeys.includes(item.id) }" @click="toggleSelect(item.id)">
                    <div class="video-cover" @click="handleCoverClick(item, $event)">
                        <!-- 如果有coverUrl，使用img标签 -->
                        <img v-if="item.coverUrl" :src="fixUrlProtocol(item.coverUrl)" :alt="item.title"
                            @error="handleImageError" @load="handleImageLoad" />
                        <!-- 如果没有coverUrl但有视频URL，使用video标签显示首帧 -->
                        <video v-else-if="item.preVideoUrl || item.videoUrl"
                            :src="fixUrlProtocol(item.preVideoUrl || item.videoUrl)" preload="metadata" muted
                            @error="handleVideoError" @loadedmetadata="handleVideoMetadataLoaded">
                        </video>
                        <!-- 都没有则显示无封面 -->
                        <div v-else class="no-cover">无封面</div>
                        <div class="no-cover" style="display: none;">封面加载失败</div>
                        <div class="video-duration" v-if="item.duration">{{ formatDuration(item.duration) }}</div>
                        <div class="select-checkbox">
                            <a-checkbox :checked="selectedRowKeys.includes(item.id)"
                                :disabled="item.statusCode === 'true'" @click.stop="toggleSelect(item.id)"></a-checkbox>
                        </div>
                    </div>
                    <div class="video-info">
                        <div class="video-title" :title="item.title">{{ item.title || '无标题' }}</div>
                        <div class="video-meta">
                            <div class="meta-item">
                                <span class="label">策略:</span>
                                <span class="value">{{ getStrategyName(item.strategyDetailStrategy) || '-' }}</span>
                            </div>
                            <div class="meta-item">
                                <span class="label">状态:</span>
                                <span class="value" :class="item.statusCode === 'true' ? 'adopted' : 'not-adopted'">
                                    {{ item.statusCode === 'true' ? '已采纳' : '未采纳' }}
                                </span>
                            </div>
                            <div class="meta-item" v-if="getExpireTime(item)">
                                <span class="label">失效时间:</span>
                                <span class="value" :class="isExpired(item) ? 'expired' : 'valid'">
                                    {{ getExpireTime(item) }}
                                </span>
                            </div>
                            <div class="meta-item">
                                <span class="label">素材ID:</span>
                                <span class="value">{{ item.materialId || '-' }}</span>
                            </div>
                            <div class="meta-item strategy-desc"
                                v-if="getStrategyDescription(item.strategyDetailStrategy)">
                                <span class="label">策略说明:</span>
                                <span class="value">{{ getStrategyDescription(item.strategyDetailStrategy) }}</span>
                            </div>
                            <div class="meta-item" v-if="getApplyTimes(item).length > 0">
                                <span class="label">修改时间段:</span>
                                <span class="value">
                                    <span v-for="(timeRange, index) in getApplyTimes(item)" :key="index">
                                        {{ getTimeRangeText(timeRange) }}<span
                                            v-if="index < getApplyTimes(item).length - 1">, </span>
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div class="video-actions">
                            <a-button size="small" @click.stop="previewVideo(item)"
                                v-if="item.preVideoUrl || item.videoUrl">预览</a-button>
                            <a-button size="small" @click.stop="downloadVideo(item)" v-if="item.videoUrl">下载</a-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper" v-if="total > 0">
                <a-pagination :current="ipagination.current" :pageSize="ipagination.pageSize" :total="total"
                    :showSizeChanger="true" :showQuickJumper="true" :showTotal="(total, range) => `共 ${total} 条记录`"
                    @change="handleTableChange" @showSizeChange="handleTableChange" />
            </div>
        </a-modal>

        <!-- 视频预览弹窗 -->
        <a-modal :title="'视频预览'" :width="900" :visible="previewVisible" @cancel="handlePreviewCancel" :footer="null">
            <div class="video-preview-container">
                <div class="video-wrapper">
                    <!-- 直接使用video标签播放 -->
                    <video v-if="previewVideoUrl" ref="previewVideo" :src="previewVideoUrl" preload="none"
                        class="preview-video" @loadedmetadata="handleVideoLoaded" @timeupdate="updateProgress"
                        @ended="onVideoEnded" @click="togglePlay" @error="handleVideoError" @canplay="handleCanPlay"
                        @waiting="handleWaiting" @stalled="handleStalled">
                        您的浏览器不支持视频播放
                    </video>

                    <!-- 播放/暂停按钮覆盖层 -->
                    <div class="video-play-overlay" v-if="previewVideoUrl" @click="togglePlay">
                        <div class="play-button" v-if="!isPlaying">
                            <i class="anticon anticon-play-circle"></i>
                        </div>
                        <div class="pause-button" v-if="isPlaying">
                            <i class="anticon anticon-pause-circle"></i>
                        </div>
                    </div>

                    <!-- 加载失败提示 -->
                    <div class="video-fallback" v-if="videoLoadFailed"
                        style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 8px;">
                        <p>视频加载失败（可能是访问限制或格式问题）</p>
                        <a-button type="primary" @click="openVideoInNewWindow">在新窗口打开视频</a-button>
                    </div>

                    <!-- 自定义视频控制条 -->
                    <div class="custom-video-controls" v-if="previewVideoItem && !videoLoadFailed">
                        <div class="controls-row">
                            <!-- 时间显示 -->
                            <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>

                            <!-- 进度条容器 -->
                            <div class="progress-container">
                                <div class="progress-bar" @click="seekTo" ref="progressBar">
                                    <!-- 视频总进度条背景 -->
                                    <div class="progress-bg"></div>
                                    <!-- 当前播放进度 -->
                                    <div class="progress-current" :style="{ width: progressPercent + '%' }"></div>
                                    <!-- 修改时间段标记 -->
                                    <div v-for="(timeRange, index) in getApplyTimes(previewVideoItem)" :key="index"
                                        class="progress-modification"
                                        :style="getModificationStyle(timeRange, previewVideoItem)"
                                        :title="getTimeRangeTooltip(timeRange)"></div>
                                    <!-- 进度条拖拽点 -->
                                    <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
    name: 'DouyinFissionTaskResultModal',
    data() {
        return {
            visible: false,
            confirmLoading: false,
            dataSource: [],
            selectedRowKeys: [],
            total: 0,
            previewVisible: false,
            previewVideoUrl: '',
            previewVideoItem: null,
            isPlaying: false,
            isMuted: true,
            currentTime: 0,
            duration: 0,
            showClickHint: true,
            videoLoadFailed: false,
            useIframe: true,  // 默认使用iframe
            queryParam: {
                title: '',
                strategyDetailStrategyName: '',
                statusCode: ''
            },
            ipagination: {
                current: 1,
                pageSize: 12
            },
            url: {
                list: '/douyinFissionTaskDetail/listNotPage',
                adopt: '/douyinFissionTaskDetail/adoptVideo'
            },
            strategyMap: {
                'CLIP_REPLACE': '分镜替换',
                'ROBOT_REPLACE': '人物替换',
                'HOT_PRE_VIDEO': '爆款开头',
                'MIX_CUT': '重新混剪',
                'PRE_VIDEO_CLIP_REPLACE': '前贴扩写',
                'RAW_MATERIAL_REPLACE': '原料分镜替换',
                'DERIVE_FROM_CHOSEN_HOT_MID': '自有爆款套路',
                'DERIVE_FROM_INDUSTRY_HOT_PATTERN': '行业爆款套路',
                'AIGC_PRE_VIDEO': 'AIGC前贴新增',
                'AIGC_HUMAN_REPLACE': 'AIGC人物替换',
                'SMART_REPLACE': '智能裂变'
            }
        }
    },
    computed: {
        progressPercent() {
            if (this.duration === 0) return 0
            return (this.currentTime / this.duration) * 100
        }
    },
    methods: {
        show(taskId) {
            this.visible = true
            this.queryParam.taskId = taskId
            this.loadData()
        },
        handleCancel() {
            this.visible = false
            this.selectedRowKeys = []
            this.dataSource = []
            this.queryParam = {
                title: '',
                strategyDetailStrategyName: '',
                statusCode: '',
                taskId: ''
            }
        },
        handleOk() {
            if (this.selectedRowKeys.length === 0) {
                this.$message.warning('请选择要采纳的视频')
                return
            }
            this.adoptVideos()
        },
        loadData() {
            const params = {
                ...this.queryParam,
                pageNo: this.ipagination.current,
                pageSize: this.ipagination.pageSize
            }
            httpAction(this.url.list, params, 'GET').then((res) => {
                if (res.success) {
                    this.dataSource = res.result.records || res.result || []
                    this.total = res.result.total || 0
                } else {
                    this.$message.warning(res.message)
                }
            }).catch((error) => {
                this.$message.error('加载数据失败')
                console.error('加载数据失败:', error)
            })
        },
        searchQuery() {
            this.ipagination.current = 1
            this.loadData()
        },
        searchReset() {
            this.queryParam = {
                title: '',
                strategyDetailStrategyName: '',
                statusCode: '',
                taskId: this.queryParam.taskId
            }
            this.ipagination.current = 1
            this.loadData()
        },
        handleTableChange(pagination) {
            this.ipagination.current = pagination.current
            this.ipagination.pageSize = pagination.pageSize
            this.loadData()
        },
        toggleSelect(id) {
            // 检查是否已采纳
            const item = this.dataSource.find(item => item.id === id)
            if (item && item.statusCode === 'true') {
                this.$message.warning('已采纳的数据不能重复选择')
                return
            }

            const index = this.selectedRowKeys.indexOf(id)
            if (index > -1) {
                this.selectedRowKeys.splice(index, 1)
            } else {
                this.selectedRowKeys.push(id)
            }
        },
        onClearSelected() {
            this.selectedRowKeys = []
        },
        adoptVideos() {
            // 检查选中的数据是否包含已采纳的数据
            const adoptedItems = this.selectedRowKeys.filter(id => {
                const item = this.dataSource.find(item => item.id === id)
                return item && item.statusCode === 'true'
            })

            if (adoptedItems.length > 0) {
                this.$message.warning('选中的数据中包含已采纳的数据，请重新选择')
                return
            }

            if (this.selectedRowKeys.length === 0) {
                this.$message.warning('请选择要采纳的数据')
                return
            }

            this.confirmLoading = true
            let formData = new FormData()
            formData.append('ids', this.selectedRowKeys)
            httpAction(this.url.adopt, formData, 'POST').then((res) => {
                if (res.success) {
                    this.$message.success('采纳成功')
                    this.selectedRowKeys = []
                    this.loadData()
                } else {
                    this.$message.warning(res.message)
                }
            }).catch((error) => {
                this.$message.error('采纳失败')
                console.error('采纳失败:', error)
            }).finally(() => {
                this.confirmLoading = false
            })
        },
        async previewVideo(item) {
            const videoUrl = item.preVideoUrl || item.videoUrl;
            if (videoUrl) {
                console.log('准备预览视频:', videoUrl);

                this.previewVideoUrl = this.fixUrlProtocol(videoUrl);
                this.previewVideoItem = item;
                this.previewVisible = true;
                this.showClickHint = true;
                this.videoLoadFailed = false;
                this.duration = item.duration || 60;

                // 1.5秒后隐藏提示
                setTimeout(() => {
                    this.showClickHint = false;
                }, 1500);

                // 等待DOM更新后加载视频
                this.$nextTick(() => {
                    if (this.$refs.previewVideo) {
                        this.$refs.previewVideo.load();
                    }
                });
            }
        },
        handleCoverClick(item, event) {
            // 阻止事件冒泡，避免触发卡片的toggleSelect
            event.stopPropagation()

            // 如果有视频URL，打开预览
            const videoUrl = item.videoUrl
            if (videoUrl) {
                this.previewVideo(item)
            } else {
                this.$message.info('该视频暂无预览')
            }
        },
        handlePreviewCancel() {
            this.previewVisible = false
            this.previewVideoUrl = ''
            this.previewVideoItem = null
            this.showClickHint = true
            this.videoLoadFailed = false
            // 停止视频播放
            if (this.$refs.previewVideo) {
                this.$refs.previewVideo.pause()
                this.$refs.previewVideo.currentTime = 0
            }
        },
        openVideoInNewWindow() {
            if (this.previewVideoUrl) {
                window.open(this.previewVideoUrl, '_blank')
            }
        },
        handleIframeLoaded() {
            console.log('iframe加载成功');
            this.videoLoadFailed = false;

            const iframe = this.$el.querySelector('.preview-iframe');
            if (iframe) {
                const aspectRatio = 16 / 9;
                const maxWidth = 800;
                const maxHeight = 600;
                let width = maxWidth;
                let height = width / aspectRatio;
                if (height > maxHeight) {
                    height = maxHeight;
                    width = height * aspectRatio;
                }
                iframe.style.width = `${width}px`;
                iframe.style.height = `${height}px`;
            }
        },
        handleIframeError(error) {
            console.error('iframe加载失败:', error);
            this.useIframe = false;  // 切换到video fallback
            this.videoLoadFailed = false;  // 重置失败状态，让video标签尝试
            this.$message.warning('iframe加载失败，尝试使用video标签播放');
        },
        handleVideoLoaded() {
            // 视频元数据加载完成后，调整弹窗大小以适应视频比例
            if (this.$refs.previewVideo) {
                const video = this.$refs.previewVideo
                const aspectRatio = video.videoWidth / video.videoHeight

                // 设置最大宽度和高度
                const maxWidth = 600
                const maxHeight = 800

                let width, height

                // 根据视频是横屏还是竖屏来决定缩放方式
                if (aspectRatio > 1) {
                    // 横屏视频，按宽度缩放
                    width = maxWidth
                    height = width / aspectRatio
                    if (height > maxHeight) {
                        height = maxHeight
                        width = height * aspectRatio
                    }
                } else {
                    // 竖屏视频，按高度缩放
                    height = maxHeight
                    width = height * aspectRatio
                    if (width > maxWidth) {
                        width = maxWidth
                        height = width / aspectRatio
                    }
                }

                // 设置视频尺寸
                video.style.width = width + 'px'
                video.style.height = height + 'px'
                video.style.maxWidth = '100%'
                video.style.maxHeight = '80vh'

                // 设置视频时长和初始状态
                this.duration = video.duration
                this.isPlaying = false  // 初始状态为暂停

                // console.log('视频尺寸调整:', {
                //     width,
                //     height,
                //     aspectRatio,
                //     videoWidth: video.videoWidth,
                //     videoHeight: video.videoHeight,
                //     duration: video.duration
                // })
            }
        },
        // 视频控制方法
        togglePlay() {
            if (this.$refs.previewVideo) {
                const video = this.$refs.previewVideo
                const wrapper = this.$el.querySelector('.video-wrapper')

                if (video.paused) {
                    // 使用Promise处理播放，避免AbortError
                    video.play().then(() => {
                        this.isPlaying = true
                        if (wrapper) {
                            wrapper.classList.add('playing')
                        }
                    }).catch(error => {
                        console.log('播放失败:', error)
                        this.isPlaying = false
                        if (wrapper) {
                            wrapper.classList.remove('playing')
                        }
                    })
                } else {
                    video.pause()
                    this.isPlaying = false
                    if (wrapper) {
                        wrapper.classList.remove('playing')
                    }
                }
            }
        },
        updateProgress() {
            if (this.$refs.previewVideo) {
                this.currentTime = this.$refs.previewVideo.currentTime

                // 检查是否在2秒左右卡住
                if (Math.abs(this.currentTime - 2) < 0.1) {
                    console.log('检测到2秒位置，当前时间:', this.currentTime)
                }
            }
        },
        onVideoEnded() {
            this.isPlaying = false
            this.currentTime = 0
            const wrapper = this.$el.querySelector('.video-wrapper')
            if (wrapper) {
                wrapper.classList.remove('playing')
            }
        },
        seekTo(event) {
            if (this.$refs.previewVideo && this.$refs.progressBar) {
                const rect = this.$refs.progressBar.getBoundingClientRect()
                const clickX = event.clientX - rect.left
                const percentage = clickX / rect.width
                const newTime = percentage * this.duration
                this.$refs.previewVideo.currentTime = newTime
                this.currentTime = newTime
            }
        },
        formatTime(seconds) {
            if (!seconds || isNaN(seconds)) return '0:00'
            const mins = Math.floor(seconds / 60)
            const secs = Math.floor(seconds % 60)
            return `${mins}:${secs.toString().padStart(2, '0')}`
        },
        downloadVideo(item) {
            const videoUrl = item.videoUrl || item.preVideoUrl
            if (videoUrl) {
                // 创建一个临时的 a 标签来触发下载
                const link = document.createElement('a')
                link.href = videoUrl
                link.download = item.title ? `${item.title}.mp4` : 'video.mp4'
                link.target = '_blank'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            } else {
                this.$message.warning('没有可下载的视频文件')
            }
        },
        formatDuration(seconds) {
            if (!seconds) return ''
            const mins = Math.floor(seconds / 60)
            const secs = seconds % 60
            return `${mins}:${secs.toString().padStart(2, '0')}`
        },
        handleImageError(e) {
            console.error('图片加载失败:', {
                src: e.target.src,
                error: e,
                userAgent: navigator.userAgent,
                protocol: window.location.protocol
            })
            e.target.style.display = 'none'
            e.target.nextElementSibling.style.display = 'block'
            this.$message.error(`图片加载失败: ${e.target.src}`)
        },
        handleImageLoad(e) {
            console.log('图片加载成功:', e.target.src)
        },
        handleVideoError(e) {
            const errorInfo = {
                src: e.target.src,
                error: e,
                userAgent: navigator.userAgent,
                protocol: window.location.protocol,
                networkState: e.target.networkState,
                readyState: e.target.readyState,
                errorCode: e.target.error ? e.target.error.code : 'unknown',
                errorMessage: e.target.error ? e.target.error.message : 'unknown',
                hostname: window.location.hostname
            }
            console.error('视频加载失败详情:', errorInfo)

            // 判断是否为跨域问题
            let errorMsg = '视频加载失败'
            if (e.target.error) {
                switch (e.target.error.code) {
                    case 1:
                        errorMsg = '视频加载被中止'
                        break
                    case 2:
                        errorMsg = '网络错误导致视频下载失败'
                        break
                    case 3:
                        errorMsg = '视频解码错误'
                        break
                    case 4:
                        errorMsg = '视频格式不支持或文件损坏'
                        break
                    default:
                        errorMsg = `视频加载失败 (错误代码: ${e.target.error.code})`
                }
            }

            // 检查是否为跨域问题
            if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                errorMsg += ' (可能是跨域访问问题)'
            }

            e.target.style.display = 'none'
            e.target.nextElementSibling.style.display = 'block'
            this.$message.error(errorMsg)
            this.videoLoadFailed = true;
        },
        handleVideoMetadataLoaded(e) {
            console.log('视频元数据加载成功:', e.target.src)
            // 视频元数据加载完成后，设置当前时间为0.1秒以显示首帧
            e.target.currentTime = 0.1
        },
        handleCanPlay() {
            console.log('视频可以播放')
        },
        handleWaiting() {
            console.log('视频缓冲中...')
        },
        handleStalled() {
            console.log('视频加载停滞，可能是网络问题或URL访问限制')
            // 如果停滞超过5秒，提示用户
            setTimeout(() => {
                if (this.$refs.previewVideo && this.$refs.previewVideo.readyState < 3) {
                    this.$message.warning('视频加载停滞，建议点击"在新窗口打开视频"查看')
                }
            }, 5000)
        },
        // 修复URL协议问题
        fixUrlProtocol(url) {
            if (!url) return url

            // 如果当前页面是HTTPS，但URL是HTTP，则转换为HTTPS
            if (window.location.protocol === 'https:' && url.startsWith('http:')) {
                return url.replace('http:', 'https:')
            }

            // 如果是相对路径，添加当前域名
            if (url.startsWith('/')) {
                return window.location.origin + url
            }

            return url
        },
        // 检测是否为跨域访问
        isCrossOriginAccess() {
            const hostname = window.location.hostname
            return hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('192.168.')
        },
        // 使用iframe代理加载视频
        createVideoProxy(url) {
            return new Promise((resolve, reject) => {
                const iframe = document.createElement('iframe')
                iframe.style.display = 'none'
                iframe.src = url
                iframe.onload = () => {
                    console.log('iframe代理加载成功')
                    resolve(iframe)
                }
                iframe.onerror = () => {
                    console.log('iframe代理加载失败')
                    reject(new Error('iframe代理加载失败'))
                }
                document.body.appendChild(iframe)

                // 5秒后清理
                setTimeout(() => {
                    if (iframe.parentNode) {
                        document.body.removeChild(iframe)
                    }
                }, 5000)
            })
        },
        // 使用fetch获取视频数据
        async fetchVideoAsBlob(url) {
            try {
                console.log('尝试使用fetch获取视频数据:', url)
                const response = await fetch(url, {
                    mode: 'cors',
                    credentials: 'omit'
                })

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }

                const blob = await response.blob()
                const blobUrl = URL.createObjectURL(blob)
                console.log('成功获取视频blob:', blobUrl)
                return blobUrl
            } catch (error) {
                console.error('fetch获取视频失败:', error)
                throw error
            }
        },
        // 使用XMLHttpRequest获取视频
        async xhrVideoAsBlob(url) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open('GET', url, true)
                xhr.responseType = 'blob'
                xhr.withCredentials = false

                xhr.onload = function () {
                    if (xhr.status === 200) {
                        const blob = xhr.response
                        const blobUrl = URL.createObjectURL(blob)
                        console.log('XHR成功获取视频blob:', blobUrl)
                        resolve(blobUrl)
                    } else {
                        reject(new Error(`XHR失败: ${xhr.status}`))
                    }
                }

                xhr.onerror = function () {
                    reject(new Error('XHR网络错误'))
                }

                xhr.send()
            })
        },
        // 多种方法尝试加载视频
        async loadVideoWithMultipleMethods(videoElement, url) {
            const methods = [
                // 方法1: 直接加载
                async () => {
                    videoElement.crossOrigin = 'anonymous'
                    videoElement.src = url
                    videoElement.load()
                    return new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => reject(new Error('直接加载超时')), 3000)
                        videoElement.addEventListener('loadedmetadata', () => {
                            clearTimeout(timeout)
                            resolve(true)
                        }, { once: true })
                        videoElement.addEventListener('error', () => {
                            clearTimeout(timeout)
                            reject(new Error('直接加载失败'))
                        }, { once: true })
                    })
                },
                // 方法2: 使用fetch获取blob
                async () => {
                    const blobUrl = await this.fetchVideoAsBlob(url)
                    videoElement.src = blobUrl
                    videoElement.load()
                    return new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            URL.revokeObjectURL(blobUrl)
                            reject(new Error('blob加载超时'))
                        }, 3000)
                        videoElement.addEventListener('loadedmetadata', () => {
                            clearTimeout(timeout)
                            resolve(true)
                        }, { once: true })
                        videoElement.addEventListener('error', () => {
                            clearTimeout(timeout)
                            URL.revokeObjectURL(blobUrl)
                            reject(new Error('blob加载失败'))
                        }, { once: true })
                    })
                },
                // 方法3: 使用XHR获取blob
                async () => {
                    const blobUrl = await this.xhrVideoAsBlob(url)
                    videoElement.src = blobUrl
                    videoElement.load()
                    return new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            URL.revokeObjectURL(blobUrl)
                            reject(new Error('XHR blob加载超时'))
                        }, 3000)
                        videoElement.addEventListener('loadedmetadata', () => {
                            clearTimeout(timeout)
                            resolve(true)
                        }, { once: true })
                        videoElement.addEventListener('error', () => {
                            clearTimeout(timeout)
                            URL.revokeObjectURL(blobUrl)
                            reject(new Error('XHR blob加载失败'))
                        }, { once: true })
                    })
                }
            ]

            for (let i = 0; i < methods.length; i++) {
                try {
                    console.log(`尝试方法 ${i + 1}:`, methods[i].name)
                    await methods[i]()
                    console.log(`方法 ${i + 1} 成功`)
                    return true
                } catch (error) {
                    console.log(`方法 ${i + 1} 失败:`, error.message)
                    if (i === methods.length - 1) {
                        throw new Error('所有方法都失败了')
                    }
                }
            }
        },
        getVideoCover(item) {
            // 优先使用coverUrl
            if (item.coverUrl) {
                console.log('使用coverUrl:', item.coverUrl)
                return item.coverUrl
            }
            // 如果有preVideoUrl，直接使用（浏览器会自动显示首帧）
            if (item.preVideoUrl) {
                console.log('使用preVideoUrl:', item.preVideoUrl)
                return item.preVideoUrl
            }
            // 最后使用videoUrl
            if (item.videoUrl) {
                console.log('使用videoUrl:', item.videoUrl)
                return item.videoUrl
            }
            console.log('没有可用的封面URL:', item)
            return null
        },
        // 解析applyTimes字段
        parseApplyTimes(applyTimes) {
            if (!applyTimes) return null
            try {
                const times = JSON.parse(applyTimes)
                if (Array.isArray(times) && times.length > 0) {
                    return times[0] // 取第一个时间段
                }
            } catch (error) {
                console.error('解析applyTimes失败:', error)
            }
            return null
        },
        // 获取所有修改时间段
        getApplyTimes(item) {
            if (!item.applyTimes) return []
            try {
                const times = JSON.parse(item.applyTimes)
                if (Array.isArray(times)) {
                    return times
                }
            } catch (error) {
                console.error('解析applyTimes失败:', error)
            }
            return []
        },
        // 获取修改时间段样式
        getModificationStyle(timeRange, item) {
            // 使用this.duration（从视频元素获取的真实时长）而不是item.duration
            const totalSeconds = this.duration || item.duration || 60

            if (!totalSeconds) {
                console.log('没有duration数据:', { item, thisDuration: this.duration })
                return {}
            }

            // 将毫秒转换为秒
            const startSeconds = timeRange.start_time / 1000
            const endSeconds = timeRange.end_time / 1000

            // 计算在时间轴上的位置和宽度（百分比）
            const leftPercent = Math.min((startSeconds / totalSeconds) * 100, 100)
            const widthPercent = Math.min(((endSeconds - startSeconds) / totalSeconds) * 100, 100 - leftPercent)

            console.log('修改时间段样式:', {
                startSeconds,
                endSeconds,
                totalSeconds,
                leftPercent,
                widthPercent
            })

            return {
                left: leftPercent + '%',
                width: widthPercent + '%'
            }
        },
        // 获取时间范围提示
        getTimeRangeTooltip(timeRange) {
            const startMinutes = Math.floor(timeRange.start_time / 60000)
            const startSeconds = Math.floor((timeRange.start_time % 60000) / 1000)
            const endMinutes = Math.floor(timeRange.end_time / 60000)
            const endSeconds = Math.floor((timeRange.end_time % 60000) / 1000)

            return `${startMinutes}:${startSeconds.toString().padStart(2, '0')} - ${endMinutes}:${endSeconds.toString().padStart(2, '0')}`
        },
        // 获取时间范围文本
        getTimeRangeText(timeRange) {
            const startMinutes = Math.floor(timeRange.start_time / 60000)
            const startSeconds = Math.floor((timeRange.start_time % 60000) / 1000)
            const endMinutes = Math.floor(timeRange.end_time / 60000)
            const endSeconds = Math.floor((timeRange.end_time % 60000) / 1000)

            return `${startMinutes}:${startSeconds.toString().padStart(2, '0')}-${endMinutes}:${endSeconds.toString().padStart(2, '0')}`
        },
        // 获取总修改时长
        getTotalModificationDuration(item) {
            const times = this.getApplyTimes(item)
            if (times.length === 0) return 0

            // 计算所有时间段的总时长（毫秒）
            const totalMs = times.reduce((sum, timeRange) => {
                return sum + (timeRange.end_time - timeRange.start_time)
            }, 0)

            // 转换为秒
            return Math.floor(totalMs / 1000)
        },
        // 计算失效时间
        getExpireTime(item) {
            if (!item.createTime) return null

            // 使用createTime计算失效时间，加上24小时
            const createTime = new Date(item.createTime)
            const expireTime = new Date(createTime.getTime() + 24 * 60 * 60 * 1000) // 加24小时

            return this.formatDateTime(expireTime)
        },
        // 检查是否已失效
        isExpired(item) {
            if (!item.createTime) return false

            const createTime = new Date(item.createTime)
            const expireTime = new Date(createTime.getTime() + 24 * 60 * 60 * 1000)
            const now = new Date()

            return now > expireTime
        },
        // 格式化日期时间
        formatDateTime(date) {
            if (!date) return ''
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            const seconds = String(date.getSeconds()).padStart(2, '0')

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        },
        getStrategyName(strategy) {
            if (!strategy) return ''
            // 如果strategy是字符串，直接返回映射
            if (typeof strategy === 'string') {
                return this.strategyMap[strategy] || strategy
            }
            // 如果strategy是数组，返回第一个策略的名称
            if (Array.isArray(strategy) && strategy.length > 0) {
                return this.strategyMap[strategy[0]] || strategy[0]
            }
            return strategy
        },
        getStrategyDescription(strategy) {
            if (!strategy) return ''

            let strategies = []
            if (typeof strategy === 'string') {
                strategies = [strategy]
            } else if (Array.isArray(strategy)) {
                strategies = strategy
            }

            if (strategies.length === 0) return ''

            // 如果只有一个策略，返回详细描述
            if (strategies.length === 1) {
                const strategyName = this.strategyMap[strategies[0]]
                if (strategyName) {
                    return this.getDetailedDescription(strategies[0])
                }
            }

            // 多个策略时，返回策略列表
            return strategies.map(s => this.strategyMap[s] || s).join('、')
        },
        getDetailedDescription(strategy) {
            const descriptions = {
                'CLIP_REPLACE': '通过AI技术替换视频中的分镜内容，保持原有节奏和风格',
                'ROBOT_REPLACE': '使用AI生成的人物替换原视频中的人物角色',
                'HOT_PRE_VIDEO': '采用爆款视频的开头部分，提高用户留存率',
                'MIX_CUT': '重新剪辑和混剪视频内容，创造新的视觉效果',
                'PRE_VIDEO_CLIP_REPLACE': '替换视频前贴片内容，优化开头吸引力',
                'RAW_MATERIAL_REPLACE': '替换原始素材中的分镜内容',
                'DERIVE_FROM_CHOSEN_HOT_MID': '基于自有爆款套路生成内容（仅千川账户支持）',
                'DERIVE_FROM_INDUSTRY_HOT_PATTERN': '基于行业爆款套路生成内容（仅千川账户支持）',
                'AIGC_PRE_VIDEO': '使用AIGC技术生成前贴视频内容',
                'AIGC_HUMAN_REPLACE': '使用AIGC技术替换视频中的人物',
                'SMART_REPLACE': '智能分析并替换视频中的关键元素'
            }
            return descriptions[strategy] || ''
        }
    }
}
</script>

<style scoped>
/* 整体容器样式 */
.video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    max-height: 600px;
    overflow-y: auto;
    padding: 8px;
    border-radius: 12px;
    margin: 16px 0;
}

/* 视频卡片样式 */
.video-card {
    border: 2px solid transparent;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background: #fff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    position: relative;
    backdrop-filter: blur(10px);
}

.video-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(135, 208, 104, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
}

.video-card:hover {
    border-color: #1890ff;
    box-shadow: 0 8px 32px rgba(24, 144, 255, 0.2);
    /* transform: translateY(-4px); */
}

.video-card:hover::before {
    opacity: 1;
}

.video-card.selected {
    border-color: #1890ff;
    box-shadow: 0 8px 32px rgba(24, 144, 255, 0.3);
    transform: translateY(-2px);
}

.video-card.selected::before {
    opacity: 1;
}

/* 视频封面样式 */
.video-cover {
    position: relative;
    width: 100%;
    height: 220px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    z-index: 2;
}

.video-cover img,
.video-cover video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.video-card:hover .video-cover img,
.video-card:hover .video-cover video {
    transform: scale(1.05);
}

.video-cover video {
    pointer-events: none;
}

.no-cover {
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    font-weight: 500;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 视频时长标签 */
.video-duration {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
    color: white;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 选择复选框 */
.select-checkbox {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 3;
}

.select-checkbox .ant-checkbox-wrapper {
    background: transparent;
    padding: 4px;
    backdrop-filter: blur(10px);
}

.select-checkbox .ant-checkbox {
    background: transparent;
}

.select-checkbox .ant-checkbox-inner {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.8);
}

.select-checkbox .ant-checkbox-disabled .ant-checkbox-inner {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
}

.select-checkbox .ant-checkbox-disabled .ant-checkbox-inner::after {
    border-color: rgba(255, 255, 255, 0.3);
}

/* 视频信息区域 */
.video-info {
    padding: 16px;
    background: #fff;
    position: relative;
    z-index: 2;
}

.video-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #1a1a1a;
    line-height: 1.4;
}

.video-meta {
    margin-bottom: 12px;
}

.meta-item {
    display: flex;
    margin-bottom: 6px;
    font-size: 13px;
    align-items: flex-start;
    padding: 4px 0;
}

.meta-item .label {
    color: #666;
    min-width: 60px;
    font-weight: 500;
    flex-shrink: 0;
}

.meta-item .value {
    color: #333;
    flex: 1;
    line-height: 1.4;
}

.meta-item .value.adopted {
    color: #52c41a;
    font-weight: 600;
    background: rgba(82, 196, 26, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
}

.meta-item .value.not-adopted {
    color: #ff4d4f;
    font-weight: 600;
    background: rgba(255, 77, 79, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
}

.meta-item .value.expired {
    color: #ff4d4f;
    font-weight: 600;
    background: rgba(255, 77, 79, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
}

.meta-item .value.valid {
    color: #52c41a;
    font-weight: 600;
    background: rgba(82, 196, 26, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
}

.video-timeline-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
}

.video-progress-bar {
    position: relative;
    height: 6px;
    background-color: #e8e8e8;
    border-radius: 3px;
    overflow: hidden;
    margin: 4px 0;
}

.progress-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #e8e8e8;
    border-radius: 3px;
}

.progress-modification {
    position: absolute;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, #00aeec, #00d4ff);
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 0 4px rgba(0, 174, 236, 0.4);
}

.progress-modification:hover {
    background: linear-gradient(90deg, #00d4ff, #40e0ff);
    transform: scaleY(1.2);
    box-shadow: 0 0 8px rgba(0, 174, 236, 0.6);
}

.time-labels {
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #666;
    pointer-events: none;
}

.timeline-info {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: #666;
}

.video-duration {
    background-color: #e6f7ff;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    color: #1890ff;
}

.modification-duration {
    background-color: #fff2e8;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    color: #fa8c16;
}

/* 操作按钮区域 */
.video-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.video-actions .ant-btn {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.video-actions .ant-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.video-actions .ant-btn-primary {
    background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
}

.video-actions .ant-btn-default {
    background: linear-gradient(135deg, #f0f0f0 0%, #d9d9d9 100%);
    color: #666;
}

/* 分页样式 */
.pagination-wrapper {
    margin-top: 24px;
    text-align: center;
    padding: 16px;
}

/* 策略描述样式 */
.strategy-desc {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
}

.strategy-desc .value {
    font-size: 12px;
    color: #666;
    line-height: 1.5;
}

/* 视频预览容器 */
.video-preview-container {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    border-radius: 16px;
    padding: 20px;
}

.video-wrapper {
    position: relative;
    display: inline-block;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2);
    background: #000;
}

.video-click-hint {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    z-index: 10;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: fadeInOut 1.5s ease-in-out;
}

@keyframes fadeInOut {
    0% {
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    80% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

.preview-video {
    max-width: 100%;
    max-height: 80vh;
    display: block;
    border-radius: 16px;
    width: auto;
    height: auto;
    object-fit: contain;
    cursor: pointer;
}

/* 播放/暂停按钮覆盖层 */
.video-play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: background 0.3s ease;
    z-index: 10;
}

.video-play-overlay:hover {
    background: rgba(0, 0, 0, 0.5);
}

.play-button,
.pause-button {
    font-size: 64px;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease;
}

.play-button:hover,
.pause-button:hover {
    color: white;
    transform: scale(1.1);
}

/* 播放时隐藏覆盖层，暂停时显示 */
.video-play-overlay {
    opacity: 1;
}

.video-wrapper.playing .video-play-overlay {
    opacity: 0;
}

/* 视频控制条 */
.custom-video-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
    padding: 16px 20px;
    color: white;
    border-radius: 0 0 16px 16px;
    backdrop-filter: blur(10px);
}

.controls-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.control-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 16px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.control-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.time-display {
    font-size: 12px;
    color: white;
    min-width: 80px;
    text-align: center;
}

.progress-container {
    flex: 1;
    height: 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.progress-bar {
    position: relative;
    width: 100%;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    cursor: pointer;
}

.progress-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
}

.progress-current {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #00aeec;
    border-radius: 2px;
    transition: width 0.1s;
}

.progress-modification {
    position: absolute;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, #ff4d4f, #ff7875);
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 0 4px rgba(255, 77, 79, 0.6);
}

.progress-modification:hover {
    background: linear-gradient(90deg, #ff7875, #ffa39e);
    transform: scaleY(1.2);
    box-shadow: 0 0 8px rgba(255, 77, 79, 0.8);
}

.progress-thumb {
    position: absolute;
    top: 50%;
    width: 12px;
    height: 12px;
    background-color: #00aeec;
    border: 2px solid white;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    transition: all 0.2s;
}

.progress-thumb:hover {
    transform: translate(-50%, -50%) scale(1.2);
}

.preview-iframe {
    width: 100%;
    height: auto;
    min-height: 300px;
    aspect-ratio: 16 / 9;
    border: none;
    border-radius: 16px;
    background: black;
}
</style>
