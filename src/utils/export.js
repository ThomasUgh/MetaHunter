export function exportToJson(data, fileName) {
  const jsonStr = JSON.stringify(data, null, 2)
  downloadFile(jsonStr, `${fileName}_metadata.json`, 'application/json')
}

export function exportToCsv(data, fileName) {
  const rows = []
  
  // flatten the data
  const flattenObj = (obj, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue
      
      const fullKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        flattenObj(value, fullKey)
      } else {
        let val = value
        if (value instanceof Date) val = value.toISOString()
        if (Array.isArray(value)) val = value.join('; ')
        rows.push({ key: fullKey, value: String(val) })
      }
    }
  }
  
  flattenObj(data)
  
  // create CSV
  const csv = 'Property,Value\n' + rows
    .map(r => `"${r.key}","${r.value.replace(/"/g, '""')}"`)
    .join('\n')
  
  downloadFile(csv, `${fileName}_metadata.csv`, 'text/csv')
}

export function exportToTxt(data, fileName) {
  const lines = []
  lines.push(`Metadata Report: ${fileName}`)
  lines.push('='.repeat(50))
  lines.push('')
  
  const formatSection = (obj, indent = 0) => {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue
      
      const pad = '  '.repeat(indent)
      
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        lines.push(`${pad}[${formatKey(key)}]`)
        formatSection(value, indent + 1)
        lines.push('')
      } else {
        let val = value
        if (value instanceof Date) val = value.toLocaleString()
        if (Array.isArray(value)) val = value.join(', ')
        lines.push(`${pad}${formatKey(key)}: ${val}`)
      }
    }
  }
  
  formatSection(data)
  
  downloadFile(lines.join('\n'), `${fileName}_metadata.txt`, 'text/plain')
}

function formatKey(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim()
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
