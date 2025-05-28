import axios from 'axios';

// Assuming the backend is running locally on port 3000
const api = axios.create({
  baseURL: 'http://localhost:3000/api',  // Update this URL based on your backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Example of user login
export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};
// Example of user registration
export const registerUser = async (username, email, password) => {
  try {
    const response = await api.post('/auth/signup', { username, email, password });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};
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
