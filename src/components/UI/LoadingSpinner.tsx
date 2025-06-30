import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full overflow-hidden animate-bounce mx-auto mb-4">
          <img 
            src="/photo_2024-12-26_12-17-47.jpg" 
            alt="LifelongLearners Tortoise" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your learning journey...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;