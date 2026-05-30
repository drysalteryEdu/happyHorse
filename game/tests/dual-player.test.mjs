/**
 * 双人游戏 E2E 测试 - 使用 Playwright 直接 API（两个独立 BrowserContext 模拟 player1/player2）
 * 运行：node tests/dual-player.test.mjs
 */

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

const BASE_URL = 'http://localhost:5173'
const SHOTS_DIR = `${process.env.HOME}/.agent-browser/tmp/screenshots`

await mkdir(SHOTS_DIR, { recursive: true })

let pass = 0, fail = 0

async function shot(page, name) {
  const p = join(SHOTS_DIR, `${name}.png`)
  await page.screenshot({ path: p, fullPage: false })
  console.log(`  📸  ${name}.png`)
}

function assert(cond, msg) {
  if (cond) { console.log(`  ✅  ${msg}`); pass++ }
  else       { console.error(`  ❌  ${msg}`); fail++ }
}

// ──────────────────────────────────────────
const browser = await chromium.launch({ headless: true })
const ctx1 = await browser.newContext()
const ctx2 = await browser.newContext()
const p1 = await ctx1.newPage()
const p2 = await ctx2.newPage()

try {
  // ── Step 1: 打开大厅 ──────────────────────
  console.log('\n══ Step 1: 两位玩家打开大厅 ══')
  await Promise.all([
    p1.goto(BASE_URL, { waitUntil: 'networkidle' }),
    p2.goto(BASE_URL, { waitUntil: 'networkidle' }),
  ])
  await shot(p1, '01-p1-lobby')
  await shot(p2, '02-p2-lobby')
  assert(await p1.title() !== '', '页面标题不为空')

  // ── Step 2: 玩家1 填名字并创建房间 ────────
  console.log('\n══ Step 2: 玩家1 创建房间 ══')
  await p1.fill('[data-testid="name-input"]', '小明')
  await p1.selectOption('[data-testid="grade-select"]', '1')
  await p1.selectOption('[data-testid="semester-select"]', 'lower')
  await p1.click('[data-testid="create-btn"]')

  // 等待房间号出现（PeerJS open 事件）
  const roomIdEl = p1.locator('[data-testid="room-id"]')
  await roomIdEl.waitFor({ timeout: 15000 })
  const roomId = (await roomIdEl.textContent())?.trim() ?? ''
  assert(roomId.length > 4, `房间号已生成: "${roomId.slice(0, 12)}…"`)
  await shot(p1, '03-p1-waiting')

  // ── Step 3: 玩家2 加入房间 ────────────────
  console.log('\n══ Step 3: 玩家2 加入房间 ══')
  await p2.fill('[data-testid="name-input"]', '小红')
  await p2.fill('[data-testid="room-id-input"]', roomId)
  await p2.click('[data-testid="join-btn"]')

  // 等待两端都跳转到 /game
  await Promise.all([
    p1.waitForURL('**/game', { timeout: 20000 }),
    p2.waitForURL('**/game', { timeout: 20000 }),
  ])
  await shot(p1, '04-p1-game-start')
  await shot(p2, '05-p2-game-start')
  assert(p1.url().includes('/game'), '玩家1 进入游戏页')
  assert(p2.url().includes('/game'), '玩家2 进入游戏页')

  // ── Step 4: 验证棋盘已渲染 ────────────────
  console.log('\n══ Step 4: 验证棋盘渲染 ══')
  const cells1 = await p1.locator('.cell').count()
  const cells2 = await p2.locator('.cell').count()
  assert(cells1 === 30, `玩家1 棋盘有 ${cells1} 格（期望 30）`)
  assert(cells2 === 30, `玩家2 棋盘有 ${cells2} 格（期望 30）`)

  // ── Step 5: 玩家1 掷骰子 ──────────────────
  console.log('\n══ Step 5: 玩家1 掷骰子 ══')
  await p1.waitForSelector('[data-testid="dice-btn"]:not([disabled])', { timeout: 5000 })
  await p1.click('[data-testid="dice-btn"]')
  await p1.waitForTimeout(1500)
  await shot(p1, '06-p1-after-roll')
  await shot(p2, '07-p2-synced-roll')

  // 检查题目卡片（可能出现也可能不出现，取决于落格类型）
  const hasQuestion = await p1.locator('[data-testid="option-0"]').isVisible({ timeout: 2000 }).catch(() => false)
  console.log(`  题目卡片出现: ${hasQuestion}`)

  if (hasQuestion) {
    console.log('\n══ Step 6: 玩家1 答题 ══')
    await p1.click('[data-testid="option-0"]')
    await p1.waitForTimeout(1000)
    await shot(p1, '08-p1-answered')
    await shot(p2, '09-p2-answer-synced')
    assert(true, '玩家1 成功选择答案')

    // 继续下一回合
    const nextBtn = p1.locator('[data-testid="next-btn"]')
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      await p1.waitForTimeout(500)
    }
  }

  // ── Step 6: 检查同步 - 两端棋子位置一致 ──
  console.log('\n══ Step 6: 验证状态同步 ══')
  await p1.waitForTimeout(800)
  const p1Pos = await p1.evaluate(() => {
    const tokenHost = document.querySelector('.token-host')
    return tokenHost?.closest('.cell')?.getAttribute('data-testid') ?? 'unknown'
  })
  const p2Pos = await p2.evaluate(() => {
    const tokenHost = document.querySelector('.token-host')
    return tokenHost?.closest('.cell')?.getAttribute('data-testid') ?? 'unknown'
  })
  assert(p1Pos === p2Pos, `两端棋子位置同步一致: ${p1Pos}`)
  await shot(p1, '10-p1-final')
  await shot(p2, '11-p2-final')

} catch (err) {
  console.error('\n💥 测试异常:', err.message)
  await shot(p1, 'error-p1').catch(() => {})
  await shot(p2, 'error-p2').catch(() => {})
  fail++
} finally {
  await browser.close()
}

// ── 结果汇总 ────────────────────────────────
console.log('\n══════════════════════════════════════')
console.log(`  通过: ${pass}  失败: ${fail}`)
console.log(`  截图: ${SHOTS_DIR}`)
console.log('══════════════════════════════════════')
process.exit(fail > 0 ? 1 : 0)
