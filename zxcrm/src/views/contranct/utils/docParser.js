import mammoth from 'mammoth'
import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'

/**
 * DOCX 转纯文本
 */
export async function docxToText(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()

    // 验证文件格式
    if (!isValidDocx(arrayBuffer)) {
      return {
        text: '',
        messages: [],
        success: false,
        error: '文件不是有效的 DOCX 格式。请确保文件已正确转换为 DOCX 格式（使用 Word 或其他工具转换），而不是简单的重命名。'
      }
    }

    const { value: text, messages } = await mammoth.extractRawText({ arrayBuffer })
    return { text, messages, success: true }
  } catch (error) {
    console.error('DOCX 解析失败:', error)
    let errorMessage = error.message || '文档解析失败'

    // 提供更友好的错误提示
    if (errorMessage.includes('end of central directory') || errorMessage.includes('zip file')) {
      errorMessage = '文件不是有效的 DOCX 格式。请确保文件已正确转换为 DOCX 格式（使用 Word 或其他工具转换），而不是简单的重命名。'
    }

    return { text: '', messages: [], success: false, error: errorMessage }
  }
}

/**
 * 验证文件是否是有效的 DOCX 格式
 */
function isValidDocx(arrayBuffer) {
  // DOCX 文件是 ZIP 格式，前4个字节应该是 ZIP 文件头：50 4B 03 04 (PK\x03\x04)
  const uint8Array = new Uint8Array(arrayBuffer.slice(0, 4))
  const zipHeader = [0x50, 0x4B, 0x03, 0x04] // PK\x03\x04
  return uint8Array[0] === zipHeader[0] &&
    uint8Array[1] === zipHeader[1] &&
    uint8Array[2] === zipHeader[2] &&
    uint8Array[3] === zipHeader[3]
}

/**
 * DOCX 转段落数组（更精确的解析）
 */
export async function docxToParagraphs(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()

    // 验证文件格式
    if (!isValidDocx(arrayBuffer)) {
      return {
        paragraphs: [],
        success: false,
        error: '文件不是有效的 DOCX 格式。请确保文件已正确转换为 DOCX 格式，而不是简单的重命名。'
      }
    }

    const zip = await JSZip.loadAsync(arrayBuffer)

    // 检查是否包含 word/document.xml
    const documentXml = zip.file('word/document.xml')
    if (!documentXml) {
      return {
        paragraphs: [],
        success: false,
        error: 'DOCX 文件结构不完整，缺少 word/document.xml 文件。'
      }
    }

    const xml = await documentXml.async('string')

    const parser = new XMLParser({ ignoreAttributes: false })
    const doc = parser.parse(xml)

    // 取段落：w:document -> w:body -> w:p
    const document = doc['w:document']
    const body = document && document['w:body']
    const ps = body && body['w:p'] ? (Array.isArray(body['w:p']) ? body['w:p'] : [body['w:p']]) : []

    const paragraphs = ps.map(p => {
      // w:r 里可能多个 w:t
      const runs = p['w:r'] ? (Array.isArray(p['w:r']) ? p['w:r'] : [p['w:r']]) : []
      const texts = []
      runs.forEach(r => {
        const t = r['w:t']
        if (t) {
          if (Array.isArray(t)) {
            texts.push(...t)
          } else {
            texts.push(t)
          }
        }
      })
      return texts.join('')
    }).filter(p => p.trim()) // 过滤空段落

    return { paragraphs, success: true }
  } catch (error) {
    console.error('DOCX 段落解析失败:', error)
    let errorMessage = error.message || '段落解析失败'

    // 提供更友好的错误提示
    if (errorMessage.includes('end of central directory') || errorMessage.includes('zip file')) {
      errorMessage = '文件不是有效的 DOCX 格式。请确保文件已正确转换为 DOCX 格式（使用 Word 或其他工具转换），而不是简单的重命名。'
    }

    return { paragraphs: [], success: false, error: errorMessage }
  }
}

