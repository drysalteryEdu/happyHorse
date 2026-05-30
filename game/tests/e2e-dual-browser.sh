#!/usr/bin/env bash
# 双浏览器 E2E 测试 - 使用 agent-browser --session 隔离两个玩家实例
# 用法: bash tests/e2e-dual-browser.sh

set -e

AGENT="node /home/asgard/Applications/agent-browser-main/bin/agent-browser.js"
BASE_URL="http://localhost:5173"
SHOTS_DIR="$HOME/.agent-browser/tmp/screenshots"
mkdir -p "$SHOTS_DIR"

section() { echo; echo "══════════════════════════════════════"; echo "  $1"; echo "══════════════════════════════════════"; }
p1() { $AGENT --session player1 "$@"; }
p2() { $AGENT --session player2 "$@"; }
shot() { local session="$1" name="$2"; $AGENT --session "$session" screenshot "$SHOTS_DIR/$name.png" && echo "  📸 $name.png"; }

# ──────────────────────────────────────────────
section "Step 1: 打开大厅页面"
p1 open "$BASE_URL"
p2 open "$BASE_URL"
sleep 2
shot player1 "01-p1-lobby"
shot player2 "02-p2-lobby"

# ──────────────────────────────────────────────
section "Step 2: 玩家1 创建房间"
p1 fill '[data-testid="name-input"]' "小明"
p1 click '[data-testid="create-btn"]'
sleep 3

shot player1 "03-p1-waiting"

# 获取房间ID
ROOM_ID=$(p1 get text '[data-testid="room-id"]' 2>/dev/null || echo "")
if [ -z "$ROOM_ID" ]; then
  # 备用：用 eval 从 DOM 取值
  ROOM_ID=$(p1 eval "document.querySelector('[data-testid=\"room-id\"]')?.textContent?.trim() || ''" 2>/dev/null || echo "")
fi

echo "  🏠 房间号: $ROOM_ID"

if [ -z "$ROOM_ID" ]; then
  echo "  ⚠️  无法获取房间号，退出"
  exit 1
fi

# ──────────────────────────────────────────────
section "Step 3: 玩家2 加入房间"
p2 fill '[data-testid="name-input"]' "小红"
p2 fill '[data-testid="room-id-input"]' "$ROOM_ID"
p2 click '[data-testid="join-btn"]'
sleep 4

shot player1 "04-p1-game-start"
shot player2 "05-p2-game-start"

# ──────────────────────────────────────────────
section "Step 4: 玩家1 掷骰子"
p1 wait '[data-testid="dice-btn"]' 2>/dev/null || true
p1 click '[data-testid="dice-btn"]'
sleep 2

shot player1 "06-p1-after-roll"
shot player2 "07-p2-synced-roll"

# ──────────────────────────────────────────────
section "Step 5: 检查是否弹出题目卡片"
HAS_QUESTION=$(p1 is visible '[data-testid="option-0"]' 2>/dev/null || echo "false")
echo "  题目卡出现: $HAS_QUESTION"

if [ "$HAS_QUESTION" = "true" ]; then
  section "Step 6: 玩家1 选择答案 A"
  p1 click '[data-testid="option-0"]'
  sleep 2
  shot player1 "08-p1-answer-result"
  shot player2 "09-p2-answer-synced"

  # 继续下一回合
  p1 click '[data-testid="next-btn"]' 2>/dev/null || true
  sleep 1
  shot player1 "10-p1-next-turn"
fi

# ──────────────────────────────────────────────
section "Step 6: 玩家2 掷骰子"
p2 wait '[data-testid="dice-btn"]' 2>/dev/null || true
HAS_P2_DICE=$(p2 is visible '[data-testid="dice-btn"]' 2>/dev/null || echo "false")
if [ "$HAS_P2_DICE" = "true" ]; then
  p2 click '[data-testid="dice-btn"]'
  sleep 2
  shot player1 "11-p1-p2-rolled"
  shot player2 "12-p2-rolled"
fi

section "✅ 测试完成"
echo ""
echo "截图保存在: $SHOTS_DIR"
ls -1t "$SHOTS_DIR"/*.png 2>/dev/null | head -15 | while read f; do echo "  $(basename $f)"; done
