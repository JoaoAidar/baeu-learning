const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// TODO: [SECURITY] Add connection pooling configuration
// TODO: [SECURITY] Implement retry mechanism for failed connections
// TODO: [SECURITY] Add connection timeout settings

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

// TODO: [PERFORMANCE] Add query timeout settings
// TODO: [PERFORMANCE] Implement connection pooling
// TODO: [PERFORMANCE] Add query caching where appropriate

// Test the connection
supabase.from('users').select('count').single()
    .then(() => {
        logger.info('Connected to Supabase successfully');
    })
    .catch(error => {
        logger.error('Error connecting to Supabase:', error);
        process.exit(1);
    });

// TODO: [ERROR HANDLING] Implement graceful shutdown
// TODO: [ERROR HANDLING] Add connection error recovery mechanism

module.exports = { supabase }; 