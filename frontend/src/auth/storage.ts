const KEY = 'appUser'

export function read<T>(key: string = KEY): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch (e) {
    console.error('storage.read error', e)
    return null
  }
}

export function write<T>(value: T, key: string = KEY) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('storage.write error', e)
  }
}

export function exists(key: string = KEY) {
  return !!localStorage.getItem(key)
}

export function remove(key: string = KEY) {
  try { localStorage.removeItem(key) } catch {}
}
