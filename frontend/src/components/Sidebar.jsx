export default function Sidebar({ status, historyLength, onClear }) {
  return (
    <aside className="w-52 min-w-52 bg-zinc-900 border-r border-white/5 flex flex-col p-6 gap-7">
      
      {/* Logo */}
      <div>
        <div className="font-mono text-lg font-semibold tracking-widest">
          <span className="text-blue-400">[</span>
          <span className="text-white">RAG</span>
          <span className="text-blue-400">]</span>
        </div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">
          Document Intelligence
        </p>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">status</p>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            status === 'connected' ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' :
            status === 'error'     ? 'bg-red-400' : 'bg-zinc-600'
          }`} />
          <span className="font-mono text-[11px] text-zinc-400">{status}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">session</p>
        <div className="flex justify-between">
          <span className="text-[11px] text-zinc-500">messages</span>
          <span className="text-[11px] text-zinc-400 font-mono">{historyLength}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[11px] text-zinc-500">model</span>
          <span className="text-[11px] text-zinc-400 font-mono">llama-3.3</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[11px] text-zinc-500">store</span>
          <span className="text-[11px] text-zinc-400 font-mono">faiss</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">actions</p>
        <button
          onClick={onClear}
          className="text-left font-mono text-[11px] text-zinc-500 border border-white/10 px-3 py-2 rounded hover:border-blue-400 hover:text-blue-400 hover:bg-blue-400/5 transition-all"
        >
          clear history
        </button>
      </div>

      {/* Footer links */}
        <div className="mt-auto flex flex-col gap-2">
        <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-zinc-600 hover:text-blue-400 transition-colors"
        >
            → API docs
        </a>
        
        <a
            href="https://github.com/Sluur/rag-api"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-zinc-600 hover:text-blue-400 transition-colors"
        >
            → GitHub
        </a>
        </div>
    </aside>
  )
}