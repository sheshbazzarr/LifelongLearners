import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Users, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Eye, 
  Edit, 
  Share2,
  BarChart3,
  MessageCircle,
  Award,
  Clock,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';

const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [createdChallenges, setCreatedChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!user) return;

      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }

        // Fetch created challenges
        const { data: challenges } = await supabase
          .from('challenges')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (challenges) {
          setCreatedChallenges(challenges);
        }
      } catch (error) {
        console.error('Error fetching creator data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your creator dashboard...</p>
        </div>
      </div>
    );
  }

  const userName = userProfile?.name || user?.email?.split('@')[0] || 'Creator';

  const creatorStats = [
    {
      label: 'Challenges Created',
      value: createdChallenges.length.toString(),
      change: '+2 this month',
      icon: Target,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      label: 'Total Participants',
      value: '0', // Would need to track participants in a separate table
      change: '+0 this week',
      icon: Users,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
    {
      label: 'Active Challenges',
      value: createdChallenges.filter(c => c.status === 'active').length.toString(),
      change: 'Currently running',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Community Rating',
      value: '4.8',
      change: '⭐ Excellent',
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  const recentActivity = [
    {
      type: 'challenge_created',
      message: 'New challenge created successfully',
      time: '2 hours ago',
      icon: Target,
    },
    {
      type: 'milestone',
      message: 'Challenge reached completion milestone',
      time: '1 day ago',
      icon: TrendingUp,
    },
    {
      type: 'feedback',
      message: 'New positive feedback received',
      time: '2 days ago',
      icon: Award,
    },
  ];

  const upcomingTasks = [
    {
      task: 'Review weekly submissions',
      challenge: 'Active Challenge',
      dueDate: 'Today',
      priority: 'high',
    },
    {
      task: 'Send motivation message',
      challenge: 'Upcoming Challenge',
      dueDate: 'Tomorrow',
      priority: 'medium',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'challenges', label: 'My Challenges', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'participants', label: 'Participants', icon: Users },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {creatorStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
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
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Icon className="w-4 h-4 text-primary-600" />
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

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
          <div className="space-y-4">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">{task.task}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{task.challenge}</p>
                    <p className="text-xs text-gray-500 mt-1">Due: {task.dueDate}</p>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/create-challenge"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-2 bg-primary-100 rounded-lg">
              <Plus className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Create Challenge</h4>
              <p className="text-sm text-gray-600">Start a new learning challenge</p>
            </div>
          </Link>

          <button className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-secondary-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Engage Community</h4>
              <p className="text-sm text-gray-600">Send updates to participants</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <div className="p-2 bg-accent-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">View Analytics</h4>
              <p className="text-sm text-gray-600">Check challenge performance</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderChallenges = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">My Challenges</h3>
        <Link
          to="/create-challenge"
          className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Challenge
        </Link>
      </div>

      {createdChallenges.length > 0 ? (
        <div className="grid gap-6">
          {createdChallenges.map((challenge) => (
            <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{challenge.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        challenge.status === 'active' ? 'bg-green-100 text-green-800' :
                        challenge.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {challenge.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {challenge.tags?.map((tag: string, tagIndex: number) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges created yet</h3>
          <p className="text-gray-600 mb-4">Create your first challenge to start inspiring learners</p>
          <Link
            to="/create-challenge"
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create First Challenge
          </Link>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'challenges':
        return renderChallenges();
      case 'analytics':
        return <div className="text-center py-12 text-gray-500">Analytics coming soon...</div>;
      case 'participants':
        return <div className="text-center py-12 text-gray-500">Participant management coming soon...</div>;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img 
                src="/photo_2024-12-26_12-17-47.jpg" 
                alt="LifelongLearners Tortoise" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Creator Dashboard 🏆
              </h1>
              <p className="text-gray-600">
                Welcome back, {userName}! Manage your challenges and inspire learners.
              </p>
            </div>
          </div>
        </div>

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

export default CreatorDashboard;