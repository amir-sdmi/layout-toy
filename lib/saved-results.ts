import type { SavedResult } from './types'

const STORAGE_KEY = 'backtest_results'

export function saveResult(result: SavedResult): void {
  const existing = loadAllResults()
  localStorage.setItem(STORAGE_KEY, JSON.stringify([result, ...existing]))
}

export function loadAllResults(): SavedResult[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function deleteResult(id: string): void {
  const filtered = loadAllResults().filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
