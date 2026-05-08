-- Function to drop all tables
CREATE OR REPLACE FUNCTION drop_all_tables()
RETURNS void AS $$
BEGIN
    DROP TABLE IF EXISTS user_progress CASCADE;
    DROP TABLE IF EXISTS exercises CASCADE;
    DROP TABLE IF EXISTS lessons CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
END;
$$ LANGUAGE plpgsql;

-- Function to create UUID extension
CREATE OR REPLACE FUNCTION create_uuid_extension()
RETURNS void AS $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
END;
$$ LANGUAGE plpgsql;

-- Function to create users table
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;

-- Function to create lessons table
CREATE OR REPLACE FUNCTION create_lessons_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE lessons (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;

-- Function to create exercises table
CREATE OR REPLACE FUNCTION create_exercises_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE exercises (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        lesson_id UUID NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('multiple_choice', 'text', 'matching', 'listening', 'speaking')),
        difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
        prompt TEXT NOT NULL,
        options JSONB NOT NULL DEFAULT '[]'::jsonb,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_exercise_lesson
            FOREIGN KEY (lesson_id)
            REFERENCES lessons(id)
            ON DELETE CASCADE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to create user_progress table
CREATE OR REPLACE FUNCTION create_user_progress_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE user_progress (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        lesson_id UUID NOT NULL,
        exercise_id UUID NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        correct BOOLEAN DEFAULT FALSE,
        attempts INTEGER DEFAULT 0,
        last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_progress_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,
        CONSTRAINT fk_progress_lesson
            FOREIGN KEY (lesson_id)
            REFERENCES lessons(id)
            ON DELETE CASCADE,
        CONSTRAINT fk_progress_exercise
            FOREIGN KEY (exercise_id)
            REFERENCES exercises(id)
            ON DELETE CASCADE,
        UNIQUE(user_id, exercise_id)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to create test users
CREATE OR REPLACE FUNCTION create_test_users()
RETURNS void AS $$
DECLARE
    admin_id UUID;
    test_id UUID;
BEGIN
    -- Create admin user (password: admin)
    INSERT INTO users (username, email, password_hash, role)
    VALUES ('admin', 'admin@example.com', '$2b$10$MmIFSAN9DP6mwa6SzsLL/uPW40xnI62mHECkfCWvUt9hRHsa/Tf9a', 'admin')
    RETURNING id INTO admin_id;

    -- Create test user (password: test123)
    INSERT INTO users (username, email, password_hash, role)
    VALUES ('test', 'test@example.com', '$2b$10$eAhN54lp1wHX7qGCEvNDSe2R9m9SAw/GhfDVb6/pww1c30HW2eE62', 'user')
    RETURNING id INTO test_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create English-Korean lessons and exercises
CREATE OR REPLACE FUNCTION create_english_korean_content()
RETURNS void AS $$
DECLARE
    lesson1_id UUID;
    lesson2_id UUID;
    lesson3_id UUID;
    lesson4_id UUID;
    lesson5_id UUID;
BEGIN
    -- Lesson 1: Basic Greetings
    INSERT INTO lessons (title, description, order_index)
    VALUES ('Basic Greetings', 'Learn essential Korean greetings and introductions', 1)
    RETURNING id INTO lesson1_id;

    -- Lesson 2: Numbers and Counting
    INSERT INTO lessons (title, description, order_index)
    VALUES ('Numbers and Counting', 'Master Korean numbers and counting systems', 2)
    RETURNING id INTO lesson2_id;

    -- Lesson 3: Basic Phrases
    INSERT INTO lessons (title, description, order_index)
    VALUES ('Basic Phrases', 'Essential Korean phrases for daily conversation', 3)
    RETURNING id INTO lesson3_id;

    -- Lesson 4: Food and Dining
    INSERT INTO lessons (title, description, order_index)
    VALUES ('Food and Dining', 'Learn Korean food vocabulary and dining phrases', 4)
    RETURNING id INTO lesson4_id;

    -- Lesson 5: Travel and Transportation
    INSERT INTO lessons (title, description, order_index)
    VALUES ('Travel and Transportation', 'Essential Korean for travelers', 5)
    RETURNING id INTO lesson5_id;

    -- Exercises for Lesson 1: Basic Greetings
    INSERT INTO exercises (lesson_id, type, difficulty, prompt, options, correct_answer, explanation, order_index)
    VALUES 
        (lesson1_id, 'multiple_choice', 'easy', 'How do you say "Hello" in Korean?', 
        '[
            {"id": "a", "text": "안녕하세요"},
            {"id": "b", "text": "감사합니다"},
            {"id": "c", "text": "잘 부탁드립니다"},
            {"id": "d", "text": "안녕히 계세요"}
        ]'::jsonb, 
        'a', '안녕하세요 (annyeonghaseyo) is the standard way to say hello in Korean', 1),
        
        (lesson1_id, 'multiple_choice', 'easy', 'What does "감사합니다" mean?',
        '[
            {"id": "a", "text": "Hello"},
            {"id": "b", "text": "Thank you"},
            {"id": "c", "text": "Goodbye"},
            {"id": "d", "text": "Please"}
        ]'::jsonb,
        'b', '감사합니다 (gamsahamnida) means "Thank you" in Korean', 2),

        (lesson1_id, 'multiple_choice', 'medium', 'How do you say "Nice to meet you" in Korean?',
        '[
            {"id": "a", "text": "안녕하세요"},
            {"id": "b", "text": "반갑습니다"},
            {"id": "c", "text": "감사합니다"},
            {"id": "d", "text": "안녕히 계세요"}
        ]'::jsonb,
        'b', '반갑습니다 (bangapseumnida) means "Nice to meet you" in Korean', 3);

    -- Exercises for Lesson 2: Numbers and Counting
    INSERT INTO exercises (lesson_id, type, difficulty, prompt, options, correct_answer, explanation, order_index)
    VALUES 
        (lesson2_id, 'multiple_choice', 'easy', 'What is the Korean word for "one"?',
        '[
            {"id": "a", "text": "이"},
            {"id": "b", "text": "일"},
            {"id": "c", "text": "삼"},
            {"id": "d", "text": "사"}
        ]'::jsonb,
        'b', '일 (il) is the Korean word for "one"', 1),

        (lesson2_id, 'multiple_choice', 'medium', 'How do you say "ten" in Korean?',
        '[
            {"id": "a", "text": "구"},
            {"id": "b", "text": "십"},
            {"id": "c", "text": "백"},
            {"id": "d", "text": "천"}
        ]'::jsonb,
        'b', '십 (sip) is the Korean word for "ten"', 2),

        (lesson2_id, 'multiple_choice', 'hard', 'What is the Korean word for "hundred"?',
        '[
            {"id": "a", "text": "십"},
            {"id": "b", "text": "백"},
            {"id": "c", "text": "천"},
            {"id": "d", "text": "만"}
        ]'::jsonb,
        'b', '백 (baek) is the Korean word for "hundred"', 3);

    -- Exercises for Lesson 3: Basic Phrases
    INSERT INTO exercises (lesson_id, type, difficulty, prompt, options, correct_answer, explanation, order_index)
    VALUES 
        (lesson3_id, 'multiple_choice', 'easy', 'How do you say "I am sorry" in Korean?',
        '[
            {"id": "a", "text": "감사합니다"},
            {"id": "b", "text": "미안합니다"},
            {"id": "c", "text": "안녕하세요"},
            {"id": "d", "text": "잘 부탁드립니다"}
        ]'::jsonb,
        'b', '미안합니다 (mianhamnida) means "I am sorry" in Korean', 1),

        (lesson3_id, 'multiple_choice', 'medium', 'What does "잘 부탁드립니다" mean?',
        '[
            {"id": "a", "text": "Thank you"},
            {"id": "b", "text": "Please take care of me"},
            {"id": "c", "text": "Goodbye"},
            {"id": "d", "text": "Hello"}
        ]'::jsonb,
        'b', '잘 부탁드립니다 (jal butakdeurimnida) means "Please take care of me"', 2);

    -- Exercises for Lesson 4: Food and Dining
    INSERT INTO exercises (lesson_id, type, difficulty, prompt, options, correct_answer, explanation, order_index)
    VALUES 
        (lesson4_id, 'multiple_choice', 'easy', 'How do you say "delicious" in Korean?',
        '[
            {"id": "a", "text": "맛있어요"},
            {"id": "b", "text": "맛없어요"},
            {"id": "c", "text": "배고파요"},
            {"id": "d", "text": "목말라요"}
        ]'::jsonb,
        'a', '맛있어요 (masisseoyo) means "delicious" in Korean', 1),

        (lesson4_id, 'multiple_choice', 'medium', 'What does "배고파요" mean?',
        '[
            {"id": "a", "text": "I am thirsty"},
            {"id": "b", "text": "I am hungry"},
            {"id": "c", "text": "I am full"},
            {"id": "d", "text": "I am tired"}
        ]'::jsonb,
        'b', '배고파요 (baegopayo) means "I am hungry" in Korean', 2);

    -- Exercises for Lesson 5: Travel and Transportation
    INSERT INTO exercises (lesson_id, type, difficulty, prompt, options, correct_answer, explanation, order_index)
    VALUES 
        (lesson5_id, 'multiple_choice', 'easy', 'How do you say "Where is the subway station?" in Korean?',
        '[
            {"id": "a", "text": "지하철역이 어디예요?"},
            {"id": "b", "text": "버스 정류장이 어디예요?"},
            {"id": "c", "text": "택시 정류장이 어디예요?"},
            {"id": "d", "text": "공항이 어디예요?"}
        ]'::jsonb,
        'a', '지하철역이 어디예요? (jihacheollyeogi eodiyeyo?) means "Where is the subway station?"', 1),

        (lesson5_id, 'multiple_choice', 'medium', 'What does "버스 정류장이 어디예요?" mean?',
        '[
            {"id": "a", "text": "Where is the subway station?"},
            {"id": "b", "text": "Where is the bus stop?"},
            {"id": "c", "text": "Where is the airport?"},
            {"id": "d", "text": "Where is the train station?"}
        ]'::jsonb,
        'b', '버스 정류장이 어디예요? (beoseu jeongnyujangi eodiyeyo?) means "Where is the bus stop?"', 2);
END;
$$ LANGUAGE plpgsql;

-- Execute the functions
SELECT drop_all_tables();
SELECT create_uuid_extension();
SELECT create_users_table();
SELECT create_lessons_table();
SELECT create_exercises_table();
SELECT create_user_progress_table();
SELECT create_test_users();
SELECT create_english_korean_content(); 