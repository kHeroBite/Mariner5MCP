# ConversationStart Hook - PROJECT.md 자동 읽기
# 대화 시작 시 자동으로 PROJECT.md를 읽도록 함

# UTF-8 인코딩 설정
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()

# 표준 입력에서 JSON 읽기
$jsonInput = [Console]::In.ReadToEnd()

# 현재 작업 디렉토리 설정 (JSON 입력이 없으면 현재 디렉토리 사용)
$cwd = $PWD.Path
if ($jsonInput -and $jsonInput.Trim()) {
    try {
        $inputData = $jsonInput | ConvertFrom-Json
        if ($inputData.cwd) {
            $cwd = $inputData.cwd
        }
    } catch {
        # JSON 파싱 실패 시 현재 디렉토리 사용
    }
}

# PROJECT.md 파일 경로
$projectMdPath = Join-Path $cwd "PROJECT.md"

# PROJECT.md 파일이 존재하는지 확인
if (Test-Path $projectMdPath) {
    # Context 추가: PROJECT.md를 자동으로 읽으라는 메시지
    $response = @{
        context = @"
<system-reminder>
🚨 CONVERSATION START - AUTOMATIC PROJECT.MD LOADING 🚨

This is the beginning of a new conversation in the MARS project.

AUTOMATIC ACTION - EXECUTE IMMEDIATELY:
Use the Read tool to read PROJECT.md file at: $projectMdPath

This file contains:
- Complete project architecture (67 C# files, 5 layers)
- All function signatures and call chains
- Database schema and connection patterns
- UI component hierarchy
- Critical dependencies and performance hotspots

ACCORDING TO CLAUDE.md PROJECT RULES:
- "PROJECT.md 파일을 항상 읽어야한다. 무조건 읽어라."
- "이 파일은 이 프로젝트의 설계도이자 지도이다."
- "항상 이 파일을 참조하여 빠른 조회 및 검색을 해야한다."

Read PROJECT.md now before proceeding with any tasks.
</system-reminder>
"@
    }

    # JSON 출력 (UTF-8)
    $jsonOutput = $response | ConvertTo-Json -Compress
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    [Console]::WriteLine($jsonOutput)
} else {
    # PROJECT.md가 없으면 아무것도 하지 않음 (빈 JSON 반환)
    @{} | ConvertTo-Json -Compress | Write-Output
}
