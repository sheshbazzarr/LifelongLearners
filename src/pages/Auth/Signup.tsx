import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Signup: React.FC = () => {
  const { signUp, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'participant',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const { error } = await signUp(formData.email, formData.password, formData.name);
    
    if (error) {
      setErrors({ submit: error.message });
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const roleOptions = [
    {
      value: 'participant',
      title: 'Learner',
      description: 'Join challenges and discover new books',
      icon: '🎓',
    },
    {
      value: 'giver',
      title: 'Challenge Creator',
      description: 'Create and lead learning challenges',
      icon: '🏆',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
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
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Our Learning Community</h2>
          <p className="text-gray-600">Start your lifelong learning journey today</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {errors.submit}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Choose Your Role
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleInputChange('role', role.value)}
                    disabled={isSubmitting}
                    className={`p-4 rounded-xl border-2 transition-all text-left disabled:opacity-50 ${
                      formData.role === role.value
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{role.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{role.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                      </div>
                      {formData.role === role.value && (
                        <Check className="w-5 h-5 text-primary-600 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Create a password"
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
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            What you'll get as a member:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">📚</div>
              <p className="font-medium text-gray-900">Curated Books</p>
              <p className="text-gray-600">Access to hand-picked learning resources</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <p className="font-medium text-gray-900">Weekly Challenges</p>
              <p className="text-gray-600">Structured learning with community support</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🤖</div>
              <p className="font-medium text-gray-900">AI Recommendations</p>
              <p className="text-gray-600">Personalized learning paths from our Tortoise AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;