import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`civic-toast toast-${type}`} role="alert">
      <div className="toast-content">
        {type === 'success' && <CheckCircle2 size={18} className="toast-icon success" />}
        {type === 'error' && <AlertCircle size={18} className="toast-icon error" />}
        {type === 'info' && <Info size={18} className="toast-icon info" />}
        <span className="toast-message">{message}</span>
      </div>
      <button type="button" className="btn-close-toast" onClick={onClose} aria-label="Close notification">
        <X size={14} />
      </button>
    </div>
  );
}