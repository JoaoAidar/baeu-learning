import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

// --- Constants & Utilities ---
const API_BASE_URL = 'http://localhost:3000/api';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- Reusable UI Components (no changes here, they are fine) ---
const LoadingState = () => (
  <div className="flex justify-center items-center h-64">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    <span className="ml-2 text-gray-700">Carregando...</span>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
    <div className="flex items-center">
      <AlertCircle className="w-6 h-6 text-red-500" />
      <h3 className="ml-2 text-red-700 font-medium">{message || 'Ocorreu um erro.'}</h3>
    </div>
  </div>
);

const NoLessonState = () => (
  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
    <div className="flex items-center">
      <AlertCircle className="w-6 h-6 text-yellow-500" />
      <h3 className="ml-2 text-yellow-700 font-medium">Nenhuma aula disponível.</h3>
    </div>
  </div>
);

const CompletionState = ({ totalExercises }) => (
  <div className="bg-green-50 p-8 rounded-lg border border-green-200 text-center">
    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
    <h2 className="text-2xl font-bold text-green-700 mt-4">Parabéns!</h2>
    <p className="text-lg text-green-600 mt-2">
      Você completou todas as {totalExercises} questões!
    </p>
  </div>
);

const FeedbackDisplay = ({ feedback, onNextExercise, hasMoreExercises }) => {
  if (!feedback || feedback.isLoading) {
    return null;
  }

  return (
    <div className={`mt-6 p-4 rounded-lg ${
      feedback.error ? 'bg-red-50' :
      feedback.is_correct ? 'bg-green-50' : 'bg-yellow-50'
    }`}>
      {feedback.error ? (
        <div className="flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p>{feedback.error}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center">
            {feedback.is_correct ? (
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 mr-2" />
            )}
            <h4 className={`font-medium ${
              feedback.is_correct ? 'text-green-700' : 'text-red-700'
            }`}>
              {feedback.is_correct ? 'Correto!' : 'Incorreto'}
            </h4>
          </div>
          {feedback.explanation && <p className="mt-2 text-gray-700">{feedback.explanation}</p>}
        </>
      )}

      <button
        onClick={onNextExercise}
        className="mt-4 flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
      >
        <span>{hasMoreExercises ? 'Próxima Questão' : 'Concluir'}</span>
        <ArrowRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );
};

// --- Main Exercise Component ---

