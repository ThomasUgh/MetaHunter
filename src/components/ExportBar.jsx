import { useI18n } from '../i18n'
import { exportToJson, exportToCsv, exportToTxt } from '../utils/export'

function ExportBar({ data, fileName }) {
  const { t } = useI18n()
  const baseName = fileName.replace(/\.[^/.]+$/, '')

  const buttons = [
    { label: 'JSON', icon: '{ }', fn: () => exportToJson(data, baseName) },
    { label: 'CSV', icon: '📊', fn: () => exportToCsv(data, baseName) },
    { label: 'TXT', icon: '📝', fn: () => exportToTxt(data, baseName) },
  ]

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 mr-2">{t('export.label')}:</span>
      {buttons.map(btn => (
        <button
          key={btn.label}
          onClick={btn.fn}
          className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-gray-300 flex items-center gap-1.5"
        >
          <span className="text-xs">{btn.icon}</span>
          <span>{btn.label}</span>
        </button>
      ))}
    </div>
  )
}

export default ExportBar
