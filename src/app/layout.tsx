import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ebmc-group.com'),
  title: {
    default: "EBMC GROUP | L'union européenne de l'expertise digitale",
    template: '%s | EBMC GROUP',
  },
  description:
    "Votre ESN de référence en Europe. Experts SAP, ICT, Cybersécurité et IA. Plus de 210 consultants, 19 ans d'expérience, SAP Silver Partner.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
