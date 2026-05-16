import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://Q28JgnuQaImrMH9krgkTBQ.supabase.co';
const supabaseAnonKey = 'sb_publishable_Q28JgnuQaImrMH9krgkTBQ_rinIVgDE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('--- Supabase Connection Test ---');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    // Attempt to fetch health or a simple auth request
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection failed with error:', error.message);
    } else {
      console.log('✅ Connection established successfully!');
      console.log('Session Status:', data.session ? 'Active' : 'No active session (Correct for fresh test)');
    }
  } catch (err: any) {
    console.error('❌ Network error:', err.message);
  }
}

testConnection();
