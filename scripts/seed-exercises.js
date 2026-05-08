const supabase = require('../config/db');

const initialExercises = [
    // Introduction to Korean
    {
        lesson_id: null, // Will be set dynamically
        type: 'multiple_choice',
        difficulty: 'easy',
        prompt: 'What is the name of the Korean alphabet?',
        options: ['Hangul', 'Hanja', 'Katakana', 'Hiragana'],
        correct_answer: 'Hangul',
        explanation: 'Hangul (한글) is the Korean alphabet, created in 1443 by King Sejong the Great.',
        order_index: 1
    },
    {
        lesson_id: null,
        type: 'multiple_choice',
        difficulty: 'medium',
        prompt: 'How many basic consonants are there in Hangul?',
        options: ['14', '10', '19', '21'],
        correct_answer: '14',
        explanation: 'There are 14 basic consonants in Hangul: ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅅ, ㅇ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅎ',
        order_index: 2
    },
    {
        lesson_id: null,
        type: 'text',
        difficulty: 'easy',
        prompt: 'Write the Korean word for "hello" (informal)',
        correct_answer: '안녕',
        explanation: '안녕 (annyeong) is the informal way to say hello in Korean.',
        order_index: 3
    },
    {
        lesson_id: null,
        type: 'matching',
        difficulty: 'medium',
        prompt: 'Match the Korean consonants with their romanized pronunciation',
        options: [
            { korean: 'ㄱ', romanized: 'g/k' },
            { korean: 'ㄴ', romanized: 'n' },
            { korean: 'ㄷ', romanized: 'd/t' },
            { korean: 'ㅁ', romanized: 'm' }
        ],
        correct_answer: JSON.stringify([
            { korean: 'ㄱ', romanized: 'g/k' },
            { korean: 'ㄴ', romanized: 'n' },
            { korean: 'ㄷ', romanized: 'd/t' },
            { korean: 'ㅁ', romanized: 'm' }
        ]),
        explanation: 'These are some of the basic consonants in Hangul with their romanized pronunciations.',
        order_index: 4
    },
    {
        lesson_id: null,
        type: 'listening',
        difficulty: 'hard',
        prompt: 'Listen to the audio and write what you hear in Korean',
        audio_url: '/audio/hello.mp3',
        correct_answer: '안녕하세요',
        explanation: '안녕하세요 (annyeonghaseyo) is the formal way to say hello in Korean.',
        order_index: 5
    },

    // Basic Greetings and Introductions
    {
        lesson_id: null,
        type: 'multiple_choice',
        difficulty: 'easy',
        prompt: 'Which greeting is used in the morning?',
        options: ['안녕하세요', '좋은 아침입니다', '안녕히 주무세요', '잘 가세요'],
        correct_answer: '좋은 아침입니다',
        explanation: '좋은 아침입니다 (joeun achimimnida) means "good morning" in Korean.',
        order_index: 1
    },
    {
        lesson_id: null,
        type: 'text',
        difficulty: 'medium',
        prompt: 'How do you say "My name is [name]" in Korean?',
        correct_answer: '제 이름은 [name]입니다',
        explanation: '제 이름은 [name]입니다 (je ireumeun [name]imnida) is the formal way to introduce yourself.',
        order_index: 2
    },
    {
        lesson_id: null,
        type: 'speaking',
        difficulty: 'hard',
        prompt: 'Record yourself saying "Nice to meet you" in Korean',
        correct_answer: '만나서 반갑습니다',
        explanation: '만나서 반갑습니다 (mannaseo bangapseumnida) means "Nice to meet you" in Korean.',
        order_index: 3
    },

    // Numbers and Counting
    {
        lesson_id: null,
        type: 'multiple_choice',
        difficulty: 'easy',
        prompt: 'What is the Korean word for "one"?',
        options: ['일', '이', '삼', '사'],
        correct_answer: '일',
        explanation: '일 (il) is the Korean word for "one" in the Sino-Korean number system.',
        order_index: 1
    },
    {
        lesson_id: null,
        type: 'matching',
        difficulty: 'medium',
        prompt: 'Match the Korean numbers with their meanings',
        options: [
            { korean: '일', meaning: '1' },
            { korean: '이', meaning: '2' },
            { korean: '삼', meaning: '3' },
            { korean: '사', meaning: '4' }
        ],
        correct_answer: JSON.stringify([
            { korean: '일', meaning: '1' },
            { korean: '이', meaning: '2' },
            { korean: '삼', meaning: '3' },
            { korean: '사', meaning: '4' }
        ]),
        explanation: 'These are the first four numbers in the Sino-Korean number system.',
        order_index: 2
    },

    // Basic Sentence Structure
    {
        lesson_id: null,
        type: 'multiple_choice',
        difficulty: 'easy',
        prompt: 'What is the basic word order in Korean?',
        options: ['Subject-Object-Verb', 'Subject-Verb-Object', 'Verb-Subject-Object', 'Object-Subject-Verb'],
        correct_answer: 'Subject-Object-Verb',
        explanation: 'Korean follows the SOV (Subject-Object-Verb) word order, unlike English which uses SVO.',
        order_index: 1
    },
    {
        lesson_id: null,
        type: 'text',
        difficulty: 'medium',
        prompt: 'Write the Korean sentence "I eat rice" (informal)',
        correct_answer: '나는 밥을 먹어',
        explanation: '나는 (naneun) = I, 밥을 (bapeul) = rice, 먹어 (meogeo) = eat',
        order_index: 2
    },

    // Daily Conversations
    {
        lesson_id: null,
        type: 'multiple_choice',
        difficulty: 'easy',
        prompt: 'How do you say "Thank you" in Korean?',
        options: ['감사합니다', '안녕하세요', '잘 가세요', '미안합니다'],
        correct_answer: '감사합니다',
        explanation: '감사합니다 (gamsahamnida) is the formal way to say "thank you" in Korean.',
        order_index: 1
    },
    {
        lesson_id: null,
        type: 'text',
        difficulty: 'medium',
        prompt: 'Write the Korean phrase for "How are you?" (informal)',
        correct_answer: '어떻게 지내세요?',
        explanation: '어떻게 지내세요? (eotteoke jinaeseyo?) is a common way to ask "How are you?" in Korean.',
        order_index: 2
    }
];

async function seedExercises() {
    try {
        console.log('Starting to seed exercises...');
        
        // First, get all lessons to map their IDs
        const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('id, order_index')
            .order('order_index');

        if (lessonsError) {
            throw lessonsError;
        }

        // Group exercises by lesson (5 exercises per lesson)
        const exercisesPerLesson = 5;
        for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            const lessonExercises = initialExercises.slice(i * exercisesPerLesson, (i + 1) * exercisesPerLesson);
            
            for (const exercise of lessonExercises) {
                exercise.lesson_id = lesson.id;
                const { data, error } = await supabase
                    .from('exercises')
                    .insert([exercise])
                    .select()
                    .single();

                if (error) {
                    console.error('Error inserting exercise:', error);
                    continue;
                }
                console.log(`Successfully inserted exercise for lesson ${lesson.order_index}: ${exercise.prompt}`);
            }
        }

        console.log('Finished seeding exercises!');
    } catch (error) {
        console.error('Error seeding exercises:', error);
    }
}

module.exports = seedExercises; 