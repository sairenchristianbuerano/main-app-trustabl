import { User } from 'lucide-react'
import Image from 'next/image'

interface AvatarProps {
  type?: 'icon' | 'initials' | 'photo'
  size?: 'sm' | 'md'
  initials?: string
  src?: string
  alt?: string
}

const sizeStyles = {
  sm: 'w-6 h-6 text-[9px]',
  md: 'w-8 h-8 text-xs',
}

const iconSize = { sm: 14, md: 18 }

export function Avatar({ type = 'icon', size = 'md', initials, src, alt }: AvatarProps) {
  const base = 'rounded-full bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center overflow-hidden flex-shrink-0'

  if (type === 'photo' && src) {
    return (
      <div className={[base, sizeStyles[size], 'relative'].join(' ')}>
        <Image
          src={src}
          alt={alt ?? ''}
          fill
          sizes={size === 'sm' ? '24px' : '32px'}
          className="object-cover rounded-full"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
    )
  }

  if (type === 'initials' && initials) {
    return (
      <div className={[base, sizeStyles[size], 'font-semibold text-[var(--color-text-primary)]'].join(' ')}>
        {initials.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div className={[base, sizeStyles[size]].join(' ')}>
      <User size={iconSize[size]} className="text-[var(--color-text-tertiary)]" />
    </div>
  )
}
