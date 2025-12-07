# ============================================
# EBMC - Auto-fix GitHub Actions errors
# Récupère les erreurs du dernier build et les affiche
# Usage: .\auto-fix.ps1
# ============================================

function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Cyan }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor Red }
function Write-Success { Write-Host "[OK] $args" -ForegroundColor Green }

# Check if gh CLI is installed
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) not installed. Install it: https://cli.github.com/"
    exit 1
}

Write-Info "🔍 Fetching latest workflow run..."

# Get latest failed run
$runId = gh run list --status=failure --limit=1 --json databaseId --jq '.[0].databaseId' 2>$null

if ([string]::IsNullOrEmpty($runId)) {
    Write-Success "✅ No failed runs found! Last build succeeded."
    exit 0
}

Write-Info "📋 Fetching errors from run #$runId..."

Write-Host ""
Write-Host "========== GITHUB ACTIONS ERRORS ==========" -ForegroundColor Yellow
gh run view $runId --log-failed 2>$null | Select-String -Pattern "(Error|error|failed|Failed|Cannot find|Module not found|Type '.*' is not assignable)" | Select-Object -First 50
Write-Host "============================================" -ForegroundColor Yellow
Write-Host ""

Write-Info "💡 Copy the errors above and ask Claude Code to fix them!"
Write-Info "Or run: gh run view $runId --log-failed"