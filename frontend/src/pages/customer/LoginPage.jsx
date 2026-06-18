import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading,     setLoading]     = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phoneNumber) {
      return toast.error('Please enter your phone number');
    }
    if (phoneNumber.length < 11) {
      return toast.error('Enter a valid 11-digit phone number');
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/login', { phoneNumber });
      login(res.data.data, res.data.token);
      toast.success(`Welcome back, ${res.data.data.name}! 👋`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛒</div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back!</h1>
          <p className="text-gray-500 text-sm mt-1">Login to your FreshMart account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="03001234567"
              maxLength={11}
              className="w-full border border-gray-300 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-primary
                         focus:border-transparent text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-3 rounded-xl
                       hover:bg-secondary transition disabled:opacity-60
                       disabled:cursor-not-allowed">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">Don't have an account?</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <Link to="/register"
              className="block w-full text-center border-2 border-primary text-primary
                         font-semibold py-3 rounded-xl hover:bg-primary hover:text-white
                         transition">
          Create Account
        </Link>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing you agree to FreshMart's Terms of Service
        </p>
      </div>
    </div>
  );
};

export default LoginPage;