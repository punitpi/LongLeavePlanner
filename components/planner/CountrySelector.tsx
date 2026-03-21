'use client'

import { useState, useEffect, useRef } from 'react'
import type { Country } from '@/lib/types'
import { GlassPanel } from '@/components/ui/GlassPanel'

function countryCodeToFlag(code: string): string {
  return code.toUpperCase().split('').map(
    (c) => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('')
}

interface CountrySelectorProps {
  value: Country | null
  onChange: (country: Country | null) => void
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/countries')
      .then((r) => r.json())
      .then((data) => {
        setCountries(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={containerRef} className="relative">
      <label className="block font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
        Country
      </label>

      {loading ? (
        <div className="h-12 rounded-lg bg-surface-container-low animate-pulse" />
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors text-left"
        >
          <span className="flex items-center gap-3 font-body">
            {value ? (
              <>
                <span className="text-2xl">{countryCodeToFlag(value.countryCode)}</span>
                <span className="text-on-surface font-medium">{value.name}</span>
              </>
            ) : (
              <span className="text-on-surface-variant">Select a country…</span>
            )}
          </span>
          <span className="material-symbols-outlined text-on-surface-variant text-sm">
            {open ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      )}

      {open && (
        <GlassPanel className="absolute top-full left-0 right-0 mt-2 z-50 max-h-72 overflow-hidden flex flex-col shadow-[0_20px_40px_rgba(86,67,56,0.15)]">
          <div className="p-3 border-b border-outline-variant/10">
            <input
              autoFocus
              type="text"
              placeholder="Search countries…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none font-body text-sm text-on-surface placeholder-on-surface-variant/50"
            />
          </div>
          <div className="overflow-y-auto flex-1 scrollbar-hide">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-on-surface-variant font-body">No countries found</p>
            ) : (
              filtered.map((country) => (
                <button
                  key={country.countryCode}
                  onClick={() => {
                    onChange(country)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-container-low ${
                    value?.countryCode === country.countryCode ? 'bg-primary/5' : ''
                  }`}
                >
                  <span className="text-xl">{countryCodeToFlag(country.countryCode)}</span>
                  <span className="font-body text-sm text-on-surface">{country.name}</span>
                </button>
              ))
            )}
          </div>
        </GlassPanel>
      )}
    </div>
  )
}
