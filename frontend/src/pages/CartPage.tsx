import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (bookId: string, newQuantity: number) => {
    updateQuantity(bookId, newQuantity);
  };
  
  if (cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-600 mt-2">Hãy khám phá thêm nhiều sách hay nhé!</p>
        <Link to="/books" className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 mt-6 inline-block">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="divide-y divide-gray-200">
              {cart.items.map(item => (
                <div key={item._id} className="flex items-center py-4">
                  <img src={item.image} alt={item.title} className="w-20 h-28 object-cover rounded-md mr-4" />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-red-600 font-bold mt-1">{(item.price).toLocaleString('vi-VN')} ₫</p>
                    <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 text-sm mt-2">Xóa</button>
                  </div>
                  <div className="flex items-center">
                    <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)} className="btn btn-sm btn-ghost">-</button>
                    <span className="mx-4">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)} className="btn btn-sm btn-ghost">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
             <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
              <div className="flex justify-between mb-2">
                <span>Tạm tính</span>
                <span>{cart.totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <hr className="my-4"/>
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng tiền</span>
                <span>{cart.totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <Link to="/checkout" className="bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 w-full mt-6 text-center block">
                Tiến hành thanh toán
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 