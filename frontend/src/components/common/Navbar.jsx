import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiShoppingCart,
  FiMenu,
  FiX,
  FiSearch,
  FiUser,
  FiPackage,
  FiLogOut,
  FiChevronDown,
  FiHome,
  FiGrid,
} from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [userMenu, setUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  // Cart count sync
  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    };
    update();
    window.addEventListener("storage", update);
    window.addEventListener("cartUpdated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cartUpdated", update);
    };
  }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home", icon: FiHome },
    { to: "/products", label: "Products", icon: FiGrid },
  ];

  return (
    <nav
      className={`bg-primary sticky top-0 z-50 transition-shadow duration-300
                     ${scrolled ? "shadow-2xl" : "shadow-lg"}`}
    >
      {/* ── Announcement bar ─────────────────────── */}
      <div
        className="bg-secondary text-white text-center py-1.5 text-xs
                      font-medium tracking-wide hidden md:block"
      >
        🚚 Free delivery on orders above Rs. 1,000 &nbsp;|&nbsp; ⏰ Open Daily
        8AM – 11PM &nbsp;|&nbsp; 📍 Sahiwal, Punjab
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="bg-white bg-opacity-20 p-1.5 rounded-xl">
              <span className="text-xl">🛒</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white text-xl font-bold tracking-tight">
                Fresh<span className="text-accent">Mart</span>
              </span>
              <p className="text-green-200 text-xs -mt-0.5 leading-none">
                Sahiwal's Grocery Store
              </p>
            </div>
            <span className="sm:hidden text-white text-xl font-bold">
              Fresh<span className="text-accent">Mart</span>
            </span>
          </Link>

          {/* Search bar — desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-white rounded-2xl
                           px-4 py-2.5 flex-1 max-w-md gap-3 group
                           focus-within:ring-2 focus-within:ring-accent
                           focus-within:ring-offset-1 transition-all"
          >
            <FiSearch
              className="text-gray-400 group-focus-within:text-primary
                                  transition flex-shrink-0"
              size={16}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none text-sm w-full text-gray-700
                         placeholder-gray-400 bg-transparent"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-gray-300 hover:text-gray-500 transition"
              >
                <FiX size={14} />
              </button>
            )}
          </form>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl
                                text-sm font-medium transition-all
                                ${
                                  location.pathname === link.to
                                    ? "bg-white bg-opacity-20 text-white"
                                    : "text-green-100 hover:bg-white hover:bg-opacity-10 hover:text-white"
                                }`}
              >
                <link.icon size={15} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 bg-white
                             bg-opacity-15 hover:bg-opacity-25 text-white
                             px-3 py-2 rounded-xl transition-all"
            >
              <FiShoppingCart size={18} />
              <span className="hidden sm:block text-sm font-medium">Cart</span>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 bg-accent text-white
                                 text-xs w-5 h-5 rounded-full flex items-center
                                 justify-center font-bold animate-bounce-sm"
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex items-center gap-2 bg-white bg-opacity-15
                             hover:bg-opacity-25 text-white px-3 py-2
                             rounded-xl transition-all"
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 bg-accent rounded-full flex items-center
                                  justify-center text-white font-bold text-xs
                                  flex-shrink-0 overflow-hidden"
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <span
                    className="hidden sm:block text-sm font-medium
                                   max-w-[80px] truncate"
                  >
                    {user.name?.split(" ")[0]}
                  </span>
                  <FiChevronDown
                    size={14}
                    className={`transition-transform duration-200
                                ${userMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {userMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-white
                                  rounded-2xl shadow-2xl border border-gray-100
                                  overflow-hidden animate-slide-up z-50"
                  >
                    {/* User info header */}
                    <div className="bg-gradient-to-r from-primary to-secondary px-4 py-3">
                      <p className="text-white font-semibold text-sm truncate">
                        {user.name}
                      </p>
                      <p className="text-green-200 text-xs truncate">
                        {user.phoneNumber}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm
                                       text-gray-700 hover:bg-green-50
                                       hover:text-primary transition"
                      >
                        <FiUser size={15} className="text-primary" />
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm
                                       text-gray-700 hover:bg-green-50
                                       hover:text-primary transition"
                      >
                        <FiPackage size={15} className="text-primary" />
                        My Orders
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5
                                         text-sm text-red-500 hover:bg-red-50 transition"
                      >
                        <FiLogOut size={15} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-white text-sm font-medium px-3 py-2 rounded-xl
                                 hover:bg-white hover:bg-opacity-10 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-accent text-white text-sm font-bold px-4 py-2
                                 rounded-xl hover:bg-yellow-500 transition shadow-md"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white bg-white bg-opacity-15
                               hover:bg-opacity-25 p-2 rounded-xl transition"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form
          onSubmit={handleSearch}
          className="md:hidden mt-3 flex items-center bg-white rounded-xl
                         px-4 py-2.5 gap-3"
        >
          <FiSearch className="text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm w-full text-gray-700 bg-transparent"
          />
        </form>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 pb-2 space-y-1 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 text-white text-sm
                               font-medium px-3 py-2.5 rounded-xl
                               hover:bg-white hover:bg-opacity-10 transition"
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}

            {!user ? (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center text-white text-sm font-medium
                                 py-2.5 rounded-xl border border-white border-opacity-30
                                 hover:bg-white hover:bg-opacity-10 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center bg-accent text-white text-sm
                                 font-bold py-2.5 rounded-xl hover:bg-yellow-500 transition"
                >
                  Register
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3
                                 text-red-300 text-sm font-medium px-3 py-2.5
                                 rounded-xl hover:bg-white hover:bg-opacity-10 transition"
              >
                <FiLogOut size={16} /> Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