/**
 * 按关键词/正则提取字段
 */
export function pickByRegex(text, patterns) {
  const result = {}
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const value = match[1].trim()
      // 检查是否匹配到了下一个字段标签（避免提取错误）
      // 如果值包含常见的字段标签，说明匹配错误，应该为空
      const fieldLabels = ['合同编号', '合同名称', '甲方', '乙方', '法定代表人', '联系地址', '联系人', '联系电话', '邮箱', '签订日期', '开始日期', '结束日期']
      const isFieldLabel = fieldLabels.some(label => value.includes(label + '：') || value.includes(label + ':'))
      if (isFieldLabel) {
        result[key] = ''
      } else {
        result[key] = value
      }
    } else {
      result[key] = ''
    }
  }
  return result
}

/**
 * 提取两个标记之间的内容
 */
export function sliceBetween(text, startMark, endMark) {
  const start = text.indexOf(startMark)
  if (start === -1) return ''
  const end = text.indexOf(endMark, start + startMark.length)
  if (end === -1) return text.slice(start + startMark.length).trim()
  return text.slice(start + startMark.length, end).trim()
}

/**
 * 合同类型识别
 */
export function detectContractType(text) {
  if (text.includes('代运营') && (text.includes('垫付') || text.includes('预付'))) {
    return '代运营垫付预付合同'
  } else if (text.includes('代运营')) {
    return '代运营合同'
  } else if (text.includes('自运营') && (text.includes('垫付') || text.includes('预付'))) {
    return '自运营垫付预付合同'
  } else if (text.includes('自运营')) {
    return '自运营合同'
  }
  return '未知合同类型'
}

/**
 * 通用合同字段解析
 */
