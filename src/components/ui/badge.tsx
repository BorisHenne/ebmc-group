import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        turquoise:
          'border-[#2DB5B5]/20 bg-[#2DB5B5]/10 text-[#2DB5B5]',
        success:
          'border-green-500/20 bg-green-500/10 text-green-600',
        warning:
          'border-amber-500/20 bg-amber-500/10 text-amber-600',
        error:
          'border-red-500/20 bg-red-500/10 text-red-600',
        sap:
          'border-blue-500/20 bg-blue-500/10 text-blue-500',
        ict:
          'border-purple-500/20 bg-purple-500/10 text-purple-500',
        cybersecurity:
          'border-red-500/20 bg-red-500/10 text-red-500',
        ai:
          'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
