/**
 * 将颜色值转换为 RGB 值
 * @param {string} color - 颜色值，支持 #fff、#ffffff、rgb(255, 255, 255)
 * @returns {{r: number, g: number, b: number}} RGB 值
 */
export function convertToRGBA(color) {
  // 处理 HEX 格式：#fff 或 #ffffff
  if (color.startsWith('#')) {
    const hex = color.slice(1).replace(/^([0-9A-F]{3})$/i, (match) => {
      return match.split('').map(c => c + c).join('')
    })
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return { r, g, b }
  }
  // 处理 RGB 格式：rgb(255, 255, 255)
  else if (color.startsWith('rgb')) {
    const parts = color.match(/(\d+),\s*(\d+),\s*(\d+)/)
    if (parts) {
      const [, r, g, b] = parts
      return { r: parseInt(r), g: parseInt(g), b: parseInt(b) }
    }
  }
  // 默认返回白色
  return { r: 255, g: 255, b: 255 }
}