export function parseContractFields(text) {
  // 定义常见的字段提取模式
  // 注意：正则表达式需要更严格，避免匹配到空值后的下一个标签
  // 格式：字段名：值（值不能包含其他字段标签）
  const patterns = {
    // 合同基本信息 - 匹配到换行或下一个字段标签之前
    contractNo: /合同编号[:：]\s*([^\n\r：:]+?)(?=\n|$|合同名称|甲方|乙方)/i,
    contractName: /合同名称[:：]\s*([^\n\r：:]+?)(?=\n|$|合同编号|甲方|乙方)/i,
    partyA: /甲方[:：]\s*([^\n\r：:]+?)(?=\n|$|乙方|法定代表人)/i,
    partyB: /乙方[:：]\s*([^\n\r：:]+?)(?=\n|$|甲方|法定代表人|甲乙双方)/i,

    // 日期相关
    signDate: /签订日期[:：]\s*([^\n\r：:]+?)(?=\n|$|开始日期|结束日期)/i,
    startDate: /开始日期[:：]\s*([^\n\r：:]+?)(?=\n|$|结束日期|签订日期)/i,
    endDate: /结束日期[:：]\s*([^\n\r：:]+?)(?=\n|$|开始日期|签订日期)/i,
    effectiveDate: /生效日期[:：]\s*([^\n\r：:]+?)(?=\n|$|签订日期|开始日期)/i,

    // 金额相关
    contractAmount: /合同金额[:：]\s*([^\n\r：:]+?)(?=\n|$|总金额|付款金额)/i,
    totalAmount: /总金额[:：]\s*([^\n\r：:]+?)(?=\n|$|合同金额|付款金额)/i,
    paymentAmount: /付款金额[:：]\s*([^\n\r：:]+?)(?=\n|$|合同金额|总金额)/i,

    // 项目相关
    projectName: /项目名称[:：]\s*([^\n\r：:]+?)(?=\n|$|项目ID)/i,
    projectId: /项目ID[:：]\s*([^\n\r：:]+?)(?=\n|$|项目名称)/i,

    // 其他 - 这些字段在区块提取中处理，这里先设为空
    contactPerson: /(?!)/, // 不匹配，由区块提取处理
    contactPhone: /(?!)/, // 不匹配，由区块提取处理
    address: /(?!)/ // 不匹配，由区块提取处理
  }

  const result = pickByRegex(text, patterns)

  // 尝试提取更多信息
  // 如果某些字段没找到，尝试其他可能的格式
  if (!result.contractNo) {
    const noMatch = text.match(/(?:合同号|合同编号|编号)[:：]?\s*([A-Z0-9\-]+)/i)
    if (noMatch) result.contractNo = noMatch[1]
  }

  // 提取甲方信息（更智能的提取，提取到下一个字段之前）
  // 格式：甲方：\n公司名称\n法定代表人：...
  // 注意：如果甲方为空，第一行可能是"法定代表人："，需要跳过
  const partyASection = text.match(/甲方[：:]\s*([\s\S]*?)(?=乙方[：:]|甲乙双方|合同期限|信息服务内容|第[一二三四五六七八九十]条|$)/i)
  if (partyASection) {
    // 提取第一行非空内容作为甲方名称
    const lines = partyASection[1].split(/[\n\r]+/).map(line => line.trim()).filter(line => line)
    // 跳过字段标签行（如"法定代表人："、"联系地址："等）
    const fieldLabels = ['法定代表人', '联系地址', '联系人', '联系电话', '邮箱']
    let foundName = false
    for (const line of lines) {
      // 检查是否是字段标签
      const isFieldLabel = fieldLabels.some(label => line.startsWith(label + '：') || line.startsWith(label + ':'))
      if (!isFieldLabel && line) {
        result.partyA = line
        foundName = true
        break
      }
    }
    if (!foundName) {
      result.partyA = '' // 甲方为空
    }
  } else {
    // 如果没找到完整区块，尝试简单匹配
    const partyAMatch = text.match(/甲方[：:]\s*([^\n\r：:（(]+?)(?=\n|$|法定代表人|联系地址|联系人|联系电话|邮箱|乙方)/i)
    if (partyAMatch && partyAMatch[1].trim()) {
      const value = partyAMatch[1].trim()
      // 检查是否匹配到了标签
      if (!value.match(/^(法定代表人|联系地址|联系人|联系电话|邮箱|乙方)/)) {
        result.partyA = value
      } else {
        result.partyA = ''
      }
    } else {
      result.partyA = ''
    }
  }

  // 提取乙方信息（更智能的提取，提取到下一个主要字段之前）
  // 格式：乙方：执象广告（上海）有限公司\n法定代表人：...
  const partyBSection = text.match(/乙方[：:]\s*([\s\S]*?)(?=甲乙双方|合同期限|信息服务内容|第[一二三四五六七八九十]条|$)/i)
  if (partyBSection) {
    // 提取第一行非空内容作为乙方名称
    const lines = partyBSection[1].split(/[\n\r]+/).map(line => line.trim()).filter(line => line)
    // 跳过字段标签行
    const fieldLabels = ['法定代表人', '联系地址', '联系人', '联系电话', '邮箱']
    let foundName = false
    for (const line of lines) {
      const isFieldLabel = fieldLabels.some(label => line.startsWith(label + '：') || line.startsWith(label + ':'))
      if (!isFieldLabel && line) {
        result.partyB = line
        foundName = true
        break
      }
    }
    if (!foundName) {
      result.partyB = ''
    }
  } else {
    // 如果没找到完整区块，尝试简单匹配
    const partyBMatch = text.match(/乙方[：:]\s*([^\n\r：:（(]+?)(?=\n|$|法定代表人|联系地址|联系人|联系电话|邮箱|甲乙双方)/i)
    if (partyBMatch && partyBMatch[1].trim()) {
      const value = partyBMatch[1].trim()
      if (!value.match(/^(法定代表人|联系地址|联系人|联系电话|邮箱|甲乙双方)/)) {
        result.partyB = value
      } else {
        result.partyB = ''
      }
    } else {
      result.partyB = ''
    }
  }

  // 从合同期限中提取开始和结束日期
  // 格式：2023年02月01日 至 2023年12月31日
  const periodMatch = text.match(/合同有效期自签订日\s*(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*至\s*(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/i)
  if (periodMatch) {
    const formatDate = (year, month, day) => {
      return `${year}年${month.padStart(2, '0')}月${day.padStart(2, '0')}日`
    }
    result.startDate = formatDate(periodMatch[1], periodMatch[2], periodMatch[3])
    result.endDate = formatDate(periodMatch[4], periodMatch[5], periodMatch[6])
    // 如果没有签订日期，使用开始日期
    if (!result.signDate || !result.signDate.trim()) {
      result.signDate = result.startDate
    }
  }

  // 提取邮箱地址
  const emailMatch = text.match(/邮箱[：:]\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+)/i)
  if (emailMatch) {
    result.email = emailMatch[1]
  }

  // 提取服务内容（开户、充值、代运营等）
  const serviceMatch = text.match(/提供\s*([开户、充值、代运营自运营]+)\s*信息服务/i)
  if (serviceMatch) {
    result.serviceContent = serviceMatch[1]
  }

  // 提取平台信息
  const platformMatch = text.match(/乙方在\s*([^\s]+)\s*平台上/i)
  if (platformMatch && platformMatch[1].trim() && !platformMatch[1].includes('        ')) {
    result.platform = platformMatch[1].trim()
  }

  // 提取返点政策
  const rebateMatch = text.match(/按\s*(\d+)\s*配送[【\[]([^】\]]*)[】\]]\s*的比例/i)
  if (rebateMatch) {
    result.rebateRatio = `${rebateMatch[1]}:${rebateMatch[2] || '0'}`
  }

  // 提取付款方式
  if (text.includes('后付款') || text.includes('垫付')) {
    result.paymentMethod = '后付款（垫付）'
  } else if (text.includes('预付款') || text.includes('预付')) {
    result.paymentMethod = '预付款'
  }

  // 提取甲方详细信息（从甲方区块中提取）
  const partyADetailSection = text.match(/甲方[：:]([\s\S]*?)(?=乙方[：:]|甲乙双方|合同期限|信息服务内容|第[一二三四五六七八九十]条|$)/i)
  if (partyADetailSection) {
    const detailText = partyADetailSection[1]

    // 提取甲方联系人 - 更严格的匹配，确保值不为空且不包含下一个标签
    const partyAContactMatch = detailText.match(/联系人[：:]\s*([^\n\r：:]+?)(?=\n|$|联系电话|联系地址|邮箱|法定代表人|乙方)/i)
    if (partyAContactMatch && partyAContactMatch[1].trim()) {
      const value = partyAContactMatch[1].trim()
      // 检查是否匹配到了标签
      if (!value.match(/^(联系电话|联系地址|邮箱|法定代表人|乙方)/)) {
        result.contactPerson = value
      }
    }

    // 提取甲方联系电话
    const partyAPhoneMatch = detailText.match(/联系电话[：:]\s*([^\n\r：:]+?)(?=\n|$|联系地址|邮箱|联系人|法定代表人|乙方)/i)
    if (partyAPhoneMatch && partyAPhoneMatch[1].trim()) {
      const value = partyAPhoneMatch[1].trim()
      if (!value.match(/^(联系地址|邮箱|联系人|法定代表人|乙方)/)) {
        result.contactPhone = value
      }
    }

    // 提取甲方地址
    const partyAAddressMatch = detailText.match(/联系地址[：:]\s*([^\n\r：:]+?)(?=\n|$|联系人|联系电话|邮箱|法定代表人|乙方)/i)
    if (partyAAddressMatch && partyAAddressMatch[1].trim()) {
      const value = partyAAddressMatch[1].trim()
      if (!value.match(/^(联系人|联系电话|邮箱|法定代表人|乙方)/)) {
        result.partyAAddress = value
      }
    }

    // 提取甲方邮箱
    const partyAEmailMatch = detailText.match(/邮箱[：:]\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+)/i)
    if (partyAEmailMatch) {
      result.email = partyAEmailMatch[1]
    }
  }

  // 提取乙方详细信息（从乙方区块中提取）
  const partyBDetailSection = text.match(/乙方[：:]([\s\S]*?)(?=甲乙双方|合同期限|信息服务内容|第[一二三四五六七八九十]条|$)/i)
  if (partyBDetailSection) {
    const detailText = partyBDetailSection[1]

    // 提取乙方联系人 - 更严格的匹配
    const partyBContactMatch = detailText.match(/联系人[：:]\s*([^\n\r：:]+?)(?=\n|$|联系电话|联系地址|邮箱|法定代表人|甲乙双方)/i)
    if (partyBContactMatch && partyBContactMatch[1].trim()) {
      const value = partyBContactMatch[1].trim()
      if (!value.match(/^(联系电话|联系地址|邮箱|法定代表人|甲乙双方)/)) {
        result.partyBContact = value
      }
    }

    // 提取乙方联系电话
    const partyBPhoneMatch = detailText.match(/联系电话[：:]\s*([^\n\r：:]+?)(?=\n|$|联系地址|邮箱|联系人|法定代表人|甲乙双方)/i)
    if (partyBPhoneMatch && partyBPhoneMatch[1].trim()) {
      const value = partyBPhoneMatch[1].trim()
      if (!value.match(/^(联系地址|邮箱|联系人|法定代表人|甲乙双方)/)) {
        result.partyBPhone = value
      }
    }

    // 提取乙方地址
    const partyBAddressMatch = detailText.match(/联系地址[：:]\s*([^\n\r：:]+?)(?=\n|$|联系人|联系电话|邮箱|法定代表人|甲乙双方)/i)
    if (partyBAddressMatch && partyBAddressMatch[1].trim()) {
      const value = partyBAddressMatch[1].trim()
      if (!value.match(/^(联系人|联系电话|邮箱|法定代表人|甲乙双方)/)) {
        result.partyBAddress = value
      }
    }

    // 提取乙方邮箱（如果甲方邮箱还没提取到）
    if (!result.email) {
      const partyBEmailMatch = detailText.match(/邮箱[：:]\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+)/i)
      if (partyBEmailMatch) {
        result.email = partyBEmailMatch[1]
      }
    }
  }

  // 提取结算周期
  const settlementMatch = text.match(/次月票后[【\[](\d+)[】\]]\s*日前/i)
  if (settlementMatch) {
    result.settlementDays = settlementMatch[1] + '日'
  }

  return result
}

