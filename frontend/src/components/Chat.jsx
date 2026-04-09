import { useState, useRef, useEffect } from 'react'

const CHIPS = [
  '¿Cuáles son los requisitos para aprobar?',
  '¿Cuántos parciales hay?',
  '¿Cuál es el porcentaje de asistencia requerido?',
]

function Message({ role, content, sources }) {
  return (
    <div className={`flex flex-col gap-1 max-w-2xl animate-fade-up ${
      role === 'user' ? 'self-end items-end' : 'self-start items-start'
    }`}>
      <span className={`font-mono text-[10px] uppercase tracking-widest ${
        role === 'user' ? 'text-blue-400/70' : 'text-zinc-600'
      }`}>
        {role === 'user' ? 'you' : 'assistant'}
      </span>

      <div className={`px-4 py-3 rounded-lg text-sm leading-relaxed ${
        role === 'user'
          ? 'bg-blue-400/10 border border-blue-400 text-zinc-100 rounded-br-sm'
          : 'bg-zinc-900 border border-white/5 font-mono text-[13px] text-zinc-200 rounded-bl-sm'
      }`}>
        {content}
      </div>

      {sources && sources.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {sources.map((s, i) => (
            <span key={i} className="font-mono text-[10px] text-zinc-600 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded">
              {s.split(/[\\/]/).pop()}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex flex-col gap-1 self-start items-start max-w-2xl">
      <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">assistant</span>
      <div className="bg-zinc-900 border border-white/5 px-4 py-3 rounded-lg rounded-bl-sm flex gap-1.5 items-center">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function Chat({ onAnswer }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(question) {
    if (!question.trim() || loading) return

    setMessages(prev => [...prev, { role: 'user', content: question }])
    setInput('')
    setLoading(true)

    try {
      const { askQuestion } = await import('../api.js')
      const data = await askQuestion(question)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      }])
      onAnswer(data.history_length)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error connecting to the API. Make sure the server is running.',
        sources: []
      }])
    }

    setLoading(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
    // auto-resize
    const ta = textareaRef.current
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-12 py-10 flex flex-col gap-8 scroll-smooth">
        {isEmpty ? (
          <div className="m-auto text-center max-w-md flex flex-col items-center gap-4">
            <span className="text-3xl text-blue-400">◈</span>
            <h2 className="text-xl font-light text-zinc-200 tracking-tight">
              Ask your documents
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Make questions in natural language. The system searches your indexed PDFs and generates grounded answers.
            </p>
            <div className="flex flex-col gap-2 w-full mt-2">
              {CHIPS.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => send(chip)}
                  className="text-sm text-zinc-500 border border-white/10 rounded-full px-4 py-2 hover:border-blue-400 hover:text-blue-400 hover:bg-blue-400/5 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <Message key={i} {...msg} />
            ))}
            {loading && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-12 pb-8 pt-4 border-t border-white/5 bg-zinc-950">
        <div className="flex items-end gap-3 bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 focus-within:border-blue-400 focus-within:shadow-[0_0_0_3px_rgba(96,165,250,0.1)] transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask something about your documents..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 resize-none outline-none leading-relaxed max-h-36 overflow-y-auto"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-md bg-blue-400 text-zinc-950 flex items-center justify-center text-base font-bold hover:opacity-85 hover:-translate-y-px disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0 transition-all flex-shrink-0"
          >
            ↑
          </button>
        </div>
        <p className="font-mono text-[10px] text-zinc-700 mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}