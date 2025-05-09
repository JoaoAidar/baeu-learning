const supabase = require('../config/db');

const initialLessons = [
    {
        title: "Introduction to Korean",
        description: "Learn the basics of Korean language, including the alphabet (Hangul) and essential greetings.",
        order_index: 1
    },
    {
        title: "Basic Greetings and Introductions",
        description: "Master common Korean greetings and learn how to introduce yourself in different situations.",
        order_index: 2
    },
    {
        title: "Numbers and Counting",
        description: "Learn Korean numbers and how to count objects, people, and express quantities.",
        order_index: 3
    },
    {
        title: "Basic Sentence Structure",
        description: "Understand the fundamental structure of Korean sentences and basic grammar patterns.",
        order_index: 4
    },
    {
        title: "Daily Conversations",
        description: "Practice common phrases and expressions used in everyday Korean conversations.",
        order_index: 5
    }
];

async function seedLessons() {
    try {
        console.log('Starting to seed lessons...');
        
        for (const lesson of initialLessons) {
            const { data, error } = await supabase
                .from('lessons')
                .insert([lesson])
                .select()
                .single();

            if (error) {
                console.error('Error inserting lesson:', error);
                continue;
            }
            console.log('Successfully inserted lesson:', data.title);
        }

        console.log('Finished seeding lessons!');
    } catch (error) {
        console.error('Error seeding lessons:', error);
    }
}

// Run the seeding function
seedLessons(); 