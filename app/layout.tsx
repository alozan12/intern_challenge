import type { Metadata } from 'next'
import { ClientLayout } from '@/components/ClientLayout'
import './globals.css'

export const metadata: Metadata = {
  title: 'ASU Study Coach',
  description: 'AI-powered study assistant for ASU students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}