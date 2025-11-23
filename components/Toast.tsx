import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] animate-in fade-in zoom-in duration-300 pointer-events-none">
      <div className="bg-slate-900/95 border border-red-500/50 text-red-100 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 min-w-[200px] justify-center">
        <span className="text-xl">⚠️</span>
        <span className="font-serif tracking-wide">{message}</span>
      </div>
    </div>
  );
};

export default Toast;