import { useState, useEffect, useRef, useCallback } from 'react'

const SPEED = { slow: 55, normal: 28, fast: 10, instant: 0 }

export function useDialogue(fullText = '', speed = 'normal') {
  const [displayed, setDisplayed] = useState(speed === 'instant' ? fullText : '')
  const [done,      setDone]      = useState(speed === 'instant')
  const idx   = useRef(0)
  const timer = useRef(null)
  const delay = SPEED[speed] ?? 28

  useEffect(() => {
    idx.current = 0
    setDone(false)

    if (delay === 0) {
      setDisplayed(fullText)
      setDone(true)
      return
    }

    setDisplayed('')

    const tick = () => {
      if (idx.current >= fullText.length) { setDone(true); return }
      idx.current++
      setDisplayed(fullText.slice(0, idx.current))
      // Slight pause on punctuation for dramatic effect
      const ch = fullText[idx.current - 1]
      const pause = (ch === '.' || ch === ',' || ch === '…') ? delay * 5 : delay
      timer.current = setTimeout(tick, pause)
    }

    timer.current = setTimeout(tick, delay)
    return () => clearTimeout(timer.current)
  }, [fullText, delay])

  const skip = useCallback(() => {
    clearTimeout(timer.current)
    setDisplayed(fullText)
    setDone(true)
  }, [fullText])

  return { displayed, done, skip }
}
