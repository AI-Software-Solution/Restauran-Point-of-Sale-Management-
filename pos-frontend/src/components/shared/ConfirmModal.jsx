import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Tasdiqlash",
  message = "Bu amalni bajarishni xohlaysizmi?",
  confirmText = "Tasdiqlash",
  cancelText = "Bekor qilish",
  type = "danger", // danger, warning, info
  isLoading = false
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      icon: 'text-yellow-500',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    },
    info: {
      icon: 'text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600'
    }
  };

  const styles = typeStyles[type] || typeStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-700">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <FiX size={20} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className={`mb-4 p-3 rounded-full bg-gray-800 ${styles.icon}`}>
            <FiAlertTriangle size={32} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-white mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-400 mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-700 text-white font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-colors disabled:opacity-50 ${styles.button}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Yuklanmoqda...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
