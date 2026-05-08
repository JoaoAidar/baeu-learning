import React, { useState } from 'react';
import AlertMessage from './AlertMessage';

export const FormField = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  success,
  helpText,
  className = '',
  inputClassName = '',
  validation,
  autoComplete,
  ...props
}) => {
  const [internalError, setInternalError] = useState('');
  const [touched, setTouched] = useState(false);

  const validateField = (fieldValue) => {
    if (!validation) return '';
    
    if (Array.isArray(validation)) {
      for (const rule of validation) {
        const result = rule(fieldValue);
        if (result) return result;
      }
    } else {
      return validation(fieldValue);
    }
    
    return '';
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    if (onChange) {
      onChange(e);
    }
    
    // Validação em tempo real
    if (touched) {
      const validationError = validateField(newValue);
      setInternalError(validationError);
    }
  };

  const handleBlur = (e) => {
    setTouched(true);
    
    if (onBlur) {
      onBlur(e);
    }
    
    // Validar quando o campo perde o foco
    const validationError = validateField(e.target.value);
    setInternalError(validationError);
  };

  const displayError = error || internalError;
  const hasError = !!displayError;
  const hasSuccess = success && !hasError;

  const inputId = id || name;
  
  const inputClasses = [
    'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition-colors',
    hasError 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : hasSuccess
        ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
    inputClassName
  ].join(' ');

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={inputClasses}
          {...props}
        />
        
        {/* Ícone de sucesso */}
        {hasSuccess && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Ícone de erro */}
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Mensagem de erro */}
      {hasError && (
        <p className="text-sm text-red-600">{displayError}</p>
      )}
      
      {/* Mensagem de sucesso */}
      {hasSuccess && typeof success === 'string' && (
        <p className="text-sm text-green-600">{success}</p>
      )}
      
      {/* Texto de ajuda */}
      {helpText && !hasError && !hasSuccess && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};
