import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Minimal types
interface Message {
  type: 'user' | 'bot'
  content: string
  confidence?: number | null
}

const BACKEND_BASE = (import.meta as any).env?.VITE_BACKEND_BASE_URL || 'http://localhost:8000'
const CHAT_API_URL = `${BACKEND_BASE}/chatbot/api/chat/`

function getOrCreateSessionId() {
  try {
    const key = 'chatbot_session_id'
    let sid = localStorage.getItem(key)
    if (!sid) {
      sid = (window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2))
      localStorage.setItem(key, sid)
    }
    return sid
  } catch {
    // Fallback if storage blocked
    return (window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2))
  }
}

const styles = {
  fab: {
    position: 'fixed' as const,
    right: '20px',
    bottom: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#007bff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    border: 'none',
    cursor: 'pointer',
    zIndex: 1000,
    fontSize: '22px',
  },
  panel: {
    position: 'fixed' as const,
    right: '20px',
    bottom: '90px',
    width: '360px',
    maxWidth: '92vw',
    height: '520px',
    maxHeight: '70vh',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    zIndex: 1000,
    transition: 'transform 200ms ease, opacity 200ms ease',
  },
  header: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#fff',
    padding: '12px 16px',
    fontWeight: 600,
    position: 'relative' as const,
  },
  statusDot: {
    position: 'absolute' as const,
    right: '12px',
    top: '12px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#4CAF50',
  },
  messages: {
    flex: 1,
    overflowY: 'auto' as const,
    background: '#f8f9fa',
    padding: '12px',
  },
  row: {
    display: 'flex',
    marginBottom: '10px',
    alignItems: 'flex-start',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    padding: '10px 12px',
    borderRadius: '14px',
    wordBreak: 'break-word' as const,
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
  },
  bubbleUser: {
    background: '#007bff',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  bubbleBot: {
    background: '#fff',
    color: '#333',
    border: '1px solid #e9ecef',
    borderBottomLeftRadius: '4px',
  },
  quick: {
    background: '#fff',
    borderTop: '1px solid #e9ecef',
  },
  quickHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  quickToggleBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#444',
    transformOrigin: '50% 50%',
    transition: 'transform 200ms ease',
  },
  quickContent: {
    padding: '0 12px 8px 12px',
    overflow: 'hidden',
    transition: 'max-height 220ms ease, opacity 220ms ease',
  },
  quickWrap: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },
  quickBtn: {
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '18px',
    padding: '6px 12px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  inputWrap: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    padding: '10px',
    background: '#fff',
    borderTop: '1px solid #e9ecef',
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    border: '2px solid #e9ecef',
    borderRadius: '22px',
    outline: 'none',
  },
  send: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  confidence: {
    fontSize: '0.7rem',
    color: '#6c757d',
    marginTop: '4px',
  },
  typing: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    background: '#fff',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    width: 'fit-content',
    margin: '0 0 10px 0',
  },
}

const QUICK_ACTIONS = [
  '¿Cómo funciona el reconocimiento de gestos?',
  '¿Cómo me registro en la plataforma?',
  '¿Qué cursos de matemáticas tienen?',
  '¿Cómo hago operaciones aritméticas?',
  '¿Dónde está el panel principal?',
  'Necesito ayuda técnica',
]

export default function FloatingChatWidget() {
  const [open, setOpen] = useState(false)
  const [panelEnter, setPanelEnter] = useState(false)
  const [quickOpen, setQuickOpen] = useState(true)
  const [messages, setMessages] = useState<Message[]>([{
    type: 'bot',
    content: '¡Hola! Soy tu asistente educativo especializado en matemáticas con reconocimiento de gestos. ¿En qué puedo asistirte hoy?',
    confidence: 1,
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const sessionId = useMemo(() => getOrCreateSessionId(), [])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  // Handle enter animation
  useEffect(() => {
    if (open) {
      // Start enter transition on next frame
      const id = requestAnimationFrame(() => setPanelEnter(true))
      return () => cancelAnimationFrame(id)
    } else {
      setPanelEnter(false)
    }
  }, [open])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { type: 'user', content: text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId })
      })

      const data = await res.json()

      if (res.ok) {
        setMessages(prev => [...prev, { type: 'bot', content: data.response, confidence: data.confidence }])
        if (data.redirect) {
          // Optional prompt: keep UX minimal in widget; could expose a link
          setMessages(prev => [...prev, { type: 'bot', content: `Puedo llevarte a: ${data.redirect}` }])
        }
      } else {
        setMessages(prev => [...prev, { type: 'bot', content: data.error || 'Error procesando mensaje' }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { type: 'bot', content: 'Error de conexión. Por favor, inténtalo de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }, [input, sessionId, loading])

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      send()
    }
  }

  const sendQuick = (q: string) => {
    setInput(q)
    // slight delay to ensure state updates before send
    setTimeout(() => { void send() }, 0)
  }

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          aria-label="Abrir chat educativo"
          style={styles.fab}
          onClick={() => setOpen(true)}
          title="Chat de ayuda"
        >
          💬
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          style={{
            ...styles.panel,
            transform: panelEnter ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
            opacity: panelEnter ? 1 : 0,
          }}
        >
          <div style={styles.header}>
            <div style={styles.statusDot} title="Chatbot activo" />
            <div>Asistente Educativo IA</div>
            <button
              onClick={() => {
                // play leave animation before unmounting
                setPanelEnter(false)
                setTimeout(() => setOpen(false), 200)
              }}
              title="Cerrar"
              style={{ position: 'absolute', right: 8, bottom: 8, background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer' }}
            >✕</button>
          </div>

          <div ref={scrollRef} style={styles.messages}>
            {/* Messages */}
            {messages.map((m, idx) => (
              <div key={idx} style={{ ...styles.row, ...(m.type === 'user' ? styles.rowUser : {}) }}>
                <div style={{ ...styles.bubble, ...(m.type === 'user' ? styles.bubbleUser : styles.bubbleBot) }}>
                  <div>{m.content}</div>
                  {m.type === 'bot' && typeof m.confidence === 'number' && (
                    <div style={styles.confidence}>Confianza: {Math.round(m.confidence * 100)}%</div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={styles.typing}>
                <span>🤖</span>
                <span>Escribiendo...</span>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div style={styles.quick}>
            <div style={styles.quickHeader} onClick={() => setQuickOpen(v => !v)}>
              <div style={{ fontSize: '0.9rem', color: '#555', fontWeight: 600 }}>Acciones rápidas</div>
              <button
                aria-label={quickOpen ? 'Contraer acciones rápidas' : 'Expandir acciones rápidas'}
                style={{
                  ...styles.quickToggleBtn,
                  transform: quickOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >⌃</button>
            </div>
            <div
              style={{
                ...styles.quickContent,
                maxHeight: quickOpen ? 140 : 0,
                opacity: quickOpen ? 1 : 0,
                pointerEvents: quickOpen ? 'auto' : 'none',
              }}
            >
              <div style={styles.quickWrap}>
                {QUICK_ACTIONS.map((q) => (
                  <button key={q} style={styles.quickBtn} onClick={() => sendQuick(q)}>{q}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Input */}
          <div style={styles.inputWrap}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Escribe tu pregunta aquí..."
              style={styles.input as React.CSSProperties}
              disabled={loading}
            />
            <button
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              style={{ ...styles.send, opacity: loading || !input.trim() ? 0.7 : 1 }}
              title="Enviar"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
