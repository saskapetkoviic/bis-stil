import { useEffect, useMemo, useRef, useState } from 'react'
import { useOrderedSwatches } from '../../utils/orderedSwatches.js'
import './MaterialsGrid.css'

export default function MaterialsGrid({ categories, onSwatchClick }) {
  const swatches = useOrderedSwatches(categories)
  const [activeCat, setActiveCat] = useState('all')
  const [open, setOpen] = useState(false)
  const filterRef = useRef(null)

  const options = useMemo(
    () => [
      { id: 'all', title: 'Prikaži sve' },
      ...categories.map((cat) => ({ id: cat.id, title: cat.title })),
    ],
    [categories],
  )

  const activeLabel = options.find((o) => o.id === activeCat)?.title ?? 'Prikaži sve'

  const visibleSwatches =
    activeCat === 'all' ? swatches : swatches.filter((sw) => sw.catId === activeCat)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function selectCat(id) {
    setActiveCat(id)
    setOpen(false)
  }

  return (
    <div className="materials-grid-wrap">
      <div className="materials-filter" ref={filterRef}>
        <button
          type="button"
          className={`materials-filter__toggle${open ? ' is-open' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="materials-filter__label">Filteri</span>
          <span className="materials-filter__value">{activeLabel}</span>
          <span className="materials-filter__caret" aria-hidden="true" />
        </button>

        {open && (
          <ul className="materials-filter__menu" role="listbox" aria-label="Kategorije boja">
            {options.map((opt) => (
              <li key={opt.id} role="option" aria-selected={activeCat === opt.id}>
                <button
                  type="button"
                  className={`materials-filter__item${activeCat === opt.id ? ' is-active' : ''}`}
                  onClick={() => selectCat(opt.id)}
                >
                  {opt.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="materials-grid">
        {visibleSwatches.map((sw) => (
          <button
            key={`${sw.catId}-${sw.name}`}
            type="button"
            className="material-tile"
            onClick={() => onSwatchClick(sw)}
            aria-label={`${sw.name} — ${sw.catTitle}`}
          >
            <span
              className="material-tile__swatch"
              aria-hidden="true"
              style={{ backgroundColor: sw.hex, backgroundImage: sw.uri }}
            />
            <span className="material-tile__tag">
              <span className="material-tile__cat">{sw.catTitle}</span>
              <span className="material-tile__name">{sw.name}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
