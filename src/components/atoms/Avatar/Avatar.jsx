export const Avatar = ({ nombre = '', size = 'md' }) => {
  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-green-700 text-white flex items-center justify-center font-semibold flex-shrink-0`}>
      {iniciales || '?'}
    </div>
  )
}
