import { useState } from 'react'
import Header from './components/Header'
import FileUpload from './components/FileUpload'
import MetadataView from './components/MetadataView'
import GpsMap from './components/GpsMap'

function App() {
  const [metadata, setMetadata] = useState(null)
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState('')
  const [preview, setPreview] = useState(null)

  const handleMetadata = (data, name, type) => { setMetadata(data); setFileName(name); setFileType(type) }
  const handlePreview = (url) => { if (preview) URL.revokeObjectURL(preview); setPreview(url) }

  const hasGps = metadata?.gps?.latitude && metadata?.gps?.longitude

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <Header />
        <FileUpload onMetadata={handleMetadata} onPreview={handlePreview} />
        
        {metadata && (
          <div className="space-y-6 animate-fade-in">
            {(preview || hasGps) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {preview && (
                  <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
                    <div className="text-xs text-gray-500 mb-3 flex items-center gap-2"><span>🖼️</span><span>Preview</span></div>
                    <img src={preview} alt="Preview" className="w-full h-auto rounded-lg max-h-64 object-contain bg-black/20" />
                  </div>
                )}
                {hasGps && (
                  <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
                    <div className="text-xs text-gray-500 mb-3 flex items-center gap-2"><span>📍</span><span>Location</span></div>
                    <GpsMap latitude={metadata.gps.latitude} longitude={metadata.gps.longitude} altitude={metadata.gps.altitude} />
                  </div>
                )}
              </div>
            )}
            <MetadataView data={metadata} fileName={fileName} fileType={fileType} />
          </div>
        )}

        <footer className="mt-16 pt-6 border-t border-[var(--border)] text-center">
          <p className="text-xs text-gray-600">MetaHunter • All processing happens locally in your browser</p>
        </footer>
      </div>
    </div>
  )
}

export default App
