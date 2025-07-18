# 📚 Thế Giới Sách - Frontend

Website bán sách trực tuyến được xây dựng với React TypeScript và TailwindCSS.

## 🚀 Công nghệ sử dụng

- **React 18** - UI Library
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework  
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **React Query** - Data fetching & caching
- **React Icons** - Icon library

## 📁 Cấu trúc thư mục

```
src/
├── components/          # Reusable components
│   ├── common/         # Common UI components
│   ├── layout/         # Layout components
│   └── forms/          # Form components
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   └── admin/          # Admin pages
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript interfaces
├── utils/              # Utility functions
└── styles/             # CSS files
```

## 🛠️ Cài đặt và chạy

### Prerequisites
- Node.js 16+ 
- npm hoặc yarn

### Bước 1: Cài đặt dependencies
```bash
npm install
# hoặc
yarn install
```

### Bước 2: Cấu hình environment
Copy file `.env.example` thành `.env` và cập nhật các biến:
```bash
cp .env.example .env
```

### Bước 3: Chạy development server
```bash
npm start
# hoặc
yarn start
```

Website sẽ chạy tại: http://localhost:3000

### Bước 4: Build cho production
```bash
npm run build
# hoặc
yarn build
```

## 🎯 Tính năng chính

### Cho khách hàng:
- 🏠 **Trang chủ** - Hiển thị sách nổi bật, mới nhất
- 📖 **Danh sách sách** - Tìm kiếm, lọc, phân trang
- 🔍 **Chi tiết sách** - Thông tin chi tiết, đánh giá
- 🛒 **Giỏ hàng** - Thêm, xóa, cập nhật số lượng
- 💳 **Thanh toán** - Đặt hàng và thanh toán
- 📋 **Đơn hàng** - Theo dõi trạng thái đơn hàng
- 👤 **Tài khoản** - Quản lý thông tin cá nhân

### Cho admin:
- 📊 **Dashboard** - Thống kê tổng quan
- 📚 **Quản lý sách** - CRUD sách, thể loại, tác giả
- 📦 **Quản lý đơn hàng** - Xử lý và theo dõi đơn hàng
- 👥 **Quản lý người dùng** - Thông tin khách hàng
- 📈 **Báo cáo** - Doanh thu, thống kê bán hàng

## 🎨 UI/UX Design

- **Responsive design** - Tối ưu cho mobile và desktop
- **Modern UI** - Clean, intuitive interface
- **Dark/Light mode** - Hỗ trợ theme switching
- **Loading states** - Skeleton loading và spinners
- **Error handling** - User-friendly error messages
- **Accessibility** - WCAG compliant

## 🔧 Scripts có sẵn

```bash
# Chạy development server
npm start

# Build production
npm run build

# Chạy tests
npm test

# Eject (không khuyến khích)
npm run eject
```

## 🌐 Environment Variables

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_APP_NAME=Thế Giới Sách
GENERATE_SOURCEMAP=false
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

## 🎭 Component Guidelines

### Naming Convention
- Components: PascalCase (e.g., `BookCard.tsx`)
- Files: camelCase (e.g., `useAuth.ts`)
- Constants: UPPER_SNAKE_CASE

### Code Style
- Use TypeScript interfaces for props
- Implement proper error boundaries
- Add loading and error states
- Use semantic HTML elements
- Follow accessibility guidelines

## 🔗 API Integration

Ứng dụng kết nối với Spring Boot backend qua REST API:

```typescript
// Example API call
import { booksAPI } from '../services/api';

const books = await booksAPI.getBooks({
  page: 0,
  size: 12,
  categoryId: 1
});
```

## 🚀 Deployment

### Build for production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Connect Git repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables

### Docker Deployment
```bash
# Build image
docker build -t bookstore-frontend .

# Run container  
docker run -p 3000:3000 bookstore-frontend
```

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ team development.

## 📝 License

MIT License - see LICENSE file for details. 