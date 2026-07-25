import { useEffect, useState } from 'react'
import './IntroSplash.css'

const WORD = 'BIS-STIL'

let alreadyShown = false

export default function IntroSplash() {
  const [phase, setPhase] = useState(() => (alreadyShown ? null : 'in'))

  useEffect(() => {
    if (phase !== 'in') return
    alreadyShown = true
    document.body.style.overflow = 'hidden'
    const holdTimer = setTimeout(() => setPhase('out'), 850)
    const removeTimer = setTimeout(() => {
      setPhase(null)
      document.body.style.overflow = ''
    }, 1250)
    return () => {
      clearTimeout(holdTimer)
      clearTimeout(removeTimer)
      document.body.style.overflow = ''
    }
  }, [phase])

  if (phase === null) return null

  return (
    <div className={`intro-splash${phase === 'out' ? ' intro-splash--out' : ''}`} aria-hidden="true">
      <div className="intro-splash__word">
        {WORD.split('').map((char, i) => (
          <span
            key={i}
            className="intro-splash__letter"
            style={{ animationDelay: `${0.08 + i * 0.04}s` }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  )
}
