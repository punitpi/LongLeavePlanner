'use client'

interface ToggleOption {
  value: string
  label: string
}

interface ToggleProps {
  options: ToggleOption[]
  value: string
  onChange: (value: string) => void
}

export function Toggle({ options, value, onChange }: ToggleProps) {
  return (
    <div className="bg-surface-container-highest rounded-full p-1 flex gap-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-full text-sm font-label font-semibold transition-all ${
            value === option.value
              ? 'bg-primary text-white'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
