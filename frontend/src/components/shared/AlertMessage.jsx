import React from 'react';
import PropTypes from 'prop-types';
import { 
  AlertCircle,
  CheckCircle, 
  AlertTriangle,
  Info,
  X
} from 'lucide-react';

const variants = {
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-200',
    icon: AlertCircle,
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-200',
    icon: CheckCircle,
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-200',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-200',
    icon: Info,
  },
};

const AlertMessage = ({ type = 'info', message, onClose }) => {
  const variant = variants[type];
  const IconComponent = variant.icon;

  return (
    <div className={`relative rounded-lg border p-4 shadow-sm ${variant.bg} ${variant.border}`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`h-5 w-5 flex-shrink-0 ${variant.text}`} />
        <div className={`flex-1 ${variant.text}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>        {onClose && (
          <button
            type="button"
            className={`rounded-md p-1.5 transition-all duration-200 hover:bg-white/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/20 ${variant.text}`}
            onClick={onClose}
            aria-label="Dismiss message"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

AlertMessage.propTypes = {
  type: PropTypes.oneOf(['error', 'success', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

export default AlertMessage;
