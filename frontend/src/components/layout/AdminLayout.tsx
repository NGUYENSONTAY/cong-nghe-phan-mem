import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaTachometerAlt, FaBook, FaShoppingCart, FaUsers, FaTags, FaPen, FaImages } from 'react-icons/fa';

const AdminLayout: React.FC = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 mt-2 text-gray-600 transition-colors duration-300 transform rounded-lg hover:bg-gray-200 hover:text-gray-700 ${
      isActive ? 'bg-gray-200 text-gray-700' : 'text-gray-600'
    }`;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 bg-white border-r px-4 py-8">
        <h2 className="text-3xl font-semibold text-gray-800">Admin</h2>
        
        <nav className="flex flex-col mt-6">
          <NavLink to="/admin" end className={navLinkClasses}>
            <FaTachometerAlt className="w-5 h-5" />
            <span className="mx-4 font-medium">Tổng quan</span>
          </NavLink>

          <NavLink to="/admin/books" className={navLinkClasses}>
            <FaBook className="w-5 h-5" />
            <span className="mx-4 font-medium">Quản lý Sách</span>
          </NavLink>
          
          <NavLink to="/admin/categories" className={navLinkClasses}>
            <FaTags className="w-5 h-5" />
            <span className="mx-4 font-medium">Quản lý Danh mục</span>
          </NavLink>

          <NavLink to="/admin/orders" className={navLinkClasses}>
            <FaShoppingCart className="w-5 h-5" />
            <span className="mx-4 font-medium">Quản lý Đơn hàng</span>
          </NavLink>

          <NavLink to="/admin/users" className={navLinkClasses}>
            <FaUsers className="w-5 h-5" />
            <span className="mx-4 font-medium">Quản lý Người dùng</span>
          </NavLink>
          
          <NavLink to="/admin/authors" className={navLinkClasses}>
            <FaPen className="w-5 h-5" />
            <span className="mx-4 font-medium">Quản lý Tác giả</span>
          </NavLink>

          <NavLink to="/admin/images" className={navLinkClasses}>
            <FaImages className="w-5 h-5" />
            <span className="mx-4 font-medium">Quản lý Ảnh</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="container mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout; 