import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const { signIn, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setError(error.message);
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleDemoLogin = async (email: string, password: string) => {
    setIsSubmitting(true);
    setError('');
    
    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img 
                src="/photo_2024-12-26_12-17-47.jpg" 
                alt="LifelongLearners Tortoise" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">LifelongLearners</h1>
              <p className="text-sm text-gray-600">Life is teaching, never stop learning</p>
            </div>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.email || !formData.password}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Demo Accounts</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('demo@lifelonglearners.com', 'demo123')}
              disabled={isSubmitting}
              className="w-full text-left p-2 rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Regular User:</span>
                <span className="font-mono text-xs">demo@lifelonglearners.com</span>
              </div>
            </button>
            <button
              onClick={() => handleDemoLogin('sarah@example.com', 'demo123')}
              disabled={isSubmitting}
              className="w-full text-left p-2 rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Challenge Creator:</span>
                <span className="font-mono text-xs">sarah@example.com</span>
              </div>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click to auto-fill credentials (password: demo123)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;