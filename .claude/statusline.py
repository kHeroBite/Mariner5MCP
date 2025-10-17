#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, json, io, os

# UTF-8 입출력 설정
if hasattr(sys.stdin, 'buffer'):
    sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ✅ 세션 한도: 25시간(요청하신 5배)
BLOCK_MS = 25 * 60 * 60 * 1000

def to_percent(v):
    if v is None:
        return None
    try:
        v = float(v)
    except Exception:
        return None
    if v <= 1.0:
        v *= 100.0
    return max(0.0, min(100.0, round(v, 1)))

def fmt_mmss(ms):
    if not isinstance(ms, (int, float)) or ms <= 0:
        return "0분"
    s = int(ms // 1000)
    h = s // 3600
    m = (s % 3600) // 60
    if h > 0:
        return f"{h}시간{m}분"
    return f"{m}분"

def fmt_tokens(n):
    """정수 토큰 수를 보기 좋게. 1000 이상은 k 단위(소수1자리)."""
    try:
        n = int(n)
    except Exception:
        return None
    if n < 1000:
        return str(n)
    return f"{n/1000:.1f}k"

def analyze_transcript(transcript_path):
    """transcript 파일(.json 또는 .jsonl)을 분석하여 토큰 사용량 및 컨텍스트 계산

    Returns:
        tuple: (total_input, total_output, context_tokens)
    """
    if not transcript_path or not os.path.exists(transcript_path):
        return None, None, None

    try:
        total_input = 0
        total_output = 0
        last_context_tokens = None

        # .jsonl 형식 (JSON Lines) 처리
        if transcript_path.endswith('.jsonl'):
            with open(transcript_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        entry = json.loads(line)
                        # message.usage 구조 확인
                        msg = entry.get('message', {})
                        usage = msg.get('usage', {})
                        if isinstance(usage, dict):
                            input_tok = usage.get('input_tokens', 0) or 0
                            cache_read = usage.get('cache_read_input_tokens', 0) or 0
                            cache_create = usage.get('cache_creation_input_tokens', 0) or 0
                            output_tok = usage.get('output_tokens', 0) or 0

                            # 비용 청구되는 토큰 = 순수 입력 + 캐시 생성 (cache_read는 무료)
                            total_input += input_tok + cache_create
                            total_output += output_tok

                            # 마지막 응답의 컨텍스트 크기 (실제 사용량)
                            if cache_read > 0 or cache_create > 0 or input_tok > 0:
                                last_context_tokens = input_tok + cache_read + cache_create
                    except:
                        continue
        else:
            # 일반 .json 형식
            with open(transcript_path, 'r', encoding='utf-8') as f:
                transcript = json.load(f)

            messages = transcript.get('messages', [])
            for msg in messages:
                usage = msg.get('usage', {})
                if isinstance(usage, dict):
                    input_tok = usage.get('input_tokens', 0) or 0
                    cache_read = usage.get('cache_read_input_tokens', 0) or 0
                    cache_create = usage.get('cache_creation_input_tokens', 0) or 0
                    output_tok = usage.get('output_tokens', 0) or 0

                    # 비용 청구되는 토큰 = 순수 입력 + 캐시 생성 (cache_read는 무료)
                    total_input += input_tok + cache_create
                    total_output += output_tok

                    # 마지막 응답의 컨텍스트 (실제 사용량)
                    if cache_read > 0 or cache_create > 0 or input_tok > 0:
                        last_context_tokens = input_tok + cache_read + cache_create

        return (total_input if total_input > 0 else None,
                total_output if total_output > 0 else None,
                last_context_tokens)
    except Exception:
        return None, None, None

def load_stdin_json():
    try:
        # BOM 제거를 위해 텍스트로 읽기
        content = sys.stdin.read()
        # UTF-8 BOM 제거
        if content.startswith('\ufeff'):
            content = content[1:]
        return json.loads(content)
    except Exception as e:
        return {}

data = load_stdin_json()

# --- 기본 필드 ---
model = data.get('model', {}).get('display_name', 'Unknown')
cost_usd = float(data.get('cost', {}).get('total_cost_usd', 0) or 0)
duration_ms = int(data.get('cost', {}).get('total_duration_ms', 0) or 0)
lines_add = int(data.get('cost', {}).get('total_lines_added', 0) or 0)
lines_del = int(data.get('cost', {}).get('total_lines_removed', 0) or 0)

# 프로젝트명 추출
workspace = data.get('workspace', {})
project_dir = workspace.get('project_dir') or workspace.get('current_dir') or data.get('cwd', '')
project_name = os.path.basename(project_dir) if project_dir else 'Unknown'

# --- 세션 사용률 - usage 필드가 제공될 때만 표시 (토큰 기반) ---
usage = data.get('usage') or {}
session_used_pct = None
if isinstance(usage, dict):
    session_used_pct = to_percent((usage.get('session') or {}).get('percent_used'))

# 시간 기반 fallback 제거 - usage 필드가 있을 때만 표시
session_str = None
if session_used_pct is not None:
    session_str = f"{session_used_pct:.1f}%"

# --- 토큰 분석: transcript.json에서 직접 계산 ---
transcript_path = data.get('transcript_path')
input_tokens, output_tokens, context_tokens = analyze_transcript(transcript_path)

# transcript 분석 실패 시 fallback
if input_tokens is None and output_tokens is None:
    cost = data.get('cost') or {}
    token_counts = (cost.get('token_counts') or cost.get('tokens') or {}) if isinstance(cost, dict) else {}

    # 입력 토큰 후보
    for val in [cost.get('input_tokens'), cost.get('prompt_tokens'), token_counts.get('input'), usage.get('input_tokens')]:
        if val is not None:
            try:
                input_tokens = int(val)
                break
            except:
                pass

    # 출력 토큰 후보
    for val in [cost.get('output_tokens'), cost.get('completion_tokens'), token_counts.get('output'), usage.get('output_tokens')]:
        if val is not None:
            try:
                output_tokens = int(val)
                break
            except:
                pass

# 토큰 문자열 생성 (사용자 관점: in=받은것, out=보낸것)
total_tokens = (input_tokens or 0) + (output_tokens or 0) if (input_tokens is not None or output_tokens is not None) else None

if total_tokens is not None and total_tokens > 0:
    total_s = fmt_tokens(total_tokens)
    # 사용자 관점으로 swap:
    # in = AI로부터 받은 것 (API의 output_tokens)
    # out = AI에게 보낸 것 (API의 input_tokens)
    in_s = fmt_tokens(output_tokens) if output_tokens else "0"
    out_s = fmt_tokens(input_tokens) if input_tokens else "0"
    # 회색으로 표시
    token_str = f"\033[90m{total_s} (in:{in_s}, out:{out_s})\033[0m"
else:
    token_str = "\033[90mn/a\033[0m"

# 컨텍스트 문자열 생성 (200k 대비 남은 공간 %)
# 주의: transcript의 cache_read는 시스템 프롬프트/도구만 포함하고 Messages는 제외됨
# 시스템 사용량(프롬프트+도구 약 10%) 기본 차감하여 보정
context_str = "\033[90mn/a\033[0m"
if context_tokens is not None and context_tokens > 0:
    # 컨텍스트 토큰 10% 보정 및 시스템 사용량 10% 차감
    free_pct = ((200000 - (context_tokens * 1.1)) / 200000) * 100
    free_pct = max(0, free_pct - 10)
    # 색상 결정: 50% 이상 = 흰색, 50%~20% = 옥색, 20% 이하 = 핫핑크
    if free_pct > 50:
        context_str = f"\033[97m{free_pct:.1f}%\033[0m"  # 흰색 (밝은 흰색)
    elif free_pct > 20:
        context_str = f"\033[96m{free_pct:.1f}%\033[0m"  # 옥색 (시안)
    else:
        context_str = f"\033[38;2;255;105;180m{free_pct:.1f}%\033[0m"  # 핫핑크 RGB(255, 105, 180)

# --- 출력 ---
# 시간 문자열 (회색)
time_str = f"\033[90m{fmt_mmss(duration_ms)}\033[0m"
# 소스 변화량 문자열 (회색)
lines_str = f"\033[90m+{lines_add}/-{lines_del}\033[0m"

# 세션 정보가 있을 때만 표시
session_part = f" | 🔋 {session_str}" if session_str is not None else ""

print(
    f"📁 \033[96m{project_name}\033[0m | 🤖 {model} | ⏱️ {time_str}{session_part} | 📦 {context_str} | 🔢 {token_str} | 📝 {lines_str}"
)
