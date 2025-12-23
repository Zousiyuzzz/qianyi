import {
    STATE_MAP,
    TRADE_TYPE_MAP,
    FUNDS_NATURE_MAP,
    CHANNEL_NAME_MAP,
    MESSAGE_TYPES,
    SHOW_TABLE_MESSAGES
} from './constants';

/**
 * 统一的API响应解析函数
 * @param {Object} res API响应
 * @param {string} selectedAction 选中的操作类型
 * @returns {Object} 解析结果
 */
export function parseApiResponse(res, selectedAction) {
    try {
        if (res && res.success) {
            // 处理授信相关操作
            if (res.message === '设置授信额度' || res.message === '调整授信') {
                return {
                    errorMsg: parseCreditLimitResult(res.result),
                    currentRecord: []
                };
            }

            // 处理备款操作
            if (res.message === '备款') {
                return {
                    errorMsg: parseReserveResult(res.result),
                    currentRecord: []
                };
            }

            if (res.result && Array.isArray(res.result)) {
                // 优先通用错误解析
                const commonError = parseCommonErrorResult(res.result);
                if (commonError) {
                    return {
                        errorMsg: commonError,
                        currentRecord: []
                    };
                } else if (res.message) {
                    // 对于需要显示表格的操作
                    const shouldShowTable = SHOW_TABLE_MESSAGES.includes(res.message);

                    return {
                        errorMsg: parseResultByMessageType(res.message, res.result),
                        currentRecord: shouldShowTable ? res.result : []
                    };
                } else if (isQueryAction(selectedAction)) {
                    return {
                        errorMsg: parseResultByMessageType(res.message, res.result),
                        currentRecord: []
                    };
                } else {
                    return {
                        errorMsg: parseResponseData(res.result),
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
    } catch (error) {
        console.error('解析API响应失败:', error);
        return {
            errorMsg: '解析响应数据失败',
            currentRecord: []
        };
    }
}

/**
 * 判断是否为查询操作
 */
function isQueryAction(action) {
    const queryActions = [
        '查询客户余额',
        '查询账户余额',
        '查询钱包余额',
        '子端口充值',
        '项目划转'
    ];
    return queryActions.includes(action);
}

/**
 * 根据消息类型解析结果
 */
export function parseResultByMessageType(message, data) {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            return '返回数据格式错误';
        }

        switch (message) {
            case MESSAGE_TYPES.QUERY_ACCOUNT_BALANCE:
                return parseCustomerBalanceResult(data);
            case MESSAGE_TYPES.QUERY_CUSTOMER_BALANCE:
                return parseClientBalanceResult(data);
            case MESSAGE_TYPES.RECHARGE:
                return parseRechargeResult(data);
            case MESSAGE_TYPES.REFUND:
                return parseRefundResult(data);
            case MESSAGE_TYPES.TRANSFER_OUT:
            case MESSAGE_TYPES.TRANSFER:
                return parseTransferResult(data, message);
            case MESSAGE_TYPES.QUERY_WALLET_BALANCE:
                return parseWalletBalanceResult(data);
            case MESSAGE_TYPES.SUB_PORT_RECHARGE:
                return parseSubPortRechargeResult(data);
            case MESSAGE_TYPES.PROJECT_TRANSFER:
                return parseProjectTransferResult(data);
            default:
                return JSON.stringify(data[0], null, 2);
        }
    } catch (error) {
        console.error('解析结果失败:', error);
        return '解析结果失败';
    }
}

/**
 * 解析客户余额返回的数据
 */
export function parseCustomerBalanceResult(data) {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            return '返回数据格式错误';
        }

        const result = data[0];

        // 错误信息优先展示
        if (result.msg && !isSuccessMessage(result.msg)) {
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
    } catch (error) {
        console.error('解析客户余额失败:', error);
        return '解析客户余额失败';
    }
}

/**
 * 解析客户余额返回的数据（查询客户余额）
 */
export function parseClientBalanceResult(data) {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            return '返回数据格式错误';
        }

        const result = data[0];

        return [
            '【客户余额查询结果】',
            `客户唯一标识：${result['id'] || '-'}`,
            `授信总额度：${parseFloat(result['totalCreditLimit'] || 0).toFixed(3)} 元`,
            `可用余额：${parseFloat(result['availablebBalance'] || 0).toFixed(3)} 元`,
            `对公余额：${parseFloat((result['publicCashReserves'] - result['publicCreditArrears']) || 0).toFixed(3)} 元`,
            `对私余额：${parseFloat((result['privateCashReserve'] - result['privateCreditArrears']) || 0).toFixed(3)} 元`,
        ].join('\n');
    } catch (error) {
        console.error('解析客户余额失败:', error);
        return '解析客户余额失败';
    }
}

