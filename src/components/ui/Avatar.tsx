import { cn, getInitials } from '@/lib/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: AvatarSize
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name)
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name ?? 'User avatar'} className={cn('rounded-full object-cover shrink-0', sizeStyles[size], className)} />
    )
  }
  return (
    <div
      className={cn('rounded-full shrink-0 flex items-center justify-center font-semibold text-white select-none', sizeStyles[size], className)}
      style={{ backgroundColor: '#2C5530' }}
      aria-label={name ?? 'User'}
    >
      {initials}
    </div>
  )
}
