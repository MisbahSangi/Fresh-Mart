import { useState, useEffect } from 'react';
import API from '../api/axios';

/**
 * Fetches the active category list once on mount.
 * Categories are cached by the browser (Cache-Control: 5 min) so
 * repeat navigations are instant without an extra API call.
 *
 * @returns {{ categories, loading, error, setCategories }}
 */
const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    API.get('/categories')
      .then(res  => setCategories(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load categories'))
      .finally(()  => setLoading(false));
  }, []);

  return { categories, loading, error, setCategories };
};

export default useCategories;
