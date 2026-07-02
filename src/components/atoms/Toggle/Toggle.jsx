export const Toggle = ({ label, descripcion, checked, onChange }) => {
  return (
    <div className="flex items-start gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39A900]/40 focus-visible:ring-offset-2 ${
          checked ? 'bg-[#39A900]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <div className="pt-0.5">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {descripcion && (
          <p className="text-xs text-gray-400 mt-0.5">{descripcion}</p>
        )}
      </div>
    </div>
  )
}
