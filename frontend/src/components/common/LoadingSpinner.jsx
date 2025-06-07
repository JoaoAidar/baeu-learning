import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ message = 'Loading...', size = 24 }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className="animate-spin rounded-full border-4 border-gray-200 border-t-primary-main"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
        role="progressbar"
        aria-label="Loading"
      />
      {message && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.number,
};

export default LoadingSpinner;
