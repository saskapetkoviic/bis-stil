import { useEffect, useRef } from 'react'
import './MaterialModal.css'

export default function MaterialModal({ swatches, index, onNavigate, onClose }) {
  const isOpen = Array.isArray(swatches) && index >= 0 && !!swatches[index]
  const data = isOpen ? swatches[index] : null
  const closeBtnRef = useRef(null)
  const lastFocusRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    lastFocusRef.current = document.activeElement
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onNavigate(-1)
      else if (e.key === 'ArrowRight') onNavigate(1)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
      if (lastFocusRef.current?.focus) lastFocusRef.current.focus()
    }
  }, [isOpen, onClose, onNavigate])

  const canNavigate = isOpen && swatches.length > 1

  return (
    <div
      className={`mat-modal${isOpen ? ' is-open' : ''}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-labelledby="matModalName"
    >
      <div className="mat-modal__backdrop" onClick={onClose} />

      {canNavigate && (
        <button
          className="mat-modal__nav mat-modal__nav--prev"
          type="button"
          aria-label="Prethodna boja"
          onClick={() => onNavigate(-1)}
        >
          &#60;
        </button>
      )}
      {canNavigate && (
        <button
          className="mat-modal__nav mat-modal__nav--next"
          type="button"
          aria-label="Sledeća boja"
          onClick={() => onNavigate(1)}
        >
          &#62;
        </button>
      )}

      <div className="mat-modal__card">
        <button className="mat-modal__close" type="button" aria-label="Zatvori" onClick={onClose} ref={closeBtnRef}>
          &times;
        </button>

        <div className="mat-modal__media">
          <span className="mat-modal__img" aria-hidden="true" style={{ backgroundImage: data?.uri }} />
        </div>
        <div className="mat-modal__body">
          <h3 className="mat-modal__name" id="matModalName">{data?.name}</h3>
          {data?.code && (
            <p className="mat-modal__sifra">
              Šifra: <strong>{data.code}</strong>
            </p>
          )}
          {data?.ps && <p className="mat-modal__ps">{data.ps}</p>}
          <p className="mat-modal__note">
            Napomena: Prikazane nijanse mogu se razlikovati na sajtu u odnosu na
            stvarni izgled uživo.
          </p>
        </div>
      </div>
    </div>
  )
}
