import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const initializeDatabase = async () => {
  try {
    console.log('🗄️ Initializing Supabase database...');

    // Check if tables exist by trying to fetch from them
    const { data: usersCheck } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (usersCheck) {
      console.log('✅ Database tables already exist');
      return;
    }

    console.log('📋 Database tables need to be created. Please run the SQL migrations in your Supabase dashboard.');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('📋 Please ensure your Supabase credentials are correct and tables are created.');
  }
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message || 'Database operation failed');
  }
};