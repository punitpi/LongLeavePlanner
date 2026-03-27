'use client'

import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary'
  children: React.ReactNode
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const base = 'font-label font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'

  const variants = {
    primary: 'px-8 py-3 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-50',
    secondary: 'px-6 py-3 rounded-xl border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container',
    tertiary: 'text-secondary font-bold hover:underline',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
