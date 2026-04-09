const API = 'http://localhost:8000'

export async function checkHealth() {
  const res = await fetch(`${API}/health`)
  return res.json()
}

export async function askQuestion(question) {
  const res = await fetch(`${API}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  })
  if (!res.ok) throw new Error('API error')
  return res.json()
}

export async function clearHistory() {
  const res = await fetch(`${API}/history`, { method: 'DELETE' })
  return res.json()
}