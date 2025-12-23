export function formatNumberWithCommas(number) {
    // 处理整数和小数部分
    const parts = number.toString().split('.');
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

    // 添加千分位逗号
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return integerPart + decimalPart;
}