interface CardProps {
  elevation?: 'low' | 'lowest' | 'high'
  children: React.ReactNode
  className?: string
}

export function Card({ elevation = 'lowest', children, className = '' }: CardProps) {
  const elevationClasses = {
    low: 'bg-surface-container-low',
    lowest: 'bg-surface-container-lowest',
    high: 'bg-surface-container-high',
  }

  return (
    <div
      className={`rounded-lg shadow-[0_20px_40px_rgba(86,67,56,0.08)] ${elevationClasses[elevation]} ${className}`}
    >
      {children}
    </div>
  )
}
