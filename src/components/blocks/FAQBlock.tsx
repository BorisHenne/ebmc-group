'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function FAQBlock({ title, description, questions }: any) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        {(title || description) && (
          <div className="text-center mb-16">
            {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}

        <div className="space-y-4">
          {questions?.map((q: any, i: number) => (
            <div key={i} className="border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full p-6 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium pr-4">{q.question}</span>
                <ChevronDown className={`h-5 w-5 flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground">
                      {typeof q.answer === 'string' ? (
                        <p>{q.answer}</p>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: q.answer }} />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
