<template>
    <div class="workbench-container">
        <div style="display: flex;justify-content: center;height: 100%;align-items: center;padding-bottom: 30px;">
            <img style="height: 50px;vertical-align: middle;margin-right: 6px;" src="~@/assets/logo.png" class="logo"
                alt="logo">
            <div class="workbench-title">云象充</div>
        </div>
        <div class="workbench-form">
            <div class="workbench-form-row">
                <select v-model="selectedAction" class="workbench-select" @change="onActionChange">
                    <!-- <option value="设置授信额度">设置授信额度</option>
                    <option value="调整授信">调整授信</option>
                    <option value="对公备款">对公备款</option>
                    <option value="对私备款">对私备款</option> -->
                    <option value="查询客户余额">查询客户余额</option>
                    <option value="查询账户余额">查询账户余额</option>
                    <option value="查询钱包余额">查询钱包余额</option>
                    <option value="充值模板">充值模板</option>
                    <option value="退款模板">退款模板</option>
                    <option value="转账模板(单笔)">转账模板(单笔)</option>
                    <option value="转账模板(批量)">转账模板(批量)</option>
                    <option value="钱包充值模板">钱包充值模板</option>
                    <option value="钱包退款模板">钱包退款模板</option>
                    <option value="子端口对公充值">子端口对公充值</option>
                    <option value="子端口对私充值">子端口对私充值</option>
                </select>
                <button class="workbench-detail-btn" @click="onDetail">明细记录</button>
            </div>
            <div class="workbench-form-row">
                <!-- <label class="workbench-label">
                    <span class="workbench-required">*</span>
                </label> -->
                <textarea v-model="inputText" class="workbench-textarea"
                    :placeholder="'请输入内容，如：查询账户余额 头条 1947839125415530496'" rows="5"></textarea>
            </div>
            <div class="workbench-tip">
                使用快捷模板时，请将媒体、账户ID、金额等参数删除，替换为正确参数输入完成后，请点击提交按钮，等待处理结果！
            </div>
            <!-- @click="generateTableImage"-->
            <button class="workbench-submit-btn" :disabled="submitLoading" @click="onSubmit">
                <span v-if="submitLoading">处理中...</span>
                <span v-else>提交</span>
            </button>
            <div v-if="errorMsg" class="workbench-error-msg">{{ errorMsg }}</div>

            <!-- 交易记录图片 -->
            <div v-if="shouldShowTransactionTable" class="transaction-table-container">
                <div class="table-header">
                    <button class="download-btn" @click="downloadTableImage">
                        <span>📥</span> 下载图片
                    </button>
                    <h3 class="table-title">交易记录</h3>
                </div>
                <div class="table-image-wrapper">
                    <img v-if="tableImageUrl" :src="tableImageUrl" alt="交易记录" class="table-image"
                        @click="showImageModal = true" />
                    <div v-else class="table-loading">生成图片中...</div>
                </div>
                <canvas ref="tableCanvas" class="table-canvas" style="display: none;"></canvas>
            </div>

            <!-- 图片弹窗 -->
            <div v-if="showImageModal" class="image-modal" @click="showImageModal = false">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <h3>交易记录</h3>
                        <button class="close-btn" @click="showImageModal = false">×</button>
                    </div>
                    <div class="modal-body">
                        <img v-if="tableImageUrl" :src="tableImageUrl" alt="交易记录" class="modal-image" />
                    </div>
                </div>
            </div>

            <!-- 明细记录弹窗 -->
            <div v-if="showDetailModal" class="detail-modal" @click="showDetailModal = false">
                <div class="detail-modal-content" @click.stop>
                    <div class="detail-modal-header">
                        <h3>充转退明细查询</h3>
                        <div class="header-actions">
                            <!-- <button class="download-btn" @click="downloadDetailRecords">
                                下载
                            </button> -->
                            <button class="filter-btn" @click="showFilterModal">
                                筛选
                            </button>
                            <button class="close-btn" @click="showDetailModal = false">×</button>
                        </div>
                    </div>
                    <div class="detail-modal-body" @scroll="onDetailScroll">
                        <div v-if="detailLoading" class="detail-loading">
                            <div class="loading-spinner"></div>
                            <div>加载中...</div>
                        </div>
                        <div v-else-if="detailRecords.length === 0" class="detail-empty">
                            暂无明细记录
                        </div>
                        <div v-else class="detail-list">
                            <div v-for="(record, index) in detailRecords" :key="`${record.id}-${index}`"
                                class="detail-item" @click="onDetailItemClick(record)">
                                <div class="detail-item-main">
                                    <!-- 转入方信息 -->
                                    <div v-if="record.targetAdvertiserId || record.targetAdvertiserName"
                                        class="detail-section">
                                        <div class="detail-entity-name">
                                            <span class="detail-section-title">转入方</span>
                                            {{ record.targetAdvertiserName || '未知账户' }}
                                        </div>
                                        <div class="detail-account-id">账户ID：{{ record.targetAdvertiserId }}</div>
                                    </div>

                                    <!-- 转出方信息 -->
                                    <div v-if="record.sourceAdvertiserId || record.sourceAdvertiserName"
                                        class="detail-section">
                                        <div class="detail-entity-name">
                                            <span class="detail-section-title">转出方</span>
                                            {{ record.sourceAdvertiserName || '未知账户' }}
                                        </div>
                                        <div class="detail-account-id">账户ID：{{ record.sourceAdvertiserId }}</div>
                                    </div>

                                    <div class="detail-time">
                                        {{ record.createTime }}
                                    </div>
                                </div>
                                <div class="detail-item-right">
                                    <div class="detail-amount">
                                        {{ parseFloat(record.amount || 0).toFixed(3) }}
                                    </div>
                                    <div class="detail-status"
                                        :class="{ 'success': record.state === '1', 'processing': record.state === '2', 'failed': record.state === '3' }">
                                        {{ getStateText(record.state) }}
                                    </div>
                                    <div class="detail-action">
                                        <button class="view-image-btn" @click.stop="viewDetailImage(record)">
                                            点击图片查看
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- 加载更多提示 -->
                            <div v-if="detailHasMore || detailLoadingMore" class="load-more-section">
                                <div v-if="detailLoadingMore" class="loading-more">
                                    <div class="loading-spinner"></div>
                                    <div>加载更多中...</div>
                                </div>
                                <div v-else-if="detailHasMore" class="load-more-tip">
                                    滚动到底部加载更多
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 明细图片弹窗 -->
            <div v-if="showDetailImageModal" class="image-modal" @click="showDetailImageModal = false">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <h3>交易明细图片</h3>
                        <button class="close-btn" @click="showDetailImageModal = false">×</button>
                    </div>
                    <div class="modal-body">
                        <img v-if="detailImageUrl" :src="detailImageUrl" alt="交易明细" class="modal-image" />
                    </div>
                </div>
            </div>

            <!-- 明细详情弹窗 -->
            <div v-if="showDetailInfoModal" class="image-modal" @click="showDetailInfoModal = false">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <h3>明细详情</h3>
                        <button class="close-btn" @click="showDetailInfoModal = false">×</button>
                    </div>
                    <div class="modal-body">
                        <div v-if="detailInfoRecord" class="detail-info-content">
                            <div class="detail-info-section">
                                <h4>基本信息</h4>
                                <div class="detail-info-row">
                                    <span class="detail-info-label">交易时间：</span>
                                    <span class="detail-info-value">{{ detailInfoRecord.createTime }}</span>
                                </div>
                                <div class="detail-info-row">
                                    <span class="detail-info-label">业务平台：</span>
                                    <span class="detail-info-value">{{ detailInfoRecord.channelName || '-' }}</span>
                                </div>
                                <div class="detail-info-row">
                                    <span class="detail-info-label">交易金额：</span>
                                    <span class="detail-info-value amount">{{ parseFloat(detailInfoRecord.amount ||
                                        0).toFixed(3) }} </span>
                                </div>
                                <div class="detail-info-row">
                                    <span class="detail-info-label">交易状态：</span>
                                    <span class="detail-info-value status"
                                        :class="{ 'success': detailInfoRecord.state === '1', 'processing': detailInfoRecord.state === '2', 'failed': detailInfoRecord.state === '3' }">
                                        {{ getStateText(detailInfoRecord.state) }}
                                    </span>
                                </div>
                                <div class="detail-info-row">
                                    <span class="detail-info-label">交易类型：</span>
                                    <span class="detail-info-value">{{ getTradeTypeText(detailInfoRecord.tradeType)
                                        }}</span>
                                </div>
                                <div class="detail-info-row">
                                    <span class="detail-info-label">交易批次号：</span>
                                    <span class="detail-info-value">{{ detailInfoRecord.batchNumber || '-' }}</span>
                                </div>
                            </div>

                            <div class="detail-info-section">
                                <h4>账户信息</h4>
                                <div v-if="detailInfoRecord.targetAdvertiserId || detailInfoRecord.targetAdvertiserName"
                                    class="detail-info-row">
                                    <span class="detail-info-label">转入方：</span>
                                    <span class="detail-info-value">{{ detailInfoRecord.targetAdvertiserName || '未知账户'
                                        }} ({{ detailInfoRecord.targetAdvertiserId }})</span>
                                </div>
                                <div v-if="detailInfoRecord.sourceAdvertiserId || detailInfoRecord.sourceAdvertiserName"
                                    class="detail-info-row">
                                    <span class="detail-info-label">转出方：</span>
                                    <span class="detail-info-value">{{ detailInfoRecord.sourceAdvertiserName || '未知账户'
                                        }} ({{ detailInfoRecord.sourceAdvertiserId }})</span>
                                </div>
                            </div>

                            <div v-if="detailInfoRecord.errMsg" class="detail-info-section">
                                <h4>错误信息</h4>
                                <div class="detail-info-row">
                                    <span class="detail-info-label">失败原因：</span>
                                    <span class="detail-info-value error">{{ detailInfoRecord.errMsg }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { parseCreditCommandFormData, getFundTransferRecordList } from '@/api/api';
import html2canvas from 'html2canvas';
export default {
    name: 'Workbench',
    data() {
        return {
            selectedAction: '查询客户余额',
            inputText: '查询客户余额',
            proId: '',
            errorMsg: '',
            submitLoading: false,
            lastSubmitTime: 0,
            currentRecord: [], // 当前展示的多条记录
            lastMessage: '', // 记录最后一次API返回的message
            tableImageUrl: '', // 表格图片URL
            showImageModal: false, // 是否显示图片弹窗
            // 明细记录相关
            showDetailModal: false, // 是否显示明细记录弹窗
            detailRecords: [], // 明细记录数据
            detailLoading: false, // 明细记录加载状态
            // 明细图片相关
            showDetailImageModal: false, // 是否显示明细图片弹窗
            detailImageUrl: '', // 明细图片URL
            // 明细详情弹窗相关
            showDetailInfoModal: false, // 是否显示明细详情弹窗
            detailInfoRecord: null, // 明细详情记录
            // 分页相关
            detailCurrent: 1, // 当前页码
            detailSize: 10, // 每页大小
            detailTotal: 0, // 总记录数
            detailHasMore: true, // 是否还有更多数据
            detailLoadingMore: false, // 是否正在加载更多
            oid: '', // oid
        };
    },
    computed: {
        // 判断是否应该显示交易记录表格
        shouldShowTransactionTable() {
            if (!this.currentRecord || this.currentRecord.length === 0) {
                return false;
            }
            // 只有全部 state 都为 '1' 才展示
            const allSuccess = this.currentRecord.every(item => item.state === '1');
            // console.log(allSuccess, 'allSuccess')
            if (!allSuccess) {
                return false;
            }
            const showMessages = ['充值', '退款', '转出', '转账', '子端口充值'];
            return showMessages.includes(this.lastMessage);
        }
    },
    watch: {
        // 监听currentRecord变化，自动生成图片
        currentRecord: {
            handler(newVal) {
                if (newVal && newVal.length > 0 && this.shouldShowTransactionTable) {
                    this.generateTableImage();
                } else {
                    this.tableImageUrl = '';
                }
            },
            immediate: true
        }
        // ,
        // '$route.query.id': {
        //     handler(newVal) {
        //         if (newVal) {
        //             // console.log(newVal)
        //         }
        //     },
        // }
    },
    created() {
        // 从路由query中获取proId（id）
        this.proId = this.$route.query.id || '';
        this.oid = this.$route.query.oid || '';
    },
    mounted() {
        // 隐藏系统名称
        this.hideSystemName();
    },
    methods: {
        // 解析返回的数据
        parseResponseData(data) {
            if (!Array.isArray(data) || data.length === 0) {
                this.currentRecord = [];
                return '返回数据格式错误';
            }
            // 只做格式化，currentRecord 由onSubmit赋值
            const result = data[0];
            // 判断交易类型
            let tradeTypeText = '';
            if (result.tradeType === '1') {
                tradeTypeText = '充值';
            } else if (result.tradeType === '2') {
                tradeTypeText = '转账';
            } else if (result.tradeType === '3') {
                tradeTypeText = '退款';
            }

            // 判断状态
            let stateText = '';
            if (result.state === '1') {
                stateText = '成功';
            } else if (result.state === '2') {
                stateText = '处理中';
            } else if (result.state === '3') {
                stateText = '失败';
            } else if (result.state === '4') {
                stateText = '已取消';
            } else if (result.state === '5') {
                stateText = '交易异常';
            }

            // 判断资金性质
            let fundsNatureText = '';
            if (result.fundsNature === '1') {
                fundsNatureText = '对公';
            } else if (result.fundsNature === '2') {
                fundsNatureText = '对私';
            }

            // 构建返回信息（每个字段一行，逗号分隔，最后一行不加逗号）
            let lines = [];
            lines.push(`【${tradeTypeText}结果—${stateText}${data.length}笔】`);
            if (result.tradeType === '1') { // 充值
                // 提取媒体名称（去掉"-磁力引擎"等后缀）
                const mediaName = result.channelName ? result.channelName.split('-')[0] : '';
                lines.push(`媒体：${mediaName}`);
                lines.push(`${result.targetAdvertiserId}，${result.targetAdvertiserName || ''}，${fundsNatureText} ${((result.rebateNum || 0) * 100).toFixed(2)}%，充值金额 ${parseFloat(result.amount || 0).toFixed(3)}，${stateText}`);
                lines.push(`充值成功总账户币：${parseFloat(result.amount || 0).toFixed(3)}`);
                lines.push(`总扣除金额：${parseFloat(result.changeMoney || 0).toFixed(3)} 元`);
                lines.push(`对公余额：${parseFloat(result.publicBalance || 0).toFixed(3)} 元`);
                lines.push(`对私余额：${parseFloat(result.privateBalance || 0).toFixed(3)} 元`);
                lines.push(`交易批次号：${result.batchNumber}`);
                lines.push(`交易完成时间：${result.createTime}`);
            } else if (result.tradeType === '2') { // 转账
                lines.push(`媒体：${result.channelName},`);
                lines.push(`转出方：${result.sourceAdvertiserId},`);
                lines.push(`${result.sourceAdvertiserName || ''},`);
                lines.push(`转入方：${result.targetAdvertiserId},`);
                lines.push(`${result.targetAdvertiserName || ''},`);
                lines.push(`转账金额：${parseFloat(result.amount || 0).toFixed(3)},`);
                lines.push(`${stateText},`);
                lines.push(`变动金额：${parseFloat(result.changeMoney || 0).toFixed(3)},`);
                lines.push(`对公余额：${parseFloat(result.publicBalance || 0).toFixed(3)},`);
                lines.push(`对私余额：${parseFloat(result.privateBalance || 0).toFixed(3)},`);
                lines.push(`交易批次号：${result.batchNumber},`);
                lines.push(`交易完成时间：${result.createTime}`);
            } else if (result.tradeType === '3') { // 退款
                // 提取媒体名称（去掉"-磁力引擎"等后缀）
                const mediaName = result.channelName ? result.channelName.split('-')[0] : '';
                lines.push(`媒体：${mediaName}`);
                lines.push(`${result.sourceAdvertiserId}，${result.sourceAdvertiserName || ''}，${fundsNatureText} ${((result.rebateNum || 0) * 100).toFixed(2)}%，退款金额 ${parseFloat(result.amount || 0).toFixed(3)}，${stateText}`);
                lines.push(`退款成功总账户币：${parseFloat(result.amount || 0).toFixed(3)}`);
                lines.push(`总增加金额：${parseFloat(result.changeMoney || 0).toFixed(3)} 元`);
                lines.push(`对公余额：${parseFloat(result.publicBalance || 0).toFixed(3)} 元`);
                lines.push(`对私余额：${parseFloat(result.privateBalance || 0).toFixed(3)} 元`);
                lines.push(`交易批次号：${result.batchNumber}`);
                lines.push(`交易完成时间：${result.createTime}`);
            }
            // 只要失败就展示errMsg
            if (result.state === '3' && result.errMsg) {
                lines.push(`失败原因：${result.errMsg}`);
            }
            return lines.join('\n');
        },
        // 解析客户余额返回的数据
        parseCustomerBalanceResult(data) {
            if (!Array.isArray(data) || data.length === 0) {
                return '返回数据格式错误';
            }
            const result = data[0];
            // 错误信息优先展示
            if (result.msg && result.msg.toLowerCase() !== 'ok' && result.msg.toLowerCase() !== 'success') {
                return [
                    '【账户余额查询失败】',
                    `广告主ID：${result.advertiserId || '-'}`,
                    `失败原因：${result.msg}`
                ].join('\n');
            }

            // 处理balance为数组的情况
            if (Array.isArray(result.balance)) {
                const balanceLines = ['【账户余额查询结果】'];
                balanceLines.push(`广告主ID：${result.advertiserId || '-'}`);
                balanceLines.push('各账户余额：');

                result.balance.forEach(balanceItem => {
                    balanceLines.push(`  ${balanceItem.fundType}：${parseFloat(balanceItem.balance || 0).toFixed(3)} 元`);
                });

                return balanceLines.join('\n');
            }

            // 处理balance为单个值的情况
            return [
                '【账户余额查询结果】',
                `广告主ID：${result.advertiserId || '-'}`,
                `余额：${parseFloat(result.balance || 0).toFixed(3)} 元`
            ].join('\n');
        },
        // 解析客户余额返回的数据（查询客户余额）
        parseClientBalanceResult(data) {
            if (!Array.isArray(data) || data.length === 0) {
                return '返回数据格式错误';
            }
            const result = data[0];

            return [
                // '【客户余额查询结果】',
                // `客户唯一标识：${result['客户唯一标识'] || '-'}`,
                // `授信余额：${result['授信余额'] || 0} 元`,
                // `对公余额：${result['对公余额'] || 0} 元`,
                // `对私余额：${result['对私余额'] || 0} 元`,
                // `授信额度：${result['授信额度'] || 0} 元`
                '【客户余额查询结果】',
                `客户唯一标识：${result['id'] || '-'}`,
                `授信总额度：${parseFloat(result['totalCreditLimit'] || 0).toFixed(3)} 元`,
                `可用余额：${parseFloat(result['availablebBalance'] || 0).toFixed(3)} 元`,
                `对公余额：${parseFloat((result['publicCashReserves'] - result['publicCreditArrears']) || 0).toFixed(3)} 元`,
                `对私余额：${parseFloat((result['privateCashReserve'] - result['privateCreditArrears']) || 0).toFixed(3)} 元`,
                // `授信额度：${result['availableCreditBalance'] || 0} 元`
            ].join('\n');
        },
        // 通用错误解析
        parseCommonErrorResult(data) {
            if (!Array.isArray(data) || data.length === 0) {
                return null;
            }
            // 收集所有错误对象
            const errorMsgs = data.filter(result => {
                // 检查是否有msg字段，且不是成功状态
                if (!result.msg) return false;
                const msg = result.msg.toLowerCase();
                return msg !== 'ok' && msg !== 'success' && msg !== 'ks' && msg !== 'dy' && msg !== 'tx' && msg !== "该钱包未绑定";
            }).map(result => [
                '【操作失败】',
                `广告主ID：${result.advertiserId || '-'}`,
                `失败原因：${result.msg}`
            ].join('\n'));
            if (errorMsgs.length > 0) {
                // 多个错误用两个换行分隔
                return errorMsgs.join('\n\n');
            }
            return null;
        },
        // 获取交易类型文本
        getTradeTypeText(tradeType) {
            const typeMap = {
                '1': '充值',
                '2': '转账',
                '3': '退款'
            };
            return typeMap[tradeType] || tradeType;
        },
        // 获取资金性质文本
        getFundsNatureText(fundsNature) {
            const natureMap = {
                '1': '对公',
                '2': '对私'
            };
            return natureMap[fundsNature] || fundsNature;
        },
        // 获取状态文本
        getStateText(state) {
            const stateMap = {
                '1': '成功',
                '2': '处理中',
                '3': '失败',
                '4': '已取消',
                '5': '交易异常'
            };
            return stateMap[state] || state;
        },
        // 根据 message 类型解析 result
        /**
         * 根据 message 类型解析 result
         * @param message 消息类型
         * @param data 数据
         * 查询钱包余额   777610266149806169
         */
        parseResultByMessageType(message, data) {
            if (!Array.isArray(data) || data.length === 0) {
                return '返回数据格式错误';
            }
            const result = data[0];
            switch (message) {
                case '查询账户余额':
                    return this.parseCustomerBalanceResult(data);
                case '查询客户余额':
                    return this.parseClientBalanceResult(data);
                case '充值':
                    return this.parseRechargeResult(data);
                case '退款':
                    return this.parseRefundResult(data);
                case '转出':
                case '转账':
                    return this.parseTransferResult(data, message);
                case '查询钱包余额':
                    return this.parserWalletBalanceResult(data, message);
                case '子端口充值':
                    return this.parseSubPortRechargeResult(data, message);
                case '项目划转':
                    return this.parseProjectTransferResult(data, message);
                // 可扩展更多类型
                default:
                    return JSON.stringify(result, null, 2);
            }
        },
        // 解析授信额度/调整授信结果
        parseCreditLimitResult(result) {
            return [
                `【${this.selectedAction}成功】`,
                `客户唯一标识：${result.proId || '-'}`,
                `授信额度：${parseFloat(result.money || 0).toFixed(3)}`,
                `可用金额：${parseFloat(result.availableCreditBalance || 0).toFixed(3)}`,
                `授信总额度：${parseFloat(result.totalCreditLimit || 0).toFixed(3)}`,
                `授信时间：${result.updateTime || '-'}`,
            ].join('\n');
        },
        // 解析备款结果
        parseReserveResult(result) {
            return [
                `【备款成功】`,
                `客户唯一标识：${result.proId || '-'}`,
                `备款金额：${parseFloat(result.money || 0).toFixed(3)}`,
                `对公余额：${parseFloat(result.publicCashReserves || 0).toFixed(3)}`,
                `对私余额：${parseFloat(result.privateCashReserve || 0).toFixed(3)}`,
                `备款时间：${result.updateTime || '-'}`,
            ].join('\n');
        },
        onActionChange() {
            if (this.selectedAction === '设置授信额度') {
                this.inputText = '';
            } else if (this.selectedAction === '调整授信') {
                this.inputText = '调整授信 1947537817968381954 1000000';
            } else if (this.selectedAction === '对公备款') {
                this.inputText = '对公备款 1947537817968381954 1000000';
            } else if (this.selectedAction === '对私备款') {
                this.inputText = '对私备款 1947537817968381954 1000000';
            } else if (this.selectedAction === '查询客户余额') {
                this.inputText = '查询客户余额';
            } else if (this.selectedAction === '查询账户余额') {
                this.inputText = '查询账户余额  178922922120001';
            } else if (this.selectedAction === '充值模板') {
                this.inputText = '对公充值  快手   27132558    100';
            } else if (this.selectedAction === '退款模板') {
                this.inputText = '对公退款  快手   27132558    100';
            } else if (this.selectedAction === '转账模板(单笔)') {
                this.inputText = '转账 快手   51837291  51837293   100 ';
            } else if (this.selectedAction === '转账模板(批量)') {
                this.inputText = '转账 快手  \n51837291   51837293   100 \n51837292   51837293   100 \n51837298   51837293   100 ';
            } else if (this.selectedAction === '钱包充值模板') {
                this.inputText = '对公充值钱包  快手   27132558    100';
            } else if (this.selectedAction === '钱包退款模板') {
                this.inputText = '对公退款钱包  快手   27132558    100';
            } else if (this.selectedAction === '查询钱包余额') {
                this.inputText = '查询钱包余额   777610266149806169';
            } else if (this.selectedAction === '子端口对公充值') {
                this.inputText = '子端口对公充值 快手 1008236 1';
            } else if (this.selectedAction === '子端口对公充值') {
                this.inputText = '子端口对私充值 快手 1008236 1';
            } else {
                this.inputText = '';
            }
        },
        onDetail() {
            // 明细记录按钮点击事件
            if (!this.oid) {
                this.$message && this.$message.error('未获取到项目ID');
                return;
            }
            this.showDetailModal = true;
            this.loadDetailRecords();
        },
        //提交
        onSubmit() {
            const now = Date.now();
            if (this.submitLoading || now - this.lastSubmitTime < 1000) {
                return;
            }
            this.lastSubmitTime = now;
            this.submitLoading = true;
            this.errorMsg = '';
            if (!this.inputText.trim()) {
                this.errorMsg = '请输入内容';
                this.submitLoading = false;
                return;
            }
            if (!this.proId) {
                this.errorMsg = '未获取到项目ID';
                this.submitLoading = false;
                return;
            }
            // 请求 instructionParsing/parseCreditCommand
            parseCreditCommandFormData({ proUniqueId: this.proId, command: this.inputText })
                .then(res => {
                    // 记录最后一次API返回的message
                    // /(parseResult.currentRecord && parseResult.currentRecord.length > 0) ? parseResult.currentRecord : res.result
                    this.lastMessage = res && res.message ? res.message : '';
                    const parseResult = this.parseApiResponse(res, this.selectedAction);
                    this.errorMsg = parseResult.errorMsg;
                    if (res.message === '子端口充值') {
                        this.currentRecord = res.result
                    } else {
                        this.currentRecord = parseResult.currentRecord
                    }
                    this.inputText = ''
                    this.submitLoading = false;
                })
                .catch(() => {
                    this.errorMsg = '请求失败';
                    this.currentRecord = [];
                    this.submitLoading = false;
                });
        },
        /**
         * 子端口充值（快手）
         * {
                "success": true,
                "message": "子端口充值",
                "code": 200,
                "result": [
                    {
                        "id": "1951579026076516354",
                        "createBy": null,
                        "createTime": "2025-08-02 17:41:13",
                        "updateBy": null,
                        "updateTime": null,
                        "delFlag": "0",
                        "channelName": "快手-磁力引擎",
                        "channelPlatform": "KS",
                        "channelSign": "KS-CLYQ",
                        "proId": "1947537817968381954",
                        "proName": "资金池测试",
                        "agentId": "251",
                        "agentName": "磁力引擎效果代理商",
                        "targetAdvertiserId": "1008236",
                        "targetAdvertiserName": "快手测试充值",
                        "sourceAdvertiserId": "251",
                        "sourceAdvertiserName": "磁力引擎效果代理商",
                        "fundsNature": "1",
                        "tradeType": "1",
                        "rebateName": "测试模板",
                        "rebateForm": "1",
                        "rebateNum": 0.01000,
                        "mediaSerialNumber": null,
                        "state": "1",
                        "batchNumber": "1951579021217239040",
                        "recordSource": "3",
                        "amount": 1,
                        "remarks": "子端口对公充值 快手 1008236 1",
                        "errMsg": null,
                        "transferType": "6",
                        "changeMoney": 0.99,
                        "publicBalance": -1.960,
                        "privateBalance": 0
                    }
                ],
                "timestamp": 1754127673126
            }
         */
        parseProjectTransferResult(data) {
            if (!Array.isArray(data) || data.length === 0) {
                return '返回数据格式错误';
            }
            const result = data[0];

            const lines = [
                `来源项目：${result.fromAccountsName || ''}`,
                `来源项目ID：${result.fromAccounts || ''}`,
                `目标项目：${result.toAccountsName || ''}`,
                `目标项目ID：${result.toAccounts || ''}`,
                `转账金额：${parseFloat(result.money || 0).toFixed(3)}元`
            ];
            if (result.state === '3' && result.errMsg) {
                lines.push(`失败原因：${result.errMsg}`);
            }
            return lines.join('\n');
        },
        parseSubPortRechargeResult(data) {
            if (!Array.isArray(data) || data.length === 0) {
                return '返回数据格式错误';
            }
            const result = data[0];

            const lines = [
                `渠道：${result.channelName || ''}`,
                `代理商：${result.agentName || ''}`,
                `目标：${result.targetAdvertiserName || ''}`,
                `来源：${result.sourceAdvertiserName || ''}`,
                `返点：${((result.rebateNum || 0) * 100).toFixed(1)}%`,
                `充值金额：${parseFloat(result.amount || 0).toFixed(3)}`,
                `扣除金额：${parseFloat(result.changeMoney || 0).toFixed(3)}`,
                `对公余额：${parseFloat(result.publicBalance || 0).toFixed(3)}`,
                `对私余额：${parseFloat(result.privateBalance || 0).toFixed(3)}`,
                `交易批次号：${result.batchNumber}`,
                `交易完成时间：${result.createTime}`
            ];
            if (result.state === '3' && result.errMsg) {
                lines.push(`失败原因：${result.errMsg}`);
            }
            return lines.join('\n');
        },

        // 解析查询钱包余额
        /**
         * 
         * @param data 
         *  {
            "msg": "KS",
            "walletId": "777610266149806169",
            "totalBalance": 22103.282
            }
         */
        parserWalletBalanceResult(data) {
            if (!Array.isArray(data) || data.length === 0) {
                return '返回数据格式错误';
            }

            const formattedResults = [];

            // 遍历所有记录
            data.forEach((result, index) => {

                const channelNameMAP = {
                    KS: '快手',
                    DY: '抖音',
                    TX: '腾讯'
                }
                const lines = [
                    `渠道：${channelNameMAP[result.msg] || '该钱包未绑定'}`,
                    `钱包名称：${result.walletName}`,
                    `钱包ID：${result.walletId}`,
                    `总余额：${result.totalBalance || 0}`
                ];

                // // 只有当state=3时才显示失败原因
                // if (result.state === '3' && result.errMsg) {
                //     lines.push(`失败原因：${result.errMsg}`);
                // }

                formattedResults.push(lines.join('\n'));
            });

            return formattedResults.join('\n\n');
        },
        // 解析充值结果
        parseRechargeResult(data) {
            if (!Array.isArray(data) || data.length === 0) {
                return '返回数据格式错误';
            }
            const result = data[0];

            // 获取状态文本
            const stateText = this.getStateText(result.state);
            // 获取资金性质文本
            const fundsNatureText = this.getFundsNatureText(result.fundsNature);
            // 提取媒体名称（去掉"-磁力引擎"等后缀）
            const mediaName = result.channelName ? result.channelName.split('-')[0] : '';

            const lines = [
                `【充值结果—${stateText}${data.length}笔】`,
                `媒体：${mediaName}`,
                `${result.targetAdvertiserId}，${result.targetAdvertiserName || ''}， ${fundsNatureText} ${((result.rebateNum || 0) * 100).toFixed(2)}%，充值金额 ${parseFloat(result.amount || 0).toFixed(3)}，${stateText}`,
                `充值金额：${parseFloat(result.amount || 0).toFixed(3)}`,
                `扣除金额：${parseFloat(result.changeMoney || 0).toFixed(3)}`,
                `对公余额：${parseFloat(result.publicBalance || 0).toFixed(3)}`,
                `对私余额：${parseFloat(result.privateBalance || 0).toFixed(3)}`,
                `交易批次号：${result.batchNumber}`,
                `交易完成时间：${result.createTime}`
            ];
            if (result.state === '3' && result.errMsg) {
                lines.push(`失败原因：${result.errMsg}`);
            }
            return lines.join('\n');
        },
        // 解析退款结果
        parseRefundResult(data) {
            if (!Array.isArray(data) || data.length === 0) {
                return '返回数据格式错误';
            }
            const result = data[0];

            // 获取状态文本
            const stateText = this.getStateText(result.state);
            // 获取资金性质文本
            const fundsNatureText = this.getFundsNatureText(result.fundsNature);
            // 提取媒体名称（去掉"-磁力引擎"等后缀）
            const mediaName = result.channelName ? result.channelName.split('-')[0] : '';

            const lines = [
                `【退款结果—${stateText}${data.length}笔】`,
                `媒体：${mediaName}`,
                `${result.sourceAdvertiserId}，${result.sourceAdvertiserName || ''}， ${fundsNatureText} ${((result.rebateNum || 0) * 100).toFixed(2)}%，退款金额 ${parseFloat(result.amount || 0).toFixed(3)}，${stateText}`,
                `退款金额：${parseFloat(result.amount || 0).toFixed(3)}`,
                `增加金额：${parseFloat(result.changeMoney || 0).toFixed(3)}`,
                `对公余额：${parseFloat(result.publicBalance || 0).toFixed(3)}`,
                `对私余额：${parseFloat(result.privateBalance || 0).toFixed(3)}`,
                `交易批次号：${result.batchNumber}`,
                `交易完成时间：${result.createTime}`
            ];
            if (result.state === '3' && result.errMsg) {
                lines.push(`失败原因：${result.errMsg}`);
            }
            return lines.join('\n');
        },
        // 解析转账/转出结果
        parseTransferResult(data, message) {
            if (!Array.isArray(data) || data.length === 0) {
                return '返回数据格式错误';
            }

            const formattedResults = [];

            // 遍历所有记录
            data.forEach((result, index) => {
                // 获取状态文本
                const stateText = this.getStateText(result.state);
                // 提取媒体名称（去掉"-磁力引擎"等后缀）
                const mediaName = result.channelName ? result.channelName.split('-')[0] : '';

                const lines = [
                    `【${message}结果—${stateText}】`,
                    `媒体：${mediaName}`,
                    `转入方：${result.targetAdvertiserId},${result.targetAdvertiserName}`,
                    `转出方：${result.sourceAdvertiserId},${result.sourceAdvertiserName}`,
                    `转账金额 ${parseFloat(result.amount || 0).toFixed(3)}，${stateText}`,
                    `交易批次号：${result.batchNumber}`,
                    `交易完成时间：${result.createTime}`
                ];

                // 只有当state=3时才显示失败原因
                if (result.state === '3' && result.errMsg) {
                    lines.push(`失败原因：${result.errMsg}`);
                }

                formattedResults.push(lines.join('\n'));
            });

            return formattedResults.join('\n\n');
        },
        // 统一的API响应解析函数
        parseApiResponse(res, selectedAction) {
            if (res && res.success) {
                let shouxing = res.message === '设置授信额度' || res.message === '调整授信'
                let beikuan = res.message === '备款'
                if (shouxing) {
                    return {
                        errorMsg: this.parseCreditLimitResult(res.result),
                        currentRecord: []
                    };
                }
                if (beikuan) {
                    return {
                        errorMsg: this.parseReserveResult(res.result),
                        currentRecord: []
                    };
                }
                if (res.result && Array.isArray(res.result)) {
                    // 优先通用错误解析
                    const commonError = this.parseCommonErrorResult(res.result);
                    if (commonError) {
                        return {
                            errorMsg: commonError,
                            currentRecord: []
                        };
                    } else if (res.message) {
                        // 对于充值、退款、转出、转账操作，需要显示交易记录表格
                        const showTableMessages = ['充值', '退款', '转出', '转账'];
                        const shouldShowTable = showTableMessages.includes(res.message);

                        return {
                            errorMsg: this.parseResultByMessageType(res.message, res.result),
                            currentRecord: shouldShowTable ? res.result : []
                        };
                    } else if (selectedAction === '查询客户余额' || selectedAction === '查询账户余额' || selectedAction === '查询钱包余额' || selectedAction === '子端口充值' || selectedAction === '项目划转') {
                        return {
                            errorMsg: this.parseResultByMessageType(res.message, res.result),
                            currentRecord: []
                        };
                    } else {
                        return {
                            errorMsg: this.parseResponseData(res.result),
                            currentRecord: res.result
                        };
                    }
                } else {
                    return {
                        errorMsg: res.result || '操作成功',
                        currentRecord: []
                    };
                }
            } else {
                return {
                    errorMsg: (res && res.message) ? res.message : '提交失败',
                    currentRecord: []
                };
            }
        },
        // 生成表格图片
        generateTableImage() {
            try {
                this.$nextTick(() => {
                    // 创建临时表格元素
                    const tempTable = document.createElement('table');
                    tempTable.className = 'transaction-table';
                    tempTable.style.cssText = `
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                    background: white;
                    margin: 0;
                    padding: 10px;
                `;

                    // 创建表头
                    const thead = document.createElement('thead');
                    const headerRow = document.createElement('tr');
                    const headers = ['交易时间', '业务平台', '交易金额（元）', '转出账户', '转入账户'];
                    //  border: 1px solid #ddd;

                    headers.forEach(headerText => {
                        const th = document.createElement('th');
                        th.textContent = headerText;
                        th.style.cssText = `
                        padding: 8px;
                        text-align: center;
                        background-color: #f2f2f2;
                        font-weight: bold;
                    `;
                        headerRow.appendChild(th);
                    });
                    thead.appendChild(headerRow);
                    tempTable.appendChild(thead);

                    // 创建表体
                    const tbody = document.createElement('tbody');
                    this.currentRecord.forEach((row, idx) => {
                        const tr = document.createElement('tr');
                        if (idx % 2 === 1) {
                            tr.style.backgroundColor = '#f9f9f9';
                        }

                        // 交易时间
                        const td1 = document.createElement('td');
                        td1.textContent = row.createTime;
                        td1.style.cssText = `
                        padding: 8px;
                        text-align: center;
                        white-space: normal;
                        word-wrap: break-word;
                        word-break: break-all;
                    `;
                        tr.appendChild(td1);

                        // 业务平台
                        const td2 = document.createElement('td');
                        td2.textContent = row.channelName;
                        td2.style.cssText = td1.style.cssText;
                        tr.appendChild(td2);

                        // 交易金额
                        const td3 = document.createElement('td');
                        td3.textContent = row.amount;
                        td3.style.cssText = td1.style.cssText;
                        tr.appendChild(td3);

                        // 转出账户
                        const td4 = document.createElement('td');
                        if (row.sourceAdvertiserId || row.sourceAdvertiserName) {
                            td4.innerHTML = `
                            <div>${row.sourceAdvertiserId || ''}</div>
                            <div>${row.sourceAdvertiserName || ''}</div>
                        `;
                        } else {
                            td4.textContent = '-';
                        }
                        td4.style.cssText = td1.style.cssText;
                        tr.appendChild(td4);

                        // 转入账户
                        const td5 = document.createElement('td');
                        if (row.targetAdvertiserId || row.targetAdvertiserName) {
                            td5.innerHTML = `
                            <div>${row.targetAdvertiserId || ''}</div>
                            <div>${row.targetAdvertiserName || ''}</div>
                        `;
                        } else {
                            td5.textContent = '-';
                        }
                        td5.style.cssText = td1.style.cssText;
                        tr.appendChild(td5);

                        tbody.appendChild(tr);
                    });
                    tempTable.appendChild(tbody);

                    // 将表格添加到临时容器
                    const tempContainer = document.createElement('div');
                    tempContainer.style.cssText = `
                    position: absolute;
                    left: -9999px;
                    top: -9999px;
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                `;
                    tempContainer.appendChild(tempTable);
                    document.body.appendChild(tempContainer);

                    // 使用html2canvas生成图片
                    html2canvas(tempContainer, {
                        scale: 2,
                        backgroundColor: '#ffffff',
                        width: tempContainer.offsetWidth,
                        height: tempContainer.offsetHeight
                    }).then(canvas => {
                        this.tableImageUrl = canvas.toDataURL('image/png');
                        document.body.removeChild(tempContainer);
                    }).catch(error => {
                        document.body.removeChild(tempContainer);
                    });
                });
            } catch (error) {
            }
        },
        // 加载明细记录
        loadDetailRecords() {
            this.detailLoading = true;
            this.detailCurrent = 1;
            this.detailHasMore = true;

            getFundTransferRecordList({
                proId: this.oid,
                column: 'createTime',
                order: 'desc',
                pageNo: this.detailCurrent,
                pageSize: this.detailSize
            })
                .then(res => {
                    if (res && res.success) {
                        this.detailRecords = res.result && res.result.records ? res.result.records : [];
                        this.detailTotal = res.result && res.result.total ? res.result.total : 0;
                        this.detailHasMore = this.detailRecords.length >= this.detailSize;
                    } else {
                        this.detailRecords = [];
                        this.detailTotal = 0;
                        this.detailHasMore = false;
                        this.$message && this.$message.error(res.message || '获取明细记录失败');
                    }
                    this.detailLoading = false;
                })
                .catch(error => {
                    this.detailRecords = [];
                    this.detailTotal = 0;
                    this.detailHasMore = false;
                    this.detailLoading = false;
                    this.$message && this.$message.error('获取明细记录失败');
                });
        },
        // 获取实体名称
        getEntityName(record) {
            // 根据交易类型和账户信息获取实体名称
            if (record.tradeType === '1') { // 充值
                return record.targetAdvertiserName || record.targetAdvertiserId || '未知账户';
            } else if (record.tradeType === '2') { // 转账
                // 转账显示转出方和转入方
                const sourceName = record.sourceAdvertiserName || record.sourceAdvertiserId || '未知账户';
                const targetName = record.targetAdvertiserName || record.targetAdvertiserId || '未知账户';
                return `${sourceName} → ${targetName}`;
            } else if (record.tradeType === '3') { // 退款
                return record.targetAdvertiserName || record.targetAdvertiserId || '未知账户';
            } else {
                // 根据transferType判断
                if (record.transferType === '1') { // 转入
                    return record.targetAdvertiserName || record.targetAdvertiserId || '未知账户';
                } else if (record.transferType === '2') { // 转出
                    return record.sourceAdvertiserName || record.sourceAdvertiserId || '未知账户';
                } else {
                    return record.targetAdvertiserName || record.sourceAdvertiserName || '未知账户';
                }
            }
        },
        // 获取账户ID
        getAccountId(record) {
            // 根据交易类型获取对应的账户ID
            if (record.tradeType === '1') { // 充值
                return record.targetAdvertiserId || '未知';
            } else if (record.tradeType === '2') { // 转账
                // 转账显示转出方ID
                return record.sourceAdvertiserId || '未知';
            } else if (record.tradeType === '3') { // 退款
                return record.targetAdvertiserId || '未知';
            } else {
                // 根据transferType判断
                if (record.transferType === '1') { // 转入
                    return record.targetAdvertiserId || '未知';
                } else if (record.transferType === '2') { // 转出
                    return record.sourceAdvertiserId || '未知';
                } else {
                    return record.targetAdvertiserId || record.sourceAdvertiserId || '未知';
                }
            }
        },
        // 加载更多明细记录
        loadMoreDetailRecords() {
            if (!this.detailHasMore || this.detailLoadingMore) {
                return;
            }

            this.detailLoadingMore = true;
            this.detailCurrent += 1;

            getFundTransferRecordList({
                proId: this.proId,
                column: 'createTime',
                order: 'desc',
                pageNo: this.detailCurrent,
                pageSize: this.detailSize
            })
                .then(res => {
                    if (res && res.success) {
                        const newRecords = res.result && res.result.records ? res.result.records : [];
                        this.detailRecords = [...this.detailRecords, ...newRecords];
                        this.detailHasMore = newRecords.length >= this.detailSize;
                    } else {
                        this.detailCurrent -= 1; // 回退页码
                        this.$message && this.$message.error(res.message || '加载更多记录失败');
                    }
                    this.detailLoadingMore = false;
                })
                .catch(error => {
                    this.detailCurrent -= 1; // 回退页码
                    this.detailLoadingMore = false;
                    this.$message && this.$message.error('加载更多记录失败');
                });
        },
        // 明细记录滚动监听
        onDetailScroll(event) {
            const target = event.target;
            const scrollTop = target.scrollTop;
            const scrollHeight = target.scrollHeight;
            const clientHeight = target.clientHeight;

            // 滚动到底部时加载更多
            if (scrollTop + clientHeight >= scrollHeight - 50 && this.detailHasMore && !this.detailLoadingMore) {
                this.loadMoreDetailRecords();
            }
        },
        // 下载明细记录
        downloadDetailRecords() {
            this.$message && this.$message.info('下载功能开发中');
        },
        // 显示筛选弹窗
        showFilterModal() {
            this.$message && this.$message.info('筛选功能开发中');
        },
        // 点击明细项
        onDetailItemClick(record) {
            this.detailInfoRecord = record;
            this.showDetailInfoModal = true;
        },
        // 查看明细图片
        viewDetailImage(record) {
            this.generateDetailImage(record);
        },
        // 生成明细图片
        generateDetailImage(record) {

            // 检查记录数据是否完整
            if (!record) {
                this.$message && this.$message.error('记录数据为空');
                return;
            }

            this.$nextTick(() => {
                // 创建临时容器
                const tempContainer = document.createElement('div');
                tempContainer.style.cssText = `
                    position: absolute;
                    left: -9999px;
                    top: -9999px;
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    width: 900px;
                `;

                // 创建明细内容
                const detailContent = document.createElement('div');
                detailContent.style.cssText = `
                    border: 1px solid #e8e8e8;
                    border-radius: 8px;
                    padding: 16px;
                    background: white;
                `;

                // 创建标题
                const title = document.createElement('h3');
                title.textContent = '交易明细';
                title.style.cssText = `
                    margin: 0 0 20px 0;
                    font-size: 20px;
                    font-weight: bold;
                    color: #333;
                    text-align: center;
                    padding-bottom: 10px;
                `;
                detailContent.appendChild(title);

                // 创建表格
                const table = document.createElement('table');
                table.style.cssText = `
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                    margin-bottom: 16px;
                `;

                // 创建表头
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                headerRow.style.cssText = `
                    background-color: #f5f5f5;
                `;

                const headers = ['交易时间', '业务平台', '金额', '转入方', '转出方'];
                headers.forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    th.style.cssText = `
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: center;
                        font-weight: bold;
                        background-color: #f5f5f5;
                    `;
                    headerRow.appendChild(th);
                });

                thead.appendChild(headerRow);
                table.appendChild(thead);

                // 创建表格内容
                const tbody = document.createElement('tbody');

                // 创建数据行
                const dataRow = document.createElement('tr');
                dataRow.style.cssText = `
                    background-color: white;
                `;

                // 交易时间列
                const timeCell = document.createElement('td');
                timeCell.textContent = record.createTime;
                timeCell.style.cssText = `
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: center;
                    font-size: 14px;
                `;

                // 业务平台列
                const platformCell = document.createElement('td');
                platformCell.textContent = record.channelName || '-';
                platformCell.style.cssText = `
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: center;
                    font-size: 14px;
                `;

                // 金额列
                const amountCell = document.createElement('td');
                amountCell.textContent = `${record.amount}`;
                amountCell.style.cssText = `
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                `;

                // 转入方列
                const targetCell = document.createElement('td');
                if (record.targetAdvertiserId || record.targetAdvertiserName) {
                    targetCell.innerHTML = `
                        <div style="font-weight: bold; margin-bottom: 4px;">${record.targetAdvertiserName || '未知账户'}</div>
                        <div style="color: #666; font-size: 12px;">${record.targetAdvertiserId}</div>
                    `;
                } else {
                    targetCell.textContent = '-';
                }
                targetCell.style.cssText = `
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: center;
                `;

                // 转出方列
                const sourceCell = document.createElement('td');
                if (record.sourceAdvertiserId || record.sourceAdvertiserName) {
                    sourceCell.innerHTML = `
                        <div style="font-weight: bold; margin-bottom: 4px;">${record.sourceAdvertiserName || '未知账户'}</div>
                        <div style="color: #666; font-size: 12px;">${record.sourceAdvertiserId}</div>
                    `;
                } else {
                    sourceCell.textContent = '-';
                }
                sourceCell.style.cssText = `
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: center;
                `;

                // 将单元格添加到行中
                dataRow.appendChild(timeCell);
                dataRow.appendChild(platformCell);
                dataRow.appendChild(amountCell);
                dataRow.appendChild(targetCell);
                dataRow.appendChild(sourceCell);
                tbody.appendChild(dataRow);



                // 将表格添加到内容中
                table.appendChild(tbody);
                detailContent.appendChild(table);



                tempContainer.appendChild(detailContent);
                document.body.appendChild(tempContainer);

                // 使用html2canvas生成图片
                html2canvas(tempContainer, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    width: tempContainer.offsetWidth,
                    height: tempContainer.offsetHeight,
                    useCORS: true,
                    allowTaint: true
                }).then(canvas => {
                    const imageUrl = canvas.toDataURL('image/png');
                    document.body.removeChild(tempContainer);

                    // 显示图片弹窗
                    this.openDetailImageModal(imageUrl);
                }).catch(error => {
                    document.body.removeChild(tempContainer);
                    this.$message && this.$message.error('生成图片失败: ' + error.message);
                });
            });
        },
        // 显示明细图片弹窗
        openDetailImageModal(imageUrl) {
            this.detailImageUrl = imageUrl;
            this.showDetailImageModal = true;
        },
        downloadTableImage() {
            if (this.tableImageUrl) {
                const link = document.createElement('a');
                link.download = '交易记录.png';
                link.href = this.tableImageUrl;
                link.click();
            }
        },
        // 隐藏系统名称
        hideSystemName() {
            this.$nextTick(() => {
                const descElements = document.querySelectorAll('.desc');
                descElements.forEach(element => {
                    if (element.textContent.includes('云枢管理平台')) {
                        element.style.display = 'none';
                    }
                });
            });
        }
    },
};
</script>

