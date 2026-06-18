import { useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { optimizeImageUrl } from "../../utils/image";

/**
 * Reusable product card used on HomePage and ProductsPage.
 *
 * Props:
 *   product     {object}   — product document from API
 *   onAddToCart {function} — optional; shows Add to Cart button on hover
 *                            called with (product)
 */
const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const outOfStock = product.stock?.status === "out_of_stock";

  // Calculate discount percentage if original price is higher
  const discount =
    product.price?.original > product.price?.current
      ? Math.round((1 - product.price.current / product.price.original) * 100)
      : 0;

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="bg-white rounded-2xl overflow-hidden card-hover cursor-pointer
                 border border-gray-100 group"
    >
      {/* ── Image ──────────────────────────────── */}
      <div className="relative h-44 bg-gray-50 flex items-center justify-center p-3">
        {product.images?.[0] ? (
          <img
            src={optimizeImageUrl(product.images[0], 400)}
            alt={product.name?.en}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain group-hover:scale-105
                       transition-transform duration-300"
          />
        ) : (
          <span className="text-5xl">🛍️</span>
        )}

        {/* Discount badge — takes priority over Sale badge */}
        {discount > 0 && (
          <span
            className="absolute top-2 left-2 bg-red-500 text-white text-xs
                           font-bold px-2 py-0.5 rounded-full"
          >
            -{discount}%
          </span>
        )}
        {product.isOnSale && discount === 0 && (
          <span
            className="absolute top-2 left-2 bg-accent text-white text-xs
                           font-bold px-2 py-0.5 rounded-full"
          >
            Sale
          </span>
        )}

        {/* Quick add button — appears on hover */}
        {onAddToCart && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={outOfStock}
            className="absolute bottom-2 right-2 bg-primary text-white p-2
                       rounded-full opacity-0 group-hover:opacity-100
                       transition-all duration-200 hover:bg-secondary shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiShoppingCart size={14} />
          </button>
        )}
      </div>

      {/* ── Info ───────────────────────────────── */}
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
          {product.name?.en}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 mb-2">
          {[product.unit, product.categoryId?.name?.en]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-primary font-bold text-sm">
              Rs. {product.price?.current?.toLocaleString()}
            </span>
            {product.price?.original > product.price?.current && (
              <span className="text-xs text-gray-400 line-through ml-1">
                Rs. {product.price?.original?.toLocaleString()}
              </span>
            )}
          </div>
          {outOfStock && (
            <span className="text-xs text-red-400 font-medium">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
