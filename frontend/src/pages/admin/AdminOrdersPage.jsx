import { useState, useEffect } from 'react';
import { FiX, FiPackage, FiMapPin, FiPhone,
         FiUser, FiCreditCard, FiClock } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const STATUSES = [
  'received', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'
];

const statusColor = (status) => {
  const map = {
    received:         'bg-blue-100 text-blue-700',
    preparing:        'bg-yellow-100 text-yellow-700',
    out_for_delivery: 'bg-purple-100 text-purple-700',
    delivered:        'bg-green-100 text-green-700',
    cancelled:        'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
};

// ── Order Detail Modal ────────────────────────────
const OrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [saving,    setSaving]    = useState(false);

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) return;
    setSaving(true);
    try {
      await API.put(`/orders/${order._id}/status`, { status: newStatus });
      onStatusUpdate(order._id, newStatus);
      toast.success('Status updated! ✅');
      onClose();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50
                    flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl
                      max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5
                        border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              Order Details
            </h3>
            <p className="text-primary text-sm font-mono font-semibold">
              {order.orderNumber}
            </p>
          </div>
          <button onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition">
            <FiX size={22} />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Status Banner */}
          <div className={`flex items-center justify-between
                           rounded-xl p-4 ${statusColor(order.status)}`}>
            <span className="font-semibold capitalize text-sm">
              {order.status?.replace(/_/g, ' ')}
            </span>
            <span className="text-xs opacity-75">
              {new Date(order.createdAt).toLocaleDateString('en-PK', {
                day: 'numeric', month: 'short',
                year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-500
                           uppercase tracking-wide mb-3">
              Customer Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <FiUser className="text-primary flex-shrink-0" size={15} />
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="text-sm font-medium text-gray-800">
                    {order.customerId?.name || 'Guest'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-primary flex-shrink-0" size={15} />
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-800">
                    {order.customerId?.phoneNumber || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <FiMapPin className="text-primary flex-shrink-0" size={15} />
                <div>
                  <p className="text-xs text-gray-400">Delivery Address</p>
                  <p className="text-sm font-medium text-gray-800">
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500
                           uppercase tracking-wide mb-3">
              Items Ordered ({order.items?.length})
            </h4>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx}
                     className="flex items-center justify-between
                                bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white w-7 h-7
                                    rounded-full flex items-center
                                    justify-center text-xs font-bold
                                    flex-shrink-0">
                      {item.quantity}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {typeof item.name === 'object'
                          ? item.name?.en : item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.unit} · Rs. {item.price} each
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">
                    Rs. {item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-500
                           uppercase tracking-wide mb-3">
              Pricing
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rs. {order.pricing?.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                {order.pricing?.deliveryFee === 0
                  ? <span className="text-green-600 font-medium">FREE</span>
                  : <span>Rs. {order.pricing?.deliveryFee}</span>
                }
              </div>
              {order.pricing?.discount?.amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- Rs. {order.pricing.discount.amount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-800
                              text-base pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary">Rs. {order.pricing?.total}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-500
                           uppercase tracking-wide mb-3">
              Payment
            </h4>
            <div className="flex items-center gap-3">
              <FiCreditCard className="text-primary" size={16} />
              <div>
                <p className="text-sm font-medium text-gray-800 capitalize">
                  {order.payment?.method?.replace(/_/g, ' ')}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${order.payment?.status === 'paid'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-yellow-100 text-yellow-600'}`}>
                  {order.payment?.status}
                </span>
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500
                             uppercase tracking-wide mb-3 flex items-center gap-2">
                <FiClock size={13} /> Status History
              </h4>
              <div className="space-y-2">
                {order.statusHistory.map((h, i) => (
                  <div key={i}
                       className="flex items-center justify-between
                                  text-sm border-l-2 border-primary
                                  pl-3 py-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs
                                      font-medium capitalize
                                      ${statusColor(h.status)}`}>
                      {h.status?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(h.timestamp).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-yellow-50 rounded-xl p-3 border
                            border-yellow-100">
              <p className="text-xs font-semibold text-yellow-700 mb-1">
                Order Notes
              </p>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}

          {/* Update Status */}
          <div className="bg-white border border-gray-200
                          rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-500
                           uppercase tracking-wide">
              Update Status
            </h4>
            <div className="flex gap-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3
                           py-2.5 text-sm outline-none focus:ring-2
                           focus:ring-primary bg-white">
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={saving || newStatus === order.status}
                className="bg-primary text-white px-5 py-2.5 rounded-xl
                           text-sm font-semibold hover:bg-secondary
                           transition disabled:opacity-50
                           disabled:cursor-not-allowed">
                {saving ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Orders Page ──────────────────────────────
const AdminOrdersPage = () => {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    API.get('/orders')
      .then(res => setOrders(res.data.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
    );
  };

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Orders</h2>
            <p className="text-gray-500 text-sm">
              {orders.length} total orders
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', ...STATUSES].map(s => (
            <button key={s}
                    onClick={() => setFilter(s)}
                    className={`px-4 py-2 rounded-full text-xs font-medium
                                whitespace-nowrap transition border
                                ${filter === s
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white text-gray-600 border-gray-200'
                                }`}>
              {s === 'all' ? 'All Orders' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border
                        border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i}
                     className="bg-gray-100 animate-pulse h-16 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-2">📦</p>
              <p>No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Order #', 'Customer', 'Items', 'Total',
                      'Payment', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h}
                          className="text-left text-xs font-semibold
                                     text-gray-500 px-4 py-3 uppercase
                                     tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(order => (
                    <tr key={order._id}
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-gray-50 transition cursor-pointer">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-primary">
                          {order.orderNumber}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">
                          {order.customerId?.name || 'Guest'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.customerId?.phoneNumber}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600">
                          {order.items?.length} item(s)
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-primary">
                          Rs. {order.pricing?.total}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500 capitalize">
                          {order.payment?.method?.replace(/_/g, ' ')}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          ${order.payment?.status === 'paid'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-yellow-100 text-yellow-600'}`}>
                          {order.payment?.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full
                                          font-medium capitalize
                                          ${statusColor(order.status)}`}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString(
                            'en-PK', {
                              day: 'numeric', month: 'short',
                              year: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-primary font-medium
                                         hover:underline">
                          View →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={updateStatus}
        />
      )}
    </AdminLayout>
  );
};

export default AdminOrdersPage;