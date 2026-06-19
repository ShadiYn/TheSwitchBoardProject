/**
 * flagEngine.js
 * Pure functions — no side effects, fully testable.
 * All condition checking and effect application lives here.
 */

export function evaluateCondition(condition, flags = {}, stats = {}, runNumber = 1) {
  if (!condition) return true

  if (condition.AND) return condition.AND.every(c => evaluateCondition(c, flags, stats, runNumber))
  if (condition.OR)  return condition.OR.some(c  => evaluateCondition(c, flags, stats, runNumber))
  if (condition.NOT) return !evaluateCondition(condition.NOT, flags, stats, runNumber)

  if (condition.flagSet)    return !!flags[condition.flagSet]
  if (condition.flagNotSet) return !flags[condition.flagNotSet]

  if (condition.flagEq !== undefined) {
    const [key, val] = Object.entries(condition.flagEq)[0]
    return flags[key] === val
  }

  if (condition.stat) {
    const val = stats[condition.stat] ?? 0
    if (condition.gte !== undefined) return val >= condition.gte
    if (condition.lte !== undefined) return val <= condition.lte
    if (condition.gt  !== undefined) return val >  condition.gt
    if (condition.lt  !== undefined) return val <  condition.lt
    if (condition.eq  !== undefined) return val === condition.eq
  }

  if (condition.runNumber) {
    if (condition.runNumber.gte !== undefined) return runNumber >= condition.runNumber.gte
    if (condition.runNumber.eq  !== undefined) return runNumber === condition.runNumber.eq
  }

  return true
}

export function getVisibleChoices(node, flags, stats, runNumber) {
  if (!node?.choices) return []
  return node.choices.filter(c =>
    !c.condition || evaluateCondition(c.condition, flags, stats, runNumber)
  )
}

export function applyEffects(source, state) {
  const stats = { ...state.stats }
  const flags = { ...state.flags }

  if (source.statEffect) {
    Object.entries(source.statEffect).forEach(([k, v]) => {
      stats[k] = Math.max(0, Math.min(100, (stats[k] ?? 0) + v))
    })
  }
  if (source.flagSet) {
    Object.entries(source.flagSet).forEach(([k, v]) => { flags[k] = v })
  }
  if (source.flagIncrement) {
    Object.entries(source.flagIncrement).forEach(([k, v]) => {
      flags[k] = ((flags[k] ?? 0)) + v
    })
  }

  return { stats, flags }
}
