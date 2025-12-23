/**
 * 文本清理工具
 * 用于处理从微信等应用复制过来的文本中的特殊字符
 */

/**
 * 清理文本中的特殊字符，特别是微信复制时产生的数字空格字符
 * @param {string} text - 需要清理的文本
 * @returns {string} - 清理后的文本
 */
export function cleanSpecialCharacters(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    // 替换各种类型的空格字符为普通空格
    // 包括：数字空格(U+2007)、不间断空格(U+00A0)、全角空格(U+3000)等
    let cleanedText = text
        .replace(/[\u2007\u00A0\u3000\u2000-\u200F\u2028-\u202F\u205F-\u206F]/g, ' ')
        // 替换多个连续空格为单个空格
        .replace(/\s+/g, ' ')
        // 去除首尾空格
        .trim();

    return cleanedText;
}

/**
 * 专门用于清理充值指令中的特殊字符
 * @param {string} command - 充值指令文本
 * @returns {string} - 清理后的指令
 */
export function cleanRechargeCommand(command) {
    if (!command || typeof command !== 'string') {
        return command;
    }

    // 先进行基础清理
    let cleanedCommand = cleanSpecialCharacters(command);

    // 针对充值指令的特殊处理
    // 确保数字之间只有一个空格
    cleanedCommand = cleanedCommand.replace(/(\d+)\s+(\d+)/g, '$1 $2');

    return cleanedCommand;
}

/**
 * 检测文本中是否包含特殊字符
 * @param {string} text - 需要检测的文本
 * @returns {boolean} - 是否包含特殊字符
 */
export function hasSpecialCharacters(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }

    // 检测各种特殊空格字符
    const specialCharRegex = /[\u2007\u00A0\u3000\u2000-\u200F\u2028-\u202F\u205F-\u206F]/;
    return specialCharRegex.test(text);
}

/**
 * 获取文本中特殊字符的详细信息
 * @param {string} text - 需要分析的文本
 * @returns {Array} - 特殊字符信息数组
 */
export function getSpecialCharacterInfo(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const specialChars = [];
    const specialCharRegex = /[\u2007\u00A0\u3000\u2000-\u200F\u2028-\u202F\u205F-\u206F]/g;
    let match;

    while ((match = specialCharRegex.exec(text)) !== null) {
        const char = match[0];
        const charCode = char.charCodeAt(0);
        const position = match.index;

        specialChars.push({
            character: char,
            charCode: charCode,
            position: position,
            unicode: `U+${charCode.toString(16).toUpperCase().padStart(4, '0')}`,
            description: getCharacterDescription(charCode)
        });
    }

    return specialChars;
}

/**
 * 获取字符描述
 * @param {number} charCode - 字符编码
 * @returns {string} - 字符描述
 */
function getCharacterDescription(charCode) {
    const descriptions = {
        0x2007: '数字空格 (FIGURE SPACE)',
        0x00A0: '不间断空格 (NON-BREAKING SPACE)',
        0x3000: '全角空格 (IDEOGRAPHIC SPACE)',
        0x2000: 'EN QUAD',
        0x2001: 'EM QUAD',
        0x2002: 'EN SPACE',
        0x2003: 'EM SPACE',
        0x2004: 'THREE-PER-EM SPACE',
        0x2005: 'FOUR-PER-EM SPACE',
        0x2006: 'SIX-PER-EM SPACE',
        0x2008: 'PUNCTUATION SPACE',
        0x2009: 'THIN SPACE',
        0x200A: 'HAIR SPACE',
        0x200B: 'ZERO WIDTH SPACE',
        0x200C: 'ZERO WIDTH NON-JOINER',
        0x200D: 'ZERO WIDTH JOINER',
        0x200E: 'LEFT-TO-RIGHT MARK',
        0x200F: 'RIGHT-TO-LEFT MARK',
        0x2028: 'LINE SEPARATOR',
        0x2029: 'PARAGRAPH SEPARATOR',
        0x202A: 'LEFT-TO-RIGHT EMBEDDING',
        0x202B: 'RIGHT-TO-LEFT EMBEDDING',
        0x202C: 'POP DIRECTIONAL FORMATTING',
        0x202D: 'LEFT-TO-RIGHT OVERRIDE',
        0x202E: 'RIGHT-TO-LEFT OVERRIDE',
        0x202F: 'NARROW NO-BREAK SPACE',
        0x205F: 'MEDIUM MATHEMATICAL SPACE',
        0x2060: 'WORD JOINER',
        0x2061: 'FUNCTION APPLICATION',
        0x2062: 'INVISIBLE TIMES',
        0x2063: 'INVISIBLE SEPARATOR',
        0x2064: 'INVISIBLE PLUS',
        0x2065: 'INVISIBLE COMMA',
        0x2066: 'LEFT-TO-RIGHT ISOLATE',
        0x2067: 'RIGHT-TO-LEFT ISOLATE',
        0x2068: 'FIRST STRONG ISOLATE',
        0x2069: 'POP DIRECTIONAL ISOLATE'
    };

    return descriptions[charCode] || `未知字符 (U+${charCode.toString(16).toUpperCase().padStart(4, '0')})`;
}
