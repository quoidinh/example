const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple parser for .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    env[key.trim()] = value.join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  console.log('Attempting to create user: admin@example.com');
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@example.com',
    password: 'password123',
    email_confirm: true
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('User already exists.');
    } else {
      console.error('Error creating user:', error.message);
    }
  } else {
    console.log('User created successfully:', data.user.id);
  }
}

createAdmin();
