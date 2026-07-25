import { useEffect } from 'react'
import './Lightbox.css'

export default function Lightbox({ images, currentIndex, isOpen, onClose, onPrev, onNext }) {
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'

    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onNext()
      else if (e.key === 'ArrowLeft') onPrev()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose, onPrev, onNext])

  const image = isOpen && images.length ? images[currentIndex] : null
  const multiple = images.length > 1

  return (
    <div
      className={`lightbox${isOpen ? ' is-open' : ''}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Uvećana slika"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button className="lightbox__close" type="button" aria-label="Zatvori" onClick={onClose}>×</button>
      <div className="lightbox__stage" onClick={(e) => e.stopPropagation()}>
        <button
          className="lightbox__nav lightbox__prev"
          type="button"
          aria-label="Prethodna slika"
          style={{ display: multiple ? '' : 'none' }}
          onClick={(e) => { e.stopPropagation(); onPrev() }}
        >
          &#60;
        </button>
        <img className="lightbox__img" src={image ? image.src : ''} alt={image ? image.alt : ''} />
        <button
          className="lightbox__nav lightbox__next"
          type="button"
          aria-label="Sledeća slika"
          style={{ display: multiple ? '' : 'none' }}
          onClick={(e) => { e.stopPropagation(); onNext() }}
        >
          &#62;
        </button>
      </div>
    </div>
  )
}
