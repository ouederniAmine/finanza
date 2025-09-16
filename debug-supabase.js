// debug-supabase.js
// Debug script to test Supabase configuration
// Run with: node debug-supabase.js

const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Checking Supabase Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log(`EXPO_PUBLIC_SUPABASE_URL: ${process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`EXPO_PUBLIC_SUPABASE_ANON_KEY: ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}\n`);

if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
  console.log(`Supabase URL: ${process.env.EXPO_PUBLIC_SUPABASE_URL}`);
  
  // Extract project reference from URL
  const urlMatch = process.env.EXPO_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (urlMatch) {
    console.log(`Project Reference: ${urlMatch[1]}`);
  }
}

if (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  try {
    // Decode JWT to check project reference
    const base64Url = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(Buffer.from(base64, 'base64').toString().split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    
    const payload = JSON.parse(jsonPayload);
    console.log(`JWT Project Reference: ${payload.ref || 'Not found'}`);
    console.log(`JWT Expiry: ${new Date(payload.exp * 1000).toISOString()}`);
  } catch (e) {
    console.log('❌ Cannot decode JWT token');
  }
}

console.log('\n🔗 Testing network connectivity...');

// Simple network test
const https = require('https');
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;

if (url) {
  const testUrl = new URL(url);
  
  const req = https.get(`https://${testUrl.hostname}`, (res) => {
    console.log(`✅ Can reach ${testUrl.hostname} (Status: ${res.statusCode})`);
  });
  
  req.on('error', (err) => {
    console.log(`❌ Cannot reach ${testUrl.hostname}: ${err.message}`);
  });
  
  req.setTimeout(5000, () => {
    console.log(`❌ Timeout connecting to ${testUrl.hostname}`);
    req.destroy();
  });
}