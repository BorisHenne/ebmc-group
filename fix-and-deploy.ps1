# ============================================
# EBMC - Fix errors and deploy
# Usage: .\fix-and-deploy.ps1 "commit message"
# ============================================

param(
    [string]$Message = "fix: auto-fix and deploy"
)

function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Cyan }
function Write-Success { Write-Host "[OK] $args" -ForegroundColor Green }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor Red }

Write-Info "🔧 Running ESLint fix..."
npm run lint:fix

Write-Info "📦 Checking TypeScript..."
$typecheck = npm run typecheck 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "TypeScript errors found!"
    Write-Host $typecheck
    exit 1
}

Write-Info "🏗️ Testing build..."
$build = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed!"
    Write-Host $build
    exit 1
}

Write-Info "📤 Committing and pushing..."
git add .
git commit -m $Message
git push

Write-Success "✅ Deployed! Check GitHub Actions for status."
Write-Host "🔗 https://github.com/BorisHenne/ebmc-group/actions" -ForegroundColor Yellow