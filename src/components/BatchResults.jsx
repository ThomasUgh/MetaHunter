import { useState } from 'react'
import MetadataView from './MetadataView'
import ExportBar from './ExportBar'

function BatchResults({ results }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  if (!results.length) return null

  const selected = results[selectedIndex]

  const getIcon = (type) => {
    if (type?.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    if (type?.includes('word')) return '📝'
    if (type?.includes('sheet')) return '📊'
    if (type?.includes('presentation')) return '📽️'
    if (type?.startsWith('audio/')) return '🎵'
    if (type?.startsWith('video/')) return '🎬'
    return '📁'
  }

  const exportAll = () => {
    const combined = results.map(r => ({ fileName: r.name, fileType: r.type, metadata: r.data }))
    const blob = new Blob([JSON.stringify(combined, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'batch_metadata.json'
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-[var(--bg-secondary)] rounded-xl px-5 py-4 border border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center"><span className="text-lg">📦</span></div>
          <div><h2 className="font-semibold">Batch Results</h2><p className="text-sm text-gray-500">{results.length} files processed</p></div>
        </div>
        <button onClick={exportAll} className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors text-cyan-400 text-sm">Export All (JSON)</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border)]"><h3 className="text-sm font-medium text-gray-400">Files</h3></div>
          <div className="max-h-96 overflow-y-auto">
            {results.map((result, i) => (
              <button key={i} onClick={() => setSelectedIndex(i)} className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${i === selectedIndex ? 'bg-cyan-500/10 border-l-2 border-cyan-500' : 'hover:bg-white/[0.02] border-l-2 border-transparent'}`}>
                <span>{getIcon(result.type)}</span>
                <div className="flex-1 min-w-0"><p className="text-sm truncate">{result.name}</p>{result.data.error && <p className="text-xs text-red-400">Error</p>}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-3 space-y-4">
          <div className="flex justify-end"><ExportBar data={selected.data} fileName={selected.name} /></div>
          <MetadataView data={selected.data} fileName={selected.name} fileType={selected.type} />
        </div>
      </div>
    </div>
  )
}

export default BatchResults