/**
 * 解析代运营垫付预付合同字段
 */
function parseDaiyunyingDianfuYufuContract(text) {
  const fields = {}

  // 1. 合同编号
  const contractNoMatch = text.match(/合同编号[：:]\s*([^\n\r：:]+?)(?=\n|$|甲方|乙方)/i)
  if (contractNoMatch && contractNoMatch[1].trim()) {
    fields.contractNo = contractNoMatch[1].trim()
  } else {
    fields.contractNo = ''
  }

  // 2. 甲方信息
  const partyASection = text.match(/甲方[：:]([\s\S]*?)(?=乙方[：:]|甲乙双方|合同期限|信息服务内容|第[一二三四五六七八九十]条|$)/i)
  if (partyASection) {
    const detailText = partyASection[1]

    // 甲方公司名称（第一行非标签内容）
    const lines = detailText.split(/[\n\r]+/).map(line => line.trim()).filter(line => line)
    const fieldLabels = ['法定代表人', '联系地址', '联系人', '联系电话', '邮箱']
    for (const line of lines) {
      const isFieldLabel = fieldLabels.some(label => line.startsWith(label + '：') || line.startsWith(label + ':'))
      if (!isFieldLabel && line) {
        fields.partyA = line
        break
      }
    }
    if (!fields.partyA) fields.partyA = ''

    // 甲方法定代表人
    const partyALegalMatch = detailText.match(/法定代表人[：:]\s*([^\n\r：:]+?)(?=\n|$|联系地址|联系人|联系电话|邮箱|乙方)/i)
    fields.partyALegal = partyALegalMatch && partyALegalMatch[1].trim() ? partyALegalMatch[1].trim() : ''

    // 甲方联系地址
    const partyAAddressMatch = detailText.match(/联系地址[：:]\s*([^\n\r：:]+?)(?=\n|$|联系人|联系电话|邮箱|法定代表人|乙方)/i)
    fields.partyAAddress = partyAAddressMatch && partyAAddressMatch[1].trim() ? partyAAddressMatch[1].trim() : ''

    // 甲方联系人
    const partyAContactMatch = detailText.match(/联系人[：:]\s*([^\n\r：:]+?)(?=\n|$|联系电话|联系地址|邮箱|法定代表人|乙方)/i)
    fields.partyAContact = partyAContactMatch && partyAContactMatch[1].trim() ? partyAContactMatch[1].trim() : ''

    // 甲方联系电话
    const partyAPhoneMatch = detailText.match(/联系电话[：:]\s*([^\n\r：:]+?)(?=\n|$|联系地址|邮箱|联系人|法定代表人|乙方)/i)
    fields.partyAPhone = partyAPhoneMatch && partyAPhoneMatch[1].trim() ? partyAPhoneMatch[1].trim() : ''

    // 甲方邮箱
    const partyAEmailMatch = detailText.match(/邮箱[：:]\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+)/i)
    fields.partyAEmail = partyAEmailMatch ? partyAEmailMatch[1] : ''
  } else {
    fields.partyA = ''
    fields.partyALegal = ''
    fields.partyAAddress = ''
    fields.partyAContact = ''
    fields.partyAPhone = ''
    fields.partyAEmail = ''
  }

  // 3. 乙方信息
  const partyBSection = text.match(/乙方[：:]([\s\S]*?)(?=甲乙双方|合同期限|信息服务内容|第[一二三四五六七八九十]条|$)/i)
  if (partyBSection) {
    const detailText = partyBSection[1]

    // 乙方公司名称
    const lines = detailText.split(/[\n\r]+/).map(line => line.trim()).filter(line => line)
    const fieldLabels = ['法定代表人', '联系地址', '联系人', '联系电话', '邮箱']
    for (const line of lines) {
      const isFieldLabel = fieldLabels.some(label => line.startsWith(label + '：') || line.startsWith(label + ':'))
      if (!isFieldLabel && line) {
        fields.partyB = line
        break
      }
    }
    if (!fields.partyB) fields.partyB = ''

    // 乙方法定代表人
    const partyBLegalMatch = detailText.match(/法定代表人[：:]\s*([^\n\r：:]+?)(?=\n|$|联系地址|联系人|联系电话|邮箱|甲乙双方)/i)
    fields.partyBLegal = partyBLegalMatch && partyBLegalMatch[1].trim() ? partyBLegalMatch[1].trim() : ''

    // 乙方联系地址
    const partyBAddressMatch = detailText.match(/联系地址[：:]\s*([^\n\r：:]+?)(?=\n|$|联系人|联系电话|邮箱|法定代表人|甲乙双方)/i)
    fields.partyBAddress = partyBAddressMatch && partyBAddressMatch[1].trim() ? partyBAddressMatch[1].trim() : ''

    // 乙方联系人
    const partyBContactMatch = detailText.match(/联系人[：:]\s*([^\n\r：:]+?)(?=\n|$|联系电话|联系地址|邮箱|法定代表人|甲乙双方)/i)
    fields.partyBContact = partyBContactMatch && partyBContactMatch[1].trim() ? partyBContactMatch[1].trim() : ''

    // 乙方联系电话
    const partyBPhoneMatch = detailText.match(/联系电话[：:]\s*([^\n\r：:]+?)(?=\n|$|联系地址|邮箱|联系人|法定代表人|甲乙双方)/i)
    fields.partyBPhone = partyBPhoneMatch && partyBPhoneMatch[1].trim() ? partyBPhoneMatch[1].trim() : ''

    // 乙方邮箱
    const partyBEmailMatch = detailText.match(/邮箱[：:]\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+)/i)
    fields.partyBEmail = partyBEmailMatch ? partyBEmailMatch[1] : ''
  } else {
    fields.partyB = ''
    fields.partyBLegal = ''
    fields.partyBAddress = ''
    fields.partyBContact = ''
    fields.partyBPhone = ''
    fields.partyBEmail = ''
  }

  // 4. 平台信息
  const platformMatch = text.match(/乙方在\s*([^\s]+?)\s*平台上/i)
  if (platformMatch && platformMatch[1].trim() && !platformMatch[1].includes('        ')) {
    fields.platform = platformMatch[1].trim()
  } else {
    fields.platform = ''
  }

  // 5. 服务内容
  const serviceMatch = text.match(/提供\s*([开户、充值、代运营自运营]+?)\s*信息服务/i)
  if (serviceMatch) {
    fields.serviceContent = serviceMatch[1]
  } else {
    fields.serviceContent = ''
  }

  // 6. 合同期限
  const periodMatch = text.match(/合同有效期自签订日\s*(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*至\s*(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/i)
  if (periodMatch) {
    const formatDate = (year, month, day) => {
      return `${year}年${month.padStart(2, '0')}月${day.padStart(2, '0')}日`
    }
    fields.startDate = formatDate(periodMatch[1], periodMatch[2], periodMatch[3])
    fields.endDate = formatDate(periodMatch[4], periodMatch[5], periodMatch[6])
    fields.signDate = fields.startDate
  } else {
    fields.startDate = ''
    fields.endDate = ''
    fields.signDate = ''
  }

  // 7. 甲方开票信息
  const partyAInvoiceSection = text.match(/甲方开票信息[：:]([\s\S]*?)(?=乙方指定收款|第[一二三四五六七八九十]条|$)/i)
  if (partyAInvoiceSection) {
    const detailText = partyAInvoiceSection[1]

    // 单位名称
    const unitNameMatch = detailText.match(/单位名称[：:]\s*([^\n\r：:]+?)(?=\n|$|税号|开户银行|账号|地址|电话)/i)
    fields.partyAInvoiceUnitName = unitNameMatch && unitNameMatch[1].trim() ? unitNameMatch[1].trim() : ''

    // 税号
    const taxNoMatch = detailText.match(/税号[：:]\s*([^\n\r：:]+?)(?=\n|$|单位名称|开户银行|账号|地址|电话)/i)
    fields.partyAInvoiceTaxNo = taxNoMatch && taxNoMatch[1].trim() ? taxNoMatch[1].trim() : ''

    // 开户银行
    const bankMatch = detailText.match(/开户银行[：:]\s*([^\n\r：:]+?)(?=\n|$|单位名称|税号|账号|地址|电话)/i)
    fields.partyAInvoiceBank = bankMatch && bankMatch[1].trim() ? bankMatch[1].trim() : ''

    // 账号
    const accountMatch = detailText.match(/账号[：:]\s*([^\n\r：:]+?)(?=\n|$|单位名称|税号|开户银行|地址|电话)/i)
    fields.partyAInvoiceAccount = accountMatch && accountMatch[1].trim() ? accountMatch[1].trim() : ''

    // 地址
    const invoiceAddressMatch = detailText.match(/地址[：:]\s*([^\n\r：:]+?)(?=\n|$|单位名称|税号|开户银行|账号|电话)/i)
    fields.partyAInvoiceAddress = invoiceAddressMatch && invoiceAddressMatch[1].trim() ? invoiceAddressMatch[1].trim() : ''

    // 电话
    const invoicePhoneMatch = detailText.match(/电话[：:]\s*([^\n\r：:]+?)(?=\n|$|单位名称|税号|开户银行|账号|地址)/i)
    fields.partyAInvoicePhone = invoicePhoneMatch && invoicePhoneMatch[1].trim() ? invoicePhoneMatch[1].trim() : ''
  } else {
    fields.partyAInvoiceUnitName = ''
    fields.partyAInvoiceTaxNo = ''
    fields.partyAInvoiceBank = ''
    fields.partyAInvoiceAccount = ''
    fields.partyAInvoiceAddress = ''
    fields.partyAInvoicePhone = ''
  }

  // 8. 乙方收款账号信息
  const partyBPaymentSection = text.match(/乙方指定收款[帐账]号[：:]([\s\S]*?)(?=第[一二三四五六七八九十]条|返点政策|付款方式|$)/i)
  if (partyBPaymentSection) {
    const detailText = partyBPaymentSection[1]

    // 收款单位
    const payeeUnitMatch = detailText.match(/收款单位[：:]\s*([^\n\r：:]+?)(?=\n|$|开户银行|银行帐号|银行账号)/i)
    fields.partyBPayeeUnit = payeeUnitMatch && payeeUnitMatch[1].trim() ? payeeUnitMatch[1].trim() : ''

    // 开户银行
    const payeeBankMatch = detailText.match(/开户银行[：:]\s*([^\n\r：:]+?)(?=\n|$|收款单位|银行帐号|银行账号)/i)
    fields.partyBPayeeBank = payeeBankMatch && payeeBankMatch[1].trim() ? payeeBankMatch[1].trim() : ''

    // 银行账号
    const payeeAccountMatch = detailText.match(/银行[帐账]号[：:]\s*([^\n\r：:]+?)(?=\n|$|收款单位|开户银行)/i)
    fields.partyBPayeeAccount = payeeAccountMatch && payeeAccountMatch[1].trim() ? payeeAccountMatch[1].trim() : ''
  } else {
    fields.partyBPayeeUnit = ''
    fields.partyBPayeeBank = ''
    fields.partyBPayeeAccount = ''
  }

  return fields
}

/**
 * 根据合同类型解析字段（针对不同合同类型的特定规则）
 */
function parseContractFieldsByType(text, contractType) {
  // 根据合同类型使用专门的解析函数
  switch (contractType) {
    case '代运营垫付预付合同':
      return parseDaiyunyingDianfuYufuContract(text)

    case '自运营垫付预付合同':
      // 可以复用代运营的逻辑，或者创建专门的函数
      return parseDaiyunyingDianfuYufuContract(text)

    case '代运营合同':
    case '自运营合同':
      // 普通运营合同使用通用解析
      return parseContractFields(text)

    default:
      // 默认使用通用解析
      return parseContractFields(text)
  }
}

/**
 * 解析合同文档
 * @param {File} file - 合同文件
 * @param {String} selectedType - 用户选择的合同类型（可选，如果提供则使用该类型）
 */
export async function parseContract(file, selectedType = null) {
  // 先提取纯文本
  const { text, success, error } = await docxToText(file)

  if (!success) {
    return {
      success: false,
      error: error || '文档解析失败',
      type: '未知',
      fields: {}
    }
  }

  // 确定合同类型：优先使用用户选择的类型，否则自动识别
  const contractType = selectedType || detectContractType(text)

  // 根据合同类型解析字段
  const fields = parseContractFieldsByType(text, contractType)

  // 获取段落（用于更精确的解析，失败不影响主流程）
  const paragraphResult = await docxToParagraphs(file)
  const paragraphs = paragraphResult.success ? paragraphResult.paragraphs : []

  return {
    success: true,
    type: contractType,
    selectedType: selectedType, // 记录用户选择的类型
    text,
    paragraphs,
    fields,
    fileName: file.name,
    paragraphParseWarning: paragraphResult.success ? null : paragraphResult.error
  }
}

