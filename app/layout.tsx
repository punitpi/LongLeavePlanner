import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google'
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
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
