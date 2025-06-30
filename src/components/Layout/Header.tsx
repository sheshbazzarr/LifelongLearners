import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, BookOpen, Target, Search, LogOut, Settings, Crown, Plus, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: BookOpen },
    { name: 'Challenges', path: '/challenges', icon: Target },
    { name: 'Books', path: '/books', icon: Search },
    { name: 'Past Challenges', path: '/past-challenges', icon: History },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getDashboardPath = () => {
    if (!userProfile) return '/dashboard';
    return userProfile.role === 'creator' ? '/creator-dashboard' : '/dashboard';
  };

  const getRoleDisplay = () => {
    if (!userProfile) return { label: 'User', icon: User, color: 'text-gray-600' };
    
    switch (userProfile.role) {
      case 'creator':
        return { label: 'Creator', icon: Crown, color: 'text-purple-600' };
      default:
        return { label: 'Learner', icon: User, color: 'text-blue-600' };
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const roleInfo = getRoleDisplay();
  const RoleIcon = roleInfo.icon;

  if (!user || !userProfile) {
    return null; // Don't render header if not authenticated
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-full overflow-hidden group-hover:scale-105 transition-transform">
              <img 
                src="/photo_2024-12-26_12-17-47.jpg" 
                alt="LifelongLearners Tortoise" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">LifelongLearners</h1>
              <p className="text-xs text-gray-500 -mt-1">Life is teaching, never stop learning</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Create Challenge Button for Creators */}
            {userProfile.role === 'creator' && (
              <Link
                to="/create-challenge"
                className="hidden md:inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Challenge
              </Link>
            )}

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900">{userProfile.name}</div>
                  <div className={`text-xs flex items-center space-x-1 ${roleInfo.color}`}>
                    <RoleIcon className="w-3 h-3" />
                    <span>{roleInfo.label}</span>
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Dashboard
                  </Link>
                  
                  {userProfile.role === 'creator' && (
                    <Link
                      to="/create-challenge"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden"
                    >
                      <Plus className="w-4 h-4 mr-3" />
                      Create Challenge
                    </Link>
                  )}

                  <button
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-50"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <nav className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.path)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <hr className="my-2" />
              
              <Link
                to={getDashboardPath()}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
              >
                <User className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              {userProfile.role === 'creator' && (
                <Link
                  to="/create-challenge"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Challenge</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;