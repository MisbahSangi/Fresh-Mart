import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FiGrid, FiPackage, FiShoppingBag, FiTag, FiLogOut, FiMenu, FiX, FiMessageSquare } from 'react-icons/fi';

const NAV_ITEMS = [
  { path: '/admin',            label: 'Dashboard',  icon: FiGrid },
  { path: '/admin/products',   label: 'Products',   icon: FiPackage },
  { path: '/admin/orders',     label: 'Orders',     icon: FiShoppingBag },
  { path: '/admin/categories', label: 'Categories', icon: FiTag },
  { path: '/admin/reviews',    label: 'Reviews',    icon: FiMessageSquare }, 
];

const AdminLayout = ({ children }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* ── Sidebar ────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900
                         transform transition-transform duration-200
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                         md:translate-x-0 md:static md:block`}>

        {/* Logo */}
        <div className="flex items-center justify-between p-5
                        border-b border-gray-700">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <div>
              <p className="text-white font-bold">FreshMart</p>
              <p className="text-yellow-400 text-xs">Admin Panel</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)}
                  className="md:hidden text-gray-400">
            <FiX />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon    = item.icon;
            const active  = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3
                                rounded-xl text-sm font-medium transition
                                ${active
                                  ? 'bg-primary text-white'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}>
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin Info + Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4
                        border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary w-9 h-9 rounded-full flex
                            items-center justify-center text-white
                            font-bold text-sm flex-shrink-0">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {adminUser?.name || 'Admin'}
              </p>
              <p className="text-yellow-400 text-xs">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-gray-400
                             hover:text-red-400 transition text-sm px-2 py-1">
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
             onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main Content ───────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Bar */}
        <header className="bg-white shadow-sm px-4 py-3
                           flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
                    className="md:hidden text-gray-600">
              <FiMenu size={22} />
            </button>
            <h1 className="font-semibold text-gray-800">
              {NAV_ITEMS.find(i => i.path === location.pathname)?.label
               || 'Admin Panel'}
            </h1>
          </div>
          <Link to="/"
                className="text-xs text-primary hover:underline font-medium">
            ← View Store
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;