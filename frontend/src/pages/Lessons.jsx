import { useState } from 'react';
import LessonCard from '../components/lessons/LessonCard';
import HeaderSection from '../components/lessons/HeaderSection';

const Lessons = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  // Mock data - replace with actual data from your backend
  const lessons = [
    {
      id: 1,
      title: 'Introduction to Korean',
      description: 'Learn the basics of Korean language and writing system',
      progress: 100,
      status: 'completed',
      icon: '🎯',
    },
    {
      id: 2,
      title: 'Basic Greetings',
      description: 'Master essential Korean greetings and introductions',
      progress: 60,
      status: 'in_progress',
      icon: '👋',
    },
    {
      id: 3,
      title: 'Numbers and Counting',
      description: 'Learn Korean numbers and counting systems',
      progress: 0,
      status: 'not_started',
      icon: '🔢',
    },
    // Add more lessons as needed
  ];

  const filters = [
    { id: 'all', label: 'All Lessons' },
    { id: 'not_started', label: 'Not Started' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];

  const filteredLessons = lessons.filter(lesson => {
    if (activeFilter === 'all') return true;
    return lesson.status === activeFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header Section with Progress */}
      <HeaderSection />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              activeFilter === filter.id
                ? 'bg-primary-main text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Lesson Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map(lesson => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  );
};

export default Lessons; 