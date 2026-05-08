<template>
  <div class="manager fade-up">
    <div class="manager-header">
      <button class="back-btn" @click="emit('back')">← 返回</button>
      <h2>字库管理</h2>
    </div>

    <!-- 内置字库预览 -->
    <section class="card">
      <h3 class="card-title">内置字库</h3>
      <div class="built-in-list">
        <div v-for="g in [1, 2]" :key="g" class="grade-group">
          <div class="grade-head">{{ g }}年级</div>
          <div class="tier-row">
            <span class="tier-chip t1">一类字 {{ tierCount(g, 1) }} 个</span>
            <span class="tier-chip t2">二类字 {{ tierCount(g, 2) }} 个</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 导入区 -->
    <section class="card">
      <h3 class="card-title">导入自定义字库</h3>
      <div
        class="drop-zone"
        :class="{ dragover: isDragging, success: importResult.success, error: importResult.error }"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="onDrop"
        @click="fileInput.click()"
      >
        <input ref="fileInput" type="file" accept=".json,.csv" @change="onFileChange" hidden />
        <div v-if="!importResult.success && !importResult.error">
          <p class="drop-hint">拖拽文件到此处，或点击选择</p>
          <p class="drop-sub">支持 .json 和 .csv 格式</p>
        </div>
        <div v-else-if="importResult.success" class="import-success">
          <span class="import-icon">✓</span>
          成功导入 <strong>{{ importResult.count }}</strong> 个字
        </div>
        <div v-else class="import-error">
          <span class="import-icon">✗</span>
          导入失败：{{ importResult.error }}
        </div>
      </div>

      <!-- 错误详情 -->
      <ul v-if="importErrors.length" class="error-list">
        <li v-for="(e, i) in importErrors" :key="i">{{ e }}</li>
      </ul>

      <!-- 预览 -->
      <div v-if="previewRecords.length" class="preview-section">
        <div class="preview-header">
          <span>预览（{{ previewRecords.length }} 条）</span>
          <button class="confirm-btn" @click="confirmImport">确认导入</button>
          <button class="cancel-btn" @click="cancelImport">取消</button>
        </div>
        <div class="preview-table">
          <div class="table-head">
            <span>汉字</span><span>拼音</span><span>年级</span><span>字类</span><span>义项数</span>
          </div>
          <div v-for="(r, i) in previewRecords.slice(0, 20)" :key="i" class="table-row">
            <span class="t-char">{{ r.char }}</span>
            <span>{{ r.pinyin }}</span>
            <span>{{ r.grade }}年级</span>
            <span>{{ r.tier === 1 ? '一类' : '二类' }}</span>
            <span>{{ r.meanings.length }}</span>
          </div>
          <div v-if="previewRecords.length > 20" class="table-more">
            …还有 {{ previewRecords.length - 20 }} 条
          </div>
        </div>
      </div>
    </section>

    <!-- 导出 -->
    <section class="card">
      <h3 class="card-title">下载模板</h3>
      <p class="hint-text">下载 CSV 模板，填写后导入。</p>
      <div class="export-btns">
        <button class="export-btn" @click="downloadTemplate">下载 CSV 模板</button>
        <button class="export-btn" @click="downloadCustom" :disabled="customCount === 0">
          导出已导入字库（{{ customCount }} 个字）
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { parseFile, exportToJSON } from '../utils/dataImporter.js'
import { getCustomSet, registerCustomSet, clearCustomSets } from '../data/index.js'
import grade1data from '../data/grade1.js'
import grade2data from '../data/grade2.js'

const emit = defineEmits(['back'])

const allBuiltIn = [...grade1data, ...grade2data]

function tierCount(grade, tier) {
  return allBuiltIn.filter(c => c.grade === grade && c.tier === tier).length
}

const fileInput = ref(null)
const isDragging = ref(false)
const importResult = ref({ success: false, error: null, count: 0 })
const importErrors  = ref([])
const previewRecords = ref([])
let pendingRecords = []

async function processFile(file) {
  importResult.value = { success: false, error: null, count: 0 }
  importErrors.value = []
  previewRecords.value = []

  const { valid, errors } = await parseFile(file)
  if (errors.length) importErrors.value = errors
  if (valid.length === 0) {
    importResult.value.error = '未找到有效数据，请检查格式'
    return
  }
  pendingRecords = valid
  previewRecords.value = valid
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}
function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) processFile(file)
  e.target.value = ''
}

