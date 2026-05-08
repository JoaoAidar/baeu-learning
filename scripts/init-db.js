const supabase = require('../config/db');

async function initializeDatabase() {
    try {
        // Drop existing tables if they exist
        const { error: dropError } = await supabase
            .from('user_progress')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (dropError) throw dropError;

        const { error: dropExercisesError } = await supabase
            .from('exercises')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (dropExercisesError) throw dropExercisesError;

        const { error: dropLessonsError } = await supabase
            .from('lessons')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (dropLessonsError) throw dropLessonsError;

        // Note: Table creation and extension enabling should be done through Supabase dashboard
        // as these operations require superuser privileges which are not available through the client
        console.log('Database tables cleared successfully');
        console.log('Please run the SQL script from scripts/sql/init.sql in your Supabase dashboard to create the tables');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Run the initialization
initializeDatabase()
    .then(() => {
        console.log('Database initialization completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }); 