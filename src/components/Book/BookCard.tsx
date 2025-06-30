import React from 'react';
import { Book as BookIcon, User, Globe, FileText } from 'lucide-react';
import { Book } from '../../types';

interface BookCardProps {
  book: Book;
  onSelect?: (bookId: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onSelect }) => {
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'audio':
        return <span className="text-sm">🎧</span>;
      case 'print':
        return <BookIcon className="w-4 h-4" />;
      default:
        return <BookIcon className="w-4 h-4" />;
    }
  };

  const getLanguageFlag = (language: string) => {
    switch (language) {
      case 'english':
        return '🇺🇸';
      case 'amharic':
        return '🇪🇹';
      default:
        return '🌍';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group cursor-pointer"
         onClick={() => onSelect?.(book.id)}>
      <div className="flex items-start space-x-4">
        {/* Book Cover Placeholder */}
        <div className="w-16 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <BookIcon className="w-8 h-8 text-primary-600" />
        </div>

        {/* Book Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors truncate">
            {book.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {book.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              {getFormatIcon(book.format)}
              <span className="capitalize">{book.format}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span>{getLanguageFlag(book.language)}</span>
              <span className="capitalize">{book.language}</span>
            </div>
          </div>

          {/* Curator */}
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Curated by {book.curatedBy}</span>
          </div>

          {/* Tags */}
          {book.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {book.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
              {book.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{book.tags.length - 3} more</span>
              )}
            </div>
          )}

          {/* Challenge Connection */}
          {book.challengeId && (
            <div className="mt-3 p-2 bg-secondary-50 rounded-lg">
              <p className="text-xs text-secondary-700">
                📚 Featured in an active challenge
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;