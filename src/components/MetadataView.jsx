function MetadataView({ data, fileName }) {
  if (data.error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
        <p className="text-red-400">Error: {data.error}</p>
      </div>
    )
  }

  // flatten nested objects for display
  const flattenData = (obj, prefix = '') => {
    const result = []
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue
      
      const fullKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result.push(...flattenData(value, fullKey))
      } else {
        result.push({ key: fullKey, value: formatValue(value) })
      }
    }
    return result
  }

  const formatValue = (val) => {
    if (val instanceof Date) return val.toLocaleString()
    if (Array.isArray(val)) return val.join(', ')
    if (typeof val === 'number') return val.toLocaleString()
    return String(val)
  }

  const entries = flattenData(data)

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
        <h2 className="font-medium">{fileName}</h2>
      </div>
      
      {entries.length === 0 ? (
        <p className="p-4 text-gray-500">No metadata found</p>
      ) : (
        <div className="divide-y divide-gray-800">
          {entries.map((entry, i) => (
            <div key={i} className="px-4 py-2 flex">
              <span className="w-1/3 text-gray-400 text-sm">{entry.key}</span>
              <span className="w-2/3 text-sm break-all">{entry.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MetadataView
