import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Toaster } from 'react-hot-toast';

// Import components (will create later)
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Import Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminBookManagement from './pages/admin/AdminBookManagement';
import AdminOrderManagement from './pages/admin/AdminOrderManagement';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminAuthorManagement from './pages/admin/AdminAuthorManagement';
import ImageManagement from './pages/admin/ImageManagement';
import AddBook from './pages/admin/AddBook';
import EditBook from './pages/admin/EditBook';
import AdminCategoryManagement from './pages/admin/AdminCategoryManagement';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Import contexts (will create later)
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              {/* Global Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />

              {/* Header */}
              <Header />

              {/* Main Content */}
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/books" element={<BooksPage />} />
                  <Route path="/books/:id" element={<BookDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected Routes */}
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }>
                    <Route index element={<AdminOverview />} />
                    <Route path="books" element={<AdminBookManagement />} />
                    <Route path="books/new" element={<AddBook />} />
                    <Route path="books/edit/:id" element={<EditBook />} />
                    <Route path="orders" element={<AdminOrderManagement />} />
                    <Route path="orders/:id" element={<AdminOrderDetail />} />
                    <Route path="users" element={<AdminUserManagement />} />
                    <Route path="authors" element={<AdminAuthorManagement />} />
                    <Route path="categories" element={<AdminCategoryManagement />} />
                    <Route path="images" element={<ImageManagement />} />
                  </Route>

                  {/* 404 Page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </Router>
      
      {/* React Query DevTools (only in development) */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App; 