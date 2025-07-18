import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen-nav flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center px-4">
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-600 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Trang không tìm thấy
          </h1>
          <p className="text-gray-600 mb-8">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="btn btn-primary btn-lg w-full"
          >
            Về trang chủ
          </Link>
          <Link
            to="/books"
            className="btn btn-outline w-full"
          >
            Xem tất cả sách
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            Hoặc bạn có thể{' '}
            <Link to="/contact" className="text-primary-600 hover:underline">
              liên hệ với chúng tôi
            </Link>{' '}
            nếu gặp vấn đề.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 