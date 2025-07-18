import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaCartPlus } from 'react-icons/fa';
import { Book } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book, 1);
    toast.success(`Đã thêm "${book.title}" vào giỏ hàng`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const PLACEHOLDER = 'https://via.placeholder.com/300x400?text=No+Image';

  return (
    <Link to={`/books/${book._id}`} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <figure className="relative h-64">
        <img 
          src={book.images[0] || PLACEHOLDER} 
          alt={book.title} 
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
        />
        {book.quantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="badge badge-error text-white font-bold">Hết hàng</span>
          </div>
        )}
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title text-base font-bold truncate" title={book.title}>
          {book.title}
        </h2>
        <p className="text-sm text-gray-500 mb-2">{book.author}</p>
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold text-primary">{formatPrice(book.price)}</p>
          <div className="card-actions">
            <button 
              onClick={handleAddToCart} 
              className="btn btn-primary btn-sm"
              disabled={book.quantity === 0}
            >
              <FaCartPlus />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard; 