import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { useOrderedSwatches } from '../../utils/orderedSwatches.js'
import './MaterialsCatalog.css'

const DECODE_TIMEOUT = 250
let hasFanOpened = false
const MAX_ANGLE = 80
const FAN_CLOSED_EXTRA = 7
const NEIGHBOR_SPREAD_DEG = 4.2
const NEIGHBOR_SPREAD_RANGE = 5
const FAN_OPEN_MS = 440
const FAN_STAGGER_MS = 12

export default function MaterialsCatalog({ categories, swatches: swatchesProp, onSwatchClick, onOpen }) {
  const [hovered, setHovered] = useState(null)
  const ordered = useOrderedSwatches(categories || [])
  const swatches = swatchesProp || ordered

  const n = swatches.length
  const step = n > 1 ? (2 * MAX_ANGLE) / (n - 1) : 0

  const [ready, setReady] = useState(hasFanOpened)
  const [fanPhase, setFanPhase] = useState(hasFanOpened ? 'static' : 'idle')
  const skipAnim = useRef(hasFanOpened)

  useEffect(() => {
    if (skipAnim.current) { setReady(true); setFanPhase('static'); return }

    let cancelled = false
    setReady(false)
    setFanPhase('idle')
    const list = swatches
    if (list.length === 0) return

    const decodes = list.map((sw) => {
      const src = sw.thumbUrl || sw.url
      if (!src) return Promise.resolve()
      const img = new Image()
      img.src = src
      return img.decode?.().catch(() => {}) ?? Promise.resolve()
    })

    let done = false
    const reveal = () => {
      if (cancelled || done) return
      done = true
      hasFanOpened = true 
      setReady(true)
      setFanPhase('armed')
    }
    Promise.allSettled(decodes).then(reveal)
    const timer = setTimeout(reveal, DECODE_TIMEOUT)

    return () => { cancelled = true; clearTimeout(timer) }
  }, [swatches])

  useEffect(() => {
    if (fanPhase !== 'armed') return
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setFanPhase('opening'))
    })
    return () => { cancelAnimationFrame(raf1); if (raf2) cancelAnimationFrame(raf2) }
  }, [fanPhase])

  useEffect(() => {
    if (fanPhase !== 'opening') return
    const total = (Math.max(n - 1, 0)) * FAN_STAGGER_MS + FAN_OPEN_MS + 80
    const t = setTimeout(() => setFanPhase('open'), total)
    return () => clearTimeout(t)
  }, [fanPhase, n])

  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen
  const firedOpenRef = useRef(false)
  useEffect(() => {
    if ((fanPhase === 'open' || fanPhase === 'static') && !firedOpenRef.current) {
      firedOpenRef.current = true
      onOpenRef.current?.()
    }
  }, [fanPhase])

  const visualRefs = useRef([])
  const clickRef = useRef(onSwatchClick)
  clickRef.current = onSwatchClick

  const applySpread = useCallback((hoveredIndex) => {
    const els = visualRefs.current
    for (let i = 0; i < els.length; i++) {
      const el = els[i]
      if (!el) continue
      let spread = 0
      if (hoveredIndex !== null && i !== hoveredIndex) {
        const dist = i - hoveredIndex
        const absDist = Math.abs(dist)
        if (absDist <= NEIGHBOR_SPREAD_RANGE) {
          const falloff = 1 - (absDist - 1) / NEIGHBOR_SPREAD_RANGE
          spread = Math.sign(dist) * NEIGHBOR_SPREAD_DEG * falloff
        }
      }
      el.style.setProperty('--spread', `${spread}deg`)
    }
  }, [])

  const bands = useMemo(() => (
    swatches.map((sw, i) => {
      const angle = n > 1 ? -MAX_ANGLE + i * step : 0
      return (
        <button
          key={sw.id || `${sw.catId}-${sw.name}`}
          type="button"
          className="ral-band"
          style={{ '--angle': `${angle}deg`, '--z': i }}
          onMouseEnter={() => { setHovered(sw); applySpread(i) }}
          onFocus={() => { setHovered(sw); applySpread(i) }}
          onMouseLeave={() => { setHovered(null); applySpread(null) }}
          onBlur={() => { setHovered(null); applySpread(null) }}
          onClick={() => clickRef.current(sw)}
          aria-label={sw.code ? `${sw.name} — ${sw.code}` : `${sw.name} — ${sw.catTitle}`}
        >
          <span
            className="ral-band__visual"
            aria-hidden="true"
            ref={(el) => { visualRefs.current[i] = el }}
            style={{ backgroundColor: sw.hex, backgroundImage: sw.thumbUri || sw.uri }}
          >
            <span className="ral-band__body" aria-hidden="true" />
            <span className="ral-band__wedge" aria-hidden="true" />
          </span>
        </button>
      )
    })
  ), [swatches, n, step, applySpread])

  return (
    <div className="ral-fan-wrap">
      <p className="ral-mobile-hint">
        <span className="ral-mobile-hint__bubble">Klik na pločicu za još informacija o boji</span>
      </p>

      <div className="ral-fan-scroll">
        <div className={`ral-fan${fanPhase === 'static' ? ' is-static' : fanPhase === 'armed' ? ' is-armed' : fanPhase === 'opening' ? ' is-opening' : ''}`} style={{ '--fan-closed': `${-(MAX_ANGLE + FAN_CLOSED_EXTRA)}deg` }}>
          {ready && (
            <>
              <span className="ral-fan__pivot" aria-hidden="true" />
              {bands}
            </>
          )}
        </div>
      </div>

      <div className={`ral-preview${hovered ? ' is-active' : ''}`}>
        {hovered ? (
          <>
            <span className="ral-preview__swatch" style={{ backgroundImage: hovered.thumbUri || hovered.uri }} />
            <span className="ral-preview__label">
              <span className="ral-preview__name">{hovered.name}</span>
              <span className="ral-preview__cat">{hovered.code || hovered.catTitle}</span>
            </span>
          </>
        ) : (
          <span className="ral-preview__hint">Pređite kursorom preko boje</span>
        )}
      </div>
    </div>
  )
}