/**
 * 解析充值结果
 */
export function parseRechargeResult(data) {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            return '返回数据格式错误';
        }

        const result = data[0];
        const stateText = getStateText(result.state);
        const fundsNatureText = getFundsNatureText(result.fundsNature);
        const mediaName = extractMediaName(result.channelName);

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
    } catch (error) {
        console.error('解析充值结果失败:', error);
        return '解析充值结果失败';
    }
}

/**
 * 解析退款结果
 */
export function parseRefundResult(data) {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            return '返回数据格式错误';
        }

        const result = data[0];
        const stateText = getStateText(result.state);
        const fundsNatureText = getFundsNatureText(result.fundsNature);
        const mediaName = extractMediaName(result.channelName);

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
    } catch (error) {
        console.error('解析退款结果失败:', error);
        return '解析退款结果失败';
    }
}

/**
 * 解析转账/转出结果
 */
export function parseTransferResult(data, message) {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            return '返回数据格式错误';
        }

        const formattedResults = [];

        data.forEach((result, index) => {
            const stateText = getStateText(result.state);
            const mediaName = extractMediaName(result.channelName);

            const lines = [
                `【${message}结果—${stateText}】`,
                `媒体：${mediaName}`,
                `转入方：${result.targetAdvertiserId},${result.targetAdvertiserName}`,
                `转出方：${result.sourceAdvertiserId},${result.sourceAdvertiserName}`,
                `转账金额 ${parseFloat(result.amount || 0).toFixed(3)}，${stateText}`,
                `交易批次号：${result.batchNumber}`,
                `交易完成时间：${result.createTime}`
            ];

            if (result.state === '3' && result.errMsg) {
                lines.push(`失败原因：${result.errMsg}`);
            }

            formattedResults.push(lines.join('\n'));
        });

        return formattedResults.join('\n\n');
    } catch (error) {
        console.error('解析转账结果失败:', error);
        return '解析转账结果失败';
    }
}

/**
 * 解析查询钱包余额
 */
export function parseWalletBalanceResult(data) {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            return '返回数据格式错误';
        }

        const formattedResults = [];

        data.forEach((result, index) => {
            const lines = [
                `渠道：${CHANNEL_NAME_MAP[result.msg] || '该钱包未绑定'}`,
                `钱包名称：${result.walletName}`,
                `钱包ID：${result.walletId}`,
                `总余额：${result.totalBalance || 0}`
            ];

            formattedResults.push(lines.join('\n'));
        });

        return formattedResults.join('\n\n');
    } catch (error) {
        console.error('解析钱包余额失败:', error);
        return '解析钱包余额失败';
    }
}

/**
 * 解析子端口充值结果
 */
export function parseSubPortRechargeResult(data) {
    try {
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
    } catch (error) {
        console.error('解析子端口充值结果失败:', error);
        return '解析子端口充值结果失败';
    }
}

/**
 * 解析项目划转结果
 */
export function parseProjectTransferResult(data) {
    try {
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
    } catch (error) {
        console.error('解析项目划转结果失败:', error);
        return '解析项目划转结果失败';
    }
}

/**
 * 解析授信额度/调整授信结果
 */
