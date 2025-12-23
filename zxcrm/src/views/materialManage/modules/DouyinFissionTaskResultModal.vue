<template>
    <a-modal title="查看结果" :width="1200" :visible="visible" :confirm-loading="confirmLoading" @ok="handleOk"
        @cancel="handleCancel" ok-text="采纳" cancel-text="关闭">
        <a-form layout="inline">
            <a-row :gutter="24">
                <a-col :md="6" :sm="24">
                    <a-form-item label="视频标题">
                        <a-input v-model="queryParam.title" placeholder="请输入视频标题" />
                    </a-form-item>
                </a-col>
                <!-- <a-col :md="6" :sm="24">
                            <a-form-item label="策略名称">
                        <a-input v-model="queryParam.strategyDetailStrategyName" placeholder="请输入策略名称" />
                            </a-form-item>
                </a-col> -->
                <a-col :md="6" :sm="24">
                    <a-form-item label="采纳状态">
                        <a-select style="width: 180px;" v-model="queryParam.statusCode" placeholder="请选择采纳状态"
                            allow-clear>
                            <a-select-option value="true">已采纳</a-select-option>
                            <a-select-option value="false">未采纳</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :md="6" :sm="24">
                    <a-button type="primary" @click="searchQuery">查询</a-button>
                    <a-button style="margin-left: 10px;" @click="searchReset">重置</a-button>
                </a-col>
            </a-row>
        </a-form>

        <div class="video-grid">
            <div v-for="item in dataSource" :key="item.id" class="video-card"
                :class="{ selected: selectedRowKeys.includes(item.id) }" @click="toggleSelect(item.id)">
                <div class="video-cover">
                    <img v-if="getCoverUrl(item) && getCoverUrl(item) !== 'video-cover'" :src="getCoverUrl(item)"
                        :alt="item.title || '视频封面'" @error="handleCoverError(item)" class="cover-image" />
                    <video v-else-if="getVideoUrl(item)" :src="getVideoUrl(item)" class="cover-video"
                        @loadeddata="onVideoLoaded" @error="onVideoError" muted preload="metadata" playsinline>
                    </video>
                    <div v-else class="cover-placeholder">
                        <span>视频连接已过期</span>
                    </div>
                    <div class="cover-source" v-if="getCoverUrl(item) || getVideoUrl(item)">
                        来源: {{ getCoverSource(item) }}
                    </div>
                </div>
                <div class="video-info">
                    <div class="video-title">{{ item.title || '无标题' }}</div>
                    <div>策略: {{ getStrategyName(item.strategyDetailStrategy) || '-' }}</div>
                    <div>状态: {{ item.statusCode === 'true' ? '已采纳' : '未采纳' }}</div>
                    <div>素材ID: {{ item.materialId || '-' }}</div>
                    <div :class="{ expired: isPreviewExpired(item.createTime) }">预览有效: {{
                        getPreviewExpireTime(item.createTime) }}</div>
                    <div :class="{ expired: isDownloadExpired(item.createTime) }">下载有效: {{
                        getDownloadExpireTime(item.createTime) }}</div>
                    <div :class="{ expired: isAdoptExpired(item.createTime) }">采纳有效: {{
                        getAdoptExpireTime(item.createTime) }}</div>
                </div>
                <div class="video-actions">
                    <a-button size="small" @click.stop="previewVideo(item)">预览</a-button>
                    <a-button size="small" @click.stop="copyDownloadUrl(item)">复制下载地址</a-button>
                </div>
            </div>
        </div>


        <!-- 视频预览弹窗 -->
        <a-modal title="视频预览" :width="600" :visible="previewVisible" :confirm-loading="false" @ok="closePreview"
            @cancel="closePreview" ok-text="关闭" cancel-text="关闭" :footer="null" :mask-closable="true">
            <div class="video-preview-container">
                <video v-if="previewUrl" :src="previewUrl" controls autoplay muted class="preview-video"
                    @error="handleVideoError">
                    您的浏览器不支持视频播放
                </video>
                <div v-else class="video-error">
                    <span>视频加载失败或链接已过期</span>
                </div>
                <div class="preview-info" v-if="currentPreviewItem">
                    <p><strong>标题:</strong> {{ currentPreviewItem.title || '无标题' }}</p>
                    <p><strong>策略:</strong> {{ getStrategyName(currentPreviewItem.strategyDetailStrategy) || '-' }}</p>
                    <p><strong>素材ID:</strong> {{ currentPreviewItem.materialId || '-' }}</p>
                </div>
            </div>
        </a-modal>
    </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import moment from 'moment';

