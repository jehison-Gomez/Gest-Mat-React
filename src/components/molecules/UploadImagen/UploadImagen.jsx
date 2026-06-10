import { useState, useRef } from 'react'
import { FiUploadCloud, FiX } from 'react-icons/fi'

export const UploadImagen = ({ onChange, error }) => {
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const procesarArchivo = (file) => {
    if (!file) return
    const validos = ['image/png', 'image/jpeg', 'image/webp']
    if (!validos.includes(file.type)) return
    if (file.size > 5 * 1024 * 1024) return

    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange?.(file)
  }

  const handleChange = (e) => procesarArchivo(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    procesarArchivo(e.dataTransfer.files[0])
  }

  const handleRemove = () => {
    setPreview(null)
    onChange?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="w-full space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">
        Imagen del Material <span className="text-gray-400 font-normal">(Opcional)</span>
      </label>

      {preview ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
          <img src={preview} alt="preview" className="w-full h-full object-contain bg-gray-50" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 rounded-full bg-white shadow text-gray-600 hover:text-red-500"
          >
            <FiX size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`w-full h-36 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            dragging
              ? 'border-green-500 bg-green-50'
              : error
              ? 'border-red-400 bg-red-50'
              : 'border-gray-200 bg-gray-50 hover:border-green-400 hover:bg-green-50'
          }`}
        >
          <FiUploadCloud size={24} className={dragging ? 'text-green-600' : 'text-gray-400'} />
          <p className="text-sm text-gray-500">
            Haga clic o arrastre una imagen aquí
          </p>
          <p className="text-xs text-gray-400">PNG, JPG o WEBP — máx. 5MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleChange}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
