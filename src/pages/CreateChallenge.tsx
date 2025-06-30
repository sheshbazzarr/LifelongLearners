import React, { useState } from 'react';
import { Calendar, Clock, Globe, Lock, Upload, Tag, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { challengeService } from '../services/challengeService';

const CreateChallenge: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'reading',
    duration: '1-week',
    startDate: '',
    visibility: 'public',
    tags: '',
    difficultyLevel: 'beginner',
    fileUrl: '',
    externalLink: '',
  });

  const challengeTypes = [
    { value: 'reading', label: 'Reading', icon: '📚' },
    { value: 'coding', label: 'Coding', icon: '💻' },
    { value: 'speaking', label: 'Speaking', icon: '🎤' },
    { value: 'custom', label: 'Custom', icon: '🎯' },
  ];

  const durations = [
    { value: '1-week', label: '1 Week', days: 7 },
    { value: '2-weeks', label: '2 Weeks', days: 14 },
    { value: '1-month', label: '1 Month', days: 30 },
    { value: '3-months', label: '3 Months', days: 90 },
    { value: '6-months', label: '6 Months', days: 180 },
    { value: '1-year', label: '1 Year', days: 365 },
  ];

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Calculate end date based on duration
      const startDate = new Date(formData.startDate);
      const durationDays = durations.find(d => d.value === formData.duration)?.days || 7;
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + durationDays);

      // Parse tags
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Create challenge
      const challenge = await challengeService.createChallenge({
        title: formData.title,
        description: formData.description,
        type: formData.type as any,
        created_by: user.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        tags: tags,
        difficulty_level: formData.difficultyLevel as any,
        visibility: formData.visibility as any,
        status: new Date(formData.startDate) <= new Date() ? 'active' : 'upcoming'
      });

      console.log('Challenge created successfully:', challenge);
      navigate('/challenges');
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      setError(error.message || 'Failed to create challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  // Redirect if not a creator
  if (userProfile?.role !== 'creator') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only creators can create challenges.</p>
          <Link to="/challenges" className="text-primary-600 hover:text-primary-700">
            Browse Challenges
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/challenges"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Learning Challenge</h1>
          <p className="text-gray-600">
            Share your knowledge and help others grow by creating a structured learning challenge
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Challenge Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., 30-Day Morning Reading Challenge"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe what participants will do, what they'll learn, and any specific requirements..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Challenge Type *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {challengeTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleInputChange('type', type.value)}
                            disabled={isSubmitting}
                            className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                              formData.type === type.value
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="text-2xl mb-1">{type.icon}</div>
                            <div className="text-sm font-medium">{type.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration *
                      </label>
                      <select
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={isSubmitting}
                      >
                        {durations.map((duration) => (
                          <option key={duration.value} value={duration.value}>
                            {duration.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficultyLevel}
                      onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={isSubmitting}
                    >
                      {difficultyLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Resources */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources (Optional)</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="e.g., productivity, habits, personal growth (comma-separated)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      External Link
                    </label>
                    <input
                      type="url"
                      value={formData.externalLink}
                      onChange={(e) => handleInputChange('externalLink', e.target.value)}
                      placeholder="https://example.com/resources"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('visibility', 'public')}
                    disabled={isSubmitting}
                    className={`p-4 rounded-lg border-2 transition-all disabled:opacity-50 ${
                      formData.visibility === 'public'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Globe className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                    <div className="font-medium text-gray-900">Public Challenge</div>
                    <div className="text-sm text-gray-600">Anyone can discover and join</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('visibility', 'private')}
                    disabled={isSubmitting}
                    className={`p-4 rounded-lg border-2 transition-all disabled:opacity-50 ${
                      formData.visibility === 'private'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Lock className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <div className="font-medium text-gray-900">Private Challenge</div>
                    <div className="text-sm text-gray-600">Invite-only access</div>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title || !formData.description || !formData.startDate}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Challenge'
                  )}
                </button>
                <Link
                  to="/challenges"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {formData.title || 'Challenge Title'}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.description || 'Challenge description will appear here...'}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{durations.find(d => d.value === formData.duration)?.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                    {challengeTypes.find(t => t.value === formData.type)?.label}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {formData.visibility === 'public' ? 'Public' : 'Private'}
                  </span>
                  <span className="px-2 py-1 bg-secondary-100 text-secondary-800 text-xs rounded-full">
                    {difficultyLevels.find(d => d.value === formData.difficultyLevel)?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Tips for Success</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Be specific about daily/weekly expectations</li>
                <li>• Include clear milestones and progress markers</li>
                <li>• Provide resources and recommended materials</li>
                <li>• Encourage community interaction and sharing</li>
                <li>• Set realistic but challenging goals</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChallenge;