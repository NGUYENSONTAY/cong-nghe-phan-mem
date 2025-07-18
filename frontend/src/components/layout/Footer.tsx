import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-bold">Thế Giới Sách</span>
            </div>
            <p className="text-gray-300 text-sm">
              Cửa hàng sách trực tuyến hàng đầu Việt Nam với hàng ngàn đầu sách chất lượng từ các tác giả nổi tiếng trong và ngoài nước.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.219-.359-1.219c0-1.142.662-1.995 1.482-1.995.699 0 1.037.219 1.037 1.142 0 .695-.442 1.734-.442 2.692 0 .662.219 1.219.662 1.482.662.359 1.738-.219 2.398-1.142.662-.925 1.142-2.403 1.142-4.038 0-2.403-1.738-4.038-4.58-4.038-3.158 0-5.079 2.403-5.079 4.798 0 .925.359 1.925.801 2.403.219.262.262.442.199.695-.041.219-.199.801-.262.925-.082.262-.359.359-.662.219-1.142-.525-1.738-2.183-1.738-3.439 0-2.901 2.117-5.562 6.117-5.562 3.158 0 5.641 2.259 5.641 5.281 0 3.158-1.995 5.641-4.798 5.641-.925 0-1.801-.482-2.117-.925 0 0-.482 1.738-.566 2.183-.219.801-.801 1.801-1.219 2.4C9.498 23.673 10.717 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/books" className="text-gray-300 hover:text-white transition-colors">
                  Tất cả sách
                </Link>
              </li>
              <li>
                <Link to="/books?category=bestseller" className="text-gray-300 hover:text-white transition-colors">
                  Sách bán chạy
                </Link>
              </li>
              <li>
                <Link to="/books?category=new" className="text-gray-300 hover:text-white transition-colors">
                  Sách mới
                </Link>
              </li>
              <li>
                <Link to="/books?category=discount" className="text-gray-300 hover:text-white transition-colors">
                  Sách giảm giá
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thể loại</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/books?category=literature" className="text-gray-300 hover:text-white transition-colors">
                  Văn học
                </Link>
              </li>
              <li>
                <Link to="/books?category=economics" className="text-gray-300 hover:text-white transition-colors">
                  Kinh tế
                </Link>
              </li>
              <li>
                <Link to="/books?category=technology" className="text-gray-300 hover:text-white transition-colors">
                  Công nghệ
                </Link>
              </li>
              <li>
                <Link to="/books?category=psychology" className="text-gray-300 hover:text-white transition-colors">
                  Tâm lý học
                </Link>
              </li>
              <li>
                <Link to="/books?category=history" className="text-gray-300 hover:text-white transition-colors">
                  Lịch sử
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>123 Nguyễn Trãi, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>1900 1234</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>contact@thegiosach.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>8:00 - 22:00 (Hàng ngày)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div>
              <h4 className="text-sm font-semibold mb-2">Phương thức thanh toán</h4>
              <div className="flex space-x-4">
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-blue-600 font-bold text-xs">VISA</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-red-600 font-bold text-xs">Mastercard</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-blue-800 font-bold text-xs">PayPal</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-green-600 font-bold text-xs">MoMo</span>
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Thanh toán an toàn & bảo mật</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Thế Giới Sách. Tất cả quyền được bảo lưu.</p>
          <div className="flex justify-center space-x-6 mt-2">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Chính sách bảo mật
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link to="/shipping" className="hover:text-white transition-colors">
              Chính sách giao hàng
            </Link>
            <Link to="/return" className="hover:text-white transition-colors">
              Chính sách đổi trả
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 