// src/components/Button.tsx
import React from 'react';
import { cn } from '../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export const Button = ({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-sunstone text-white hover:bg-sunstone-dark shadow-lg shadow-sunstone/20',
    secondary: 'bg-lava text-alabaster border border-white/10 hover:bg-lava-light',
    ghost: 'bg-transparent text-grey-mist hover:text-alabaster hover:bg-white/5',
    danger: 'bg-ember text-white hover:bg-ember/80 shadow-lg shadow-ember/20',
    outline: 'bg-transparent border border-sunstone text-sunstone hover:bg-sunstone/10',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg font-semibold',
    icon: 'p-2',
  };
  return (
    <button 
      className={cn('rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium', variants[variant], sizes[size], className)} 
      {...props} 
    />
  );
};
