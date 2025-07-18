import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { orderAPI } from '../../api/orderAPI';
import { Order, OrderStatus } from '../../types';
import Loading from '../../components/common/Loading';
import { FaArrowLeft, FaCalendar, FaUser, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery<Order>(
    ['order', id],
    () => orderAPI.getOrderById(id!),
    {
      enabled: !!id,
    }
  );

  const updateStatusMutation = useMutation(
    ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderAPI.updateOrderStatus(orderId, status),
    {
      onSuccess: (updatedOrder) => {
        queryClient.setQueryData(['order', id], updatedOrder);
        queryClient.invalidateQueries(['adminOrders']);
        toast.success('Cập nhật trạng thái đơn hàng thành công!');
      },
      onError: (error: Error) => {
        toast.error(`Lỗi: ${error.message}`);
      },
    }
  );

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (order && id) {
      updateStatusMutation.mutate({ orderId: id, status: newStatus });
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'SHIPPED': return 'Đang giao';
      case 'DELIVERED': return 'Đã giao';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (isLoading) return <Loading text="Đang tải chi tiết đơn hàng..." />;
  if (error) return <div className="text-red-500">Lỗi: {(error as Error).message}</div>;
  if (!order) return <div className="text-gray-500">Không tìm thấy đơn hàng</div>;

  const canUpdateStatus = (currentStatus: OrderStatus, newStatus: OrderStatus) => {
    // Define business rules for status transitions
    switch (currentStatus) {
      case 'PENDING':
        return ['CONFIRMED', 'CANCELLED'].includes(newStatus);
      case 'CONFIRMED':
        return ['SHIPPED', 'CANCELLED'].includes(newStatus);
      case 'SHIPPED':
        return ['DELIVERED'].includes(newStatus);
      default:
        return false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/orders"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Đơn hàng #{order._id}
          </h1>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm đã đặt</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.book.images?.[0] || '/placeholder-book.jpg'}
                      alt={item.book.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{item.book.title}</h4>
                      <p className="text-sm text-gray-500">{item.book.author}</p>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(item.price)}</p>
                    <p className="text-sm text-gray-500">
                      Tổng: {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cập nhật trạng thái</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={!canUpdateStatus(order.status, status) || updateStatusMutation.isLoading}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    canUpdateStatus(order.status, status)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {getStatusText(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Info Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUser className="w-4 h-4 mr-2" />
              Thông tin khách hàng
            </h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-gray-500">Tên:</span>{' '}
                <span className="font-medium">{order.user.name}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Email:</span>{' '}
                <span className="font-medium">{order.user.email}</span>
              </p>
              {order.user.phone && (
                <p className="text-sm">
                  <span className="text-gray-500">Điện thoại:</span>{' '}
                  <span className="font-medium">{order.user.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaMapMarkerAlt className="w-4 h-4 mr-2" />
              Địa chỉ giao hàng
            </h3>
            <p className="text-sm text-gray-700">{order.address}</p>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaCreditCard className="w-4 h-4 mr-2" />
              Thanh toán
            </h3>
            <p className="text-sm">
              <span className="text-gray-500">Phương thức:</span>{' '}
              <span className="font-medium">COD</span>
            </p>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaCalendar className="w-4 h-4 mr-2" />
              Thời gian
            </h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-gray-500">Ngày đặt:</span>{' '}
                <span className="font-medium">{formatDateTime(order.createdAt)}</span>
              </p>
              {order.updatedAt && (
                <p className="text-sm">
                  <span className="text-gray-500">Cập nhật:</span>{' '}
                  <span className="font-medium">{formatDateTime(order.updatedAt)}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail; 