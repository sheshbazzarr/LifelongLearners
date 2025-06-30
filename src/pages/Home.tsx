import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, BookOpen, Users, TrendingUp, Star } from 'lucide-react';
import { challengeService } from '../services/challengeService';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const [featuredChallenges, setFeaturedChallenges] = useState<any[]>([]);
  const [upcomingChallenges, setUpcomingChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const [active, upcoming] = await Promise.all([
          challengeService.getChallenges({ status: 'active' }),
          challengeService.getChallenges({ status: 'upcoming' })
        ]);

        setFeaturedChallenges(active.slice(0, 2));
        setUpcomingChallenges(upcoming.slice(0, 1));
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const stats = [
    { label: 'Active Learners', value: '1,247', icon: Users },
    { label: 'Challenges Completed', value: '89', icon: Target },
    { label: 'Books Recommended', value: '342', icon: BookOpen },
    { label: 'Success Rate', value: '94%', icon: TrendingUp },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      content: 'The AI recommendations helped me discover books I never would have found. My learning journey has been incredibly focused.',
      rating: 5,
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Professor',
      content: 'Creating challenges for my students has never been easier. The platform makes learning collaborative and fun.',
      rating: 5,
    },
  ];

  const handleJoinChallenge = async (challengeId: string) => {
    if (!userProfile) return;
    
    try {
      await challengeService.joinChallenge(challengeId, userProfile.id);
      // Refresh challenges to update participant count
      const updatedChallenges = await challengeService.getChallenges({ status: 'active' });
      setFeaturedChallenges(updatedChallenges.slice(0, 2));
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden animate-bounce-slow shadow-lg">
                <img 
                  src="/photo_2024-12-26_12-17-47.jpg" 
                  alt="LifelongLearners Wise Tortoise" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Where Learning Becomes a
              <span className="block text-primary-600 bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                Lifestyle
              </span>
            </h1>
            
            <p className="text-xl text-primary-700 font-medium mb-6 italic">
              "Life is teaching, never stop learning"
            </p>
            
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join weekly challenges, discover curated books, and accelerate your growth with 
              AI-powered personalized recommendations. Learn with purpose, at your own pace.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/challenges"
                className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <Target className="w-5 h-5 mr-2" />
                Start a Challenge
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <Link
                to="/books"
                className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border-2 border-gray-200 transition-all transform hover:scale-105"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Find a Book
              </Link>
            </div>

            {/* AI Feature Highlight */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-gray-200 shadow-lg">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src="/photo_2024-12-26_12-17-47.jpg" 
                    alt="Tortoise AI" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold text-gray-900">Ask the Tortoise AI</span>
                <Sparkles className="w-5 h-5 text-primary-500" />
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Get personalized book recommendations and learning plans
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-left">
                <p className="text-sm text-gray-700 italic">
                  "What should I read to become a better public speaker?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Current Week's Challenge */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">This Week's Featured Challenges</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of learners in our active challenges. Pick one that sparks your interest and start growing today.
            </p>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {featuredChallenges.map((challenge) => (
                <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getTypeIcon(challenge.type)}</div>
                      <div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {challenge.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{challenge.participants?.[0]?.count || 0}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {challenge.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {challenge.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    {challenge.start_date && challenge.end_date && (
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-700">
                          {challenge.creator?.name?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{challenge.creator?.name || 'Creator'}</p>
                        <p className="text-xs text-gray-500">{challenge.creator?.role || 'creator'}</p>
                      </div>
                    </div>

                    {userProfile && challenge.status !== 'completed' && (
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
                      {challenge.tags.slice(0, 3).map((tag: string, index: number) => (
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
          )}

          <div className="text-center">
            <Link
              to="/challenges"
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              View All Challenges
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Challenges Preview */}
      {upcomingChallenges.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
              <p className="text-xl text-gray-600">Get ready for upcoming challenges and be the first to join.</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              {upcomingChallenges.map((challenge) => (
                <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-2xl">{getTypeIcon(challenge.type)}</div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {challenge.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
                  {challenge.start_date && (
                    <p className="text-sm text-gray-500">Starts: {formatDate(challenge.start_date)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Learners Say</h2>
            <p className="text-xl text-gray-600">Join thousands who have transformed their learning journey</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-primary-700">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img 
                src="/photo_2024-12-26_12-17-47.jpg" 
                alt="LifelongLearners Tortoise" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-xl mb-2 opacity-90">
            Start your journey today and join a community of lifelong learners
          </p>
          <p className="text-lg mb-8 opacity-75 italic">
            Remember: Life is teaching, never stop learning
          </p>
          <Link
            to={userProfile?.role === 'creator' ? '/creator-dashboard' : '/dashboard'}
            className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-100 text-primary-600 font-semibold rounded-xl transition-all transform hover:scale-105"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;