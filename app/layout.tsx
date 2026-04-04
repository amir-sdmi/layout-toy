import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Paper Trader',
  description: 'Test crypto trading strategies with paper money',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 antialiased">
        <Nav />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
