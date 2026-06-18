import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiArrowLeft,
  FiPlus,
  FiMinus,
  FiStar,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import toast from "react-hot-toast";

// ── Star Rating Component ─────────────────────────
const StarRating = ({ rating, onRate, size = "md", interactive = false }) => {
  const [hovered, setHovered] = useState(0);
  const sz = size === "lg" ? 28 : size === "md" ? 20 : 14;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={sz}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`transition-colors
            ${interactive ? "cursor-pointer" : ""}
            ${
              (hovered || rating) >= star
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
        />
      ))}
    </div>
  );
};

// ── Review Form ───────────────────────────────────
const ReviewForm = ({ productId, orderId, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Please select a star rating");
    setSaving(true);
    try {
      await API.post("/reviews", { productId, orderId, rating, comment });
      toast.success("Review submitted! ⭐");
      onSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
      <h4 className="font-semibold text-gray-800 mb-3">Write Your Review</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <p className="text-sm text-gray-600 mb-1">Your Rating *</p>
          <StarRating
            rating={rating}
            onRate={setRating}
            size="lg"
            interactive={true}
          />
        </div>
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={3}
            maxLength={500}
            className="w-full border border-gray-200 rounded-xl px-4 py-3
                       outline-none text-sm focus:ring-2 focus:ring-primary
                       focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-1">
            {comment.length}/500
          </p>
        </div>
        <button
          type="submit"
          disabled={saving || !rating}
          className="bg-primary text-white font-semibold px-6 py-2.5
                     rounded-xl hover:bg-secondary transition text-sm
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

// ── Reviews List ──────────────────────────────────
const ReviewsList = ({ reviews, avgRating }) => {
  if (reviews.length === 0)
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-3xl mb-2">💬</p>
        <p className="text-sm">No reviews yet — be the first to review!</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Average Rating Summary */}
      <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
        <div className="text-center">
          <p className="text-4xl font-bold text-primary">{avgRating}</p>
          <StarRating rating={Math.round(avgRating)} size="sm" />
          <p className="text-xs text-gray-400 mt-1">
            {reviews.length} review(s)
          </p>
        </div>
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500 w-4">{star}</span>
                <FiStar size={10} className="text-yellow-400 fill-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-yellow-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-4">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Reviews */}
      {reviews.map((review) => (
        <div
          key={review._id}
          className="bg-white border border-gray-100 rounded-xl p-4
                        shadow-sm"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="bg-primary text-white w-8 h-8 rounded-full
                              flex items-center justify-center font-bold
                              text-sm flex-shrink-0"
              >
                {review.customerId?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {review.customerId?.name || "User"}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <StarRating rating={review.rating} size="sm" />
          </div>
          {review.comment && (
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Main Product Detail Page ──────────────────────
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        toast.error("Product not found");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/product/${id}`);
      setReviews(res.data.data);
      setAvgRating(res.data.avgRating);
    } catch (err) {
      console.error(err);
    }
  };

  const checkCanReview = async () => {
    if (!user) return;
    try {
      const res = await API.get(`/reviews/can-review/${id}`);
      setCanReview(res.data.canReview);
      setOrderId(res.data.orderId);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
    checkCanReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = cart.find((i) => i._id === product._id);
    if (exists) {
      exists.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    toast.success(`${product.name?.en} added to cart! 🛒`);
  };

  if (loading)
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gray-200 animate-pulse rounded-2xl h-96" />
      </div>
    );

  if (!product) return null;

  const discount =
    product.price?.original > product.price?.current
      ? Math.round((1 - product.price.current / product.price.original) * 100)
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-primary
                   transition mb-6 text-sm"
      >
        <FiArrowLeft /> Back to Products
      </button>

      {/* Product Card */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100
                      overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div
            className="bg-gray-50 h-72 md:h-auto flex items-center
                          justify-center p-8 relative"
          >
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name?.en}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-8xl">🛍️</span>
            )}
            {discount > 0 && (
              <div
                className="absolute top-4 left-4 bg-red-500 text-white
                              font-bold text-sm px-3 py-1 rounded-full"
              >
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <span
                className="text-xs text-primary font-medium bg-green-50
                               px-3 py-1 rounded-full"
              >
                {product.categoryId?.name?.en}
              </span>
              <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-1">
                {product.name?.en}
              </h1>
              {product.name?.ur && (
                <p className="text-gray-400 text-sm mb-2" dir="rtl">
                  {product.name.ur}
                </p>
              )}

              {/* Rating Preview */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <StarRating rating={Math.round(avgRating)} size="sm" />
                  <span className="text-sm text-gray-500">
                    {avgRating} ({reviews.length} reviews)
                  </span>
                </div>
              )}

              {product.description?.en && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {product.description.en}
                </p>
              )}

              <div className="flex items-center gap-3 mb-4">
                <span
                  className="bg-gray-100 text-gray-600 text-xs
                                 px-3 py-1 rounded-full"
                >
                  Unit: {product.unit}
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium
                  ${
                    product.stock?.status === "in_stock"
                      ? "bg-green-100 text-green-700"
                      : product.stock?.status === "low_stock"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.stock?.status === "in_stock"
                    ? "✓ In Stock"
                    : product.stock?.status === "low_stock"
                      ? "⚠ Low Stock"
                      : "✗ Out of Stock"}
                </span>
              </div>

              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-500 text-xs
                                     px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-3xl font-bold text-primary">
                  Rs. {product.price?.current}
                </span>
                {product.price?.original > product.price?.current && (
                  <span className="text-gray-400 line-through text-lg">
                    Rs. {product.price?.original}
                  </span>
                )}
              </div>

              {product.stock?.status !== "out_of_stock" && (
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Quantity:
                  </span>
                  <div
                    className="flex items-center border border-gray-200
                                  rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span
                      className="px-4 py-2 font-semibold text-sm
                                     border-x border-gray-200 min-w-[3rem]
                                     text-center"
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-2 hover:bg-gray-100 transition"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                </div>
              )}

              {quantity > 1 && (
                <p className="text-sm text-gray-500 mb-4">
                  Total:{" "}
                  <span className="font-bold text-primary">
                    Rs. {product.price?.current * quantity}
                  </span>
                </p>
              )}

              <button
                onClick={addToCart}
                disabled={product.stock?.status === "out_of_stock"}
                className="w-full bg-primary text-white font-semibold py-3
                           rounded-xl hover:bg-secondary transition
                           flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingCart />
                {product.stock?.status === "out_of_stock"
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reviews Section ──────────────────────── */}
      <div className="mt-8 space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Customer Reviews</h2>

        {/* Review Form — only for eligible users */}
        {!user && (
          <div
            className="bg-gray-50 rounded-2xl p-5 text-center
                          border border-gray-100"
          >
            <p className="text-gray-500 text-sm">
              Please{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary font-medium hover:underline"
              >
                login
              </button>{" "}
              to write a review
            </p>
          </div>
        )}

        {user && canReview && (
          <ReviewForm
            productId={id}
            orderId={orderId}
            onSubmitted={() => {
              fetchReviews();
              setCanReview(false);
            }}
          />
        )}

        {user && !canReview && reviews.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-blue-600 text-xs">
              {reviews.find(
                (r) =>
                  r.customerId?._id === user?._id || r.customerId === user?._id,
              )
                ? "✅ You have already reviewed this product"
                : "📦 Order and receive this product to write a review"}
            </p>
          </div>
        )}

        <ReviewsList reviews={reviews} avgRating={avgRating} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
