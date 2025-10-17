#!/bin/bash
# 간단한 statusline - 세션 사용량 표시

input=$(cat)

# 기본값
model="Unknown"
cost="0"
duration="0"
lines_add="0"
lines_del="0"
dir="MARS"

# JSON 파싱 (간단하게)
if command -v jq &>/dev/null; then
    model=$(echo "$input" | jq -r '.model.display_name // "Unknown"')
    cost=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
    duration=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')
    lines_add=$(echo "$input" | jq -r '.cost.total_lines_added // 0')
    lines_del=$(echo "$input" | jq -r '.cost.total_lines_removed // 0')
fi

# 시간 변환 (밀리초 -> 분)
min=$((duration / 60000))
sec=$(( (duration % 60000) / 1000 ))

# 출력
echo "🤖 $model | 💰 \$$cost | ⏱️ ${min}m${sec}s | 📝 +$lines_add/-$lines_del | 📁 $dir"
