import { useState } from 'react'
import FileUpload from './components/FileUpload'
import MetadataView from './components/MetadataView'

function App() {
  const [metadata, setMetadata] = useState(null)
  const [fileName, setFileName] = useState('')

  const handleMetadata = (data, name) => {
    setMetadata(data)
    setFileName(name)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">MetaHunter</h1>
        <p className="text-gray-400 mb-8">Extract metadata from your files</p>
        
        <FileUpload onMetadata={handleMetadata} />
        
        {metadata && (
          <MetadataView data={metadata} fileName={fileName} />
        )}
      </div>
    </div>
  )
}

export default App
