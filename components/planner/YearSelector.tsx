'use client'

interface YearSelectorProps {
  value: number
  onChange: (year: number) => void
}

export function YearSelector({ value, onChange }: YearSelectorProps) {
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear + 1]

  return (
    <div className="relative">
      <label className="block font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
        Year
      </label>
      <div className="flex gap-2">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => onChange(year)}
            className={`flex-1 py-3 rounded-lg font-headline font-bold text-lg transition-all ${
              value === year
                ? 'bg-primary text-white shadow-[0_4px_12px_rgba(155,69,0,0.3)]'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  )
}
