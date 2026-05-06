import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | PPDS FK UNAND',
    default:  'Pendaftaran PPDS – Fakultas Kedokteran Universitas Andalas',
  },
  description:
    'Portal resmi pendaftaran Program Pendidikan Dokter Spesialis (PPDS) Fakultas Kedokteran Universitas Andalas.',
  keywords: ['PPDS', 'FK UNAND', 'Universitas Andalas', 'dokter spesialis', 'pendaftaran'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={plusJakarta.variable}>
      <body className="bg-slate-50 text-slate-800 antialiased">
        {children}
        <Toaster
          position="top-right"
          richColors
          expand
          toastOptions={{
            style: {
              fontFamily: 'var(--font-plus-jakarta)',
              borderRadius: '12px',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
