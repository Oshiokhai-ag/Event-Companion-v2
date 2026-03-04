// src/components/Input.tsx
import React from 'react';
import { cn } from '../types';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className, ...props }: InputProps) => (
  <div className="space-y-1.5">
    {label && <label className="text-xs font-bold uppercase tracking-wider text-grey-mist">{label}</label>}
    <input 
      className={cn('w-full px-4 py-3 bg-lava/50 border border-white/10 rounded-2xl text-alabaster placeholder:text-grey-mist/50 focus:outline-none focus:ring-2 focus:ring-sunstone/20 focus:border-sunstone transition-all', error && 'border-ember focus:ring-ember/20', className)} 
      {...props} 
    />
    {error && <p className="text-xs text-ember">{error}</p>}
  </div>
);
