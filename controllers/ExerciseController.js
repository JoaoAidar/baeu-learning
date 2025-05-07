const supabase = require('../lib/supabase');

// GET /lesson/:lessonId - Retorna lição com exercícios no novo formato JSON modular
exports.getExercisesByLessonId = async (req, res) => {
  const { lessonId } = req.params;

  try {
    // Buscar a lição
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lessonData) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Buscar os exercícios da lição
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .eq('lesson_id', lessonId);

    if (exercisesError) {
      throw exercisesError;
    }

    // Retornar estrutura JSON modular
    res.json({
      lesson_id: lessonData.id,
      title: lessonData.title,
      description: lessonData.description,
      exercises: exercises.map((ex) => ({
        exercise_id: ex.id,
        type: ex.type,
        question: ex.prompt,
        options: ex.choices || null, // apenas se for múltipla escolha
        correct_answer: ex.correct_answer
      }))
    });
  } catch (err) {
    console.error('Error fetching lesson and exercises:', err.message);
    res.status(500).json({ error: 'Failed to fetch lesson data' });
  }
};

// GET /:lessonId/type/:type - Opcional, filtrar exercícios por tipo
exports.getExercisesByType = async (req, res) => {
  const { lessonId} = req.params;

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('lesson_id', lessonId);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// In controllers/ExerciseController.js
exports.submitAnswer = async (req, res) => {
    const { exerciseId } = req.params;
    const { userAnswer } = req.body;
  
    try {
      if (!userAnswer) {
        return res.status(400).json({ error: 'userAnswer is required' });
      }
  
      const { data: exercise, error: fetchError } = await supabase
        .from('exercises')
        .select('id, prompt, answer, type')
        .eq('id', exerciseId)
        .single();
  
      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        return res.status(404).json({ error: 'Exercise not found' });
      }
  
      const correctAnswer = exercise.answer?.trim();
      const isCorrect = userAnswer.trim() === correctAnswer;
  
      res.json({
        is_correct: isCorrect,
        correct_answer: correctAnswer,
        explanation: isCorrect
          ? 'Ótimo! Você acertou.'
          : `Não foi dessa vez. A resposta correta é "${correctAnswer}".`,
        highlighted_issues: isCorrect ? [] : ['check_answer']
      });
    } catch (err) {
      console.error('submitAnswer unexpected error:', err);
      res.status(500).json({ error: 'Internal server error in submitAnswer' });
    }
  };
  
  
