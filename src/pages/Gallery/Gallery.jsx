import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/PageLayout/PageLayout.jsx'
import GalleryCategories from '../../components/GalleryCategories/GalleryCategories.jsx'
import Lightbox from '../../components/Lightbox/Lightbox.jsx'
import { categories } from '../../data/galleryData.js'
import './Gallery.css'

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const sectionRef = useRef(null)

  const activeCat = categories.find((c) => c.id === activeCategory) || null
  const items = activeCat ? activeCat.items : []

  function handleSelect(id) {
    setActiveCategory((current) => (current === id ? null : id))
  }

  useEffect(() => {
    if (activeCategory && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeCategory])

  return (
    <PageLayout variant="gallery">
      <div className="page-head">
        <p className="eyebrow">Naši radovi</p>
        <h1>Galerija</h1>
        <p>
          Od skice do gotovog proizvoda. Bavimo se izradom kuhinja, ormana,
          stolova, TV polica, kreveta i drugih komada nameštaja po želji klijenata. U galeriji su prikazani neki od naših
          radova, a za više informacija o izradi i cenama, možete nas kontaktirati na{' '}
          <Link to="/kontakt">Kontakt</Link>.
        </p>
      </div>

      <GalleryCategories categories={categories} activeCategory={activeCategory} onSelect={handleSelect} />

      {activeCat && (
        <section className="gallery-section" id={activeCat.id} ref={sectionRef}>
          <h2>{activeCat.label}</h2>
          <div className="gallery">
            {activeCat.items.map((item, i) => (
              <div
                className="gallery__item has-image"
                key={item.alt}
                style={{ '--i': i }}
                onClick={() => setLightboxIndex(i)}
              >
                <img src={item.src} alt={item.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}

      <button
        className="back-link"
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑ Nazad na vrh
      </button>

      <Lightbox
        images={items}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onPrev={() => setLightboxIndex((i) => (i - 1 + items.length) % items.length)}
        onNext={() => setLightboxIndex((i) => (i + 1) % items.length)}
      />
    </PageLayout>
  )
}
