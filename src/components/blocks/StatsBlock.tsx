// StatsBlock
export function StatsBlock({ stats }: any) {
  return (
    <section className="py-16 bg-[#2DB5B5]/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats?.map((stat: any, i: number) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold text-gradient">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
              {stat.description && <div className="text-sm text-muted-foreground/70">{stat.description}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
