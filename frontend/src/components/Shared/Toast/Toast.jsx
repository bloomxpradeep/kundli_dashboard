import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[9999]">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let toastClass = 'border-l-emerald-600';
        let iconClass = 'text-emerald-600';
        
        if (toast.type === 'error') {
          Icon = XCircle;
          toastClass = 'border-l-red-600';
          iconClass = 'text-red-600';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          toastClass = 'border-l-amber-500';
          iconClass = 'text-amber-500';
        }

        return (
          <div 
            key={toast.id} 
            className={`flex items-center gap-3 px-5 py-4 bg-bg-card border border-border-subtle border-l-4 ${toastClass} rounded-lg shadow-premium animate-toast text-[#111111] font-medium text-sm min-w-[320px] max-w-[450px]`}
          >
            <Icon size={18} className={`flex-shrink-0 ${iconClass}`} />
            <div className="flex-grow pr-2">{toast.message}</div>
            <button 
              onClick={() => removeToast(toast.id)} 
              className="text-neutral-400 hover:text-neutral-600 focus:outline-none cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