export default {
    name: 'DouyinFissionTaskResultModal',
    data() {
        return {
            visible: false,
            confirmLoading: false,
            dataSource: [],
            selectedRowKeys: [],
            total: 0,
            queryParam: { title: '', strategyDetailStrategyName: '', statusCode: '' },
            ipagination: { current: 1, pageSize: 12 },
            url: { list: '/douyinFissionTaskDetail/listNotPage', adopt: '/douyinFissionTaskDetail/adoptVideo' },
            // 预览相关
            previewVisible: false,
            previewUrl: '',
            currentPreviewItem: null,
            failedPreviews: new Set(), // 存储失效的预览URL
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
    methods: {
        show(taskId) {
            this.visible = true
            this.queryParam.taskId = taskId
            this.loadData()
        },
        handleCancel() { this.visible = false; this.selectedRowKeys = [] },
        handleOk() {
            if (this.selectedRowKeys.length === 0) {
                this.$message.warning('请选择要采纳的视频')
                return
            }

            // 检查选中的数据是否包含已采纳的数据
            const adoptedItems = this.selectedRowKeys.filter(id => {
                const item = this.dataSource.find(item => item.id === id)
                return item && item.statusCode === 'true'
            })

            if (adoptedItems.length > 0) {
                this.$message.warning('选中的数据中包含已采纳的数据，请重新选择')
                return
            }

            // 过滤出未过期的有效ID
            const validIds = this.selectedRowKeys.filter(id => {
                const item = this.dataSource.find(i => i.id === id);
                const adoptExpire = moment(item.createTime).add(7, 'days');
                return !this.isExpired(adoptExpire);
            });

            if (validIds.length === 0) {
                this.$message.warning('没有有效的可采纳项（可能已过期）');
                return;
            }

            this.adoptVideos(validIds);
        },
        loadData() {
            httpAction(this.url.list, this.queryParam, 'GET').then(res => {
                this.dataSource = res.result || [];  // 确保是数组
                this.total = res.result.length || 0;  // 简化总计
                this.$forceUpdate();  // 强制刷新渲染
            })
        },
        searchQuery() { this.loadData() },
        searchReset() { this.queryParam = { ...this.queryParam, title: '', strategyDetailStrategyName: '', statusCode: '' }; this.loadData() },
        toggleSelect(id) {
            const item = this.dataSource.find(i => i.id === id);

            // 检查是否已采纳
            if (item && item.statusCode === 'true') {
                this.$message.warning('已采纳的数据不能重复选择')
                return
            }

            // 检查采纳期限
            const adoptExpire = moment(item.createTime).add(7, 'days');
            if (this.isExpired(adoptExpire)) {
                this.$message.warning('该项已超出采纳期限，无法选择');
                return;
            }

            const index = this.selectedRowKeys.indexOf(id)
            if (index > -1) this.selectedRowKeys.splice(index, 1)
            else this.selectedRowKeys.push(id)
        },
        adoptVideos(validIds) {
            // 再次检查选中的数据是否包含已采纳的数据
            const adoptedItems = validIds.filter(id => {
                const item = this.dataSource.find(item => item.id === id)
                return item && item.statusCode === 'true'
            })

            if (adoptedItems.length > 0) {
                this.$message.warning('选中的数据中包含已采纳的数据，请重新选择')
                return
            }

            if (validIds.length === 0) {
                this.$message.warning('请选择要采纳的数据')
                return
            }

            this.confirmLoading = true
            // 使用FormData传参
            const formData = new FormData()
            formData.append('ids', validIds)

            httpAction(this.url.adopt, formData, 'POST').then(res => {
                if (res.success) {
                    this.$message.success('采纳成功');
                    this.selectedRowKeys = [];
                    this.loadData()
                } else {
                    this.$message.warning(res.message)
                }
            }).catch(error => {
                this.$message.error('采纳失败')
                console.error('采纳失败:', error)
            }).finally(() => this.confirmLoading = false)
        },
        previewVideo(item) {
            // 检查preVideoUrl是否能提取到封面来判断预览是否有效
            if (!item.preVideoUrl) {
                this.$message.warning('无预览视频URL');
                return;
            }

            // 检查preVideoUrl是否在失效列表中
            if (this.isPreviewFailed(item)) {
                this.$message.warning('视频预览已失效，请尝试下载');
                return;
            }

            // 直接测试preVideoUrl是否能加载（创建一个临时video元素测试）
            this.testPreviewUrl(item);
        },
        // 测试预览URL是否有效
        testPreviewUrl(item) {
            const testVideo = document.createElement('video');
            testVideo.muted = true;
            testVideo.preload = 'metadata';

            const timeout = setTimeout(() => {
                // console.log('预览URL测试超时，标记为失效:', item.preVideoUrl);
                this.markPreviewFailed(item.preVideoUrl);
                this.$message.warning('视频预览已失效，请尝试下载');
            }, 3000); // 3秒超时

            testVideo.onloadedmetadata = () => {
                clearTimeout(timeout);
                // console.log('预览URL测试成功:', item.preVideoUrl);
                // URL有效，打开预览
                this.previewUrl = item.preVideoUrl;
                this.currentPreviewItem = item;
                this.previewVisible = true;
            };

            testVideo.onerror = () => {
                clearTimeout(timeout);
                // console.log('预览URL测试失败，标记为失效:', item.preVideoUrl);
                this.markPreviewFailed(item.preVideoUrl);
                this.$message.warning('视频预览已失效，请尝试下载');
            };

            testVideo.src = item.preVideoUrl;
        },
        copyDownloadUrl(item) {
            const downloadExpire = moment(item.createTime).add(1, 'days');
            if (this.isExpired(downloadExpire)) {
                this.$message.warning('该视频已超出下载期限，无法复制');
                return;
            }
            const url = item.videoUrl || item.preVideoUrl
            if (url) {
                // 复制URL到剪贴板
                this.copyToClipboard(url);
            } else {
                this.$message.warning('无视频URL')
            }
        },
        getStrategyName(strategy) {
            return this.strategyMap[strategy] || strategy;  // 直接映射字符串
        },
        isExpired(time) {
            return moment().isAfter(time);
        },
        getPreviewExpireTime(createTime) {
            if (!createTime) return '未知';
            const expire = moment(createTime).add(1, 'hours');
            return this.isExpired(expire) ? '已过期' : expire.format('YYYY-MM-DD HH:mm:ss');
        },

        getDownloadExpireTime(createTime) {
            if (!createTime) return '未知';
            const expire = moment(createTime).add(1, 'days');
            return this.isExpired(expire) ? '已过期' : expire.format('YYYY-MM-DD HH:mm:ss');
        },

        getAdoptExpireTime(createTime) {
            if (!createTime) return '未知';
            const expire = moment(createTime).add(7, 'days');
            return this.isExpired(expire) ? '已过期' : expire.format('YYYY-MM-DD HH:mm:ss');
        },
        isPreviewExpired(createTime) {
            if (!createTime) return true;
            const expire = moment(createTime).add(1, 'hours');
            return this.isExpired(expire);
        },
        isDownloadExpired(createTime) {
            if (!createTime) return true;
            const expire = moment(createTime).add(1, 'days');
            return this.isExpired(expire);
        },
        isAdoptExpired(createTime) {
            if (!createTime) return true;
            const expire = moment(createTime).add(7, 'days');
            return this.isExpired(expire);
        },
        // 获取封面URL，按优先级：coverUrl > preVideoUrl > videoUrl
        getCoverUrl(item) {
            // console.log('检查封面URL:', item);
            if (item.coverUrl) {
                // console.log('使用coverUrl:', item.coverUrl);
                return item.coverUrl;
            }
            // 对于preVideoUrl，返回特殊标记表示使用video元素
            if (item.preVideoUrl) {
                // console.log('检测到preVideoUrl，使用video元素作为封面');
                return 'video-cover'; // 返回特殊标记，表示使用video元素
            }
            if (item.videoUrl) {
                const thumbnailUrl = this.getVideoThumbnail(item.videoUrl);
                // console.log('使用videoUrl生成缩略图:', thumbnailUrl);
                return thumbnailUrl;
            }
            // console.log('无可用封面URL');
            return null;
        },
        // 生成视频第一帧缩略图
        getVideoThumbnail(videoUrl) {
            // console.log('处理视频URL:', videoUrl);

            // 对于加密的抖音视频URL，直接返回null，让系统使用video元素作为封面
            if (videoUrl && videoUrl.includes('oceanengine.com') && videoUrl.length > 500) {
                // console.log('检测到加密抖音视频URL，跳过缩略图生成');
                return null;
            }

            // 对于标准抖音CDN视频，尝试添加缩略图参数
            if (videoUrl && videoUrl.includes('oceanengine.com')) {
                try {
                    const url = new URL(videoUrl);
                    url.searchParams.set('x-oss-process', 'video/snapshot,t_1000,f_jpg');
                    const thumbnailUrl = url.toString();
                    // console.log('生成抖音缩略图URL:', thumbnailUrl);
                    return thumbnailUrl;
                } catch (e) {
                    console.error('生成抖音缩略图失败:', e);
                    return null;
                }
            }

            // 其他视频源，返回null让系统使用video元素
            // console.log('其他视频源，使用video元素作为封面');
            return null;
        },
        // 获取视频URL
        getVideoUrl(item) {
            if (item.preVideoUrl) return item.preVideoUrl;
            if (item.videoUrl) return item.videoUrl;
            return null;
        },
        // 获取封面来源字段名称
        getCoverSource(item) {
            if (item.coverUrl) return 'coverUrl';
            if (item.preVideoUrl) return 'preVideoUrl';
            if (item.videoUrl) return 'videoUrl';
            return '无可用';
        },
        // 视频加载完成处理
        onVideoLoaded(event) {
            const video = event.target;
            // console.log('视频加载完成:', video.src);
            // 设置视频到第一帧
            video.currentTime = 0.1;
            // 暂停视频
            video.pause();
        },
        // 视频加载失败处理（preVideoUrl封面提取失败）
        onVideoError(event) {
            const video = event.target;
            // console.log('preVideoUrl封面提取失败，预览已失效:', video.src);
            // 标记preVideoUrl失效
            this.markPreviewFailed(video.src);
        },
        // 标记预览失效
        markPreviewFailed(videoUrl) {
            this.failedPreviews.add(videoUrl);
            // console.log('标记预览失效:', videoUrl, '失效列表:', Array.from(this.failedPreviews));
        },
        // 检查预览是否失效 - 基于preVideoUrl是否能提取到封面
        isPreviewFailed(item) {
            // 只检查preVideoUrl是否失效
            const isFailed = item.preVideoUrl && this.failedPreviews.has(item.preVideoUrl);
            // console.log('检查预览失效:', item.preVideoUrl, '是否失效:', isFailed);
            return isFailed;
        },
        // 处理封面加载失败
        handleCoverError(item) {
            // console.log('封面加载失败:', item.id);
            // 这里可以添加重试逻辑或者标记为过期
            this.$forceUpdate();
        },
        // 关闭预览弹窗
        closePreview() {
            this.previewVisible = false;
            this.previewUrl = '';
            this.currentPreviewItem = null;
        },
        // 处理视频播放错误
        handleVideoError() {
            // console.log('视频播放失败:', this.previewUrl);
            this.$message.error('视频播放失败，请尝试下载');
        },
        // 复制到剪贴板
        copyToClipboard(text) {
            if (navigator.clipboard && window.isSecureContext) {
                // 使用现代 Clipboard API
                navigator.clipboard.writeText(text).then(() => {
                    this.$message.success('下载地址已复制到剪贴板');
                }).catch(err => {
                    console.error('复制失败:', err);
                    this.fallbackCopyToClipboard(text);
                });
            } else {
                // 降级方案
                this.fallbackCopyToClipboard(text);
            }
        },
        // 降级复制方案
        fallbackCopyToClipboard(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                this.$message.success('下载地址已复制到剪贴板');
            } catch (err) {
                console.error('复制失败:', err);
                this.$message.error('复制失败，请手动复制');
            }
            document.body.removeChild(textArea);
        }
    }
}
</script>

<style scoped>
/* 视频网格布局 - 竖屏视频优化 */
.video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    margin: 16px 0;
}

