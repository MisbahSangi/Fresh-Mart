import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import useProducts from "../../hooks/useProducts";
import useCategories from "../../hooks/useCategories";
import ProductCard from "../../components/common/ProductCard";

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialise directly from URL params — prevents a double-fetch
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "all",
  );

  const { products, loading: productsLoading } = useProducts({
    category: activeCategory,
    search: searchTerm,
  });
  const { categories } = useCategories();

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveCategory("all");
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = cart.find((i) => i._id === product._id);
    if (exists) {
      exists.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    toast.success(`${product.name?.en} added to cart! 🛒`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ── Page Header ────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Products</h1>
        <p className="text-gray-500 text-sm mt-1">
          {productsLoading ? "Loading..." : `${products.length} products found`}
        </p>
      </div>

      {/* ── Search Bar ─────────────────────────── */}
      <form onSubmit={handleSearch} className="mb-6">
        <div
          className="flex items-center bg-white border border-gray-200
                        rounded-xl px-4 py-3 gap-3 shadow-sm max-w-xl"
        >
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name..."
            className="flex-1 outline-none text-sm text-gray-700"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* ── Category Filter ────────────────────── */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-8 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap
                      transition border
                      ${
                        activeCategory === "all"
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-600 border-gray-200 hover:border-primary"
                      }`}
        >
          All Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap
                              transition border flex items-center gap-2
                              ${
                                activeCategory === cat._id
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-primary"
                              }`}
          >
            <span>{cat.icon}</span>
            {cat.name?.en}
          </button>
        ))}
      </div>

      {/* ── Products Grid ──────────────────────── */}
      {productsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 animate-pulse rounded-xl h-64"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Try a different search or category</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setActiveCategory("all");
            }}
            className="mt-4 text-primary text-sm hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
