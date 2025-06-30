import React, { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, TrendingUp, Filter, Search, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  creator_name: string;
  creator_role: string;
  start_date: string;
  end_date: string;
  tags: string[];
  status: string;
  created_at: string;
}

const PastChallenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const challengeTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'reading', label: 'Reading' },
    { value: 'coding', label: 'Coding' },
    { value: 'speaking', label: 'Speaking' },
    { value: 'custom', label: 'Custom' },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
  ];

  useEffect(() => {
    fetchCompletedChallenges();
  }, []);

  const fetchCompletedChallenges = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('status', 'completed')
        .order('end_date', { ascending: false });

      if (error) {
        console.error('Error fetching completed challenges:', error);
      } else {
        setChallenges(data || []);
      }
    } catch (error) {
      console.error('Error fetching completed challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = challenges
    .filter(challenge => {
      const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          challenge.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || challenge.type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        case 'popular':
          // In a real app, you'd sort by participant count
          return b.title.localeCompare(a.title);
        default:
          return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
      }
    });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading':
        return '📚';
      case 'coding':
        return '💻';
      case 'speaking':
        return '🎤';
      default:
        return '🎯';
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading past challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Past Challenges</h1>
          <p className="text-gray-600">
            Explore completed challenges and their results. Get inspired by what the community has achieved.
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg mr-4">
                <Trophy className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{challenges.length}</p>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-secondary-100 rounded-lg mr-4">
                <Users className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {challenges.length * 15} {/* Estimated participants */}
                </p>
                <p className="text-gray-600">Total Participants</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">85%</p>
                <p className="text-gray-600">Avg Completion</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                <span className="text-yellow-600 text-xl">⭐</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">4.6</p>
                <p className="text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search past challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {challengeTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

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

        {/* Timeline */}
        <div className="space-y-6">
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map((challenge, index) => (
              <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-6">
                  {/* Timeline Indicator */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-primary-600" />
                    </div>
                    {index < filteredChallenges.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-200 mt-4"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getTypeIcon(challenge.type)}</div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{challenge.title}</h3>
                          <p className="text-gray-600 text-sm">
                            {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span>⭐</span>
                          <span>4.6</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{challenge.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Completion Rate</span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            85%
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Duration</span>
                          <span className="text-sm font-medium text-gray-900">
                            {calculateDuration(challenge.start_date, challenge.end_date)} days
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Participants</span>
                          <span className="text-sm font-medium text-gray-900">
                            {Math.floor(Math.random() * 50) + 10} {/* Mock participant count */}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {challenge.tags && challenge.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No past challenges found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PastChallenges;