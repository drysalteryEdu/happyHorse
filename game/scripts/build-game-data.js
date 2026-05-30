#!/usr/bin/env node
/**
 * 构建时预处理游戏数据：
 * - 解析 人教版生字.md → 按年级/册分组字符
 * - 从 chinese-xinhua/data/word.json 查询笔画、部首、拼音
 * - 从 SimilarCharacter/音近字语料库.txt 建同音字索引
 * - 输出 public/data/grade{N}-{semester}.json（每个组合约 20-50KB）
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')
const OUT_DIR = join(__dirname, '../public/data')

mkdirSync(OUT_DIR, { recursive: true })

// 如果输出目录已有完整数据（Vercel 部署时数据已预生成并提交），跳过生成
import { existsSync } from 'fs'
const EXPECTED_FILES = ['grade1-upper.json','grade1-lower.json','grade2-upper.json','grade2-lower.json',
  'grade3-upper.json','grade3-lower.json','grade4-upper.json','grade4-lower.json',
  'grade5-upper.json','grade5-lower.json','grade6-upper.json','grade6-lower.json']
if (EXPECTED_FILES.every(f => existsSync(join(OUT_DIR, f)))) {
  console.log('✅ 游戏数据已存在，跳过生成')
  process.exit(0)
}

const GRADE_NUM = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6 }
const isCJK = (c) => c >= '一' && c <= '鿿'

// 1. 解析 人教版生字.md
function parseGradeChars() {
  const text = readFileSync(join(ROOT, '人教版生字.md'), 'utf-8')
  const result = {}
  let current = null
  for (const line of text.split('\n')) {
    const m = line.match(/^([一二三四五六])年级([上下])册生字/)
    if (m) {
      const key = `grade${GRADE_NUM[m[1]]}-${m[2] === '上' ? 'upper' : 'lower'}`
      result[key] = []
      current = key
      continue
    }
    if (current) {
      for (const ch of line.trim()) {
        if (isCJK(ch)) result[current].push(ch)
      }
    }
  }
  return result
}

// 2. 加载 word.json → Map<char, {pinyin, strokes, radical}>
function loadWordDict() {
  const raw = JSON.parse(readFileSync(join(ROOT, 'chinese-xinhua/data/word.json'), 'utf-8'))
  const map = new Map()
  for (const entry of raw) {
    if (entry.word && !map.has(entry.word)) {
      map.set(entry.word, {
        pinyin: entry.pinyin || '',
        strokes: parseInt(entry.strokes) || 0,
        radical: entry.radicals || '',
      })
    }
  }
  return map
}

// 3. 加载音近字语料库 → Map<char, char[]>
function loadPhoneticMap() {
  const text = readFileSync(join(ROOT, 'SimilarCharacter/音近字语料库.txt'), 'utf-8')
  const map = new Map()
  for (const line of text.split('\n')) {
    const parts = line.trim().split(/\s+/)
    if (parts.length < 2) continue
    const key = parts[0]
    const similar = parts.slice(1).join('').split('').filter(isCJK)
    if (!map.has(key)) map.set(key, new Set())
    for (const c of similar) map.get(key).add(c)
  }
  return new Map([...map.entries()].map(([k, v]) => [k, [...v]]))
}

// 4. 生成并写出每个 grade-semester.json
function buildAll() {
  console.log('📖 解析生字表...')
  const gradeChars = parseGradeChars()

  console.log('📚 加载字典数据...')
  const wordDict = loadWordDict()
  const phoneticMap = loadPhoneticMap()

  let total = 0
  for (const [key, chars] of Object.entries(gradeChars)) {
    const enriched = chars.map(char => {
      const w = wordDict.get(char) || { pinyin: '', strokes: 0, radical: '' }
      return {
        char,
        pinyin: w.pinyin,
        strokes: w.strokes,
        radical: w.radical,
        homophones: (phoneticMap.get(char) || []).filter(c => c !== char).slice(0, 8),
      }
    }).filter(c => c.pinyin || c.strokes) // 过滤掉完全没有数据的字

    const out = join(OUT_DIR, `${key}.json`)
    writeFileSync(out, JSON.stringify(enriched, null, 0), 'utf-8')
    console.log(`  ✓ ${key}.json  (${enriched.length} 字)`)
    total += enriched.length
  }
  console.log(`✅ 完成，共处理 ${total} 个字符`)
}

buildAll()
