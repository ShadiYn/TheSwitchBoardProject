const KEY     = (slot) => `switchboard_save_${slot}`
const VERSION = '1.0'

export function saveGame(slot, state) {
  // Strip non-serialisable function refs that Zustand might carry
  const { startNewGame, loadSave, saveProgress, answerCall, advanceNode,
          makeChoice, transferCall, finishCall, endShift, triggerAnomaly,
          discoverClue, setFlag, setEnding, updateSetting, ...data } = state
  const snapshot = { ...data, _savedAt: new Date().toISOString(), _version: VERSION }
  try {
    localStorage.setItem(KEY(slot), JSON.stringify(snapshot))
    return true
  } catch { return false }
}

export function loadGame(slot) {
  const raw = localStorage.getItem(KEY(slot))
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function deleteSlot(slot) {
  localStorage.removeItem(KEY(slot))
}

export function listSlots() {
  return [0, 1, 2].map(slot => {
    const save = loadGame(slot)
    return save
      ? { slot, empty: false, shift: save.currentShift, savedAt: save._savedAt, runNumber: save.runNumber }
      : { slot, empty: true }
  })
}
