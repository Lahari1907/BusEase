import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const typeStyles = {
    success: 'bg-emerald-600 text-white shadow-lg',
    error: 'bg-red-600 text-white shadow-lg',
    warning: 'bg-amber-500 text-slate-900 font-semibold shadow-lg',
    info: 'bg-blue-600 text-white shadow-lg',
  };

  const icons = {
    success: '🎉',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium ${typeStyles[type] || typeStyles.info}`}>
        <span className="text-base">{icons[type] || icons.info}</span>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-75 transition-opacity text-xs p-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
