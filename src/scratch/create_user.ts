import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zatyeyyqyqjeykyxkpge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphdHlleXlxeXFqZXlreXhrcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MDk2MDYsImV4cCI6MjA5NDQ4NTYwNn0.3c9cgPBlJCexKi89B6nL-wcxk-KEehiUV_BdwiTTAK0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUser() {
  const email = 'admin2@shieldnet.com';
  const password = 'CyberPunkSecurity2026!';
  
  console.log(`Attempting to create user: ${email}`);

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: 'Admin Operative',
      },
    },
  });

  if (error) {
    console.error('❌ Error creating user:', error.message);
  } else {
    console.log('✅ User created successfully!');
    console.log('User ID:', data.user?.id);
    
    // Check if email confirmation is required
    if (data.user?.identities?.length === 0) {
      console.log('⚠️ Note: User already exists or email confirmation is required.');
    }
  }
}

createUser();