export function parseCreditLimitResult(result) {
    try {
        return [
            `【设置授信额度成功】`,
            `客户唯一标识：${result.proId || '-'}`,
            `授信额度：${parseFloat(result.money || 0).toFixed(3)}`,
            `可用金额：${parseFloat(result.availableCreditBalance || 0).toFixed(3)}`,
            `授信总额度：${parseFloat(result.totalCreditLimit || 0).toFixed(3)}`,
            `授信时间：${result.updateTime || '-'}`,
        ].join('\n');
    } catch (error) {
        console.error('解析授信结果失败:', error);
        return '解析授信结果失败';
    }
}

/**
 * 解析备款结果
 */
export function parseReserveResult(result) {
    try {
        return [
            `【备款成功】`,
            `客户唯一标识：${result.proId || '-'}`,
            `备款金额：${parseFloat(result.money || 0).toFixed(3)}`,
            `对公余额：${parseFloat(result.publicCashReserves || 0).toFixed(3)}`,
            `对私余额：${parseFloat(result.privateCashReserve || 0).toFixed(3)}`,
            `备款时间：${result.updateTime || '-'}`,
        ].join('\n');
    } catch (error) {
        console.error('解析备款结果失败:', error);
        return '解析备款结果失败';
    }
}

/**
 * 通用错误解析
 */
export function parseCommonErrorResult(data) {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            return null;
        }

        const errorMsgs = data.filter(result => {
            if (!result.msg) return false;
            const msg = result.msg.toLowerCase();
            return !isSuccessMessage(msg);
        }).map(result => [
            '【操作失败】',
            `广告主ID：${result.advertiserId || '-'}`,
            `失败原因：${result.msg}`
        ].join('\n'));

        if (errorMsgs.length > 0) {
            return errorMsgs.join('\n\n');
        }

        return null;
    } catch (error) {
        console.error('解析通用错误失败:', error);
        return null;
    }
}

/**
 * 解析返回的数据
 */
export function parseResponseData(data) {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            return '返回数据格式错误';
        }

        const result = data[0];
        const tradeTypeText = getTradeTypeText(result.tradeType);
        const stateText = getStateText(result.state);
        const fundsNatureText = getFundsNatureText(result.fundsNature);

        let lines = [];
        lines.push(`【${tradeTypeText}结果—${stateText}${data.length}笔】`);

        if (result.tradeType === '1') { // 充值
            const mediaName = extractMediaName(result.channelName);
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
            const mediaName = extractMediaName(result.channelName);
            lines.push(`媒体：${mediaName}`);
            lines.push(`${result.sourceAdvertiserId}，${result.sourceAdvertiserName || ''}，${fundsNatureText} ${((result.rebateNum || 0) * 100).toFixed(2)}%，退款金额 ${parseFloat(result.amount || 0).toFixed(3)}，${stateText}`);
            lines.push(`退款成功总账户币：${parseFloat(result.amount || 0).toFixed(3)}`);
            lines.push(`总增加金额：${parseFloat(result.changeMoney || 0).toFixed(3)} 元`);
            lines.push(`对公余额：${parseFloat(result.publicBalance || 0).toFixed(3)} 元`);
            lines.push(`对私余额：${parseFloat(result.privateBalance || 0).toFixed(3)} 元`);
            lines.push(`交易批次号：${result.batchNumber}`);
            lines.push(`交易完成时间：${result.createTime}`);
        }

        if (result.state === '3' && result.errMsg) {
            lines.push(`失败原因：${result.errMsg}`);
        }

        return lines.join('\n');
    } catch (error) {
        console.error('解析响应数据失败:', error);
        return '解析响应数据失败';
    }
}

// 工具函数
export function getStateText(state) {
    return STATE_MAP[state] || state;
}

export function getTradeTypeText(tradeType) {
    return TRADE_TYPE_MAP[tradeType] || tradeType;
}

export function getFundsNatureText(fundsNature) {
    return FUNDS_NATURE_MAP[fundsNature] || fundsNature;
}

export function extractMediaName(channelName) {
    return channelName ? channelName.split('-')[0] : '';
}

export function isSuccessMessage(msg) {
    const successMessages = ['ok', 'success', 'ks', 'dy', 'tx'];
    return successMessages.includes(msg.toLowerCase()) || msg === "该钱包未绑定";
}
