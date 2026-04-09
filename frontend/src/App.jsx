import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import { checkHealth, clearHistory } from './api'

export default function App() {
  const [status, setStatus] = useState('connecting...')
  const [historyLength, setHistoryLength] = useState(0)

  async function fetchHealth() {
    try {
      const data = await checkHealth()
      setStatus(data.index_loaded ? 'connected' : 'error')
      setHistoryLength(data.history_length ?? 0)
    } catch {
      setStatus('error')
    }
  }

  async function handleClear() {
    await clearHistory()
    setHistoryLength(0)
    window.location.reload()
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <Sidebar
        status={status}
        historyLength={historyLength}
        onClear={handleClear}
      />
      <Chat onAnswer={setHistoryLength} />
    </div>
  )
}