const supabase = require('../config/db');
const logger = require('../utils/logger');

async function verifyDatabase() {
    try {
        logger.info('Verifying database state...');

        // Check lessons table
        const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('*');

        if (lessonsError) {
            logger.error('Error checking lessons table:', lessonsError);
            return;
        }

        logger.info(`Found ${lessons?.length || 0} lessons in database`);
        if (lessons && lessons.length > 0) {
            logger.info('Sample lesson:', lessons[0]);
        }

        // Check exercises table
        const { data: exercises, error: exercisesError } = await supabase
            .from('exercises')
            .select('*');

        if (exercisesError) {
            logger.error('Error checking exercises table:', exercisesError);
            return;
        }

        logger.info(`Found ${exercises?.length || 0} exercises in database`);
        if (exercises && exercises.length > 0) {
            logger.info('Sample exercise:', exercises[0]);
        }

        // If no lessons found, suggest running the seed script
        if (!lessons || lessons.length === 0) {
            logger.warn('No lessons found in database. You may need to run the seed script:');
            logger.warn('npm run seed-lessons');
        }

    } catch (error) {
        logger.error('Error verifying database:', error);
    }
}

// Run the verification
verifyDatabase()
    .then(() => {
        logger.info('Database verification completed');
        process.exit(0);
    })
    .catch((error) => {
        logger.error('Database verification failed:', error);
        process.exit(1);
    }); 