<style scoped>
.workbench-container {
    width: 95%;
    max-width: 2400px;
    min-width: 600px;
    margin: 40px auto;
    padding: 40px 40px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
    .workbench-container {
        width: 100%;
        min-width: unset;
        padding: 20px 8px;
        max-width: 100vw;
    }

    .workbench-form-row {
        flex-direction: column;
        align-items: stretch;
        white-space: normal;
        gap: 8px;
    }

    .workbench-select,
    .workbench-detail-btn {
        width: 100%;
        min-width: unset;
        max-width: 100%;
    }

    .workbench-textarea {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        display: block;
    }
}

.workbench-title {
    color: #000000;
    font-family: 'WDXL Lubrifont SC Local', 'ZCOOL KuaiLe', 'ZCOOL XiaoWei', 'ZCOOL ShangWei', 'ZCOOL JianYi', 'ZCOOL QingKe HuangYou', 'Source Han Sans SC', 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', sans-serif;
    font-size: 2em;
    white-space: nowrap;
    position: relative;
    cursor: pointer;
    letter-spacing: 2px;
    font-weight: 500;
    letter-spacing: 1px;
}

.workbench-form {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.workbench-form-row {
    display: flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
    justify-content: space-between;
}

.workbench-select {
    min-width: 160px;
    padding: 8px 16px;
    font-size: 16px;
    border-radius: 4px;
    border: 1px solid #b7b7b9bb;
    white-space: nowrap;
}

.workbench-select:focus,
.workbench-textarea:focus {
    border-color: #40a9ff;
    outline: none;
    box-shadow: 0 0 0 2px #40a9ff22;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.workbench-detail-btn {
    margin-left: auto;
    min-width: 160px;
    white-space: nowrap;
    padding: 6px 16px;
    font-size: 14px;
    background: #fff;
    border: 1px solid #1890ff;
    color: #1890ff;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
}

.workbench-detail-btn:hover {
    background: #e6f7ff;
}

.workbench-label {
    margin-right: 4px;
}

.workbench-required {
    color: #ff4d4f;
    font-size: 18px;
    vertical-align: middle;
}

.workbench-textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 20px;
    font-size: 20px;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
    resize: vertical;
    min-width: 0;
    max-width: 100%;
}

