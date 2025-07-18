#!/bin/bash

# ==================== BOOKSTORE STARTUP SCRIPT ====================
# Script khởi động toàn bộ hệ thống Website Bán Sách
# Hỗ trợ chạy với Docker hoặc local development

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==================== FUNCTIONS ====================

print_header() {
    echo -e "${BLUE}"
    echo "======================================"
    echo "    🚀 WEBSITE BÁN SÁCH STARTUP     "
    echo "======================================"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_requirements() {
    print_info "Kiểm tra requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker chưa được cài đặt!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose chưa được cài đặt!"
        exit 1
    fi
    
    print_success "Docker và Docker Compose đã sẵn sàng"
}

start_docker() {
    print_info "Khởi động với Docker Compose..."
    
    # Stop existing containers
    docker-compose down 2>/dev/null || true
    
    # Remove orphaned containers
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Build and start services
    print_info "Building và starting services..."
    docker-compose up --build -d
    
    if [ $? -eq 0 ]; then
        print_success "Hệ thống đã khởi động thành công với Docker!"
        print_services_info
    else
        print_error "Lỗi khi khởi động với Docker"
        exit 1
    fi
}

start_local() {
    print_info "Khởi động local development..."
    
    # Check Java
    if ! command -v java &> /dev/null; then
        print_error "Java chưa được cài đặt!"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js chưa được cài đặt!"
        exit 1
    fi
    
    # Start MySQL with Docker
    print_info "Khởi động MySQL..."
    docker-compose up -d mysql
    
    # Wait for MySQL
    print_info "Đợi MySQL khởi động..."
    sleep 10
    
    # Start Backend
    print_info "Khởi động Backend..."
    cd backend
    if [ ! -f "target/bookstore-backend-1.0.0.jar" ]; then
        print_info "Building backend..."
        ./mvnw clean package -DskipTests
    fi
    ./mvnw spring-boot:run &
    BACKEND_PID=$!
    cd ..
    
    # Start Frontend
    print_info "Khởi động Frontend..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        print_info "Installing frontend dependencies..."
        npm install
    fi
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    print_success "Hệ thống local development đã khởi động!"
    print_services_info
    
    # Wait for user to stop
    echo -e "${YELLOW}Nhấn Ctrl+C để dừng hệ thống...${NC}"
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose stop mysql; exit" INT
    wait
}

print_services_info() {
    echo ""
    echo -e "${GREEN}🌐 CÁC DỊCH VỤ ĐANG CHẠY:${NC}"
    echo "======================================"
    echo -e "🖥️  Frontend:      ${BLUE}http://localhost:3000${NC}"
    echo -e "🔧 Backend API:    ${BLUE}http://localhost:8080${NC}"
    echo -e "📊 Database Admin: ${BLUE}http://localhost:8090${NC}"
    echo "======================================"
    echo ""
    echo -e "${GREEN}👤 TÀI KHOẢN TEST:${NC}"
    echo -e "Admin:    ${YELLOW}admin@bookstore.com${NC} / ${YELLOW}admin123${NC}"
    echo -e "Customer: ${YELLOW}customer1@example.com${NC} / ${YELLOW}password123${NC}"
    echo ""
}

show_logs() {
    print_info "Hiển thị logs của tất cả services..."
    docker-compose logs -f
}

stop_services() {
    print_info "Dừng tất cả services..."
    docker-compose down
    print_success "Đã dừng tất cả services!"
}

restart_services() {
    print_info "Restart tất cả services..."
    docker-compose restart
    print_success "Đã restart tất cả services!"
}

show_status() {
    print_info "Trạng thái các services:"
    docker-compose ps
}

clean_system() {
    print_warning "Xóa tất cả containers, images và volumes..."
    read -p "Bạn có chắc chắn? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --rmi all
        docker system prune -f
        print_success "Đã clean toàn bộ hệ thống!"
    else
        print_info "Hủy clean system."
    fi
}

show_help() {
    echo "Cách sử dụng: $0 [OPTION]"
    echo ""
    echo "TÙYCHỌN:"
    echo "  start, -s           Khởi động với Docker (mặc định)"
    echo "  local, -l           Khởi động local development"
    echo "  logs, -lg           Xem logs của tất cả services"
    echo "  stop, -st           Dừng tất cả services"
    echo "  restart, -r         Restart tất cả services"
    echo "  status, -stat       Xem trạng thái services"
    echo "  clean, -c           Clean toàn bộ system"
    echo "  help, -h            Hiển thị help"
    echo ""
    echo "VÍ DỤ:"
    echo "  $0                  # Khởi động với Docker"
    echo "  $0 local            # Khởi động local development"
    echo "  $0 logs             # Xem logs"
    echo "  $0 stop             # Dừng services"
}

# ==================== MAIN SCRIPT ====================

print_header

# Parse command line arguments
case "${1:-start}" in
    "start"|"-s"|"")
        check_requirements
        start_docker
        ;;
    "local"|"-l")
        start_local
        ;;
    "logs"|"-lg")
        show_logs
        ;;
    "stop"|"-st")
        stop_services
        ;;
    "restart"|"-r")
        restart_services
        ;;
    "status"|"-stat")
        show_status
        ;;
    "clean"|"-c")
        clean_system
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Tùy chọn không hợp lệ: $1"
        show_help
        exit 1
        ;;
esac 