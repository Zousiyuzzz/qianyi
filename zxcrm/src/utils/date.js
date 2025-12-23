/**
 * 日期格式化工具函数
 * @param {string} format - 日期格式，例如 'YYYY-MM-DD'
 * @param {Date|string|number} [date=new Date()] - 可选，日期对象、时间戳或日期字符串
 * @returns {string} 格式化后的日期字符串
 */
// YYYY-MM-DD hh:mm:ss 
export function formatDate(format = 'YYYY-MM-DD', date = new Date()) {
    // 如果date是数字或字符串，转换为Date对象
    if (typeof date === 'number' || typeof date === 'string') {
        date = new Date(date);
    }

    // 确保date是有效的Date对象
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        date = new Date();
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 替换格式标记
    return format
        .replace(/YYYY/g, year)
        .replace(/MM/g, month)
        .replace(/DD/g, day)
        .replace(/HH/g, hours)
        .replace(/mm/g, minutes)
        .replace(/ss/g, seconds);
}