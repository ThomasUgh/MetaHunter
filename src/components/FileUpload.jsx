import { useRef, useState } from 'react'
import { extractMetadata } from '../utils/extractor'

function FileUpload({ onMetadata, onPreview }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const processFile = async (file) => {
    if (!file) return

    setIsLoading(true)
    
    // create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      onPreview?.(url)
    } else {
      onPreview?.(null)
    }

    try {
      const data = await extractMetadata(file)
      onMetadata(data, file.name, file.type)
    } catch (err) {
      console.error('Failed to extract metadata:', err)
      onMetadata({ error: err.message }, file.name, file.type)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFile = (e) => {
    processFile(e.target.files[0])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    processFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="mb-8">
      <div 
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-cyan-500 bg-cyan-500/10' 
            : 'border-gray-600 hover:border-gray-500'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isLoading ? (
          <p className="text-gray-400">Processing...</p>
        ) : (
          <>
            <p className="text-gray-400">
              {isDragging ? 'Drop file here' : 'Click or drag a file here'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Images • PDF • Office (DOCX, XLSX, PPTX) • Audio • Video
            </p>
          </>
        )}
      </div>
      <input 
        ref={inputRef}
        type="file" 
        onChange={handleFile}
        accept="image/*,.pdf,.docx,.xlsx,.pptx,audio/*,video/*"
        className="hidden"
      />
    </div>
  )
}

export default FileUpload
