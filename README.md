# 📚 Website Bán Sách Trực Tuyến

Hệ thống website bán sách trực tuyến hoàn chỉnh được xây dựng với kiến trúc tách biệt Frontend và Backend.

## 🎯 Tổng quan

### 🏗️ Kiến trúc hệ thống
- **Frontend**: React TypeScript + TailwindCSS
- **Backend**: Spring Boot + JPA/Hibernate + MySQL
- **Database**: MySQL 8.0
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Docker + Docker Compose

### ✨ Tính năng chính

#### Cho khách hàng:
- 🏠 **Trang chủ** với sách nổi bật và thể loại
- 📖 **Danh sách sách** với tìm kiếm, lọc và phân trang
- 🔍 **Chi tiết sách** với thông tin đầy đủ
- 🛒 **Giỏ hàng** với quản lý số lượng
- 💳 **Thanh toán** và đặt hàng
- 📋 **Theo dõi đơn hàng**
- 👤 **Quản lý tài khoản cá nhân**

#### Cho admin:
- 📊 **Dashboard** với thống kê tổng quan
- 📚 **Quản lý sách, thể loại, tác giả**
- 📦 **Quản lý đơn hàng và trạng thái**
- 👥 **Quản lý người dùng**
- 📈 **Báo cáo doanh thu và thống kê**

## 🚀 Cài đặt và chạy

### Prerequisites
- **Docker & Docker Compose**
- **Java 17+** (nếu chạy local)
- **Node.js 18+** (nếu chạy local)
- **MySQL 8.0** (nếu chạy local)

### 🐳 Chạy với Docker (Khuyến khích)

```bash
# Clone repository
git clone <repository-url>
cd bookstore

# Chạy toàn bộ hệ thống
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng hệ thống
docker-compose down
```

**Truy cập ứng dụng:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database Admin: http://localhost:8090
- Swagger UI: http://localhost:8080/swagger-ui/index.html

### 💻 Chạy Local Development

#### Backend (Spring Boot)
```bash
cd backend

# Cấu hình database trong application.properties
# Chạy ứng dụng
./mvnw spring-boot:run

# Hoặc với Maven
mvn spring-boot:run
```

#### Frontend (React)
```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm start

# Build production
npm run build
```

## 📁 Cấu trúc project

```
bookstore/
├── backend/                 # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/bookstore/
│   │       ├── controller/  # REST Controllers
│   │       ├── service/     # Business Logic
│   │       ├── repository/  # Data Access Layer
│   │       ├── entity/      # JPA Entities
│   │       ├── dto/         # Data Transfer Objects
│   │       ├── config/      # Configuration Classes
│   │       └── security/    # Security & JWT
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                # React TypeScript Frontend
│   ├── src/
│   │   ├── components/      # React Components
│   │   ├── pages/           # Page Components
│   │   ├── contexts/        # React Contexts
│   │   ├── services/        # API Services
│   │   ├── types/           # TypeScript Types
│   │   └── styles/          # CSS Styles
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml       # Docker Compose Configuration
└── README.md
```

## 🎨 Công nghệ sử dụng

### Backend
- **Spring Boot 3.2**: Framework chính
- **Spring Security**: Authentication & Authorization
- **Spring Data JPA**: ORM và database access
- **Hibernate**: JPA implementation
- **MySQL**: Database
- **JWT**: Stateless authentication
- **Maven**: Dependency management
- **Docker**: Containerization

### Frontend
- **React 18**: UI Library
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **React Context**: State management
- **React Hot Toast**: Notifications

## 🔧 Cấu hình

### Environment Variables

#### Backend (.env hoặc application.properties)
```properties
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/bookstore
SPRING_DATASOURCE_USERNAME=bookstore_user
SPRING_DATASOURCE_PASSWORD=bookstore_password
JWT_SECRET=mySecretKey
JWT_EXPIRATION=86400000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_APP_NAME=Thế Giới Sách
```

## 📊 Database Schema

### Entities chính:
- **User**: Thông tin người dùng (customer/admin)
- **Book**: Thông tin sách
- **Category**: Thể loại sách
- **Author**: Tác giả
- **Order**: Đơn hàng
- **OrderItem**: Chi tiết đơn hàng

## 🛡️ Security

- **JWT Authentication**: Stateless authentication
- **Role-based Authorization**: ADMIN/CUSTOMER roles
- **Password Encryption**: BCrypt hashing
- **CORS Configuration**: Cross-origin resource sharing
- **Input Validation**: Server-side validation

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - Thông tin user hiện tại

### Books
- `GET /api/books` - Danh sách sách (có phân trang)
- `GET /api/books/{id}` - Chi tiết sách
- `GET /api/books/search` - Tìm kiếm sách
- `POST /api/books` - Tạo sách mới (Admin)
- `PUT /api/books/{id}` - Cập nhật sách (Admin)
- `DELETE /api/books/{id}` - Xóa sách (Admin)

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/my-orders` - Đơn hàng của user
- `GET /api/orders/admin/all` - Tất cả đơn hàng (Admin)
- `PATCH /api/orders/admin/{id}/status` - Cập nhật trạng thái (Admin)

### Categories & Authors
- `GET /api/categories` - Danh sách thể loại
- `GET /api/authors` - Danh sách tác giả
- CRUD operations cho Admin

## 🚀 Deployment

### Production với Docker
```bash
# Build và deploy
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

### Cloud Deployment
- **Frontend**: Netlify, Vercel, AWS S3 + CloudFront
- **Backend**: AWS EC2, Heroku, Google Cloud Run
- **Database**: AWS RDS, Google Cloud SQL

## 🧪 Testing

```bash
# Backend tests
cd backend
mvn test

# Frontend tests
cd frontend
npm test
```

## 📈 Monitoring & Logging

- **Spring Boot Actuator**: Health checks và metrics
- **Application logs**: File-based logging
- **Docker logs**: Container monitoring

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` file for more information.

## 📞 Support

- **Email**: support@thegiosach.com
- **GitHub Issues**: [Create an issue](https://github.com/username/bookstore/issues)
- **Documentation**: [Wiki](https://github.com/username/bookstore/wiki)

## 🎉 Demo

### Accounts để test:
- **Admin**: admin@bookstore.com / admin123
- **Customer**: customer1@example.com / password123

### Sample Data:
- 10+ sách mẫu với đầy đủ thông tin
- 10 thể loại sách khác nhau
- 10 tác giả nổi tiếng

---

**Được phát triển với ❤️ bởi [Tên Developer]** 