import type { Metadata } from 'next'
import { RootLayout } from '@payloadcms/next/layouts'
import config from '@payload-config'
import React from 'react'
import './custom.scss'

export const metadata: Metadata = {
  title: 'EBMC Admin',
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config}>
      {children}
    </RootLayout>
  )
}