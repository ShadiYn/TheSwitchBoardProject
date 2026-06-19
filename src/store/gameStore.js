import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { saveGame, loadGame } from '@/engines/saveLoad'
import { applyEffects } from '@/engines/flagEngine'
import { buildCallQueue } from '@/engines/callQueue'

const DEFAULT_STATE = {
  saveSlot:         null,
  runNumber:        1,
  currentShift:     1,
  gamePhase:        'TITLE',
  stats: { empathy: 0, efficiency: 0, curiosity: 0, chaos: 0 },
  flags:            {},
  shiftCallQueue:   [],
  currentCallIndex: 0,
  activeCall:       null,
  activeNode:       null,
  relationships:    {},
  callHistory:      [],
  worldEvents:      [],
  mysteryPhase:     0,
  officeState: {
    clockStopped:  false,
    notesAppeared: [],
    lightFlicker:  false,
    filesMissing:  [],
    catStaring:    false,
    radioStatic:   false,
  },
  notebookEntries: [],
  cluesFound:      [],
  endingId:        null,
  settings: {
    textSpeed:    'normal',
    crtEnabled:   true,
    soundEnabled: true,
    reducedMotion: false,
  },
}

export const useGameStore = create(immer((set, get) => ({
  ...DEFAULT_STATE,

  startNewGame: (slot) => set(s => {
    Object.assign(s, structuredClone(DEFAULT_STATE))
    s.saveSlot = slot
    s.gamePhase = 'INTRO'
    s.shiftCallQueue = buildCallQueue(1, {}, {}, 1)
  }),

  loadSave: (slot) => {
    const saved = loadGame(slot)
    if (!saved) return false
    set(() => ({ ...saved }))
    return true
  },

  saveProgress: () => {
    const state = get()
    if (state.saveSlot !== null) saveGame(state.saveSlot, state)
  },

  beginShift: () => set(s => {
    if (s.gamePhase === 'IDLE' && s.shiftCallQueue.length > 0) s.gamePhase = 'RINGING'
  }),

  endIntro: () => set(s => { s.gamePhase = 'IDLE' }),

  answerCall: (callData) => set(s => {
    s.activeCall = callData
    s.activeNode = callData.nodes[0]
    s.gamePhase  = callData.nodes[0].type === 'choice' ? 'CHOOSING' : 'IN_CALL'
  }),

  advanceNode: (nextNodeId) => set(s => {
    if (!nextNodeId) { s.gamePhase = 'CALL_END'; return }
    const next = s.activeCall.nodes.find(n => n.id === nextNodeId)
    if (!next) { s.gamePhase = 'CALL_END'; return }
    s.activeNode = next
    if (next.type === 'choice')   s.gamePhase = 'CHOOSING'
    else if (next.type === 'transfer') s.gamePhase = 'TRANSFER'
    else if (next.type === 'end') s.gamePhase = 'CALL_END'
    else                          s.gamePhase = 'IN_CALL'
  }),

  makeChoice: (choice) => set(s => {
    const patch = applyEffects(choice, { stats: s.stats, flags: s.flags })
    s.stats = patch.stats
    s.flags = patch.flags
    if (choice.relEffect) {
      Object.entries(choice.relEffect).forEach(([id, delta]) => {
        s.relationships[id] = (s.relationships[id] || 0) + delta
      })
    }
    s.callHistory.push({ callId: s.activeCall.id, choiceId: choice.id, shift: s.currentShift })
    if (!choice.next) { s.gamePhase = 'CALL_END'; return }
    const next = s.activeCall.nodes.find(n => n.id === choice.next)
    s.activeNode = next || null
    if (!next || next.type === 'end') s.gamePhase = 'CALL_END'
    else if (next.type === 'choice')  s.gamePhase = 'CHOOSING'
    else if (next.type === 'transfer') s.gamePhase = 'TRANSFER'
    else s.gamePhase = 'IN_CALL'
  }),

  transferCall: (deptId) => set(s => {
    s.flags[`transferred_to_${deptId}`] = (s.flags[`transferred_to_${deptId}`] || 0) + 1
    if (deptId === 'unknown') {
      s.flags['used_unknown_dept'] = true
      s.stats.chaos = Math.min(100, s.stats.chaos + 3)
    }
    s.callHistory.push({ callId: s.activeCall?.id, transfer: deptId, shift: s.currentShift })
    s.gamePhase = 'CALL_END'
  }),

  finishCall: () => set(s => {
    if (s.activeCall) {
      s.notebookEntries.unshift({
        id: `note_${Date.now()}`, shift: s.currentShift,
        caller: s.activeCall.callerId,
        text: s.activeCall.notebookSummary || `Llamada registrada.`,
      })
    }
    s.activeCall  = null
    s.activeNode  = null
    s.currentCallIndex++
    if (s.currentCallIndex >= s.shiftCallQueue.length) s.gamePhase = 'END_OF_SHIFT'
    else s.gamePhase = 'RINGING'
  }),

  endShift: () => set(s => {
    s.currentShift++
    if (s.currentShift > 30) {
      s.gamePhase = 'ENDING'
      return
    }
    s.shiftCallQueue   = buildCallQueue(s.currentShift, s.flags, s.stats, s.runNumber)
    s.currentCallIndex = 0
    s.gamePhase = 'IDLE'
    if (s.saveSlot !== null) saveGame(s.saveSlot, s)
  }),

  triggerAnomaly: (key, value) => set(s => { s.officeState[key] = value }),
  discoverClue:   (id)         => set(s => { if (!s.cluesFound.includes(id)) s.cluesFound.push(id) }),
  setFlag:        (k, v)       => set(s => { s.flags[k] = v }),
  setEnding:      (id)         => set(s => { s.endingId = id; s.gamePhase = 'ENDING' }),
  updateSetting:  (k, v)       => set(s => { s.settings[k] = v }),
})))
