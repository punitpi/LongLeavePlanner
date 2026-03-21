'use client'

import type { PreviewItem } from '@/lib/types'

interface HolidayPreviewProps {
  holidays: PreviewItem[]
  onRemove: (date: string) => void
}

export function HolidayPreview({ holidays, onRemove }: HolidayPreviewProps) {
  if (holidays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-4">event</span>
        <p className="font-body text-sm text-on-surface-variant/60">
          No holidays selected yet.
          <br />
          Choose a country or pick dates manually.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide pr-1">
      {holidays.map((item) => (
        <div
          key={item.date}
          className="flex items-center justify-between px-4 py-3 bg-surface-container-low rounded-lg group"
        >
          <div>
            <span className="font-headline font-bold text-on-surface text-sm">{item.date}</span>
            {item.label && (
              <span className="ml-2 font-body text-xs text-on-surface-variant">{item.label}</span>
            )}
          </div>
          <button
            onClick={() => onRemove(item.date)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-surface-container"
            aria-label={`Remove ${item.date}`}
          >
            <span className="material-symbols-outlined text-sm text-on-surface-variant">close</span>
          </button>
        </div>
      ))}
    </div>
  )
}
