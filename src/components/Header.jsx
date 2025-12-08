function Header() {
  return (
    <header className="mb-10">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center glow-accent">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Meta<span className="text-cyan-400">Hunter</span>
          </h1>
          <p className="text-sm text-gray-500">File Metadata Extraction Tool</p>
        </div>
      </div>
      
      <div className="inline-flex items-center gap-2 text-xs">
        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          v0.5.0
        </span>
        <span className="text-gray-600">•</span>
        <span className="text-gray-500">Images • PDF • Office • Audio • Video</span>
      </div>
    </header>
  )
}

export default Header
