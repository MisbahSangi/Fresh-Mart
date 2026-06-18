import { useState, useEffect } from 'react';
import { FiStar, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const StarDisplay = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => (
      <FiStar key={s} size={13}
              className={s <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-200'} />
    ))}
  </div>
);

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    API.get('/reviews/admin/all')
      .then(res => setReviews(res.data.data))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, []);

  const toggleApprove = async (id) => {
    try {
      const res = await API.put(`/reviews/${id}/toggle`);
      setReviews(prev =>
        prev.map(r => r._id === id
          ? { ...r, isApproved: res.data.data.isApproved }
          : r
        )
      );
      toast.success('Review updated!');
    } catch {
      toast.error('Failed to update');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await API.delete(`/reviews/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = filter === 'all'      ? reviews
                 : filter === 'approved' ? reviews.filter(r =>  r.isApproved)
                 :                         reviews.filter(r => !r.isApproved);

  const avgOverall = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Customer Reviews
            </h2>
            <p className="text-gray-500 text-sm">
              {reviews.length} total · ⭐ {avgOverall} avg rating
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Reviews',    value: reviews.length,                           color: 'bg-blue-50 text-blue-700' },
            { label: 'Approved',         value: reviews.filter(r => r.isApproved).length, color: 'bg-green-50 text-green-700' },
            { label: 'Hidden',           value: reviews.filter(r => !r.isApproved).length,color: 'bg-red-50 text-red-700' },
          ].map(stat => (
            <div key={stat.label}
                 className={`${stat.color} rounded-xl p-4 text-center`}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {['all', 'approved', 'hidden'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full text-xs font-medium
                                capitalize transition border
                                ${filter === f
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white text-gray-600 border-gray-200'
                                }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Reviews Table */}
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
              <p className="text-4xl mb-2">⭐</p>
              <p>No reviews found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Customer', 'Product', 'Rating',
                      'Comment', 'Date', 'Status', 'Actions'].map(h => (
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
                  {filtered.map(review => (
                    <tr key={review._id}
                        className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary text-white w-7 h-7
                                          rounded-full flex items-center
                                          justify-center text-xs font-bold
                                          flex-shrink-0">
                            {review.customerId?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {review.customerId?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {review.customerId?.phoneNumber}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 max-w-[120px]
                                      truncate">
                          {review.productId?.name?.en || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StarDisplay rating={review.rating} />
                        <p className="text-xs text-gray-400 mt-0.5">
                          {review.rating}/5
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600 max-w-[180px]
                                      line-clamp-2">
                          {review.comment || (
                            <span className="text-gray-300 italic">
                              No comment
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(review.createdAt).toLocaleDateString(
                            'en-PK',
                            { day: 'numeric', month: 'short', year: 'numeric' }
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full
                                          font-medium
                          ${review.isApproved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'}`}>
                          {review.isApproved ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleApprove(review._id)}
                            title={review.isApproved ? 'Hide' : 'Show'}
                            className={`p-1.5 rounded-lg transition
                              ${review.isApproved
                                ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-50'
                                : 'text-green-500 hover:text-green-700 hover:bg-green-50'
                              }`}>
                            {review.isApproved
                              ? <FiEyeOff size={15} />
                              : <FiEye size={15} />
                            }
                          </button>
                          <button
                            onClick={() => deleteReview(review._id)}
                            className="text-red-400 hover:text-red-600
                                       hover:bg-red-50 p-1.5 rounded-lg
                                       transition">
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReviewsPage;