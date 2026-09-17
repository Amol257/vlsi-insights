const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: (process.env.FRONTEND_URL || 'http://localhost:8888,https://vlsi-insights.netlify.app').split(',').map(u => u.trim()),
  SUPABASE: {
    URL: process.env.SUPABASE_URL || 'https://riipijrgucqigndcjwre.supabase.co',
    ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  RAZORPAY: {
    KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
    KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
    WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || ''
  }
};
