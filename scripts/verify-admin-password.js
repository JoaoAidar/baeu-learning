const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');

async function verifyAdminPassword() {
    try {
        // First, get the admin user
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('username', 'admin')
            .single();

        if (fetchError) {
            console.error('Error fetching admin user:', fetchError);
            return;
        }

        if (!user) {
            console.error('Admin user not found!');
            return;
        }

        console.log('Admin user found:', {
            id: user.id,
            username: user.username,
            role: user.role,
            hasPassword: !!user.password_hash
        });

        // Test the password
        const testPassword = 'admin123';
        const isValid = await bcrypt.compare(testPassword, user.password_hash);
        
        console.log('Password verification:', {
            testPassword,
            isValid,
            storedHash: user.password_hash
        });

        if (!isValid) {
            // If password is invalid, update it
            console.log('Updating admin password...');
            const newHash = await bcrypt.hash(testPassword, 10);
            
            const { error: updateError } = await supabase
                .from('users')
                .update({ 
                    password_hash: newHash,
                    role: 'admin'
                })
                .eq('username', 'admin');

            if (updateError) {
                console.error('Error updating password:', updateError);
                return;
            }

            console.log('Password updated successfully!');
        } else {
            console.log('Password is valid!');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

verifyAdminPassword(); 