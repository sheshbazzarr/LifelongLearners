import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AuthGuard from './components/Layout/AuthGuard';
import TortoiseChat from './components/AI/TortoiseChat';
import Home from './pages/Home';
import Challenges from './pages/Challenges';
import Books from './pages/Books';
import CreateChallenge from './pages/CreateChallenge';
import Dashboard from './pages/Dashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import PastChallenges from './pages/PastChallenges';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/*" element={
              <AuthGuard>
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/challenges" element={<Challenges />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/past-challenges" element={<PastChallenges />} />
                    
                    {/* Role-based Dashboard Routes */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/creator-dashboard" element={
                      <AuthGuard requiredRole="creator">
                        <CreatorDashboard />
                      </AuthGuard>
                    } />
                    <Route path="/admin-dashboard" element={
                      <AuthGuard requiredRole="admin">
                        <AdminDashboard />
                      </AuthGuard>
                    } />
                    
                    {/* Challenge Creation - Creator Role Required */}
                    <Route path="/create-challenge" element={
                      <AuthGuard requiredRole="creator">
                        <CreateChallenge />
                      </AuthGuard>
                    } />
                  </Routes>
                </main>
                <Footer />
                <TortoiseChat />
              </AuthGuard>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;