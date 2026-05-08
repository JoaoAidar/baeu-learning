const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');

async function updateAdminPassword() {
    try {
        const newPassword = 'admin123';
        const passwordHash = await bcrypt.hash(newPassword, 10);

        const { data, error } = await supabase
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('username', 'admin')
            .select();

        if (error) {
            console.error('Error updating admin password:', error);
            return;
        }

        console.log('Admin password updated successfully!');
        console.log('New password:', newPassword);
    } catch (error) {
        console.error('Error:', error);
    }
}

updateAdminPassword(); 