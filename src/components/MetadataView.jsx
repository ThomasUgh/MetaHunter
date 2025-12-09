import { useI18n } from '../i18n'

function MetadataView({ data, fileName, fileType }) {
  const { t } = useI18n()

  if (data.error) {
    return (
      <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-red-400">{t('metadata.error')}</p>
            <p className="text-sm text-red-400/70">{data.error}</p>
          </div>
        </div>
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

  const getSectionIcon = (title) => {
    const icons = {
      fileInfo: '📁', camera: '📷', settings: '⚙️', dates: '📅',
      gps: '📍', dimensions: '📐', document: '📄', properties: '🔧',
      application: '💻', statistics: '📊', format: '🎵', tags: '🏷️', albumArt: '🎨',
    }
    return icons[title] || '📋'
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
      sections.push({ id: key, title: t(`sections.${key}`) || formatTitle(key), entries })
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-[var(--bg-secondary)] rounded-xl px-5 py-4 flex items-center gap-4 border border-[var(--border)]">
        <span className="text-3xl">{getIcon()}</span>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{fileName}</h2>
          {data.note && <p className="text-sm text-gray-500">{data.note}</p>}
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">{t('metadata.sections')}</div>
          <div className="text-lg font-semibold text-cyan-400">{sections.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, i) => (
          <div 
            key={i} 
            className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden border border-[var(--border)] hover:border-cyan-500/30 transition-colors"
          >
            <div className="px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border)] flex items-center gap-2">
              <span>{getSectionIcon(section.id)}</span>
              <h3 className="text-sm font-medium text-gray-300">{section.title}</h3>
              <span className="ml-auto text-xs text-gray-600">{section.entries.length}</span>
            </div>
            <div className="divide-y divide-[var(--border)]/50">
              {section.entries.map((entry, j) => (
                <div key={j} className="px-4 py-2.5 flex gap-4 hover:bg-white/[0.02] transition-colors">
                  <span className="w-1/3 text-gray-500 text-sm truncate">{formatTitle(entry.key)}</span>
                  <span className="w-2/3 text-sm break-all font-mono text-gray-300">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-8 text-center border border-[var(--border)]">
          <p className="text-gray-500">{t('metadata.noMetadata')}</p>
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
