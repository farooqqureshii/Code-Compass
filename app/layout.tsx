import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' })

export const metadata: Metadata = {
  title: 'Code Compass - Find Your First Issue',
  description: 'Help developers find good first issues in GitHub repositories',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.className}`}>{children}</body>
    </html>
  )
} 