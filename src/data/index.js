import { normalizeRecord } from './schema.js'

/** 按年级懒加载字库 */
const gradeLoaders = {
  1: () => import('./grade1.js').then(m => m.default),
  2: () => import('./grade2.js').then(m => m.default),
}

const cache = {}

/** 加载指定年级数据（带缓存），返回规范化后的记录数组 */
export async function loadGrade(grade) {
  if (cache[grade]) return cache[grade]
  const loader = gradeLoaders[grade]
  if (!loader) return []
  const raw = await loader()
  cache[grade] = raw.map(r => normalizeRecord(r))
  return cache[grade]
}

/** 加载多个年级并合并，按 grade+tier 排序 */
export async function loadGrades(grades = [1, 2]) {
  const results = await Promise.all(grades.map(loadGrade))
  return results.flat()
}

/** 支持注册用户自定义字库（不进 cache，每次重新合并） */
const customSets = []
export function registerCustomSet(records) {
  customSets.push(...records.map(r => normalizeRecord(r)))
}
export function getCustomSet() { return [...customSets] }
export function clearCustomSets() { customSets.length = 0 }

/** 按年级+字类过滤 */
export function filterCharacters(chars, { grades = [], tiers = [] }) {
  return chars.filter(c =>
    (grades.length === 0 || grades.includes(c.grade)) &&
    (tiers.length  === 0 || tiers.includes(c.tier))
  )
}

/** 所有已知年级 */
export const AVAILABLE_GRADES = Object.keys(gradeLoaders).map(Number)
