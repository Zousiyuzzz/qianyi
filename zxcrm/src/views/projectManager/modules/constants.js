// 操作类型常量
export const ACTION_TYPES = {
    SET_CREDIT_LIMIT: '设置授信额度',
    ADJUST_CREDIT: '调整授信',
    PUBLIC_RESERVE: '对公备款',
    PRIVATE_RESERVE: '对私备款',
    QUERY_CUSTOMER_BALANCE: '查询客户余额',
    QUERY_ACCOUNT_BALANCE: '查询账户余额',
    QUERY_WALLET_BALANCE: '查询钱包余额',
    RECHARGE_TEMPLATE: '充值模板',
    REFUND_TEMPLATE: '退款模板',
    TRANSFER_SINGLE_TEMPLATE: '转账模板(单笔)',
    TRANSFER_BATCH_TEMPLATE: '转账模板(批量)',
    WALLET_RECHARGE_TEMPLATE: '钱包充值模板',
    WALLET_REFUND_TEMPLATE: '钱包退款模板',
    SUB_PORT_PUBLIC_RECHARGE: '子端口对公充值',
    SUB_PORT_PRIVATE_RECHARGE: '子端口对私充值'
};

// 消息类型常量
export const MESSAGE_TYPES = {
    QUERY_ACCOUNT_BALANCE: '查询账户余额',
    QUERY_CUSTOMER_BALANCE: '查询客户余额',
    RECHARGE: '充值',
    REFUND: '退款',
    TRANSFER_OUT: '转出',
    TRANSFER: '转账',
    QUERY_WALLET_BALANCE: '查询钱包余额',
    SUB_PORT_RECHARGE: '子端口充值',
    PROJECT_TRANSFER: '项目划转'
};

// 状态映射
export const STATE_MAP = {
    '1': '成功',
    '2': '处理中',
    '3': '失败',
    '4': '已取消',
    '5': '交易异常'
};

// 交易类型映射
export const TRADE_TYPE_MAP = {
    '1': '充值',
    '2': '转账',
    '3': '退款'
};

// 资金性质映射
export const FUNDS_NATURE_MAP = {
    '1': '对公',
    '2': '对私'
};

// 渠道名称映射
export const CHANNEL_NAME_MAP = {
    KS: '快手',
    DY: '抖音',
    TX: '腾讯'
};

// 显示表格的消息类型
export const SHOW_TABLE_MESSAGES = ['充值', '退款', '转出', '转账', '子端口充值'];

// 分页配置
export const PAGINATION_CONFIG = {
    DEFAULT_PAGE_SIZE: 10,
    SCROLL_THRESHOLD: 50
};

// 防抖配置
export const THROTTLE_CONFIG = {
    SUBMIT_INTERVAL: 1000 // 提交间隔1秒
};

// 图片生成配置
export const IMAGE_CONFIG = {
    SCALE: 2,
    BACKGROUND_COLOR: '#ffffff',
    QUALITY: 0.9
};
