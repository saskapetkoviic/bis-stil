import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/PageLayout/PageLayout.jsx'
import MaterialsCatalog from '../../components/MaterialsCatalog/MaterialsCatalog.jsx'
import BojeGrid from '../../components/BojeGrid/BojeGrid.jsx'
import MaterialModal from '../../components/MaterialModal/MaterialModal.jsx'
import { boje, bojeFan } from '../../data/bojeData.js'
import './Materials.css'

export default function Materials() {
  const [modalSwatches, setModalSwatches] = useState(null)
  const [modalIndex, setModalIndex] = useState(-1)
  const [showAll, setShowAll] = useState(false)
  const [fanReady, setFanReady] = useState(false)
  const gridRef = useRef(null)
  const scrollAfterExpand = useRef(false)

  useEffect(() => {
    if (showAll && scrollAfterExpand.current) {
      scrollAfterExpand.current = false
      requestAnimationFrame(() => {
        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [showAll])

  function showAllAndScroll() {
    scrollAfterExpand.current = true
    setShowAll(true)
  }

  function openSwatch(swatch, list) {
    const idx = list.findIndex((s) => s.id === swatch.id)
    setModalSwatches(list)
    setModalIndex(idx < 0 ? 0 : idx)
  }

  function navigate(dir) {
    setModalIndex((i) => {
      if (!modalSwatches || modalSwatches.length === 0) return i
      const n = modalSwatches.length
      return (i + dir + n) % n
    })
  }

  function closeModal() {
    setModalIndex(-1)
    setModalSwatches(null)
  }

  return (
    <PageLayout variant="materials">
      <div className="page-head">
        <p className="eyebrow">Materijali</p>
        <h1>Katalog boja</h1>
        <p className="mat-intro mat-intro--desktop">
          Svaki komad počinje od izbora iverice. Za kompletan asortiman
          boja možete kliknuti na dugme +Prikaži sve, a za uvećan prikaz i naziv kliknite na pločicu. Ukoliko imate pitanja, možete nas kontaktirati na{' '}
          <Link to="/kontakt">Kontakt</Link>.
        </p>
        <p className="mat-intro mat-intro--mobile">
          Svaki komad počinje od izbora iverice. Prikazan je kompletan asortiman
          boja, a za uvećan prikaz i naziv kliknite na pločicu. Ukoliko imate
          pitanja, možete nas kontaktirati na{' '}
          <Link to="/kontakt">Kontakt</Link>.
        </p>
      </div>

      <div className={`boje-catalog${showAll ? ' is-expanded' : ''}`}>
        {!showAll && (
          <div className={`boje-showall boje-showall--top${fanReady ? ' is-visible' : ''}`}>
            <button
              className="boje-showall__btn"
              type="button"
              aria-expanded={showAll}
              onClick={showAllAndScroll}
            >
              + Prikaži sve
            </button>
          </div>
        )}

        <div className="materials-fan-only">
          <MaterialsCatalog swatches={bojeFan} onSwatchClick={(sw) => openSwatch(sw, bojeFan)} onOpen={() => setFanReady(true)} />
        </div>
        <div className="materials-grid-mobile">
          <BojeGrid swatches={boje} onSwatchClick={(sw) => openSwatch(sw, boje)} />
        </div>

        {showAll && (
          <section className="boje-section" ref={gridRef}>
            <h2>Kompletan asortiman boja</h2>
            <div className="boje-fullgrid">
              <BojeGrid swatches={boje} onSwatchClick={(sw) => openSwatch(sw, boje)} />
            </div>
            <div className="boje-showall">
              <button
                className="boje-showall__btn"
                type="button"
                aria-expanded={showAll}
                onClick={() => setShowAll(false)}
              >
                − Prikaži manje
              </button>
            </div>
          </section>
        )}
      </div>

      <button
        className="back-link"
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑ Nazad na vrh
      </button>

      <MaterialModal
        swatches={modalSwatches}
        index={modalIndex}
        onNavigate={navigate}
        onClose={closeModal}
      />
    </PageLayout>
  )
}
