import { useState, useEffect } from 'react';
import API from '../api/axios';

/**
 * Fetches orders for a given userId.
 * Returns empty array immediately if no userId is provided (guest/not logged in).
 *
 * @param {string|null} userId  — user._id from AuthContext
 * @param {number}      [limit] — optional: only return the first N orders
 *
 * @returns {{ orders, loading, error, setOrders }}
 */
const useOrders = (userId, limit) => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    API.get(`/orders/user/${userId}`)
      .then(res => {
        const data = res.data.data;
        setOrders(limit ? data.slice(0, limit) : data);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, [userId, limit]);

  return { orders, loading, error, setOrders };
};

export default useOrders;
