#!/bin/bash
# ============================================
# EBMC - Fix errors and deploy
# Usage: ./fix-and-deploy.sh "commit message"
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

MESSAGE=${1:-"fix: auto-fix and deploy"}

log_info "🔧 Running ESLint fix..."
npm run lint:fix || true

log_info "📦 Checking TypeScript..."
npm run typecheck || {
    log_error "TypeScript errors found! Fix them manually."
    exit 1
}

log_info "🏗️ Testing build..."
npm run build || {
    log_error "Build failed! Fix errors manually."
    exit 1
}

log_info "📤 Committing and pushing..."
git add .
git commit -m "$MESSAGE" || {
    log_info "Nothing to commit"
}
git push

log_success "✅ Deployed! Check GitHub Actions for status."
log_info "🔗 https://github.com/BorisHenne/ebmc-group/actions"