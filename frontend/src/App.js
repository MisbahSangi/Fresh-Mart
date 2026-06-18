import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';

// Customer Pages
import HomePage          from './pages/customer/HomePage';
import LoginPage         from './pages/customer/LoginPage';
import RegisterPage      from './pages/customer/RegisterPage';
import ProductsPage      from './pages/customer/ProductsPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage          from './pages/customer/CartPage';
import CheckoutPage      from './pages/customer/CheckoutPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import ProfilePage from './pages/customer/ProfilePage';

// Admin Pages
import AdminLoginPage      from './pages/admin/AdminLoginPage';
import AdminDashboard      from './pages/admin/AdminDashboard';
import AdminProductsPage   from './pages/admin/AdminProductsPage';
import AdminOrdersPage     from './pages/admin/AdminOrdersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminGuard from './components/admin/AdminGuard';

// Components
import Navbar  from './components/common/Navbar';
import Footer  from './components/common/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" />
        <Routes>

          <Route path="/admin/login"      element={<AdminLoginPage />} />
          <Route path="/admin" element={
          <AdminGuard><AdminDashboard /></AdminGuard> } />
          <Route path="/admin/products" element={
          <AdminGuard><AdminProductsPage /></AdminGuard> } />
          <Route path="/admin/orders" element={
          <AdminGuard><AdminOrdersPage /></AdminGuard> } />
          <Route path="/admin/categories" element={
          <AdminGuard><AdminCategoriesPage /></AdminGuard> } />
          <Route path="/admin/reviews" element={
          <AdminGuard><AdminReviewsPage /></AdminGuard> } />

          {/* ── Customer Routes (with Navbar/Footer) ── */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="min-h-screen">
                <Routes>
                  <Route path="/"            element={<HomePage />} />
                  <Route path="/login"       element={<LoginPage />} />
                  <Route path="/register"    element={<RegisterPage />} />
                  <Route path="/products"    element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart"        element={<CartPage />} />
                  <Route path="/checkout"    element={<CheckoutPage />} />
                  <Route path="/orders"      element={<OrderTrackingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;