/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'
import { getPayloadClient } from '@/getPayloadClient'
import { isEditorOrAdmin } from '@/access/roles'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = async ({ params, searchParams }: Args) => {
  // Check user access before rendering admin UI
  const headers = await getHeaders()
  const payload = await getPayloadClient()

  try {
    const { user } = await payload.auth({ headers })

    // Redirect regular users away from admin panel
    if (!isEditorOrAdmin(user as any)) {
      redirect('/')
    }
  } catch {
    // If auth fails, redirect to home
    redirect('/')
  }

  return RootPage({ config, params, searchParams, importMap })
}

export default Page
