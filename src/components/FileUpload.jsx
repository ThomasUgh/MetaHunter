import { useRef, useState } from 'react'
import { extractMetadata } from '../utils/extractor'
import { useI18n } from '../i18n'

function FileUpload({ onMetadata, onPreview, onBatchStart, onBatchProgress }) {
  const { t } = useI18n()
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const processFile = async (file) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      onPreview?.(url)
    } else {
      onPreview?.(null)
    }

    const data = await extractMetadata(file)
    return { data, name: file.name, type: file.type }
  }

  const processFiles = async (files) => {
    if (!files.length) return
    
    setIsLoading(true)

    if (files.length === 1) {
      try {
        const result = await processFile(files[0])
        onMetadata(result.data, result.name, result.type)
      } catch (err) {
        console.error('Failed to extract metadata:', err)
        onMetadata({ error: err.message }, files[0].name, files[0].type)
      } finally {
        setIsLoading(false)
      }
      return
    }

    onBatchStart?.()
    setProgress({ current: 0, total: files.length })
    
    const results = []
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await processFile(files[i])
        results.push(result)
      } catch (err) {
        results.push({ data: { error: err.message }, name: files[i].name, type: files[i].type })
      }
      setProgress({ current: i + 1, total: files.length })
      onBatchProgress?.(results, i + 1, files.length)
    }

    setIsLoading(false)
    setProgress({ current: 0, total: 0 })
  }

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const showProgress = isLoading && progress.total > 1

  return (
    <div className="mb-8">
      <div 
        className={`
          relative rounded-xl p-10 text-center cursor-pointer transition-all duration-300
          border-2 border-dashed
          ${isDragging 
            ? 'border-cyan-500 bg-cyan-500/5 glow-accent' 
            : 'border-gray-700 hover:border-gray-600 bg-[var(--bg-secondary)]'
          }
          ${isLoading ? 'pointer-events-none' : ''}
        `}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {showProgress && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 rounded-t-xl overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        )}

        <div className={`
          w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
          ${isDragging ? 'bg-cyan-500/20' : 'bg-gray-800'}
          transition-colors
        `}>
          {isLoading ? (
            <svg className="w-8 h-8 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className={`w-8 h-8 ${isDragging ? 'text-cyan-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>

        {showProgress ? (
          <p className="text-gray-400">
            {t('upload.processingBatch', { current: progress.current, total: progress.total })}
          </p>
        ) : isLoading ? (
          <p className="text-gray-400">{t('upload.processing')}</p>
        ) : (
          <>
            <p className="text-gray-300 font-medium mb-1">
              {isDragging ? t('upload.dropHere') : t('upload.dropOrClick')}
            </p>
            <p className="text-sm text-gray-500">
              {t('upload.supportedFormats')}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {t('upload.batchHint')}
            </p>
          </>
        )}

        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gray-700 rounded-tl" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gray-700 rounded-tr" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gray-700 rounded-bl" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gray-700 rounded-br" />
      </div>
      
      <input 
        ref={inputRef}
        type="file" 
        onChange={handleFiles}
        accept="image/*,.pdf,.docx,.xlsx,.pptx,audio/*,video/*"
        multiple
        className="hidden"
      />
    </div>
  )
}

export default FileUpload
