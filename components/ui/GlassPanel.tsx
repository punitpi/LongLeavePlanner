interface GlassPanelProps {
  children: React.ReactNode
  className?: string
}

export function GlassPanel({ children, className = '' }: GlassPanelProps) {
  return (
    <div
      className={`glass-effect bg-surface-container-highest/80 rounded-lg backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  )
}
