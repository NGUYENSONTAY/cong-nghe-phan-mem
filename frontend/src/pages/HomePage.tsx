import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, Category } from '../types';
import { booksAPI } from '../api/booksAPI';
import { categoryAPI } from '../api/categoryAPI';
import Loading from '../components/common/Loading';
import BookCard from '../components/common/BookCard';

const HomePage: React.FC = () => {
  const [latestBooks, setLatestBooks] = useState<Book[]>([]);
  const [bestSellers, setBestSellers] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          latestBooksData,
          bestSellersData,
          categoriesData,
        ] = await Promise.all([
          booksAPI.getLatestBooks(8),
          booksAPI.getBestSellers(4),
          categoryAPI.getAllCategories(),
        ]);
        setLatestBooks(latestBooksData);
        setBestSellers(bestSellersData);
        setCategories(categoriesData.slice(0, 6)); // Lấy 6 danh mục đầu tiên
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
        // You might want to show a toast notification here
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderBookSkeletons = (count: number) => {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8`}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="book-card animate-pulse">
            <div className="bg-gray-300 h-64 w-full rounded-lg"></div>
            <div className="mt-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Khám Phá Thế Giới Sách
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Hàng ngàn đầu sách chất lượng từ các tác giả nổi tiếng trong và ngoài nước
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/books"
              className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100"
            >
              Khám phá ngay
            </Link>
            <Link
              to="/books?filter=bestseller"
              className="btn btn-lg border-white text-white hover:bg-white hover:text-primary-600"
            >
              Sách bán chạy
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-4">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sách Chất Lượng</h3>
              <p className="text-gray-600">
                Hàng ngàn đầu sách được tuyển chọn kỹ lưỡng từ các nhà xuất bản uy tín.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Giao Hàng Nhanh</h3>
              <p className="text-gray-600">
                Giao hàng nhanh chóng trong vòng 24-48h tại TP.HCM và các tỉnh thành.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Đảm Bảo Chất Lượng</h3>
              <p className="text-gray-600">
                Cam kết 100% sách chính hãng, hỗ trợ đổi trả trong 7 ngày.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Books Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Sách Mới Nhất</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những cuốn sách vừa được phát hành, đang chờ bạn khám phá.
            </p>
          </div>
          
          {loading ? (
            renderBookSkeletons(8)
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {latestBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
          
          <div className="text-center">
            <Link to="/books" className="btn btn-outline">
              Xem tất cả sách
            </Link>
          </div>
        </div>
      </section>
      
      {/* Bestsellers Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Sách Bán Chạy</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Top những cuốn sách được độc giả yêu thích và tìm mua nhiều nhất.
            </p>
          </div>

          {loading ? (
            renderBookSkeletons(4)
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {bestSellers.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Thể Loại Sách</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá các thể loại sách đa dạng phù hợp với mọi độc giả
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/books?category=${category._id}`}
                className={`bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-primary-500 transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center`}
              >
                <div className="text-3xl mb-2">📚</div>
                <h3 className="font-semibold text-gray-800">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Đăng Ký Nhận Tin</h2>
          <p className="text-xl mb-8 opacity-90">
            Nhận thông báo về sách mới, khuyến mãi đặc biệt và nhiều ưu đãi hấp dẫn.
          </p>
          <div className="max-w-md mx-auto">
            <form className="flex">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button type="submit" className="btn bg-white text-primary-600 hover:bg-gray-100 rounded-l-none">
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 