import React from 'react';
import { Clock, Users, Calendar, Tag } from 'lucide-react';
import { Challenge } from '../../types';

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin?: (challengeId: string) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onJoin }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getTypeIcon(challenge.type)}</div>
          <div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(challenge.status)}`}>
              {challenge.status}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{challenge.participants.length}</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
        {challenge.title}
      </h3>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {challenge.description}
      </p>

      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-primary-700">
              {challenge.creatorName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{challenge.creatorName}</p>
            <p className="text-xs text-gray-500">{challenge.creatorRole}</p>
          </div>
        </div>

        {onJoin && challenge.status !== 'completed' && (
          <button
            onClick={() => onJoin(challenge.id)}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Join Challenge
          </button>
        )}
      </div>

      {challenge.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {challenge.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              <Tag className="w-3 h-3" />
              <span>{tag}</span>
            </span>
          ))}
          {challenge.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{challenge.tags.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ChallengeCard;