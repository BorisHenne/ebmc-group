import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayloadHMR({ config })
  
  const page = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (!page.docs[0]) return { title: 'Page non trouvée' }

  const doc = page.docs[0]
  return {
    title: doc.meta?.title || doc.title,
    description: doc.meta?.description,
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayloadHMR({ config })

  const page = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (!page.docs[0]) {
    notFound()
  }

  const { layout } = page.docs[0]

  return (
    <>
      {layout && <RenderBlocks blocks={layout} />}
    </>
  )
}
