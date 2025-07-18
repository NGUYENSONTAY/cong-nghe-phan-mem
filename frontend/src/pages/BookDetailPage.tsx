import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { booksAPI } from '../api/booksAPI';
import { Book } from '../types';
import { useCart } from '../contexts/CartContext';
import BookCard from '../components/common/BookCard';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: book, isLoading: isLoadingBook, error } = useQuery<Book, Error>(
    ['book', id],
    () => booksAPI.getBookById(id!),
    { enabled: !!id }
  );

  const { data: relatedBooksResponse, isLoading: isLoadingRelated } = useQuery(
    ['relatedBooks', book?.category._id],
    () => booksAPI.getBooks(0, 4, { category: book!.category._id }),
    { enabled: !!book }
  );
  
  const relatedBooks = relatedBooksResponse?.data?.filter(
    (relatedBook) => relatedBook._id !== book?._id
  );

  const handleQuantityChange = (change: number) => {
    if (!book) return;
    const newQuantity = quantity + change;
    if (newQuantity > 0 && newQuantity <= book.quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (book) {
      addToCart(book, quantity);
      toast.success(`Đã thêm ${quantity} cuốn "${book.title}" vào giỏ hàng`);
    }
  };

  if (isLoadingBook) return <Loading text="Đang tải chi tiết sách..." />;
  if (error || !book) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold">Không tìm thấy sách</h2>
        <p className="text-gray-600 mt-2">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/books" className="btn btn-primary mt-6">
          Quay lại trang sách
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4">
              <img
                src={book.images[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
                alt={book.title}
                className="w-full max-w-sm h-auto object-contain"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Image'; }}
              />
            </div>

            {/* Details */}
            <div>
              <Link to={`/books?category=${book.category._id}`} className="text-primary hover:underline text-sm">
                {book.category.name}
              </Link>

              <h1 className="text-2xl font-bold mt-2 mb-4">{book.title}</h1>
              <p className="text-gray-700 mb-4 whitespace-pre-line">{book.description}</p>

              <div className="flex items-center mb-6 space-x-4">
                <span className="text-3xl font-semibold text-primary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
                </span>
                <span className="text-sm text-gray-500">Còn {book.quantity} cuốn</span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 mb-6">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="btn btn-outline btn-sm"
                  disabled={quantity === 1}
                >
                  -
                </button>
                <span className="px-4 py-2 border rounded-md">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="btn btn-outline btn-sm"
                  disabled={quantity === book.quantity}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn btn-primary btn-lg"
                disabled={book.quantity === 0}
              >
                Thêm vào giỏ hàng
              </button>
            </div>

          </div>
        </div>

        {/* Related books */}
        {relatedBooks && relatedBooks.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Sách liên quan</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedBooks.map((rb) => (
                <BookCard key={rb._id} book={rb} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookDetailPage;