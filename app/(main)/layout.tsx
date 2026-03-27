import { Header } from '@/components/ui/Header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-20">
        {children}
      </main>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-surface/90 backdrop-blur-2xl rounded-t-lg shadow-[0_-10px_30px_rgba(86,67,56,0.05)]">
        <a href="/" className="flex flex-col items-center gap-1 text-on-surface-variant/60 p-3">
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="font-label text-[10px] uppercase tracking-wider">Planner</span>
        </a>
        <a href="/results" className="flex flex-col items-center gap-1 text-on-surface-variant/60 p-3">
          <span className="material-symbols-outlined">auto_awesome</span>
          <span className="font-label text-[10px] uppercase tracking-wider">Results</span>
        </a>
      </nav>
    </>
  )
}
