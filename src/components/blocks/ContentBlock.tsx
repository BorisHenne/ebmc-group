// ContentBlock.tsx
export function ContentBlock({ content, layout = 'full' }: any) {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`prose prose-gray dark:prose-invert max-w-none ${
          layout === 'centered' ? 'max-w-3xl mx-auto' : ''
        }`}>
          {content && (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>
      </div>
    </section>
  )
}
