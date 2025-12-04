function MetadataView({ data, fileName, fileType }) {
  if (data.error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
        <p className="text-red-400">Error: {data.error}</p>
      </div>
    )
  }

  const getIcon = () => {
    if (fileType?.startsWith('image/')) return '🖼️'
    if (fileType === 'application/pdf' || fileType === 'PDF') return '📄'
    if (fileType?.includes('word') || fileType === 'DOCX') return '📝'
    if (fileType?.includes('sheet') || fileType === 'XLSX') return '📊'
    if (fileType?.includes('presentation') || fileType === 'PPTX') return '📽️'
    if (fileType?.startsWith('audio/')) return '🎵'
    if (fileType?.startsWith('video/')) return '🎬'
    return '📁'
  }

  const sections = []
  
  for (const [key, value] of Object.entries(data)) {
    if (key === 'note') continue
    if (value === null || value === undefined) continue
    if (typeof value !== 'object') continue
    
    const entries = Object.entries(value)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => ({ key: k, value: formatValue(v) }))
    
    if (entries.length > 0) {
      sections.push({ title: formatTitle(key), entries })
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-lg px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">{getIcon()}</span>
        <div>
          <h2 className="font-medium">{fileName}</h2>
          {data.note && <p className="text-sm text-gray-500">{data.note}</p>}
        </div>
      </div>

      {sections.map((section, i) => (
        <div key={i} className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-800">
            <h3 className="text-sm font-medium text-gray-300">{section.title}</h3>
          </div>
          <div className="divide-y divide-gray-800/50">
            {section.entries.map((entry, j) => (
              <div key={j} className="px-4 py-2 flex">
                <span className="w-1/3 text-gray-400 text-sm">{formatTitle(entry.key)}</span>
                <span className="w-2/3 text-sm break-all">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {sections.length === 0 && (
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-gray-500">No metadata found</p>
        </div>
      )}
    </div>
  )
}

function formatValue(val) {
  if (val instanceof Date) return val.toLocaleString()
  if (Array.isArray(val)) return val.join(', ')
  if (typeof val === 'number') return val.toLocaleString()
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  return String(val)
}

function formatTitle(str) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

export default MetadataView
