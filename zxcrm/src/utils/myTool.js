import { cmbAmountTypeEnum } from './enum';

// 6位数时间格式化为hh:mm:ss
export const formatTime = text => text.toString().padStart(6, '0').replace(/(\d{2})(\d{2})(\d{2})/, "$1:$2:$3");

// 解析招商银行借贷码
export const parseCmbDebitCreditCode = code => {
    //借贷码（C贷方，D借方）
    if (code === 'C') {
        return '贷方';
    } else if (code === 'D') {
        return '借方';
    }
}

export const parseCmbAmountType = code => {
    return cmbAmountTypeEnum[code] || '未知类型';
}