import React from 'react';
import { Heart, Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src="/photo_2024-12-26_12-17-47.jpg" 
                  alt="LifelongLearners Tortoise" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">LifelongLearners</h3>
                <p className="text-sm text-gray-600">Life is teaching, never stop learning</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Empowering individuals to embrace continuous learning through weekly challenges, 
              curated resources, and AI-powered personalized recommendations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              <li><a href="/challenges" className="text-gray-600 hover:text-primary-500 transition-colors">Challenges</a></li>
              <li><a href="/books" className="text-gray-600 hover:text-primary-500 transition-colors">Books</a></li>
              <li><a href="/create-challenge" className="text-gray-600 hover:text-primary-500 transition-colors">Create Challenge</a></li>
              <li><a href="/dashboard" className="text-gray-600 hover:text-primary-500 transition-colors">Dashboard</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors">Community</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 LifelongLearners. Made with <Heart className="w-4 h-4 inline text-red-500" /> for lifelong learners everywhere.
            </p>
            <p className="text-gray-500 text-sm mt-2 md:mt-0">
              Version 1.0.0 MVP
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;