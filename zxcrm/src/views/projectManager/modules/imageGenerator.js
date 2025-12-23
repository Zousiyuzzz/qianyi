import html2canvas from 'html2canvas';
import { IMAGE_CONFIG } from './constants';

/**
 * 生成交易记录表格图片
 * @param {Array} records - 交易记录数组
 * @returns {Promise<string>} 图片的base64数据URL
 */
export async function generateTableImage(records) {
    try {
        if (!records || records.length === 0) {
            throw new Error('没有交易记录数据');
        }

        const tableElement = createTransactionTable(records);
        document.body.appendChild(tableElement);

        const canvas = await html2canvas(tableElement, {
            ...IMAGE_CONFIG,
            backgroundColor: '#ffffff',
            scale: 2,
            width: tableElement.offsetWidth,
            height: tableElement.offsetHeight
        });

        document.body.removeChild(tableElement);
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('生成表格图片失败:', error);
        throw error;
    }
}

/**
 * 生成明细记录图片
 * @param {Object} record - 明细记录对象
 * @returns {Promise<string>} 图片的base64数据URL
 */
export async function generateDetailImage(record) {
    try {
        if (!record) {
            throw new Error('没有明细记录数据');
        }

        const detailElement = createDetailContent(record);
        document.body.appendChild(detailElement);

        const canvas = await html2canvas(detailElement, {
            ...IMAGE_CONFIG,
            backgroundColor: '#ffffff',
            scale: 2,
            width: detailElement.offsetWidth,
            height: detailElement.offsetHeight
        });

        document.body.removeChild(detailElement);
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('生成明细图片失败:', error);
        throw error;
    }
}

/**
 * 创建交易记录表格元素
 * @param {Array} records - 交易记录数组
 * @returns {HTMLElement} 表格元素
 */
function createTransactionTable(records) {
    const container = document.createElement('div');
    container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        min-width: 800px;
    `;

    const title = document.createElement('h2');
    title.textContent = '交易记录';
    title.style.cssText = `
        margin: 0 0 20px 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
        text-align: center;
    `;
    container.appendChild(title);

    const table = document.createElement('table');
    table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    `;

    // 表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['序号', '账户', '渠道', '交易类型', '金额', '状态', '时间'];

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.cssText = `
            padding: 12px 8px;
            background: #f5f5f5;
            border: 1px solid #ddd;
            text-align: center;
            font-weight: 600;
            color: #333;
        `;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 表体
    const tbody = document.createElement('tbody');
    records.forEach((record, index) => {
        const row = document.createElement('tr');
        row.style.cssText = `
            background: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'};
        `;

        const cells = [
            index + 1,
            record.account || '-',
            record.channel || '-',
            record.tradeType || '-',
            formatAmount(record.amount),
            getStateText(record.state),
            formatTime(record.createTime)
        ];

        cells.forEach(cellText => {
            const td = document.createElement('td');
            td.textContent = cellText;
            td.style.cssText = `
                padding: 10px 8px;
                border: 1px solid #ddd;
                text-align: center;
                color: #333;
            `;
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);

    return container;
}

/**
 * 创建明细记录内容元素
 * @param {Object} record - 明细记录对象
 * @returns {HTMLElement} 明细内容元素
 */
function createDetailContent(record) {
    const container = document.createElement('div');
    container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        min-width: 600px;
        max-width: 800px;
    `;

    const title = document.createElement('h2');
    title.textContent = '交易明细';
    title.style.cssText = `
        margin: 0 0 30px 0;
        color: #333;
        font-size: 20px;
        font-weight: 600;
        text-align: center;
        border-bottom: 2px solid #1890ff;
        padding-bottom: 10px;
    `;
    container.appendChild(title);

    const details = [
        { label: '交易ID', value: record.id || '-' },
        { label: '账户', value: record.account || '-' },
        { label: '渠道', value: record.channel || '-' },
        { label: '交易类型', value: record.tradeType || '-' },
        { label: '金额', value: formatAmount(record.amount) },
        { label: '状态', value: getStateText(record.state) },
        { label: '创建时间', value: formatTime(record.createTime) },
        { label: '更新时间', value: formatTime(record.updateTime) },
        { label: '备注', value: record.remark || '-' }
    ];

    details.forEach(detail => {
        const row = document.createElement('div');
        row.style.cssText = `
            display: flex;
            margin-bottom: 15px;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 10px;
        `;

        const label = document.createElement('div');
        label.textContent = detail.label + '：';
        label.style.cssText = `
            width: 120px;
            font-weight: 600;
            color: #666;
            flex-shrink: 0;
        `;

        const value = document.createElement('div');
        value.textContent = detail.value;
        value.style.cssText = `
            flex: 1;
            color: #333;
            word-break: break-all;
        `;

        row.appendChild(label);
        row.appendChild(value);
        container.appendChild(row);
    });

    return container;
}

/**
 * 格式化金额
 * @param {number|string} amount - 金额
 * @returns {string} 格式化后的金额
 */
function formatAmount(amount) {
    if (amount === null || amount === undefined || amount === '') {
        return '-';
    }

    const num = parseFloat(amount);
    if (isNaN(num)) {
        return amount.toString();
    }

    return num.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * 格式化时间
 * @param {string|number} time - 时间戳或时间字符串
 * @returns {string} 格式化后的时间
 */
function formatTime(time) {
    if (!time) {
        return '-';
    }

    try {
        const date = new Date(time);
        if (isNaN(date.getTime())) {
            return time.toString();
        }

        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        return time.toString();
    }
}

/**
 * 获取状态文本
 * @param {string} state - 状态码
 * @returns {string} 状态文本
 */
function getStateText(state) {
    const stateMap = {
        '0': '失败',
        '1': '成功',
        '2': '处理中'
    };
    return stateMap[state] || '未知';
}
