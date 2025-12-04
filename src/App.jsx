import { useState } from 'react'
import FileUpload from './components/FileUpload'
import MetadataView from './components/MetadataView'
import GpsMap from './components/GpsMap'

function App() {
  const [metadata, setMetadata] = useState(null)
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState('')
  const [preview, setPreview] = useState(null)

  const handleMetadata = (data, name, type) => {
    setMetadata(data)
    setFileName(name)
    setFileType(type)
  }

  const handlePreview = (url) => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(url)
  }

  const hasGps = metadata?.gps?.latitude && metadata?.gps?.longitude

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">MetaHunter</h1>
        <p className="text-gray-400 mb-8">Extract metadata from your files</p>
        
        <FileUpload onMetadata={handleMetadata} onPreview={handlePreview} />
        
        {metadata && (
          <div className="space-y-6">
            {(preview || hasGps) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {preview && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-auto rounded max-h-64 object-contain bg-gray-800"
                    />
                  </div>
                )}
                {hasGps && (
                  <div>
                    <GpsMap 
                      latitude={metadata.gps.latitude}
                      longitude={metadata.gps.longitude}
                      altitude={metadata.gps.altitude}
                    />
                  </div>
                )}
              </div>
            )}
            
            <MetadataView data={metadata} fileName={fileName} fileType={fileType} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
