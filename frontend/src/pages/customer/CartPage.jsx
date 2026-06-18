import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  // Load cart from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(saved);
  }, []);

  // Save cart to localStorage whenever it changes
  const saveCart = (updatedCart) => {
  setCart(updatedCart);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  window.dispatchEvent(new CustomEvent('cartUpdated')); 
 };

  const increaseQty = (id) => {
    const updated = cart.map(item =>
      item._id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveCart(updated);
  };

  const decreaseQty = (id) => {
    const updated = cart.map(item =>
      item._id === id
        ? { ...item, quantity: Math.max(1, item.quantity - 1) }
        : item
    );
    saveCart(updated);
  };

  const removeItem = (id) => {
    const updated = cart.filter(item => item._id !== id);
    saveCart(updated);
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    saveCart([]);
    toast.success('Cart cleared');
  };

  // Calculations
  const subtotal     = cart.reduce((sum, i) => sum + i.price?.current * i.quantity, 0);
  const deliveryFee  = subtotal >= 1000 ? 0 : 100;
  const total        = subtotal + deliveryFee;

  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center
                    text-gray-400 px-4">
      <p className="text-7xl mb-4">🛒</p>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Your cart is empty
      </h2>
      <p className="text-sm mb-6">Add some products to get started!</p>
      <Link to="/products"
            className="bg-primary text-white px-8 py-3 rounded-full
                       font-semibold hover:bg-secondary transition
                       flex items-center gap-2">
        <FiShoppingBag /> Browse Products
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Cart</h1>
          <p className="text-gray-500 text-sm">{cart.length} item(s)</p>
        </div>
        <button
          onClick={clearCart}
          className="text-red-400 hover:text-red-600 text-sm
                     flex items-center gap-1 transition">
          <FiTrash2 size={14} /> Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Cart Items ──────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item._id}
                 className="bg-white rounded-xl border border-gray-100
                            shadow-sm p-4 flex items-center gap-4">

              {/* Image */}
              <div className="bg-gray-50 rounded-lg h-16 w-16
                              flex items-center justify-center flex-shrink-0">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name?.en}
                       className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <span className="text-2xl">🛍️</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {item.name?.en}
                </p>
                <p className="text-xs text-gray-400">{item.unit}</p>
                <p className="text-primary font-bold text-sm mt-1">
                  Rs. {item.price?.current}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center border border-gray-200
                              rounded-xl overflow-hidden flex-shrink-0">
                <button onClick={() => decreaseQty(item._id)}
                        className="px-2 py-1.5 hover:bg-gray-100 transition">
                  <FiMinus size={12} />
                </button>
                <span className="px-3 py-1.5 text-sm font-semibold
                                 border-x border-gray-200 min-w-[2.5rem]
                                 text-center">
                  {item.quantity}
                </span>
                <button onClick={() => increaseQty(item._id)}
                        className="px-2 py-1.5 hover:bg-gray-100 transition">
                  <FiPlus size={12} />
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-800 text-sm">
                  Rs. {item.price?.current * item.quantity}
                </p>
                <button onClick={() => removeItem(item._id)}
                        className="text-red-400 hover:text-red-600
                                   transition mt-1">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Summary ───────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100
                          shadow-sm p-5 sticky top-24">
            <h2 className="font-bold text-gray-800 text-lg mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.length} items)</span>
                <span>Rs. {subtotal}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="text-green-600 font-medium">FREE</span>
                ) : (
                  <span>Rs. {deliveryFee}</span>
                )}
              </div>

              {deliveryFee > 0 && (
                <p className="text-xs text-gray-400 bg-green-50 p-2 rounded-lg">
                  💡 Add Rs. {1000 - subtotal} more for free delivery!
                </p>
              )}

              <div className="border-t border-gray-100 pt-3 flex justify-between
                              font-bold text-gray-800 text-base">
                <span>Total</span>
                <span className="text-primary">Rs. {total}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary text-white font-semibold py-3
                         rounded-xl hover:bg-secondary transition mt-5
                         flex items-center justify-center gap-2">
              Proceed to Checkout <FiArrowRight />
            </button>

            <Link to="/products"
                  className="block text-center text-primary text-sm
                             font-medium mt-3 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;