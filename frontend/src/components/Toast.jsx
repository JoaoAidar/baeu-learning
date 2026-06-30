import React, { createContext, useCallback, useContext, useState } from 'react';

const ToastCtx = createContext({ push: () => {} });

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, kind = 'info', ttl = 4000) => {
    const id = nextId++;
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed inset-x-3 bottom-3 z-50 flex flex-col gap-2 sm:inset-x-auto sm:bottom-auto sm:top-4 sm:right-4 sm:max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-card animate-fade-in text-sm font-medium border ${
              t.kind === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : t.kind === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-white text-gray-800 border-gray-200'
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
