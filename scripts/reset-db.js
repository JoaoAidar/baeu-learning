require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function resetDatabase() {
    try {
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'sql', 'init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute the SQL
        const { error } = await supabase.rpc('exec_sql', { sql });

        if (error) {
            console.error('Error resetting database:', error);
            return;
        }

        console.log('Database reset successfully!');
    } catch (error) {
        console.error('Error:', error);
    }
}

resetDatabase(); 