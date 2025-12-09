import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Artisan Connect - Find Local Artisans in Nigeria',
  description: 'Connect with skilled artisans across Nigeria. Find pottery, textiles, woodwork, metalwork, jewelry and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  )
}