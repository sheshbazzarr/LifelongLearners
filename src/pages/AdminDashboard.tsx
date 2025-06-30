import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Settings, 
  Shield, 
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  BarChart3,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChallenges: 0,
    totalBooks: 0,
    completionRate: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const [
        { count: totalUsers },
        { count: activeChallenges },
        { count: totalBooks },
        { count: completedChallenges },
        { count: totalChallenges }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('books').select('*', { count: 'exact', head: true }),
        supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('challenges').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        activeChallenges: activeChallenges || 0,
        totalBooks: totalBooks || 0,
        completionRate: totalChallenges ? Math.round(((completedChallenges || 0) / totalChallenges) * 100) : 0
      });

      // Fetch users for user management
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent challenges
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent books
      const { data: booksData } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setUsers(usersData || []);
      setChallenges(challengesData || []);
      setBooks(booksData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminStats = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toString(),
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Active Challenges',
      value: stats.activeChallenges.toString(),
      change: '+5%',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Books in Library',
      value: stats.totalBooks.toString(),
      change: '+18%',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Completion Rate',
      value: `${stats.completionRate}%`,
      change: '+3%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const recentActivity = [
    {
      type: 'user_joined',
      message: `${users.length} new users joined recently`,
      time: '2 minutes ago',
      icon: Users,
    },
    {
      type: 'challenge_created',
      message: `${challenges.filter(c => c.status === 'upcoming').length} new challenges created`,
      time: '15 minutes ago',
      icon: Target,
    },
    {
      type: 'book_added',
      message: `${books.length} books added to library`,
      time: '1 hour ago',
      icon: BookOpen,
    },
  ];

  const pendingActions = [
    {
      type: 'challenge_approval',
      title: 'Challenge Approval Required',
      description: 'New challenges need review before going live',
      priority: 'high',
    },
    {
      type: 'user_report',
      title: 'User Reports',
      description: 'Review reported content and user behavior',
      priority: 'medium',
    },
    {
      type: 'book_review',
      title: 'Book Review',
      description: 'New books submitted for library inclusion',
      priority: 'low',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
          <div className="space-y-4">
            {pendingActions.map((action, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">{action.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        action.priority === 'high' ? 'bg-red-100 text-red-800' :
                        action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        <button className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.filter(user => 
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'giver' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-primary-600 hover:text-primary-700">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-700">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'challenges':
        return <div className="text-center py-12 text-gray-500">Challenge management coming soon...</div>;
      case 'books':
        return <div className="text-center py-12 text-gray-500">Book management coming soon...</div>;
      case 'reports':
        return <div className="text-center py-12 text-gray-500">Reports management coming soon...</div>;
      case 'settings':
        return <div className="text-center py-12 text-gray-500">Settings coming soon...</div>;
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src="/photo_2024-12-26_12-17-47.jpg" 
                  alt="LifelongLearners Tortoise" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">LifelongLearners Platform Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;