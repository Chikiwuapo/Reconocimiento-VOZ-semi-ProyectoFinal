import React, { useEffect, useState } from 'react'

export default function Modal({ open, title, children, onClose, actions }: { open: boolean; title?: string; children?: React.ReactNode; onClose: () => void; actions?: React.ReactNode }) {
  const [mounted, setMounted] = useState(open)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setExiting(false)
    } else if (mounted) {
      setExiting(true)
      const t = setTimeout(() => {
        setMounted(false)
        setExiting(false)
      }, 200)
      return () => clearTimeout(t)
    }
  }, [open, mounted])

  if (!mounted) return null

  const backdropStyle: React.CSSProperties = {
    position: 'fixed', inset: 0 as any, display: 'grid', placeItems: 'center', zIndex: 50,
    background: 'rgba(0,0,0,.55)',
    transition: 'opacity .2s ease',
    opacity: exiting ? 0 : 1,
  }

  const dialogStyle: React.CSSProperties = {
    width: 'min(520px, 92vw)', background: 'rgba(18,18,22,.95)', border: '1px solid rgba(255,255,255,.08)',
    borderRadius: 16, boxShadow: '0 30px 80px rgba(0,0,0,.55)', padding: 20, position: 'relative',
    transform: exiting ? 'translateY(8px) scale(.98)' : 'translateY(0) scale(1)',
    opacity: exiting ? 0 : 1,
    transition: 'opacity .2s ease, transform .2s ease',
  }

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e)=>e.stopPropagation()}>
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        <div style={{ color: '#d8dbe7' }}>{children}</div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{actions}</div>
        <button aria-label="Close" onClick={onClose} style={{ position: 'absolute', right: 16, top: 10, background: 'transparent', border: 'none', color: '#c7c7d1', cursor: 'pointer' }}>✖</button>
      </div>
    </div>
  )
}
