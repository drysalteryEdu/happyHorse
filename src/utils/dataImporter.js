import { validateRecords, normalizeRecord } from '../data/schema.js'

/**
 * 解析用户上传的文件（支持 JSON / CSV）
 * @param {File} file
 * @returns {Promise<{ valid: object[], errors: string[] }>}
 */
export async function parseFile(file) {
  const text = await readFileAsText(file)
  const ext = file.name.split('.').pop().toLowerCase()

  let raw = []
  if (ext === 'json') {
    raw = parseJSON(text)
  } else if (ext === 'csv') {
    raw = parseCSV(text)
  } else {
    return { valid: [], errors: ['仅支持 .json 或 .csv 文件'] }
  }

  if (!Array.isArray(raw)) {
    return { valid: [], errors: ['文件格式解析失败，请检查内容'] }
  }

  return validateRecords(raw)
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file, 'UTF-8')
  })
}

/** JSON 格式：数组 或 { characters: [...] } */
function parseJSON(text) {
  try {
    const obj = JSON.parse(text)
    return Array.isArray(obj) ? obj : (obj.characters || [])
  } catch {
    return null
  }
}

/**
 * CSV 格式（UTF-8，首行为表头）
 * 必填列：char, pinyin, grade, tier, meanings
 * meanings / examples 列内部用 | 分隔多个值
 */
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  if (lines.length < 2) return []

  const headers = splitCSVLine(lines[0])
  const records = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const cells = splitCSVLine(line)
    const obj = {}
    headers.forEach((h, idx) => { obj[h.trim()] = (cells[idx] || '').trim() })

    // meanings / examples 用 | 分割成数组
    if (obj.meanings) obj.meanings = obj.meanings.split('|').map(s => s.trim()).filter(Boolean)
    if (obj.examples) obj.examples = obj.examples.split('|').map(s => s.trim()).filter(Boolean)

    records.push(normalizeRecord(obj))
  }
  return records
}

/** 处理 CSV 带引号的字段 */
function splitCSVLine(line) {
  const result = []
  let cur = '', inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && line[i+1] === '"') { cur += '"'; i++ }
      else inQuote = !inQuote
    } else if (ch === ',' && !inQuote) {
      result.push(cur); cur = ''
    } else {
      cur += ch
    }
  }
  result.push(cur)
  return result
}

/** 将字库导出为 JSON 字符串 */
export function exportToJSON(records, meta = {}) {
  return JSON.stringify({
    meta: { ...meta, exported: new Date().toISOString().slice(0, 10) },
    characters: records,
  }, null, 2)
}
