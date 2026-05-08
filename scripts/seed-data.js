require('dotenv').config();
const supabase = require('../utils/supabase');

const lessons = [
    {
        title: 'Introduction to Korean',
        description: 'Learn the basics of Korean language, including the alphabet (Hangul) and essential greetings.',
        duration: 30,
        level: 'beginner',
        order_index: 1
    },
    {
        title: 'Basic Korean Grammar',
        description: 'Master fundamental Korean grammar structures and sentence patterns.',
        duration: 45,
        level: 'beginner',
        order_index: 2
    },
    {
        title: 'Korean Vocabulary - Daily Life',
        description: 'Essential vocabulary for everyday situations in Korea.',
        duration: 40,
        level: 'beginner',
        order_index: 3
    },
    {
        title: 'Korean Pronunciation',
        description: 'Learn proper Korean pronunciation and intonation patterns.',
        duration: 35,
        level: 'beginner',
        order_index: 4
    },
    {
        title: 'Korean Culture and Etiquette',
        description: 'Understanding Korean culture and social customs.',
        duration: 50,
        level: 'beginner',
        order_index: 5
    }
];

const exercises = [
    // Lesson 1 Exercises
    {
        lesson_id: 1,
        title: 'Hangul Basics',
        description: 'Learn to read and write basic Hangul characters.',
        type: 'quiz',
        content: {
            questions: [
                {
                    question: 'What is the Korean alphabet called?',
                    options: ['Hangul', 'Kanji', 'Hiragana', 'Katakana'],
                    correct_answer: 'Hangul'
                },
                {
                    question: 'How many basic consonants are there in Hangul?',
                    options: ['10', '14', '19', '21'],
                    correct_answer: '14'
                }
            ]
        },
        order: 1
    },
    {
        lesson_id: 1,
        title: 'Basic Greetings',
        description: 'Practice common Korean greetings.',
        type: 'practice',
        content: {
            phrases: [
                { korean: '안녕하세요', english: 'Hello', pronunciation: 'Annyeonghaseyo' },
                { korean: '감사합니다', english: 'Thank you', pronunciation: 'Kamsahamnida' }
            ]
        },
        order: 2
    },
    // Lesson 2 Exercises
    {
        lesson_id: 2,
        title: 'Basic Sentence Structure',
        description: 'Learn the basic Korean sentence structure.',
        type: 'quiz',
        content: {
            questions: [
                {
                    question: 'What is the basic word order in Korean?',
                    options: ['SVO', 'SOV', 'VSO', 'VOS'],
                    correct_answer: 'SOV'
                }
            ]
        },
        order: 1
    }
];

async function seedData() {
    try {
        console.log('Starting data seeding...');

        // Insert lessons
        console.log('Inserting lessons...');
        for (const lesson of lessons) {
            const { data, error } = await supabase
                .from('lessons')
                .insert(lesson)
                .select()
                .single();

            if (error) {
                console.error('Error inserting lesson:', error);
                continue;
            }
            console.log(`Inserted lesson: ${data.title}`);
        }

        // Insert exercises
        console.log('Inserting exercises...');
        for (const exercise of exercises) {
            const { data, error } = await supabase
                .from('exercises')
                .insert(exercise)
                .select()
                .single();

            if (error) {
                console.error('Error inserting exercise:', error);
                continue;
            }
            console.log(`Inserted exercise: ${data.title}`);
        }

        console.log('Data seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

// Run the seeding function
seedData(); 