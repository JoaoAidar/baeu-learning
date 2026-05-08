require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function verifyUsers() {
    try {
        // Get all users
        const { data: users, error } = await supabase
            .from('users')
            .select('*');

        if (error) {
            console.error('Error fetching users:', error);
            return;
        }

        console.log('Users in database:');
        users.forEach(user => {
            console.log({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                password_hash: user.password_hash
            });
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

verifyUsers(); 