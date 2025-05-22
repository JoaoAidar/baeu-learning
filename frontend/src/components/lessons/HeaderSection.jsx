import React from 'react';

function HeaderSection() {
    // These would typically come from props or a state management solution
    const progressStats = {
        total: 3,
        completed: 1,
        inProgress: 1
    };

    return (
        <section className="mb-12">
            {/* Header */}
            <h1 className="text-4xl font-extrabold text-white mb-4">
                Korean Lessons
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
                Master Korean with our comprehensive lessons. Track your progress and continue your learning journey.
            </p>

            {/* Progress Summary */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Total Lessons */}
                    <div>
                        <span className="text-gray-400 text-sm uppercase tracking-wider">
                            Total Lessons
                        </span>
                        <p className="text-white text-3xl font-bold mt-1">
                            {progressStats.total}
                        </p>
                    </div>

                    {/* Completed Lessons */}
                    <div>
                        <span className="text-gray-400 text-sm uppercase tracking-wider">
                            Completed
                        </span>
                        <p className="text-white text-3xl font-bold mt-1">
                            {progressStats.completed}
                        </p>
                    </div>

                    {/* In Progress */}
                    <div>
                        <span className="text-gray-400 text-sm uppercase tracking-wider">
                            In Progress
                        </span>
                        <p className="text-white text-3xl font-bold mt-1">
                            {progressStats.inProgress}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeaderSection; 