.workbench-tip {
    color: #888;
    font-size: 14px;
    margin-bottom: 8px;
}

.workbench-submit-btn {
    width: 100%;
    padding: 16px 0;
    font-size: 20px;
    background: #1890ff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    margin-top: 16px;
    transition: background 0.2s;
    position: relative;
    opacity: 1;
}

.workbench-submit-btn[disabled] {
    background: #bfbfbf;
    cursor: not-allowed;
    opacity: 0.7;
}

.workbench-submit-btn:hover {
    background: #40a9ff;
}

.workbench-error-msg {
    color: #414040;
    margin-top: 12px;
    font-size: 18px;
    font-weight: bold;
    text-align: left;
    white-space: pre-line;
    background: rgba(239, 241, 239, 0.822);
    border: 1px solid #eff0ee;
    border-radius: 4px;
    padding: 12px;
    line-height: 1.5;
}

/* 新增的样式 */
.transaction-table-container {
    margin-top: 20px;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 4px;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.download-btn {
    padding: 8px 12px;
    font-size: 14px;
    background: #1890ff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    gap: 5px;
}

.download-btn:hover {
    background: #40a9ff;
}

.table-title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
}

.table-wrapper {
    /* 去掉滚动条，确保完整显示 */
    overflow: visible;
}

.table-canvas {
    width: 100%;
    height: 100%;
    display: none;
    /* 默认隐藏 */
}

