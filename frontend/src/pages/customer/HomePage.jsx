import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiTruck,
  FiShield,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { optimizeImageUrl } from "../../utils/image";
import ProductCard from "../../components/common/ProductCard"; // shared component

// ── Hero Carousel ─────────────────────────────────
const HeroCarousel = ({ saleProducts }) => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % Math.max(saleProducts.length, 1));
  }, [saleProducts.length]);

  const prev = () => {
    setCurrent((c) => (c - 1 + saleProducts.length) % saleProducts.length);
  };

  // Auto-slide every 3.5 seconds
  useEffect(() => {
    if (saleProducts.length < 2) return;
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [next, saleProducts.length]);

  if (saleProducts.length === 0)
    return (
      <div className="hidden lg:flex items-center justify-center h-64">
        <span className="text-8xl animate-bounce-sm">🛒</span>
      </div>
    );

  const product = saleProducts[current];
  const discount =
    product.price?.original > product.price?.current
      ? Math.round((1 - product.price.current / product.price.original) * 100)
      : 0;

  return (
    <div className="hidden lg:block relative w-full max-w-sm">
      {/* Card */}
      <div
        key={current}
        onClick={() => navigate(`/products/${product._id}`)}
        className="bg-white bg-opacity-15 backdrop-blur-sm rounded-3xl p-5
                   border border-white border-opacity-20 cursor-pointer
                   hover:bg-opacity-20 transition-all animate-fade-in"
      >
        {/* Badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="bg-red-500 text-white text-xs font-bold
                           px-3 py-1 rounded-full"
          >
            🔥 {discount}% OFF
          </span>
          <span className="text-white text-xs opacity-75">
            {current + 1} / {saleProducts.length}
          </span>
        </div>

        {/* Image */}
        <div className="h-32 flex items-center justify-center mb-4">
          {product.images?.[0] ? (
            <img
              src={optimizeImageUrl(product.images[0], 200)}
              alt={product.name?.en}
              className="h-full object-contain drop-shadow-xl"
            />
          ) : (
            <span className="text-6xl">🛍️</span>
          )}
        </div>

        {/* Info */}
        <p className="text-white font-bold text-base line-clamp-2 leading-snug">
          {product.name?.en}
        </p>
        <p className="text-green-200 text-xs mt-1">{product.unit}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-accent font-bold text-xl">
              Rs. {product.price?.current?.toLocaleString()}
            </p>
            <p className="text-green-200 text-xs line-through">
              Rs. {product.price?.original?.toLocaleString()}
            </p>
          </div>
          <div
            className="bg-accent text-white text-xs font-bold
                          px-3 py-1.5 rounded-full"
          >
            Shop Now →
          </div>
        </div>
      </div>

      {/* Arrows */}
      {saleProducts.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2
                             bg-white bg-opacity-20 hover:bg-opacity-30
                             text-white p-1.5 rounded-full transition"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2
                             bg-white bg-opacity-20 hover:bg-opacity-30
                             text-white p-1.5 rounded-full transition"
          >
            <FiChevronRight size={16} />
          </button>
        </>
      )}

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {saleProducts.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${
              i === current
                ? "w-5 h-2 bg-white"
                : "w-2 h-2 bg-white bg-opacity-40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────
const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes, saleRes] = await Promise.all([
          API.get("/categories"),
          API.get("/products?featured=true"),
          API.get("/products?sale=true"),
        ]);
        setCategories(catRes.data.data);
        setFeatured(featRes.data.data);
        setSaleProducts(saleRes.data.data.slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = cart.find((i) => i._id === product._id);
    if (exists) exists.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    toast.success(`${product.name?.en} added! 🛒`);
  };

  return (
    <div>
      {/* ── HERO ──────────────────────────────────── */}
      <section
        className="bg-gradient-to-br from-primary via-secondary to-green-800
                          relative overflow-hidden"
      >
        {/* Background circles */}
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5
                        rounded-full -translate-y-1/2 translate-x-1/2"
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5
                        rounded-full translate-y-1/2 -translate-x-1/2"
        />

        <div className="max-w-7xl mx-auto px-4 py-14 lg:py-16 relative z-10">
          <div className="flex items-center justify-between gap-8">
            {/* Left: Text */}
            <div className="max-w-xl animate-slide-up">
              <div
                className="inline-flex items-center gap-2 bg-white
                              bg-opacity-15 text-white px-4 py-1.5
                              rounded-full text-xs font-medium mb-4"
              >
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Now delivering in Sahiwal
              </div>

              <h1
                className="text-4xl md:text-5xl font-extrabold text-white
                             leading-tight mb-4"
              >
                Fresh Groceries
                <br />
                <span className="text-accent">Delivered</span> to
                <br />
                Your Door 🏠
              </h1>

              <p className="text-green-100 text-base mb-8 leading-relaxed">
                Shop from Sahiwal's most trusted grocery store. Quality
                products, unbeatable prices, same-day delivery.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="bg-white text-primary font-bold px-7 py-3
                                 rounded-2xl hover:bg-accent hover:text-white
                                 transition-all shadow-xl flex items-center gap-2
                                 group"
                >
                  Shop Now
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>

                {!user && (
                  <Link
                    to="/register"
                    className="border-2 border-white border-opacity-60
                                   text-white font-bold px-7 py-3 rounded-2xl
                                   hover:bg-white hover:text-primary
                                   transition-all"
                  >
                    Join Free
                  </Link>
                )}
                {user && (
                  <Link
                    to="/orders"
                    className="border-2 border-white border-opacity-60
                                   text-white font-bold px-7 py-3 rounded-2xl
                                   hover:bg-white hover:text-primary
                                   transition-all"
                  >
                    My Orders
                  </Link>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 mt-8">
                {[
                  { icon: "⭐", text: "4.8 Rating" },
                  { icon: "📦", text: "500+ Products" },
                  { icon: "🚚", text: "Same-day Delivery" },
                ].map((b) => (
                  <div
                    key={b.text}
                    className="flex items-center gap-1.5 text-green-100 text-xs"
                  >
                    <span>{b.icon}</span>
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Sale Products Carousel */}
            <HeroCarousel saleProducts={saleProducts} />
          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP ────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div
          className="max-w-7xl mx-auto px-4 py-5
                        grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0
                        md:divide-x divide-gray-100"
        >
          {[
            {
              icon: FiTruck,
              color: "text-primary",
              bg: "bg-green-50",
              title: "Free Delivery",
              sub: "On orders above Rs. 1,000",
            },
            {
              icon: FiShield,
              color: "text-blue-600",
              bg: "bg-blue-50",
              title: "Fresh Quality",
              sub: "100% fresh — guaranteed",
            },
            {
              icon: FiClock,
              color: "text-accent",
              bg: "bg-amber-50",
              title: "Open Daily",
              sub: "8:00 AM – 11:00 PM",
            },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4 px-6 py-4">
              <div className={`${f.bg} p-3 rounded-2xl flex-shrink-0`}>
                <f.icon className={f.color} size={22} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{f.title}</p>
                <p className="text-xs text-gray-500">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Shop by Category
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {categories.length} categories available
            </p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1 text-primary text-sm
                           font-semibold hover:underline"
          >
            View All <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 animate-pulse h-20 rounded-2xl"
              />
            ))}
          </div>
        ) : (
          /* Horizontal scroll on mobile, wrap on desktop */
          <div
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2
                          md:grid md:grid-cols-5 lg:grid-cols-9"
          >
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="flex-shrink-0 flex flex-col items-center gap-2
                           bg-white rounded-2xl p-3 w-24 md:w-auto
                           hover:shadow-hover hover:-translate-y-1
                           transition-all border border-gray-100 group"
              >
                <div className="text-3xl group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <p
                  className="text-xs font-medium text-gray-700 text-center
                               leading-tight line-clamp-2"
                >
                  {cat.name?.en}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Featured Products
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              Handpicked for you today
            </p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1 text-primary text-sm
                           font-semibold hover:underline"
          >
            View All <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 animate-pulse h-64 rounded-2xl"
              />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p>No featured products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── SALE BANNER ───────────────────────────── */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-10">
          <div
            className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl
                          p-6 md:p-8 flex flex-col md:flex-row items-center
                          justify-between gap-4"
          >
            <div>
              <p className="text-white text-sm font-medium opacity-80 mb-1">
                🔥 Limited Time Offers
              </p>
              <h2 className="text-white text-2xl md:text-3xl font-extrabold">
                Big Sale — Up to 30% Off!
              </h2>
              <p className="text-red-100 text-sm mt-1">
                On selected groceries and daily essentials
              </p>
            </div>
            <Link
              to="/products?sale=true"
              className="bg-white text-red-500 font-bold px-7 py-3
                             rounded-2xl hover:bg-red-50 transition
                             flex items-center gap-2 flex-shrink-0 shadow-xl"
            >
              Shop Sale Items <FiArrowRight />
            </Link>
          </div>
        </section>
      )}

      {/* ── ON SALE PRODUCTS ──────────────────────── */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                🏷️ On Sale Now
              </h2>
              <p className="text-gray-400 text-sm mt-0.5">
                Grab these deals before they're gone!
              </p>
            </div>
            <Link
              to="/products?sale=true"
              className="flex items-center gap-1 text-primary text-sm
                             font-semibold hover:underline"
            >
              View All <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {saleProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
