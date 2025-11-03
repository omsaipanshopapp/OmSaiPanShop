
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XIcon } from './icons/Icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    bg: 'bg-green-50 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-400',
  },
  error: {
    icon: <XCircleIcon className="w-6 h-6 text-red-500" />,
    bg: 'bg-red-50 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-400',
  },
  info: {
    icon: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
    bg: 'bg-blue-50 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-400',
  },
};

export default function Toast({ message, type, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const config = toastConfig[type];

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, 2700);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center p-4 w-full max-w-xs rounded-lg shadow-lg border ${config.bg} ${config.border} ${config.text} transition-transform duration-300 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      role="alert"
    >
      {config.icon}
      <div className="ml-3 text-sm font-medium">{message}</div>
      <button
        type="button"
        className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8 ${config.text} hover:bg-gray-200 dark:hover:bg-gray-700`}
        onClick={onClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
