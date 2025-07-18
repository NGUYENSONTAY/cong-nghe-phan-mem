import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/adminAPI';
import { orderAPI } from '../../api/orderAPI';
import Loading from '../../components/common/Loading';
import { FaBook, FaShoppingCart, FaUsers, FaDollarSign, FaTags, FaPen, FaEye, FaPlus, FaChartLine } from 'react-icons/fa';

const AdminOverview: React.FC = () => {
    const { data: stats, isLoading, error } = useQuery(
        'adminOverview',
        adminAPI.getOverview,
        {
            refetchInterval: 30000, // Refresh every 30 seconds
        }
    );

    const { data: recentOrders, isLoading: ordersLoading } = useQuery(
        'recentOrders',
        () => orderAPI.getAllOrders(0, 5), // Get latest 5 orders
        {
            refetchInterval: 60000, // Refresh every minute
        }
    );

    const { data: bestSellers, isLoading: bestSellersLoading } = useQuery(
        'bestSellers',
        () => adminAPI.getBestSellers(5),
        {
            refetchInterval: 300000, // Refresh every 5 minutes
        }
    );

    if (isLoading) return <Loading text="Đang tải thống kê tổng quan..." />;
    if (error) return <div className="text-red-500">Lỗi khi tải dữ liệu: {(error as Error).message}</div>;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'SHIPPED': return 'Đang giao';
            case 'DELIVERED': return 'Đã giao';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const statCards = [
        {
            title: 'Tổng số sách',
            value: stats?.books?.total || 0,
            subtitle: `${stats?.books?.available || 0} còn hàng`,
            icon: FaBook,
            color: 'bg-blue-500',
            change: '+5%',
            link: '/admin/books'
        },
        {
            title: 'Đơn hàng mới',
            value: stats?.orders?.pending || 0,
            subtitle: `${stats?.orders?.total || 0} tổng đơn`,
            icon: FaShoppingCart,
            color: 'bg-green-500',
            change: '+12%',
            link: '/admin/orders'
        },
        {
            title: 'Danh mục',
            value: stats?.categories?.total || 0,
            subtitle: 'Thể loại sách',
            icon: FaTags,
            color: 'bg-purple-500',
            change: '+2%',
            link: '/admin/categories'
        },
        {
            title: 'Tác giả',
            value: stats?.authors?.total || 0,
            subtitle: 'Tác giả trong hệ thống',
            icon: FaPen,
            color: 'bg-orange-500',
            change: '+8%',
            link: '/admin/books' // Changed from /admin/authors to /admin/books
        },
        {
            title: 'Doanh thu',
            value: formatCurrency(stats?.totalRevenue || 0),
            subtitle: 'Tổng doanh thu',
            icon: FaDollarSign,
            color: 'bg-emerald-500',
            change: '+15%',
            link: '/admin/orders' // Changed from /admin/analytics to /admin/orders
        }
    ];

    const orderStats = [
        { label: 'Chờ xử lý', value: stats?.orders?.pending || 0, color: 'bg-yellow-500' },
        { label: 'Đã xác nhận', value: stats?.orders?.confirmed || 0, color: 'bg-blue-500' },
        { label: 'Đang giao', value: stats?.orders?.shipped || 0, color: 'bg-indigo-500' },
        { label: 'Đã giao', value: stats?.orders?.delivered || 0, color: 'bg-green-500' },
        { label: 'Đã hủy', value: stats?.orders?.cancelled || 0, color: 'bg-red-500' }
    ];

    const quickActions = [
        {
            title: 'Thêm sách mới',
            description: 'Thêm sách mới vào kho',
            icon: FaPlus,
            color: 'text-blue-500',
            link: '/admin/books/new'
        },
        {
            title: 'Xem đơn hàng mới',
            description: 'Quản lý đơn hàng chờ xử lý',
            icon: FaEye,
            color: 'text-green-500',
            link: '/admin/orders?status=PENDING'
        },
        {
            title: 'Quản lý danh mục',
            description: 'Xem và chỉnh sửa danh mục',
            icon: FaChartLine,
            color: 'text-purple-500',
            link: '/admin/categories' // Changed from /admin/analytics to /admin/categories
        },
        {
            title: 'Quản lý người dùng',
            description: 'Xem và quản lý tài khoản',
            icon: FaUsers,
            color: 'text-orange-500',
            link: '/admin/users'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Tổng quan Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {statCards.map((stat, index) => (
                    <Link 
                        key={index} 
                        to={stat.link}
                        className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">
                                    {typeof stat.value === 'number' ? stat.value.toLocaleString('vi-VN') : stat.value}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                            <span className="text-gray-500 text-sm ml-1">so với tháng trước</span>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Status Chart */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái đơn hàng</h3>
                    <div className="space-y-4">
                        {orderStats.map((stat, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full ${stat.color} mr-3`}></div>
                                    <span className="text-sm text-gray-600">{stat.label}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    {stat.value.toLocaleString('vi-VN')}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <Link 
                            to="/admin/orders"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Xem tất cả đơn hàng →
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
                    <div className="space-y-3">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.link}
                                className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center">
                                    <action.icon className={`w-4 h-4 ${action.color} mr-3`} />
                                    <div>
                                        <span className="text-sm font-medium text-gray-900">{action.title}</span>
                                        <p className="text-xs text-gray-500">{action.description}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Best Sellers */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sách bán chạy</h3>
                    {bestSellersLoading ? (
                        <div className="text-center py-4">
                            <Loading text="Đang tải..." />
                        </div>
                    ) : bestSellers && bestSellers.length > 0 ? (
                        <div className="space-y-3">
                            {bestSellers.slice(0, 5).map((book: any, index: number) => (
                                <div key={book._id || index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-xs font-semibold text-blue-600">#{index + 1}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                                {book.title}
                                            </p>
                                            <p className="text-xs text-gray-500">{book.author}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-600">
                                        {book.soldCount || 0} bán
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Không có dữ liệu</p>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <Link 
                            to="/admin/books"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Xem tất cả sách →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h3>
                        <Link 
                            to="/admin/orders"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Xem tất cả →
                        </Link>
                    </div>
                </div>
                <div className="p-6">
                    {ordersLoading ? (
                        <div className="text-center py-8">
                            <Loading text="Đang tải đơn hàng..." />
                        </div>
                    ) : recentOrders && recentOrders.data && recentOrders.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mã đơn</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Khách hàng</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ngày đặt</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tổng tiền</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.data.map((order: any) => (
                                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <Link 
                                                    to={`/admin/orders/${order._id}`}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    #{order._id}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-900">
                                                {order.user?.name || order.customerName || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {formatDateTime(order.orderDate || order.createdAt)}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Chưa có đơn hàng nào</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOverview; 