import { useRef } from 'react'
import { extractMetadata } from '../utils/extractor'

function FileUpload({ onMetadata }) {
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const data = await extractMetadata(file)
      onMetadata(data, file.name)
    } catch (err) {
      console.error('Failed to extract metadata:', err)
      onMetadata({ error: err.message }, file.name)
    }
  }

  return (
    <div className="mb-8">
      <div 
        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500"
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-gray-400">Click to select a file</p>
        <p className="text-sm text-gray-500 mt-2">Supports: JPEG, PNG, TIFF, WebP</p>
      </div>
      <input 
        ref={inputRef}
        type="file" 
        onChange={handleFile}
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}

export default FileUpload
