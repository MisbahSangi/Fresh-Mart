import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form,    setForm]    = useState({
    name: '', phoneNumber: '', email: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      return toast.error('Please enter your full name');
    }
    if (!form.phoneNumber) {
      return toast.error('Please enter your phone number');
    }
    if (form.phoneNumber.length < 11) {
      return toast.error('Enter a valid 11-digit phone number');
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/register', form);
      login(res.data.data, res.data.token);
      toast.success(`Welcome to FreshMart, ${res.data.data.name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Join FreshMart — Shop fresh, save more!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ali Hassan"
              className="w-full border border-gray-300 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-primary
                         focus:border-transparent text-sm"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="03001234567"
              maxLength={11}
              className="w-full border border-gray-300 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-primary
                         focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              This will be your login ID
            </p>
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ali@gmail.com"
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
                       disabled:cursor-not-allowed mt-2">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">Already have an account?</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <Link to="/login"
              className="block w-full text-center border-2 border-primary text-primary
                         font-semibold py-3 rounded-xl hover:bg-primary hover:text-white
                         transition">
          Login Instead
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;