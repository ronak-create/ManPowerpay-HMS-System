import React from 'react';
import { HelpCircle } from 'lucide-react';
import Button from './Button';

export default function EmptyState({ 
  icon: Icon = HelpCircle, 
  title, 
  description, 
  action,
  className = "" 
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 px-6 bg-white rounded-3xl border-2 border-dashed border-zinc-100 text-center animate-fade-in ${className}`}>
      <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 text-amber-500 shadow-inner">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-xs mb-8 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          {action}
        </div>
      )}
    </div>
  );
}
