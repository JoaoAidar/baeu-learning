require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// Check for required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Error: Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function setupAdmin() {
    try {
        const adminPassword = 'admin123';
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        // First, check if admin user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('username', 'admin')
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
            console.error('Error checking for admin user:', fetchError);
            return;
        }

        if (existingUser) {
            // Update existing admin user
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    password_hash: passwordHash,
                    role: 'admin'
                })
                .eq('username', 'admin');

            if (updateError) {
                console.error('Error updating admin user:', updateError);
                return;
            }
            console.log('Admin user updated successfully!');
        } else {
            // Create new admin user
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    username: 'admin',
                    email: 'admin@example.com',
                    password_hash: passwordHash,
                    role: 'admin'
                });

            if (insertError) {
                console.error('Error creating admin user:', insertError);
                return;
            }
            console.log('Admin user created successfully!');
        }

        console.log('\nAdmin credentials:');
        console.log('Username: admin');
        console.log('Password: admin123');
    } catch (error) {
        console.error('Error:', error);
    }
}

setupAdmin(); 