.transaction-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    /* 去掉滚动条 */
    overflow: visible;
    /* 确保表格完整显示 */
    table-layout: fixed;
}

.transaction-table th,
.transaction-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
    /* 允许文字换行，确保内容完整显示 */
    white-space: normal;
    word-wrap: break-word;
    word-break: break-all;
    vertical-align: middle;
}

.transaction-table td div {
    line-height: 1.4;
    margin: 2px 0;
}

.transaction-table th {
    background-color: #f2f2f2;
    font-weight: bold;
}

.transaction-table tbody tr:nth-child(even) {
    background-color: #f9f9f9;
}

.transaction-table tbody tr:hover {
    background-color: #e9e9e9;
}

/* 图片显示样式 */
.table-image-wrapper {
    text-align: center;
    margin: 20px 0;
}

.table-image {
    max-width: 100%;
    height: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-image:hover {
    transform: scale(1.02);
}

.table-loading {
    padding: 40px;
    color: #666;
    font-size: 16px;
}

/* 弹窗样式 */
.image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    max-width: 90%;
    max-height: 90%;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.close-btn:hover {
    background-color: #f0f0f0;
}

.modal-body {
    padding: 20px;
    text-align: center;
    max-height: calc(90vh - 100px);
    overflow: auto;
}

.modal-image {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
}

/* 明细记录弹窗样式 */
.detail-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.detail-modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    max-height: 90%;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.detail-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
}

