import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function LessonList({ onSelect }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/api/lessons')
      .then((res) => {
        setLessons(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch lessons');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading lessons...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Select a Lesson:</h2>
      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(lesson)}>
            {lesson.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
