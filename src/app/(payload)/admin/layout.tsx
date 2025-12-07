/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'
import type { ServerFunctionClient } from 'payload'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import config from '@payload-config'
import React from 'react'
import { importMap } from './[[...segments]]/importMap'
import './custom.scss'

export const metadata: Metadata = {
  title: 'EBMC Admin',
}

const serverFunction: ServerFunctionClient = async (args) => {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}