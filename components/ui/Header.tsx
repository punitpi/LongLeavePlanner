import Link from 'next/link'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 max-w-7xl mx-auto px-6 py-4 flex justify-between items-center bg-surface/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(86,67,56,0.08)]">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-primary font-headline"
        >
          Long Leave Planner
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-on-surface-variant hover:bg-surface-container transition-colors px-3 py-1 rounded-full font-label text-sm uppercase tracking-wide"
          >
            Planner
          </Link>
          <Link
            href="/results"
            className="text-on-surface-variant hover:bg-surface-container transition-colors px-3 py-1 rounded-full font-label text-sm uppercase tracking-wide"
          >
            Results
          </Link>
        </nav>
      </div>
    </header>
  )
}
