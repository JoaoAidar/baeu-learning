import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../shared/Button';

export default function Result() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');  // Go back to the lesson list page
  };

  return (
    <div>
      <h2>Result</h2>
      <p>You completed the exercise. Congratulations!</p>
      <Button onClick={handleGoBack} variant="primary">Go Back to Lessons</Button>
    </div>
  );
}
