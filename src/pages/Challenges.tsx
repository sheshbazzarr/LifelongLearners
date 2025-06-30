import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Calendar, Users, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { challengeService } from '../services/challengeService';
import { Link } from 'react-router-dom';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  created_by: string;
  start_date: string;
  end_date: string;
  tags: string[];
  difficulty_level: string;
  visibility: string;
  status: string;
  created_at: string;
}

const Challenges: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const challengeTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'reading', label: 'Reading' },
    { value: 'coding', label: 'Coding' },
    { value: 'speaking', label: 'Speaking' },
    { value: 'custom', label: 'Custom' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'ending-soon', label: 'Ending Soon' },
  ];

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const data = await challengeService.getChallenges({
        search: searchTerm,
        type: selectedType,
        status: selectedStatus
      });
      setChallenges(data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [searchTerm, selectedType, selectedStatus]);

  const filteredChallenges = challenges
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        case 'ending-soon':
          return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) return;
    
    try {
      await challengeService.joinChallenge(challengeId, user.id);
      console.log('Joined challenge:', challengeId);
      // Refresh challenges to update participant count
      fetchChallenges();
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const stats = {
    active: challenges.filter(c => c.status === 'active').length,
    upcoming: challenges.filter(c => c.status === 'upcoming').length,
    total: challenges.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Challenges</h1>
            <p className="text-gray-600">Discover and join challenges to accelerate your growth</p>
          </div>
          {userProfile?.role === 'creator' && (
            <Link
              to="/create-challenge"
              className="mt-4 lg:mt-0 inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Challenge
            </Link>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {challengeTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-gray-600">Active Challenges</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                <p className="text-gray-600">Upcoming</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-gray-600">Total Challenges</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredChallenges.length} challenges
          </p>
        </div>

        {/* Challenge Grid */}
        {filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {challenge.type === 'reading' ? '📚' : 
                       challenge.type === 'coding' ? '💻' : 
                       challenge.type === 'speaking' ? '🎤' : '🎯'}
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        challenge.status === 'active' ? 'bg-green-100 text-green-800' :
                        challenge.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {challenge.status}
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                  {challenge.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {challenge.description}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-700">C</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Creator</p>
                      <p className="text-xs text-gray-500">Challenge Creator</p>
                    </div>
                  </div>

                  {challenge.status !== 'completed' && (
                    <button
                      onClick={() => handleJoinChallenge(challenge.id)}
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Join Challenge
                    </button>
                  )}
                </div>

                {challenge.tags && challenge.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {challenge.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {challenge.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{challenge.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            {userProfile?.role === 'creator' && (
              <Link
                to="/create-challenge"
                className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Challenge
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges;