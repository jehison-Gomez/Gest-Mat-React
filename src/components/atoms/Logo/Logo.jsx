import gestmatLogo from '@/assets/gestmat_logo_transparente.png'

export const Logo = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-20',
  }

  return (
    <img
      src={gestmatLogo}
      alt="Gest-Mat Logo"
      className={`${sizes[size]} object-contain`}
    />
  )
}
