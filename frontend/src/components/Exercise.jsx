import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

function shuffleArray(arr) {
  // Fisher–Yates shuffle
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:3000/api/exercises/lesson/${lessonId}`)
      .then(res => {
        setLesson(res.data);
        // shuffle exercises into our queue
        setAvailableExercises(shuffleArray(res.data.exercises || []));
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError('Error fetching lesson');
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  // Grab next exercise from the front of the queue
  const loadNextExercise = () => {
    setFeedback(null);
    setUserAnswer('');
    setSelectedExercise(prev => {
      const [next, ...rest] = availableExercises;
      setAvailableExercises(rest);
      
      // Update progress
      const total = lesson.exercises?.length || 0;
      const completed = total - rest.length;
      setProgress(Math.floor((completed / total) * 100));
      
      return next || null;
    });
  };

  // If exercises just loaded, pick the first one automatically
  useEffect(() => {
    if (availableExercises.length > 0 && selectedExercise === null) {
      loadNextExercise();
    }
  }, [availableExercises, selectedExercise]);

  const handleSubmit = async () => {
    try {
      setFeedback({ isLoading: true });
      const res = await axios.post(
        `http://localhost:3000/api/exercises/${selectedExercise.exercise_id}/submit`,
        { userAnswer }
      );
      setFeedback(res.data);
    } catch {
      setFeedback({ error: 'Failed to submit answer.' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-700">Carregando...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h3 className="ml-2 text-red-700 font-medium">{error}</h3>
        </div>
      </div>
    );
  }
  
  if (!lesson) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-yellow-500" />
          <h3 className="ml-2 text-yellow-700 font-medium">No lesson available</h3>
        </div>
      </div>
    );
  }
  
  if (!selectedExercise) {
    return (
      <div className="bg-green-50 p-8 rounded-lg border border-green-200 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold text-green-700 mt-4">Parabéns!</h2>
        <p className="text-lg text-green-600 mt-2">
          Você completou todas as {lesson.exercises?.length} questões!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{lesson.title}</h2>
        <p className="text-gray-600 mt-1">{lesson.description}</p>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progresso: </span>
          <span>Questão {lesson.exercises.length - availableExercises.length} de {lesson.exercises.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-900">{selectedExercise.question}</h3>
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
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="mc"
                  value={opt}
                  checked={userAnswer === opt}
                  onChange={() => setUserAnswer(opt)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3">{opt}</span>
              </label>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            placeholder="Digite sua resposta"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!userAnswer || feedback?.isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
          !userAnswer || feedback?.isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {feedback?.isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>Avaliando...</span>
          </div>
        ) : 'Enviar Resposta'}
      </button>

      {/* Feedback */}
      {feedback && !feedback.isLoading && (
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
              <p className="mt-2 text-gray-700">{feedback.explanation}</p>
            </>
          )}
          
          {/* Next button */}
          <button
            onClick={loadNextExercise}
            className="mt-4 flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            <span>{availableExercises.length > 0 ? 'Próxima Questão' : 'Concluir'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Exercise;