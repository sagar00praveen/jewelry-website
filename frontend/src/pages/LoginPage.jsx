import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FooterSection from '../components/FooterSection';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    privateKey: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password, formData.privateKey);

      if (result.success) {
        if (isAdmin && result.user?.role !== 'admin') {
          setError('Access denied: Admins only');
        } else {
          navigate(isAdmin ? '/admin' : '/');
        }
      } else {
        setError(result.message || 'Login failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex justify-center items-center bg-cream text-dark-brown p-6 relative">
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className="absolute top-6 right-6 px-4 py-2 text-sm font-medium border border-dark-brown rounded hover:bg-dark-brown hover:text-cream transition"
        >
          {isAdmin ? 'User Login' : 'Admin Login'}
        </button>

        <div className="bg-white shadow-xl rounded-xl p-10 max-w-md w-full">

          <h2 className="text-3xl font-serif mb-6 text-center">{isAdmin ? 'Admin Login' : 'Login'}</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border-b border-dark-brown bg-transparent focus:outline-none focus:border-khaki transition-colors"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border-b border-dark-brown bg-transparent focus:outline-none focus:border-khaki transition-colors"
            />

            {isAdmin && (
              <input
                name="privateKey"
                type="password"
                placeholder="Private Key (12 digits)"
                required
                value={formData.privateKey}
                onChange={handleChange}
                className="w-full p-3 border-b border-dark-brown bg-transparent focus:outline-none focus:border-khaki transition-colors"
              />
            )}

            <button
              disabled={loading}
              className="w-full mt-4 py-3 bg-dark-brown text-cream rounded-md hover:bg-khaki transition disabled:opacity-70 disabled:cursor-not-allowed font-medium tracking-wide"
            >
              {loading ? 'Logging in...' : (isAdmin ? 'Login to Dashboard' : 'Login')}
            </button>
          </form>

          {!isAdmin && (
            <p className="text-center mt-4 text-sm text-gray-500">
              Don’t have an account? <a href="/signup" className="text-dark-brown underline hover:text-khaki transition">Sign Up</a>
            </p>
          )}

        </div>
      </div>

      <FooterSection />
    </>
  );
}
