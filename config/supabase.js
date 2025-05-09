const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    logger.error('Missing Supabase configuration. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

// Test the connection
supabase.from('users').select('count').single()
    .then(() => {
        logger.info('Connected to Supabase successfully');
    })
    .catch(error => {
        logger.error('Error connecting to Supabase:', error);
        process.exit(1);
    });

module.exports = { supabase }; 