.detail-modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.header-actions .download-btn,
.header-actions .filter-btn {
    background: none;
    border: none;
    color: #1890ff;
    font-size: 14px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.header-actions .download-btn:hover,
.header-actions .filter-btn:hover {
    background-color: #f0f0f0;
}

.detail-modal-body {
    padding: 20px;
    max-height: calc(90vh - 100px);
    overflow-y: auto;
}

.detail-loading {
    text-align: center;
    padding: 40px;
    color: #666;
}

.loading-spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #1890ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.detail-empty {
    text-align: center;
    padding: 40px;
    color: #999;
    font-size: 16px;
}

.detail-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: white;
    transition: all 0.2s;
    cursor: pointer;
}

.detail-item:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.detail-item-highlight {
    border: 2px solid #ff4d4f;
    background: #fff2f0;
}

.detail-item-main {
    flex: 1;
    min-width: 0;
}

.detail-section {
    margin-bottom: 12px;
}

.detail-section-title {
    font-size: 14px;
    font-weight: bold;
    color: #666;
    margin-right: 8px;
}

.detail-entity-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
}

.detail-direction {
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: bold;
}

.transfer-in {
    color: #52c41a;
    margin-right: 8px;
}

.transfer-out {
    color: #ff4d4f;
    margin-right: 8px;
}

