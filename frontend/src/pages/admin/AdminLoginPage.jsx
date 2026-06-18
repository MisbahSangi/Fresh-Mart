import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const AdminLoginPage = () => {
  const [form,    setForm]    = useState({ phoneNumber: '', secretKey: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.phoneNumber || !form.secretKey) {
      return toast.error('All fields are required');
    }
    setLoading(true);
    try {
      const res = await API.post('/auth/admin-login', form);
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser',  JSON.stringify(res.data.data));
      toast.success('Welcome to Admin Panel! 👋');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center
                    justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛒</div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">
            FreshMart Administration
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="03346461739"
              className="w-full border border-gray-300 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-primary
                         text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Secret Key
            </label>
            <input
              type="password"
              value={form.secretKey}
              onChange={(e) => setForm({ ...form, secretKey: e.target.value })}
              placeholder="Enter secret key"
              className="w-full border border-gray-300 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-primary
                         text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-semibold py-3
                       rounded-xl hover:bg-gray-700 transition mt-2
                       disabled:opacity-60">
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;