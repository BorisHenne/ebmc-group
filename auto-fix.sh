#!/bin/bash
# ============================================
# EBMC - Auto-fix GitHub Actions errors
# Récupère les erreurs du dernier build et les affiche
# Usage: ./auto-fix.sh
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    log_error "GitHub CLI (gh) not installed. Install it: https://cli.github.com/"
    exit 1
fi

log_info "🔍 Fetching latest workflow run..."

# Get latest failed run
RUN_ID=$(gh run list --status=failure --limit=1 --json databaseId --jq '.[0].databaseId' 2>/dev/null)

if [ -z "$RUN_ID" ]; then
    log_success "✅ No failed runs found! Last build succeeded."
    exit 0
fi

log_info "📋 Fetching errors from run #$RUN_ID..."

# Get the logs
echo ""
echo "========== GITHUB ACTIONS ERRORS =========="
gh run view $RUN_ID --log-failed 2>/dev/null | grep -E "(Error|error|failed|Failed|Cannot find|Module not found|Type '.*' is not assignable)" | head -50
echo "============================================"
echo ""

log_info "💡 Copy the errors above and ask Claude Code to fix them!"
log_info "Or run: gh run view $RUN_ID --log-failed"