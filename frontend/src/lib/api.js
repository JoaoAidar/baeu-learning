import axios from 'axios';

// Assuming the backend is running locally on port 3000
const api = axios.create({
  baseURL: 'http://localhost:3000/api',  // Update this URL based on your backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example of fetching lessons
export const getLessons = async () => {
  try {
    const response = await api.get('/lessons');
    return response.data;
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw error;
  }
};

// Example of submitting an exercise answer
export const submitExercise = async (lessonId, answer) => {
  try {
    const response = await api.post(`/submit-exercise`, { lessonId, answer });
    return response.data;
  } catch (error) {
    console.error("Error submitting exercise:", error);
    throw error;
  }
};

export default api;