function confirmImport() {
  registerCustomSet(pendingRecords)
  importResult.value = { success: true, error: null, count: pendingRecords.length }
  previewRecords.value = []
}
function cancelImport() {
  previewRecords.value = []
  pendingRecords = []
}

const customCount = computed(() => getCustomSet().length)

function downloadTemplate() {
  const header = 'char,pinyin,grade,tier,meanings,examples\n'
  const example = '人,rén,1,1,能制造并使用工具进行劳动的高等动物|别人|每人,人类|他人\n'
  download('template.csv', header + example, 'text/csv;charset=utf-8')
}
function downloadCustom() {
  const json = exportToJSON(getCustomSet(), { name: '自定义字库' })
  download('custom-chars.json', json, 'application/json')
}
function download(filename, content, type) {
  const blob = new Blob(['﻿' + content], { type })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.manager {
  max-width: 680px;
  margin: 0 auto;
  padding: var(--sp-8) var(--sp-6);
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}
.manager-header {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
}
.back-btn {
  font-size: 0.85rem;
  color: var(--color-stone);
  cursor: pointer;
  padding: var(--sp-1) var(--sp-3);
  border: 1px solid var(--color-paper-dark);
  border-radius: var(--radius-sm);
  background: white;
  transition: color var(--t-fast);
}
.back-btn:hover { color: var(--color-cinnabar); }
h2 { font-size: 1.4rem; color: var(--color-ink); }

.card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--sp-6);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}
.card-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-stone);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.built-in-list { display: flex; flex-direction: column; gap: var(--sp-3); }
.grade-group { display: flex; align-items: center; gap: var(--sp-4); }
.grade-head { font-weight: 700; min-width: 50px; }
.tier-row { display: flex; gap: var(--sp-2); }
.tier-chip {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
}
.tier-chip.t1 { background: #fde8e8; color: var(--color-cinnabar); }
.tier-chip.t2 { background: #e8f0fd; color: var(--color-azure); }

.drop-zone {
  border: 2px dashed var(--color-paper-dark);
  border-radius: var(--radius-lg);
  padding: var(--sp-12) var(--sp-8);
  text-align: center;
  cursor: pointer;
  transition: all var(--t-normal);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.drop-zone:hover, .drop-zone.dragover { border-color: var(--color-cinnabar); background: #fef9f9; }
.drop-zone.success { border-color: var(--color-jade); background: #d5f5e3; border-style: solid; }
.drop-zone.error   { border-color: var(--color-clay); background: #fde8d8; border-style: solid; }
.drop-hint { color: var(--color-stone); font-weight: 700; }
.drop-sub  { color: var(--color-stone); font-size: 0.78rem; margin-top: var(--sp-1); }
.import-success, .import-error { display: flex; align-items: center; gap: var(--sp-3); font-weight: 700; }
.import-success { color: var(--color-jade); }
.import-error   { color: var(--color-clay); }
.import-icon { font-size: 1.4rem; }

.error-list {
  font-size: 0.78rem;
  color: var(--color-clay);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview-section { display: flex; flex-direction: column; gap: var(--sp-3); }
.preview-header {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  font-size: 0.85rem;
  color: var(--color-stone);
}
.confirm-btn {
  padding: var(--sp-1) var(--sp-4);
  background: var(--color-jade);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
}
.cancel-btn {
  padding: var(--sp-1) var(--sp-4);
  border: 1px solid var(--color-paper-dark);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  cursor: pointer;
  color: var(--color-stone);
  background: white;
}

.preview-table { font-size: 0.82rem; }
.table-head, .table-row {
  display: grid;
  grid-template-columns: 40px 70px 60px 50px 50px;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  align-items: center;
}
.table-head { font-weight: 700; color: var(--color-stone); border-bottom: 1px solid var(--color-paper-dark); }
.table-row:nth-child(even) { background: var(--color-paper); }
.t-char { font-family: var(--font-hanzi); font-size: 1.1rem; font-weight: 700; }
.table-more { font-size: 0.78rem; color: var(--color-stone); text-align: center; padding: var(--sp-2); }

.hint-text { font-size: 0.85rem; color: var(--color-stone); }
.export-btns { display: flex; flex-wrap: wrap; gap: var(--sp-3); }
.export-btn {
  padding: var(--sp-2) var(--sp-6);
  border: 2px solid var(--color-cinnabar);
  border-radius: var(--radius-md);
  color: var(--color-cinnabar);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  background: white;
  transition: all var(--t-fast);
}
.export-btn:hover:not(:disabled) { background: var(--color-cinnabar); color: white; }
.export-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
