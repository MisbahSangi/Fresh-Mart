import { useState, useEffect } from 'react';
import API from '../api/axios';

/**
 * Fetches products from the API whenever the filter params change.
 *
 * @param {object} params
 * @param {string}  [params.category]  - category ObjectId or 'all'
 * @param {boolean} [params.featured]  - only featured products
 * @param {string}  [params.search]    - text search term
 * @param {boolean} [params.sale]      - only on-sale products
 *
 * @returns {{ products, loading, error, setProducts }}
 */
const useProducts = ({ category = 'all', featured = false, search = '', sale = false } = {}) => {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    let url = '/products?';
    if (category && category !== 'all') url += `category=${encodeURIComponent(category)}&`;
    if (featured)          url += 'featured=true&';
    if (sale)              url += 'sale=true&';
    if (search?.trim())    url += `search=${encodeURIComponent(search.trim())}`;

    API.get(url)
      .then(res  => setProducts(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load products'))
      .finally(()  => setLoading(false));
  }, [category, featured, search, sale]);

  return { products, loading, error, setProducts };
};

export default useProducts;
