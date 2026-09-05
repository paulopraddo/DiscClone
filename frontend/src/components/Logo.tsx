import { useId } from 'react'

interface LogoProps {
  size?: number
  className?: string
}

/** Marca da aplicação: um "#" em gradiente, ecoando os canais (#geral, #random...). */
function Logo({ size = 24, className }: LogoProps) {
  const gradientId = useId()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="DiscClone"
    >
      <defs>
        <linearGradient id={gradientId} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8f9bff" />
          <stop offset="1" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <rect x="12" y="22" width="40" height="7" rx="3.5" fill={`url(#${gradientId})`} />
      <rect x="12" y="35" width="40" height="7" rx="3.5" fill={`url(#${gradientId})`} />
      <rect x="22" y="12" width="7" height="40" rx="3.5" fill={`url(#${gradientId})`} />
      <rect x="35" y="12" width="7" height="40" rx="3.5" fill={`url(#${gradientId})`} />
    </svg>
  )
}

export default Logo
