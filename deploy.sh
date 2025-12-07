#!/bin/bash
# ============================================
# EBMC GROUP - Deployment Script for UGOS NAS
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
INSTALL_DIR="${INSTALL_DIR:-/volume1/docker/ebmc}"
REPO_URL="https://github.com/BorisHenne/ebmc.git"
COMPOSE_CMD="sudo docker compose"

# Functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

show_help() {
    cat << EOF
EBMC GROUP - Deployment Script for UGOS NAS

Usage: ./deploy.sh [command]

Commands:
  install     Clone repo and start services
  update      Pull latest changes and rebuild
  rebuild     Force rebuild all containers
  start       Start services
  stop        Stop services
  restart     Restart services
  logs        Show logs
  status      Show status
  backup      Backup MongoDB data
  cleanup     Remove all containers and volumes
  help        Show this help

Environment Variables:
  INSTALL_DIR     Installation directory (default: /volume1/docker/ebmc)
  PORT            App port (default: 3000)
  MONGO_USER      MongoDB user (default: ebmc)
  MONGO_PASSWORD  MongoDB password (default: ebmc_secret)

EOF
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
    fi
    log_info "Docker found"
}

install() {
    log_info "Installing EBMC GROUP..."
    
    check_docker
    
    # Create directory
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Clone if not exists
    if [ ! -d ".git" ]; then
        log_info "Cloning repository..."
        git clone "$REPO_URL" .
    fi
    
    # Create .env if not exists
    if [ ! -f ".env" ]; then
        log_info "Creating .env file..."
        cp .env.example .env
        
        # Generate random secret
        PAYLOAD_SECRET=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)
        sed -i "s/your-super-secret-key-change-in-production/$PAYLOAD_SECRET/" .env
        
        log_warn "Please edit .env file with your configuration"
        log_warn "Run: nano $INSTALL_DIR/.env"
    fi
    
    # Build and start
    log_info "Building and starting services..."
    $COMPOSE_CMD build --no-cache
    $COMPOSE_CMD up -d
    
    log_success "Installation complete!"
    log_info "App URL: http://localhost:${PORT:-8889}"
    log_info "Admin URL: http://localhost:${PORT:-8889}/admin"
}

update() {
    log_info "Updating EBMC GROUP..."
    
    cd "$INSTALL_DIR"
    
    # Pull latest
    git pull origin main
    
    # Rebuild
    $COMPOSE_CMD build
    $COMPOSE_CMD up -d
    
    log_success "Update complete!"
}

rebuild() {
    log_info "Rebuilding all services..."
    
    cd "$INSTALL_DIR"
    
    $COMPOSE_CMD down
    $COMPOSE_CMD build --no-cache
    $COMPOSE_CMD up -d
    
    log_success "Rebuild complete!"
}

start() {
    cd "$INSTALL_DIR"
    $COMPOSE_CMD up -d
    log_success "Services started"
}

stop() {
    cd "$INSTALL_DIR"
    $COMPOSE_CMD down
    log_success "Services stopped"
}

restart() {
    cd "$INSTALL_DIR"
    $COMPOSE_CMD restart
    log_success "Services restarted"
}

logs() {
    cd "$INSTALL_DIR"
    $COMPOSE_CMD logs -f "${2:-app}"
}

status() {
    cd "$INSTALL_DIR"
    $COMPOSE_CMD ps
}

backup() {
    log_info "Backing up MongoDB..."
    
    cd "$INSTALL_DIR"
    BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    $COMPOSE_CMD exec -T mongo mongodump --archive > "$BACKUP_DIR/mongo.archive"
    
    log_success "Backup saved to $BACKUP_DIR"
}

cleanup() {
    log_warn "This will remove all containers and volumes!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$INSTALL_DIR"
        $COMPOSE_CMD down -v --rmi all
        log_success "Cleanup complete"
    else
        log_info "Cleanup cancelled"
    fi
}

# Main
case "${1:-help}" in
    install)  install ;;
    update)   update ;;
    rebuild)  rebuild ;;
    start)    start ;;
    stop)     stop ;;
    restart)  restart ;;
    logs)     logs "$@" ;;
    status)   status ;;
    backup)   backup ;;
    cleanup)  cleanup ;;
    help|*)   show_help ;;
esac
