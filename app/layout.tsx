import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google'
import { Header } from '@/components/ui/Header'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  variable: '--font-be-vietnam-pro',
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Long Leave Planner',
  description: 'Find extended leave opportunities by strategically placing a few days off around public holidays.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${beVietnamPro.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-background text-on-surface font-body antialiased">
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
