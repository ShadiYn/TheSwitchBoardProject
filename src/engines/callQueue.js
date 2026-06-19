import shiftsData from '@/data/shifts.json'
import callsIndex from '@/data/callsIndex.json'
import { evaluateCondition } from './flagEngine'

/**
 * Returns an ordered array of call IDs for the given shift.
 * Filters out calls whose unlockCondition is not met.
 */
export function buildCallQueue(shiftNumber, flags, stats, runNumber) {
  const shiftDef = shiftsData.find(s => s.shift === shiftNumber)
  if (!shiftDef) return []

  return shiftDef.calls.filter(callId => {
    const meta = callsIndex[callId]
    if (!meta) return false
    if (!meta.unlockCondition) return true
    return evaluateCondition(meta.unlockCondition, flags, stats, runNumber)
  })
}

/**
 * Loads a call object by ID from the appropriate caller JSON.
 * Uses import.meta.glob (eager) so all call files are bundled
 * and looked up synchronously — no runtime path resolution issues.
 */
const callModules = import.meta.glob('@/data/calls/*.json', { eager: true })

function findModuleByFilename(filename) {
  const entry = Object.entries(callModules).find(([path]) => path.endsWith(filename))
  return entry ? entry[1] : null
}

export async function loadCall(callId) {
  const meta = callsIndex[callId]
  if (!meta) return null
  const mod = findModuleByFilename(meta.file)
  if (!mod) return null
  const calls = mod.default ?? mod
  return calls.find(c => c.id === callId) || null
}
