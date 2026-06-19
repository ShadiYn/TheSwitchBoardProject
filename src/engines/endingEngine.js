import endings from '@/data/endings.json'
import { evaluateCondition } from './flagEngine'

/**
 * Evaluates all endings against current state and returns the
 * highest-priority match. Always returns an ending (loop_fallback
 * has condition: null and priority 0, guaranteeing a match).
 */
export function evaluateEnding(flags, stats, runNumber) {
  const matches = endings.filter(e =>
    evaluateCondition(e.condition, flags, stats, runNumber)
  )
  if (matches.length === 0) {
    return endings.find(e => e.id === 'loop_fallback')
  }
  return matches.reduce((best, e) => (e.priority > best.priority ? e : best))
}

export function getEndingById(id) {
  return endings.find(e => e.id === id) ?? null
}
