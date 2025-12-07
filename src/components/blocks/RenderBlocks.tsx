import React from 'react'
import { HeroBlock } from './HeroBlock'
import { ContentBlock } from './ContentBlock'
import { ServicesBlock } from './ServicesBlock'
import { CTABlock } from './CTABlock'
import { FeaturesBlock } from './FeaturesBlock'
import { StatsBlock } from './StatsBlock'
import { TestimonialsBlock } from './TestimonialsBlock'
import { TeamBlock } from './TeamBlock'
import { FAQBlock } from './FAQBlock'
import { ContactFormBlock } from './ContactFormBlock'
import { OffersListBlock } from './OffersListBlock'

const blockComponents: Record<string, React.FC<any>> = {
  hero: HeroBlock,
  content: ContentBlock,
  services: ServicesBlock,
  cta: CTABlock,
  features: FeaturesBlock,
  stats: StatsBlock,
  testimonials: TestimonialsBlock,
  team: TeamBlock,
  faq: FAQBlock,
  contactForm: ContactFormBlock,
  offersList: OffersListBlock,
}

type Block = {
  blockType: string
  id?: string
  [key: string]: any
}

type RenderBlocksProps = {
  blocks: Block[]
}

export function RenderBlocks({ blocks }: RenderBlocksProps) {
  if (!blocks || blocks.length === 0) return null

  return (
    <>
      {blocks.map((block, index) => {
        const Block = blockComponents[block.blockType]

        if (!Block) {
          console.warn(`Unknown block type: ${block.blockType}`)
          return null
        }

        return <Block key={block.id || index} {...block} />
      })}
    </>
  )
}