const Exercise = ({ selectedLesson }) => {
  const [lesson, setLesson] = useState(selectedLesson);
  const [loading, setLoading] = useState(!selectedLesson);
  const [error, setError] = useState(null);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState(0);

  const { lessonId } = useParams();

  // Effect to fetch lesson and exercises
  useEffect(() => {
    if (selectedLesson) {
      setLesson(selectedLesson);
      setAvailableExercises(shuffleArray(selectedLesson.exercises || []));
      setLoading(false);
      return;
    }

    setLoading(true);
    axios.get(`${API_BASE_URL}/exercises/lesson/${lessonId}`)
      .then(res => {
        setLesson(res.data);
        setAvailableExercises(shuffleArray(res.data.exercises || []));
        setError(null);
      })
      .catch(err => {
        console.error("Failed to fetch lesson data:", err);
        setError('Erro ao carregar a aula. Por favor, tente novamente.');
      })
      .finally(() => setLoading(false));
  }, [lessonId, selectedLesson]);

  // Refined memoized function to load the next exercise
  const loadNextExercise = useCallback(() => {
    setFeedback(null); // Clear previous feedback
    setUserAnswer(''); // Clear user's previous answer

    // Use functional update for availableExercises to ensure we're working with the latest state
    setAvailableExercises(prevAvailableExercises => {
      // Get the next exercise from the beginning of the previous array
      const nextExerciseToSet = prevAvailableExercises[0] || null;
      // Get the rest of the array (excluding the first item)
      const restOfExercises = prevAvailableExercises.slice(1);

      // Set the selected exercise BEFORE updating availableExercises
      // This is the key: we want the UI to show the *next* exercise as soon as possible,
      // and then update the 'available' list.
      setSelectedExercise(nextExerciseToSet);

      // Calculate and set progress
      const total = lesson?.exercises?.length || 0;
      const completed = total - restOfExercises.length;
      setProgress(total > 0 ? Math.floor((completed / total) * 100) : 0);

      // Return the new list of available exercises
      return restOfExercises;
    });
  }, [lesson]); // Depend only on lesson, as availableExercises is updated functionally

  // Effect to automatically load the first exercise when available
  useEffect(() => {
    // Only load if there are available exercises AND no exercise is currently selected.
    // This prevents re-loading the same exercise if availableExercises updates for other reasons.
    if (availableExercises.length > 0 && selectedExercise === null) {
      loadNextExercise();
    }
  }, [availableExercises, selectedExercise, loadNextExercise]);

  // Memoized function to handle answer submission
  const handleSubmit = useCallback(async () => {
    if (!selectedExercise || userAnswer.trim() === '') return; // Prevent submission if no exercise or empty answer

    try {
      setFeedback({ isLoading: true });
      const res = await axios.post(
        `${API_BASE_URL}/exercises/${selectedExercise.exercise_id}/submit`,
        { userAnswer }
      );
      setFeedback(res.data);
    } catch (err) {
      console.error("Failed to submit answer:", err);
      setFeedback({ error: err.response?.data?.message || 'Falha ao enviar a resposta. Tente novamente.' });
    }
  }, [selectedExercise, userAnswer]);

  // --- Render Logic based on states ---
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!lesson) return <NoLessonState />;
  
  // Logic for completion state:
  // Show completion if lesson has exercises, but selectedExercise is null
  // (meaning all exercises have been processed/completed)
  if (!selectedExercise && lesson.exercises?.length > 0) {
    return <CompletionState totalExercises={lesson.exercises.length} />;
  }
  // If lesson loaded but has no exercises from the start
  if (!selectedExercise && lesson.exercises?.length === 0) {
    return <NoLessonState />; 
  }
  
  // Fallback in case selectedExercise somehow becomes null when it shouldn't
  if (!selectedExercise) { 
      return <ErrorState message="Nenhum exercício para exibir. (Estado inesperado)" />;
  }


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl mx-auto text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="border-b dark:border-gray-700 pb-4 mb-4">
        <h2 className="text-2xl font-bold">{lesson.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{lesson.description}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progresso: </span>
          {/* Corrected progress text to reflect current question */}
          <span>Questão { (lesson.exercises.length - availableExercises.length) || 0} de {lesson.exercises.length}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 shadow-sm">
        <div className="flex items-start">
          <div className="flex-grow">
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
              {selectedExercise.type === 'multiple_choice' ? 'Escolha a resposta correta:' : 'Responda à pergunta:'}
            </span>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{selectedExercise.prompt}</h3>
          </div>
          {selectedExercise.difficulty && (
            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
              selectedExercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              selectedExercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {selectedExercise.difficulty.charAt(0).toUpperCase() + selectedExercise.difficulty.slice(1)}
            </span>
          )}
        </div>
      </div>

      {/* Answer options */}
      <div className="mb-6">
        {selectedExercise.type === 'multiple_choice' && selectedExercise.options ? (
          <div className="space-y-2">
            {selectedExercise.options.map((opt, i) => (
              <label
                key={i}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  userAnswer === opt
                    ? 'bg-blue-50 border-blue-300 dark:bg-blue-900 dark:border-blue-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="mc"
                  value={opt}
                  checked={userAnswer === opt}
                  onChange={() => setUserAnswer(opt)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-3 text-gray-800 dark:text-gray-200">{opt}</span>
              </label>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            placeholder="Digite sua resposta"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!userAnswer || feedback?.isLoading || !!feedback?.error}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
          !userAnswer || feedback?.isLoading || !!feedback?.error
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
        }`}
      >
        {feedback?.isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>Avaliando...</span>
          </div>
        ) : 'Enviar Resposta'}
      </button>

      {/* Feedback Section */}
      <FeedbackDisplay
        feedback={feedback}
        onNextExercise={loadNextExercise}
        hasMoreExercises={availableExercises.length > 0}
      />
    </div>
  );
};

export default Exercise;