.entity-name {
    color: #333;
}

.detail-account-id {
    color: #666;
    font-size: 14px;
    margin-bottom: 4px;
}

.detail-time {
    color: #999;
    font-size: 12px;
}

.detail-item-right {
    text-align: right;
    min-width: 120px;
}

.detail-amount {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
}

.detail-status {
    font-size: 14px;
    margin-bottom: 8px;
}

.detail-status.success {
    color: #52c41a;
}

.detail-status.processing {
    color: #faad14;
}

.detail-status.failed {
    color: #ff4d4f;
}

.view-image-btn {
    background: #1890ff;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
    margin-bottom: 4px;
    position: relative;
    z-index: 10;
}

.view-image-btn:hover {
    background: #40a9ff;
}



.detail-label {
    color: #999;
    font-size: 12px;
}

/* 加载更多样式 */
.load-more-section {
    text-align: center;
    padding: 20px;
    border-top: 1px solid #f0f0f0;
}

.loading-more {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 14px;
}

.loading-more .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #1890ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.load-more-tip {
    color: #999;
    font-size: 14px;
}

/* 明细详情弹窗样式 */
.detail-info-content {
    text-align: left;
}

.detail-info-section {
    margin-bottom: 24px;
}

.detail-info-section h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: bold;
    color: #333;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
}

.detail-info-row {
    display: flex;
    margin-bottom: 8px;
    line-height: 1.5;
}

.detail-info-label {
    min-width: 100px;
    color: #666;
    font-size: 14px;
}

.detail-info-value {
    flex: 1;
    color: #333;
    font-size: 14px;
    word-break: break-all;
}

.detail-info-value.amount {
    font-size: 16px;
    font-weight: bold;
    color: #1890ff;
}

.detail-info-value.status {
    font-weight: bold;
}

.detail-info-value.status.success {
    color: #52c41a;
}

.detail-info-value.status.processing {
    color: #faad14;
}

.detail-info-value.status.failed {
    color: #ff4d4f;
}

.detail-info-value.error {
    color: #ff4d4f;
    background: #fff2f0;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #ffccc7;
}
</style>