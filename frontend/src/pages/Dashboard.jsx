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
    <div className="space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-gray-900 dark:text-white">
          Welcome back!
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Continue your Korean learning journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 lg:p-5">
          <div className="flex items-center">            <div className="p-1.5 sm:p-2 rounded-full bg-red-100 dark:bg-red-900">
              <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Lessons</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 lg:p-5">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-green-100 dark:bg-green-900">
              <TrophyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">{stats.completedLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 lg:p-5">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">{stats.inProgressLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 lg:p-5">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <TrophyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Day Streak</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">{stats.streak}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Lessons */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white">Recent Lessons</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentLessons.map((lesson) => (
            <div key={lesson.id} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">{lesson.title}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Last accessed: {lesson.lastAccessed}
                  </p>
                </div>
                <Link
                  to={`/lessons/${lesson.id}`}
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 w-full sm:w-auto"
                >
                  Continue
                  <ArrowRightIcon className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-1.5 sm:h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                    <div
                      style={{ width: `${lesson.progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-600 transition-all duration-300"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{lesson.progress}%</span>
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