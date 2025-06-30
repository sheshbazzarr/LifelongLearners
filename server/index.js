import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import route handlers
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/users.js';
import searchRoutes from './routes/search.js';
import { initializeDatabase } from './database/supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.static(join(__dirname, '../dist')));

// Initialize Supabase database
await initializeDatabase();

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'supabase'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🤖 OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}`);
  console.log(`🗄️ Database: Supabase ${process.env.SUPABASE_URL ? 'Configured' : 'Missing credentials'}`);
});