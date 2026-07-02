export const Avatar = ({ nombre = '', size = 'md' }) => {
  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const sizes = {
    xs: 'w-7 h-7 text-[11px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  return (
    <div
      className={`${sizes[size] ?? sizes.md} rounded-full bg-[#39A900] text-white flex items-center justify-center font-semibold flex-shrink-0 select-none`}
    >
      {iniciales || '?'}
    </div>
  )
}
