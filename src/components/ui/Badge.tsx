import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: { backgroundColor: '#F3F4F6', color: '#374151' },
  primary: { backgroundColor: '#E8F5E9', color: '#2C5530' },
  success: { backgroundColor: '#F0FDF4', color: '#166534' },
  warning: { backgroundColor: '#FFFBEB', color: '#92400E' },
  error:   { backgroundColor: '#FEF2F2', color: '#991B1B' },
  info:    { backgroundColor: '#EFF6FF', color: '#1E40AF' },
}

const dotColors: Record<BadgeVariant, string> = {
  default: '#9CA3AF', primary: '#2C5530', success: '#22C55E',
  warning: '#F59E0B', error: '#EF4444',   info: '#3B82F6',
}

export function Badge({ variant = 'default', dot, children, className, style, ...props }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', className)} style={{ ...variantStyles[variant], ...style }} {...props}>
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColors[variant] }} />}
      {children}
    </span>
  )
}
