'use client'

import type { Session } from '@/lib/types'

interface SessionSwitcherProps {
  sessions: Session[]
  activeSessionId: string
  onSwitch: (session: Session) => void
  onDelete: (id: string) => void
}

export function SessionSwitcher({ sessions, activeSessionId, onSwitch, onDelete }: SessionSwitcherProps) {
  if (sessions.length <= 1) return null  // Don't show if only one session

  return (
    <div className="mb-8">
      <p className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
        Saved Plans
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {sessions.map(session => {
          const isActive = session.id === activeSessionId
          return (
            <div
              key={session.id}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container cursor-pointer'
              }`}
            >
              <button
                onClick={() => onSwitch(session)}
                className="font-label text-sm font-semibold"
              >
                {session.label}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(session.id)
                }}
                className={`rounded-full p-0.5 transition-colors ${
                  isActive ? 'hover:bg-white/20' : 'hover:bg-surface-container-high'
                }`}
                aria-label={`Delete ${session.label}`}
              >
                <span className="material-symbols-outlined text-sm leading-none">close</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
