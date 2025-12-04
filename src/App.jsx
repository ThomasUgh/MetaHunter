import { useState } from 'react'
import FileUpload from './components/FileUpload'
import MetadataView from './components/MetadataView'

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
    // cleanup old preview URL
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(url)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">MetaHunter</h1>
        <p className="text-gray-400 mb-8">Extract metadata from your files</p>
        
        <FileUpload onMetadata={handleMetadata} onPreview={handlePreview} />
        
        {metadata && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {preview && (
              <div className="lg:col-span-1">
                <div className="bg-gray-900 rounded-lg p-4">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-auto rounded max-h-80 object-contain bg-gray-800"
                  />
                </div>
              </div>
            )}
            
            <div className={preview ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <MetadataView data={metadata} fileName={fileName} fileType={fileType} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
