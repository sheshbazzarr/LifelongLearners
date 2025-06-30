import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Target, TrendingUp, Users, Clock, Award, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { challengeService } from '../services/challengeService';

const Dashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [joinedChallenges, setJoinedChallenges] = useState<any[]>([]);
  const [createdChallenges, setCreatedChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch joined challenges
        const joined = await challengeService.getUserJoinedChallenges(user.id);
        setJoinedChallenges(joined);

        // Fetch created challenges if user is a creator
        if (userProfile?.role === 'creator') {
          const created = await challengeService.getUserCreatedChallenges(user.id);
          setCreatedChallenges(created);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const userName = userProfile?.name || user?.email?.split('@')[0] || 'Learner';
  const userRole = userProfile?.role || 'learner';

  const stats = [
    {
      label: 'Challenges Joined',
      value: joinedChallenges.length,
      icon: Target,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      label: 'Challenges Created',
      value: createdChallenges.length,
      icon: Users,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
    {
      label: 'Days Active',
      value: userProfile ? Math.floor((Date.now() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      icon: Calendar,
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
    },
    {
      label: 'Learning Streak',
      value: '3 days',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  const upcomingDeadlines = [
    {
      challenge: 'Daily Reading Challenge',
      deadline: 'Today',
      task: 'Share weekly reflection',
      priority: 'high',
    },
    {
      challenge: 'JavaScript Fundamentals',
      deadline: 'Tomorrow',
      task: 'Complete Module 3',
      priority: 'medium',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userName.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600">
                {userRole === 'creator' ? 'Challenge Creator' : 'Learning Enthusiast'} • 
                Member since {userProfile ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Challenges */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Active Challenges</h2>
                <a href="/challenges" className="text-primary-600 hover:text-primary-700 font-medium">
                  View All
                </a>
              </div>
              
              {joinedChallenges.length > 0 ? (
                <div className="grid gap-6">
                  {joinedChallenges.slice(0, 3).map((userChallenge) => {
                    const challenge = userChallenge.challenge;
                    return (
                      <div key={userChallenge.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}</span>
                              </span>
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
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active challenges</h3>
                  <p className="text-gray-600 mb-4">Join a challenge to start your learning journey</p>
                  <a
                    href="/challenges"
                    className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Browse Challenges
                  </a>
                </div>
              )}
            </div>

            {/* Created Challenges */}
            {userRole === 'creator' && createdChallenges.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Challenges You Created</h2>
                  <a href="/create-challenge" className="text-primary-600 hover:text-primary-700 font-medium">
                    Create New
                  </a>
                </div>
                
                <div className="grid gap-6">
                  {createdChallenges.slice(0, 3).map((challenge) => (
                    <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          challenge.status === 'active' ? 'bg-green-100 text-green-800' :
                          challenge.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {challenge.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-secondary-600" />
                Upcoming Tasks
              </h3>
              
              <div className="space-y-3">
                {upcomingDeadlines.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      item.priority === 'high' ? 'bg-red-500' :
                      item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.task}</p>
                      <p className="text-xs text-gray-600">{item.challenge}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.deadline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                AI Recommendations
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">📖 "Deep Work" by Cal Newport</p>
                  <p className="text-xs text-gray-600">Based on your interests</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">🎯 Morning Routine Challenge</p>
                  <p className="text-xs text-gray-600">Perfect for building consistency</p>
                </div>
              </div>
              
              <button className="w-full mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                Get More Recommendations
              </button>
            </div>

            {/* Achievement Badges */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-secondary-600" />
                Your Progress
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-xs text-gray-600">Challenge Starter</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl mb-1">📚</div>
                  <div className="text-xs text-gray-600">Book Explorer</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg opacity-50">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-xs text-gray-600">7-Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;