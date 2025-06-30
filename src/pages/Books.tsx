import React, { useState, useEffect } from 'react';
import { Search, Filter, Globe, FileText, Bookmark } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookService } from '../services/bookService';

interface Book {
  id: string;
  title: string;
  author: string;
  language: string;
  format: string;
  tags: string[];
  description: string;
  created_by: string;
  created_at: string;
}

const Books: React.FC = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const languages = [
    { value: 'all', label: 'All Languages' },
    { value: 'english', label: 'English' },
    { value: 'amharic', label: 'Amharic' },
    { value: 'other', label: 'Other' },
  ];

  const formats = [
    { value: 'all', label: 'All Formats' },
    { value: 'pdf', label: 'PDF' },
    { value: 'audio', label: 'Audio' },
    { value: 'print', label: 'Print' },
    { value: 'ebook', label: 'E-book' },
  ];

  const topics = [
    { value: 'all', label: 'All Topics' },
    { value: 'habits', label: 'Habits & Productivity' },
    { value: 'programming', label: 'Programming' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'language', label: 'Language Learning' },
    { value: 'leadership', label: 'Leadership' },
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getBooks({
        search: searchTerm,
        language: selectedLanguage,
        format: selectedFormat,
        tags: selectedTopic !== 'all' ? [selectedTopic] : undefined
      });
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, selectedLanguage, selectedFormat, selectedTopic]);

  const handleBookSelect = async (bookId: string) => {
    if (!user) return;
    
    try {
      // Log the interaction
      console.log('Selected book:', bookId);
      // In a real app, this would navigate to book details or add to reading list
    } catch (error) {
      console.error('Error logging book interaction:', error);
    }
  };

  const stats = {
    total: books.length,
    languages: new Set(books.map(b => b.language)).size,
    formats: new Set(books.map(b => b.format)).size,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Curated Books</h1>
          <p className="text-gray-600">
            Discover hand-picked books recommended by our community of learners and experts
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search books, authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Language Filter */}
            <div>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            {/* Format Filter */}
            <div>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {formats.map(format => (
                  <option key={format.value} value={format.value}>{format.label}</option>
                ))}
              </select>
            </div>

            {/* Topic Filter */}
            <div>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {topics.map(topic => (
                  <option key={topic.value} value={topic.value}>{topic.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Books</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-600">{stats.languages}</div>
              <div className="text-sm text-gray-600">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-600">{stats.formats}</div>
              <div className="text-sm text-gray-600">Formats</div>
            </div>
          </div>
        </div>

        {/* AI Recommendation Prompt */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 mb-8 border border-primary-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🐢</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can't find what you're looking for?
              </h3>
              <p className="text-gray-600 mb-3">
                Ask the Tortoise AI for personalized book recommendations based on your interests and goals.
              </p>
              <button className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
                <Search className="w-4 h-4 mr-2" />
                Ask for Recommendations
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {books.length} books
          </p>
        </div>

        {/* Books Grid */}
        {books.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group cursor-pointer"
                   onClick={() => handleBookSelect(book.id)}>
                <div className="flex items-start space-x-4">
                  {/* Book Cover Placeholder */}
                  <div className="w-16 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Bookmark className="w-8 h-8 text-primary-600" />
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
                        <FileText className="w-4 h-4" />
                        <span className="capitalize">{book.format}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <span className="capitalize">{book.language}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {book.tags && book.tags.length > 0 && (
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters, or ask the Tortoise AI for recommendations
            </p>
            <button className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
              <Search className="w-5 h-5 mr-2" />
              Get AI Recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;