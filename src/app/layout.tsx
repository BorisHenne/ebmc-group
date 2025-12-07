import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EBMC GROUP - Conseil & Expertise IT',
  description: 'EBMC GROUP - Votre partenaire en transformation digitale, SAP, Cybersécurité et Intelligence Artificielle',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
