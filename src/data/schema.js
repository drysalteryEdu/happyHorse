/**
 * 汉字记录格式定义与校验
 *
 * @typedef {Object} CharacterRecord
 * @property {string}   char      - 汉字，单个字符
 * @property {string}   pinyin    - 带声调拼音，如 "rén"
 * @property {number}   grade     - 年级 1-6
 * @property {1|2}      tier      - 1=一类字（读写），2=二类字（认读）
 * @property {string[]} meanings  - 新华字典义项（至少1条）
 * @property {string[]} [examples] - 组词示例（可选）
 * @property {string}   [radical]  - 部首（可选）
 * @property {number}   [strokes]  - 笔画数（可选）
 */

/**
 * 校验单条记录，返回错误列表（空数组表示合法）
 * @param {object} record
 * @param {number} index - 用于错误信息定位
 * @returns {string[]}
 */
export function validateRecord(record, index = 0) {
  const errors = []
  const prefix = `第 ${index + 1} 条`

  if (!record.char || typeof record.char !== 'string' || [...record.char].length !== 1) {
    errors.push(`${prefix}：char 必须是单个汉字`)
  }
  if (!record.pinyin || typeof record.pinyin !== 'string') {
    errors.push(`${prefix}：pinyin 不能为空`)
  }
  if (![1,2,3,4,5,6].includes(Number(record.grade))) {
    errors.push(`${prefix}：grade 必须是 1-6`)
  }
  if (![1,2].includes(Number(record.tier))) {
    errors.push(`${prefix}：tier 必须是 1（一类字）或 2（二类字）`)
  }
  if (!Array.isArray(record.meanings) || record.meanings.length === 0) {
    errors.push(`${prefix}：meanings 必须是非空数组`)
  }
  return errors
}

/**
 * 批量校验，返回 { valid, errors }
 * @param {object[]} records
 * @returns {{ valid: object[], errors: string[] }}
 */
export function validateRecords(records) {
  const valid = []
  const errors = []
  for (let i = 0; i < records.length; i++) {
    const errs = validateRecord(records[i], i)
    if (errs.length) {
      errors.push(...errs)
    } else {
      valid.push(records[i])
    }
  }
  return { valid, errors }
}

/** 规范化一条记录：类型强制转换，补充默认值 */
export function normalizeRecord(r) {
  return {
    char:     String(r.char).trim(),
    pinyin:   String(r.pinyin).trim(),
    grade:    Number(r.grade),
    tier:     Number(r.tier),
    meanings: Array.isArray(r.meanings)
      ? r.meanings.map(m => String(m).trim()).filter(Boolean)
      : [String(r.meanings).trim()],
    examples: Array.isArray(r.examples)
      ? r.examples.map(e => String(e).trim()).filter(Boolean)
      : [],
    radical:  r.radical ? String(r.radical).trim() : '',
    strokes:  r.strokes ? Number(r.strokes) : 0,
  }
}