/* 视频卡片样式 */
.video-card {
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    padding: 0;
    cursor: pointer;
    background: #fff;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.video-card:hover {
    border-color: #40a9ff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.video-card.selected {
    border-color: #1890ff;
    background-color: #f6ffed;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

/* 视频封面区域 - 竖屏视频比例 */
.video-cover {
    width: 100%;
    height: 280px;
    overflow: hidden;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.cover-image {
    width: auto;
    height: 100%;
    max-width: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
}

.cover-video {
    width: auto;
    height: 100%;
    max-width: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
    pointer-events: none;
}

.video-card:hover .cover-image {
    transform: scale(1.05);
}

.cover-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: #f5f5f5;
    color: #999;
    font-size: 14px;
    text-align: center;
    padding: 20px;
}

.cover-source {
    position: absolute;
    bottom: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 500;
    z-index: 2;
}

/* 视频信息区域 */
.video-info {
    padding: 16px;
    margin-bottom: 0;
}

.video-title {
    font-size: 14px;
    font-weight: 500;
    color: #262626;
    margin-bottom: 8px;
    line-height: 1.4;
    word-break: break-all;
}

.video-info>div {
    font-size: 12px;
    color: #595959;
    margin-bottom: 4px;
    line-height: 1.5;
}

/* 操作按钮区域 */
.video-actions {
    padding: 0 16px 16px 16px;
    margin-top: 0;
    display: flex;
    gap: 8px;
}

.video-actions .ant-btn {
    flex: 1;
}

/* 过期状态样式 */
.expired {
    color: #ff4d4f !important;
    font-weight: bold;
}

/* 预览弹窗样式 */
.video-preview-container {
    text-align: center;
}

.preview-video {
    width: auto;
    max-width: 100%;
    height: 600px;
    object-fit: contain;
    border-radius: 6px;
    background: #000;
}

.video-error {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 6px;
    color: #999;
    font-size: 14px;
}

.preview-info {
    margin-top: 16px;
    text-align: left;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 4px;
}

.preview-info p {
    margin: 4px 0;
    font-size: 14px;
    color: #666;
}

.preview-info strong {
    color: #333;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .video-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .video-card {
        padding: 12px;
    }
}
</style>