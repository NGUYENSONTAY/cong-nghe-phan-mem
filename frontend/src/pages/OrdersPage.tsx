import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../api/orderAPI';
import { Order, OrderStatus } from '../types';
import Loading from '../components/common/Loading';
import { format } from 'date-fns';

const statusDisplay: Record<OrderStatus, { text: string; className: string }> = {
  PENDING: { text: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { text: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
  SHIPPED: { text: 'Đang giao', className: 'bg-purple-100 text-purple-800' },
  DELIVERED: { text: 'Đã giao', className: 'bg-green-100 text-green-800' },
  CANCELLED: { text: 'Đã hủy', className: 'bg-red-100 text-red-800' },
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userOrders = await orderAPI.getUserOrders();
        setOrders(userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err: any) {
        setError(err.message || 'Không thể tải được lịch sử đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return <Loading text="Đang tải lịch sử đơn hàng..." />;
  if (error) return <div className="text-center p-12 text-red-500">{error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Lịch sử đơn hàng</h1>
        {orders.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-lg shadow">
            <h2 className="text-xl font-semibold">Bạn chưa có đơn hàng nào.</h2>
            <Link to="/books" className="btn btn-primary mt-6">
              Bắt đầu mua sắm
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b bg-gray-50">
                  <div>
                    <p className="font-semibold text-lg">Đơn hàng #{order._id.slice(-6)}</p>
                    <p className="text-sm text-gray-500">
                      Ngày đặt: {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusDisplay[order.status]?.className}`}>
                      {statusDisplay[order.status]?.text || 'Không rõ'}
                    </span>
                    <p className="font-bold text-lg mt-2">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
                <div className="p-6">
                   <ul className="space-y-4 mb-4">
                       {order.items.map(item => (
                           <li key={item.book._id} className="flex items-center">
                               <img src={item.book.images[0]} alt={item.book.title} className="w-16 h-20 object-cover rounded mr-4"/>
                               <div>
                                   <p className="font-semibold">{item.book.title}</p>
                                   <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                               </div>
                           </li>
                       ))}
                   </ul>
                   <div className="text-right">
                        <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                           Xem chi tiết
                        </Link>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 