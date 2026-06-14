import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaEnvelope, FaLock, FaUserTag, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAppContext } from '../context/AppContext';
import { AuthAPI } from '../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const { handleLogin } = useAppContext();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      tempErrors.role = 'Please select a role';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const response = await AuthAPI.signup({
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      toast.success(response.data.message || 'Account created successfully!');
      handleLogin(response.data.token, response.data.user);

      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl p-8 relative z-10 flex flex-col items-center">
        {/* Brand/Logo Header */}
        <Link to="/" className="flex items-center gap-2 mb-6 group">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <FaHeartbeat className="text-2xl" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Med<span className="text-blue-600">Flow</span>
          </span>
        </Link>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Account</h2>
        <p className="text-slate-500 text-sm mb-6">Join MedFlow to manage your healthcare operations</p>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 mb-6">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1 text-left">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/60 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'
                  }`}
                disabled={loading}
              />
              <FaEnvelope className="absolute left-3 top-3.5 text-slate-400" />
            </div>
            {errors.email && <p className="mt-1 text-red-500 text-xs text-left">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1 text-left">
              Select Your Role
            </label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/60 appearance-none cursor-pointer ${errors.role ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'
                  }`}
                disabled={loading}
              >
                <option value="patient">Patient Manager</option>
                <option value="doctor">Staff Manager</option>
                <option value="admin">Administrator / Finance</option>
              </select>
              <FaUserTag className="absolute left-3 top-3.5 text-slate-400" />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {errors.role && <p className="mt-1 text-red-500 text-xs text-left">{errors.role}</p>}
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1 text-left">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/60 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'
                  }`}
                disabled={loading}
              />
              <FaLock className="absolute left-3 top-3.5 text-slate-400" />
            </div>
            {errors.password && <p className="mt-1 text-red-500 text-xs text-left">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1 text-left">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/60 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'
                  }`}
                disabled={loading}
              />
              <FaLock className="absolute left-3 top-3.5 text-slate-400" />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-red-500 text-xs text-left">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <FaSpinner className="animate-spin text-lg" />
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>

        {/* Navigation Helper Links */}
        <div className="space-y-4 w-full">
          <div className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
              Log In
            </Link>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
