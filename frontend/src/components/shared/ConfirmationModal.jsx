import React from 'react';
import Button from './Button';
import AlertMessage from './AlertMessage';

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning', // 'warning', 'danger', 'info'
  loading = false,
  error = null,
  children
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  const getTypeColors = () => {
    switch (type) {      case 'danger':
        return {
          icon: '⚠️',
          confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: '⚠️',
          confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
          iconColor: 'text-red-600'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
          iconColor: 'text-blue-600'
        };
      default:
        return {
          icon: '❓',
          confirmButtonClass: 'bg-gray-600 hover:bg-gray-700 text-white',
          iconColor: 'text-gray-600'
        };
    }
  };

  const typeConfig = getTypeColors();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          {/* Conteúdo do Modal */}
          <div className="sm:flex sm:items-start">
            {/* Ícone */}
            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
              type === 'danger' ? 'bg-red-100' : 
              type === 'warning' ? 'bg-yellow-100' : 
              'bg-blue-100'
            }`}>
              <span className={`text-xl ${typeConfig.iconColor}`}>
                {typeConfig.icon}
              </span>
            </div>
            
            {/* Texto */}
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
                {children && (
                  <div className="mt-3">
                    {children}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Erro */}
          {error && (
            <div className="mt-4">
              <AlertMessage type="error" message={error} />
            </div>
          )}
          
          {/* Botões */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <Button
              onClick={handleConfirm}
              loading={loading}
              disabled={loading}
              className={typeConfig.confirmButtonClass}
            >
              {confirmText}
            </Button>
            
            <Button
              onClick={onClose}
              disabled={loading}
              variant="outline"
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
