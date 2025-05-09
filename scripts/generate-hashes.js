const bcrypt = require('bcryptjs');

async function generateHashes() {
    const adminPassword = 'admin';
    const testPassword = 'test123';

    const adminHash = await bcrypt.hash(adminPassword, 10);
    const testHash = await bcrypt.hash(testPassword, 10);

    console.log('Admin hash:', adminHash);
    console.log('Test hash:', testHash);
}

generateHashes(); 