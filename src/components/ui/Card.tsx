import { cn } from '@/lib/utils'

type CardVariant = 'base' | 'elevated' | 'info' | 'success' | 'warning'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  base:     { backgroundColor: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  elevated: { backgroundColor: '#FFFFFF', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
  info:     { backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' },
  success:  { backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' },
  warning:  { backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' },
}

export function Card({ variant = 'base', className, style, children, ...props }: CardProps) {
  return (
    <div className={cn('rounded-2xl p-5', className)} style={{ ...variantStyles[variant], ...style }} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4', className)} {...props}>{children}</div>
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold', className)} style={{ color: '#1A1A1A' }} {...props}>{children}</h3>
}
