import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { useOrderedSwatches } from '../../utils/orderedSwatches.js'
import './MaterialsBook.css'

function chunk(list, size) {
  const pages = []
  for (let i = 0; i < list.length; i += size) pages.push(list.slice(i, i + size))
  return pages
}

const SHRINK_BELOW = 620
const GROW_ABOVE = 700

function nextPageSize(prevSize, height) {
  if (prevSize === 3) return height > GROW_ABOVE ? 4 : 3
  return height < SHRINK_BELOW ? 3 : 4
}

const ITEM_H = { 3: 118, 4: 92 }
const GRID_GAP = 10
const PAD_TOP = 8
const PAD_BOTTOM = 20

const PAGE_W = 230
const MIN_W = 190
const MAX_W = 280

const RESIZE_DEBOUNCE_MS = 250

const FLIP_TIME = 550

export default function MaterialsBook({ categories, onSwatchClick }) {
  const swatches = useOrderedSwatches(categories)
  const [pageSize, setPageSize] = useState(() => nextPageSize(4, window.innerHeight))
  const bookRef = useRef(null)
  const [index, setIndex] = useState(0)
  const flippingRef = useRef(false)
  const flipTimerRef = useRef(null)

  const endFlip = useCallback(() => {
    flippingRef.current = false
    if (flipTimerRef.current) { clearTimeout(flipTimerRef.current); flipTimerRef.current = null }
    document.documentElement.classList.remove('is-book-flipping')
  }, [])

  useEffect(() => {
    let timer
    function onResize() {
      clearTimeout(timer)
      timer = setTimeout(() => {
        setPageSize((prev) => nextPageSize(prev, window.innerHeight))
      }, RESIZE_DEBOUNCE_MS)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const contentPages = useMemo(() => chunk(swatches, pageSize), [swatches, pageSize])
  const pageCount = contentPages.length + 2 // + prednja i zadnja korica
  const itemH = ITEM_H[pageSize] ?? ITEM_H[4]
  const pageHeight = pageSize * itemH + (pageSize - 1) * GRID_GAP + PAD_TOP + PAD_BOTTOM

  useEffect(() => { setIndex(0); endFlip() }, [pageSize, endFlip])

  useEffect(() => endFlip, [endFlip])

  const handleFlip = useCallback((e) => {
    setIndex(e.data)
    endFlip()
  }, [endFlip])

  const handleChangeState = useCallback((e) => {
    if (e.data === 'read') endFlip()
  }, [endFlip])

  const pinScroll = useCallback(() => {
    const y = window.scrollY
    const deadline = performance.now() + FLIP_TIME + 250
    const hold = () => {
      if (!flippingRef.current || performance.now() > deadline) return
      if (window.scrollY !== y) window.scrollTo({ top: y, left: 0, behavior: 'instant' })
      requestAnimationFrame(hold)
    }
    requestAnimationFrame(hold)
  }, [])

  const beginFlip = useCallback(() => {
    flippingRef.current = true
    document.documentElement.classList.add('is-book-flipping')
    if (flipTimerRef.current) clearTimeout(flipTimerRef.current)
    flipTimerRef.current = setTimeout(endFlip, FLIP_TIME + 250)
  }, [endFlip])

  const goNext = useCallback(() => {
    if (flippingRef.current || index === pageCount - 1) return
    beginFlip()
    pinScroll()
    bookRef.current?.pageFlip()?.flipNext()
  }, [index, pageCount, pinScroll, beginFlip])
  const goPrev = useCallback(() => {
    if (flippingRef.current || index === 0) return
    beginFlip()
    pinScroll()
    bookRef.current?.pageFlip()?.flipPrev()
  }, [index, pinScroll, beginFlip])

  const suppressFocusScroll = useCallback((e) => e.preventDefault(), [])

  if (pageCount === 0) return null

  let indicatorLabel
  if (index === 0) indicatorLabel = 'Naslovna strana'
  else if (index === pageCount - 1) indicatorLabel = 'Zadnja korica'
  else indicatorLabel = `str. ${index} od ${contentPages.length}`

  return (
    <div className="book-wrap">

      <div className="book-stage">
        <button
          type="button"
          className="book-arrow book-arrow--prev"
          onClick={goPrev}
          onPointerDown={suppressFocusScroll}
          aria-disabled={index === 0}
          aria-label="Prethodna stranica"
        >
          ‹
        </button>

        <div className="book-flip-wrap" style={{ '--page-h': `${pageHeight}px` }}>
          <HTMLFlipBook
            key={pageSize}
            ref={bookRef}
            width={PAGE_W}
            height={pageHeight}
            size="stretch"
            minWidth={MIN_W}
            maxWidth={MAX_W}
            minHeight={Math.round(pageHeight * (MIN_W / PAGE_W))}
            maxHeight={Math.round(pageHeight * (MAX_W / PAGE_W))}
            showCover
            drawShadow
            maxShadowOpacity={0.5}
            flippingTime={FLIP_TIME}
            usePortrait
            swipeDistance={30}
            mobileScrollSupport={false}
            className="materials-flipbook"
            onFlip={handleFlip}
            onChangeState={handleChangeState}
          >
            <div className="book-page">
              <div className="book-cover-face">
                <h2 className="book-cover__title">BIS-STIL</h2>
                <span className="book-cover__rule" aria-hidden="true" />
                <p className="book-cover__subtitle">Katalog materijala</p>
                <p className="book-cover__hint">Dodirnite strelicu → za pregled boja</p>
              </div>
            </div>

            {contentPages.map((page, i) => (
              <div className="book-page" key={i}>
                <div className="book-paper">
                  <div className="book-paper__swatches" data-count={page.length}>
                    {page.map((sw) => (
                      <button
                        key={`${sw.catId}-${sw.name}`}
                        type="button"
                        className="swatch-chip"
                        onClick={() => onSwatchClick(sw)}
                        aria-label={`${sw.name} — ${sw.catTitle}`}
                      >
                        <span
                          className="swatch-chip__band"
                          aria-hidden="true"
                          style={{ backgroundColor: sw.hex, backgroundImage: sw.uri }}
                        />
                        <span className="swatch-chip__tag">
                          <span className="swatch-chip__cat">{sw.catTitle}</span>
                          <span className="swatch-chip__name">{sw.name}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <span className="book-paper__pageno">{i + 1}</span>
                </div>
              </div>
            ))}

            <div className="book-page">
              <div className="book-cover-face">
                <h2 className="book-cover__title">BIS-STIL</h2>
                <span className="book-cover__rule" aria-hidden="true" />
                <p className="book-cover__subtitle">Nameštaj za savremeni život</p>
                <p className="book-cover__hint">Za kompletan izbor nas kontaktirajte</p>
              </div>
            </div>
          </HTMLFlipBook>
        </div>

        <button
          type="button"
          className="book-arrow book-arrow--next"
          onClick={goNext}
          onPointerDown={suppressFocusScroll}
          aria-disabled={index === pageCount - 1}
          aria-label="Sledeća stranica"
        >
          ›
        </button>
      </div>

      <div className="book-indicator" aria-live="polite">
        {indicatorLabel}
      </div>
    </div>
  )
}
