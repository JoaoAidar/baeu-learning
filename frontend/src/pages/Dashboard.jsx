import { Link } from 'react-router-dom';
import { ArrowRightIcon, ChartBarIcon, ClockIcon, TrophyIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  // Mock data - replace with actual data from your backend
  const stats = {
    totalLessons: 12,
    completedLessons: 4,
    inProgressLessons: 2,
    streak: 5,
  };

  const recentLessons = [
    {
      id: 1,
      title: 'Basic Greetings',
      progress: 60,
      lastAccessed: '2 hours ago',
    },
    {
      id: 2,
      title: 'Numbers and Counting',
      progress: 0,
      lastAccessed: 'Not started',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Welcome back!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Continue your Korean learning journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-1.5 rounded-full bg-primary-light dark:bg-primary-dark">
              <ChartBarIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Lessons</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900">
              <TrophyIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completedLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900">
              <ClockIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.inProgressLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <TrophyIcon className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Day Streak</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.streak}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Lessons */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Lessons</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentLessons.map((lesson) => (
            <div key={lesson.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">{lesson.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Last accessed: {lesson.lastAccessed}
                  </p>
                </div>
                <Link
                  to={`/lessons/${lesson.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-main bg-primary-light/10 hover:bg-primary-light/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main"
                >
                  Continue
                  <ArrowRightIcon className="ml-1.5 h-3 w-3" />
                </Link>
              </div>
              <div className="mt-4">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                    <div
                      style={{ width: `${lesson.progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-main"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 