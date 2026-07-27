import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import video1 from '../../assets/videos/video1.mp4'
import video2 from '../../assets/videos/video2.mp4'
import video3 from '../../assets/videos/video3.mp4'
import video1reversed from '../../assets/videos/video1reversed.mp4'
import video2reversed from '../../assets/videos/video2reversed.mp4'
import video3reversed from '../../assets/videos/video3reversed.mp4'
import video1poster from '../../assets/videos/video1-poster.jpg'
import './ScrollVideoHero.css'

export default function ScrollVideoHero() {
  const containerRef = useRef(null)
  const fillRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const videos = Array.prototype.slice.call(container.querySelectorAll('.scroll-video[data-video]'))
    const revVideos = Array.prototype.slice.call(container.querySelectorAll('.scroll-video[data-rev]'))
    const allVideos = videos.concat(revVideos)
    const fill = fillRef.current
    const checkpoints = Array.prototype.slice.call(container.querySelectorAll('.checkpoint'))

    const N = videos.length
    const durations = new Array(N)
    const readyFlags = new Array(N)
    let allLoaded = false

    const tailTrim = new Array(N).fill(0)
    tailTrim[N - 1] = 0.2

    const headTrim = new Array(N).fill(0)

    const R = revVideos.length
    const revDur = new Array(R)
    const revReady = new Array(R)
    const revHead = new Array(R).fill(0)
    const revTail = new Array(R).fill(0)

    let idx = 0
    let pos = 'start'
    let animating = false
    let released = false
    let playingEl = null

    const cleanups = []

    function onPlayGuard(v) {
      function handler() {
        if (!animating || v !== playingEl) v.pause()
      }
      v.addEventListener('play', handler)
      cleanups.push(() => v.removeEventListener('play', handler))
    }

    allVideos.forEach((v) => {
      v.pause()
      onPlayGuard(v)
    })

    function headOf(i) { return headTrim[i] || 0 }
    function durationOf(i) {
      const d = durations[i] || videos[i].duration || 0
      return Math.max(0, d - (tailTrim[i] || 0))
    }
    function revHeadOf(r) { return revHead[r] || 0 }
    function revEndOf(r) {
      const d = revDur[r] || revVideos[r].duration || 0
      return Math.max(0, d - (revTail[r] || 0))
    }

    function onReadyFor(i) {
      if (readyFlags[i]) return
      const v = videos[i]
      const d = v.duration || 0
      if (!d) return
      readyFlags[i] = true
      durations[i] = d
      try { v.currentTime = headOf(i) } catch (e) {}
      if (i === 0) setProgressFor(0)
      checkAllLoaded()
    }

    function onRevReadyFor(r) {
      if (revReady[r]) return
      const v = revVideos[r]
      const d = v.duration || 0
      if (!d) return
      revReady[r] = true
      revDur[r] = d
      try { v.currentTime = revHeadOf(r) } catch (e) {}
      checkAllLoaded()
    }

    // Scrubbing needs every clip (forward and reversed) buffered, otherwise
    // scrolling into an unloaded segment shows a black/frozen frame. So the
    // hero stays locked until all videos are ready, then reveals the scroll
    // hint to invite scrolling.
    let readyFallback = null
    function markReady() {
      if (allLoaded) return
      allLoaded = true
      if (readyFallback) { clearTimeout(readyFallback); readyFallback = null }
      const hint = container.querySelector('.scroll-hint')
      if (hint) hint.classList.add('is-ready')
    }
    function checkAllLoaded() {
      for (let i = 0; i < N; i++) if (!readyFlags[i]) return
      for (let r = 0; r < R; r++) if (!revReady[r]) return
      markReady()
    }

    function armForward(i) {
      const v = videos[i]
      const onMeta = () => onReadyFor(i)
      const onCanPlay = () => onReadyFor(i)
      v.addEventListener('loadedmetadata', onMeta)
      v.addEventListener('canplay', onCanPlay)
      cleanups.push(() => {
        v.removeEventListener('loadedmetadata', onMeta)
        v.removeEventListener('canplay', onCanPlay)
      })
      if (v.readyState >= 1 && v.duration) onReadyFor(i)
    }

    function armReversed(r) {
      const v = revVideos[r]
      const onMeta = () => onRevReadyFor(r)
      const onCanPlay = () => onRevReadyFor(r)
      v.addEventListener('loadedmetadata', onMeta)
      v.addEventListener('canplay', onCanPlay)
      cleanups.push(() => {
        v.removeEventListener('loadedmetadata', onMeta)
        v.removeEventListener('canplay', onCanPlay)
      })
      if (v.readyState >= 1 && v.duration) onRevReadyFor(r)
    }

    let cancelled = false
    const abortController = new AbortController()
    const createdUrls = []
    function loadToBlob(v, onArm) {
      const srcUrl = v.getAttribute('data-src')
      if (!srcUrl || !window.fetch) { onArm(); return }
      fetch(srcUrl, { signal: abortController.signal })
        .then((r) => { if (!r.ok) throw new Error('http ' + r.status); return r.blob() })
        .then((blob) => {
          if (cancelled) return
          const url = URL.createObjectURL(blob)
          createdUrls.push(url)
          v.src = url
          v.load()
          onArm()
        })
        .catch(() => { if (!cancelled) onArm() })
    }

    // Load every clip up front (as blobs, for smooth scrubbing in both
    // directions). The hero stays locked until they are all ready.
    videos.forEach((v, i) => loadToBlob(v, () => armForward(i)))
    revVideos.forEach((v, r) => loadToBlob(v, () => armReversed(r)))

    // Safety net: unlock even if a clip never loads, so the hero can't stay
    // locked forever on a flaky connection.
    readyFallback = setTimeout(markReady, 15000)
    cleanups.push(() => { if (readyFallback) clearTimeout(readyFallback) })

    function clamp01(p) { return Math.max(0, Math.min(1, p)) }
    function setProgressOverall(overall) {
      fill.style.width = (clamp01(overall) * 100).toFixed(2) + '%'
    }
    function setProgressFor(frac) { setProgressOverall((idx + clamp01(frac)) / N) }

    function setActiveEl(el) {
      allVideos.forEach((v) => v.classList.toggle('is-active', v === el))
    }
    function setActive(i) { setActiveEl(videos[i]); idx = i }

    function whenFramePainted(v, cb) {
      let done = false
      const finish = () => {
        if (done) return
        done = true
        clearTimeout(timer)
        cb()
      }
      const timer = setTimeout(finish, 120)
      if (typeof v.requestVideoFrameCallback === 'function') {
        v.requestVideoFrameCallback(() => finish())
      } else {
        v.addEventListener('seeked', finish, { once: true })
      }
    }

    function stopKey() { return idx + ':' + pos }
    function showCheckpointForRest() {
      const key = stopKey()
      checkpoints.forEach((c) => c.classList.toggle('is-visible', c.getAttribute('data-stop') === key))
    }
    function hideBoth() {
      checkpoints.forEach((c) => c.classList.remove('is-visible'))
    }

    function holdTop() {
      if (!released && window.scrollY !== 0) window.scrollTo(0, 0)
    }

    function playForward(onDone) {
      animating = true
      hideBoth()
      const v = videos[idx]
      playingEl = v
      const start = headOf(idx)
      const d = durationOf(idx)
      const span = Math.max(0.0001, d - start)

      function tick() {
        if (!animating) return
        setProgressFor((v.currentTime - start) / span)
        if (v.currentTime >= d - 0.06 || v.ended) {
          v.pause()
          try { v.currentTime = d - 0.03 } catch (e) {}
          onDone()
        } else {
          requestAnimationFrame(tick)
        }
      }

      const p = v.play()
      if (p && p.catch) p.catch(() => onDone())
      requestAnimationFrame(tick)
    }

    function playReversed(r, onDone) {
      const v = revVideos[r]
      if (!v || !revReady[r]) { onDone(); return }

      animating = true
      hideBoth()
      playingEl = v
      const start = revHeadOf(r)
      const end = revEndOf(r)
      const span = Math.max(0.0001, end - start)

      try { v.currentTime = start } catch (e) {}

      function tick() {
        if (!animating) return
        const f = clamp01((v.currentTime - start) / span)
        setProgressOverall((r + (1 - f)) / N)
        if (v.currentTime >= end - 0.06 || v.ended) {
          v.pause()
          onDone()
        } else {
          requestAnimationFrame(tick)
        }
      }

      whenFramePainted(v, () => {
        if (!animating) return
        setActiveEl(v)
        const p = v.play()
        if (p && p.catch) p.catch(() => onDone())
        requestAnimationFrame(tick)
      })
    }

    function goForward() {
      if (pos === 'start') {
        playForward(() => {
          animating = false
          pos = 'end'
          setProgressFor(1)
          showCheckpointForRest()
        })
      } else if (idx < N - 1) {
        const next = idx + 1
        const nv = videos[next]
        animating = true
        hideBoth()
        try { nv.currentTime = headOf(next) } catch (e) {}
        whenFramePainted(nv, () => {
          setActive(next)
          pos = 'start'
          playForward(() => {
            animating = false
            pos = 'end'
            setProgressFor(1)
            showCheckpointForRest()
          })
        })
      }
    }

    function goBackward() {
      if (pos === 'start') return

      if (idx === 0) {
        playReversed(0, () => {
          const v = videos[0]
          try { v.currentTime = headOf(0) } catch (e) {}
          whenFramePainted(v, () => {
            setActive(0)
            pos = 'start'
            animating = false
            setProgressFor(0)
            showCheckpointForRest()
          })
        })
      } else {
        const prev = idx - 1
        playReversed(idx, () => {
          const pv = videos[prev]
          try { pv.currentTime = durationOf(prev) - 0.03 } catch (e) {}
          whenFramePainted(pv, () => {
            setActive(prev)
            pos = 'end'
            animating = false
            setProgressFor(1)
            showCheckpointForRest()
          })
        })
      }
    }

    function handleIntent(direction) {
      if (!allLoaded || animating) return true

      if (released) {
        if (direction < 0 && window.scrollY <= 0) {
          released = false
          return true
        }
        return false
      }

      if (direction > 0) {
        if (pos === 'end' && idx === N - 1) { released = true; return false }
        goForward()
        return true
      } else if (direction < 0) {
        goBackward()
        return true
      }
      return true
    }

    function onWheel(e) {
      if (Math.abs(e.deltaY) < 1) return
      const consumed = handleIntent(e.deltaY > 0 ? 1 : -1)
      if (consumed) e.preventDefault()
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    cleanups.push(() => window.removeEventListener('wheel', onWheel))

    let touchY = null
    let touchArmed = true
    function onTouchStart(e) {
      touchY = e.touches[0].clientY
      touchArmed = true
    }
    function onTouchMove(e) {
      if (touchY === null) return
      const dy = touchY - e.touches[0].clientY
      if (!released) e.preventDefault()
      if (touchArmed && Math.abs(dy) > 36) {
        touchArmed = false
        handleIntent(dy > 0 ? 1 : -1)
      }
    }
    function onTouchEnd() { touchY = null }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    cleanups.push(() => window.removeEventListener('touchstart', onTouchStart))
    cleanups.push(() => window.removeEventListener('touchmove', onTouchMove))
    cleanups.push(() => window.removeEventListener('touchend', onTouchEnd))

    function onKeyDown(e) {
      const down = e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar'
      const up = e.key === 'ArrowUp' || e.key === 'PageUp'
      if (!down && !up) return
      const consumed = handleIntent(down ? 1 : -1)
      if (consumed) e.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    cleanups.push(() => window.removeEventListener('keydown', onKeyDown))

    window.addEventListener('scroll', holdTop, { passive: true })
    cleanups.push(() => window.removeEventListener('scroll', holdTop))

    showCheckpointForRest()

    return () => {
      cancelled = true
      animating = false
      abortController.abort()
      cleanups.forEach((fn) => fn())
      createdUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  return (
    <section className="scroll-stage" id="stage" ref={containerRef}>
      <div className="scroll-sticky">
        <video className="scroll-video is-active" data-video="0" data-src={video1} poster={video1poster} muted playsInline preload="auto" aria-hidden="true" />
        <video className="scroll-video" data-video="1" data-src={video2} muted playsInline preload="auto" aria-hidden="true" />
        <video className="scroll-video" data-video="2" data-src={video3} muted playsInline preload="auto" aria-hidden="true" />

        <video className="scroll-video" data-rev="0" data-src={video1reversed} muted playsInline preload="auto" aria-hidden="true" />
        <video className="scroll-video" data-rev="1" data-src={video2reversed} muted playsInline preload="auto" aria-hidden="true" />
        <video className="scroll-video" data-rev="2" data-src={video3reversed} muted playsInline preload="auto" aria-hidden="true" />

        <div className="scrim" />

        <div className="checkpoint checkpoint--left" data-stop="0:start">
          <div className="checkpoint__body">
            <p className="eyebrow"></p>
            <h1>Nameštaj po Vašoj meri.</h1>
            <p className="lead">
              BIS-STIL je samostalna zanatska trgovinska radnja koja posluje od 2004. godine — bavi se izradom nameštaja po meri od pločastog materijala iverice i medijapana,
              uslužnim sečenjem medijapana i iverice, kao i uslužnim kantovanjem PVC i ABS trakom. 
            </p>
            <div className="scroll-hint" aria-hidden="true">
              <span>Skrolujte za više</span>
              <span className="arrow">↓</span>
            </div>
          </div>
        </div>

        <div className="checkpoint checkpoint--right" data-stop="0:end">
          <div className="checkpoint__body">
            <p className="eyebrow">Korak prvi — Materijal</p>
            <h2>Sve počinje od izbora materijala.</h2>
            <p className="lead">
              Svaki komad nameštaja počinje izborom materijala. Radimo sa ivericom u širokom izboru dekora i boja. 
              Materijal biramo zajedno sa Vama, prema prostoru, nameni i budžetu, jer dobar temelj je preduslov za dobar rezultat.
            </p>
          </div>
        </div>

        <div className="checkpoint checkpoint--left" data-stop="1:end">
          <div className="checkpoint__body">
            <p className="eyebrow">Korak drugi — Spajanje</p>
            <h2>Sečeno, uklapano<br />i oblikovano ručno.</h2>
            <p className="lead">
              Svaki spoj se meri, seče i uklapa na radnom stolu, a montaža se radi na licu mesta. Konstrukcija se
              oblikuje polako, dok svaki deo ne legne tačno tamo gde treba, čvrsto i precizno.
            </p>
          </div>
        </div>

        <div className="checkpoint checkpoint--right" data-stop="2:end">
          <div className="checkpoint__body">
            <p className="eyebrow">Gotov komad</p>
            <h2>Oplemenjena iverica, oblikovana za Vaš dom.</h2>
            <p className="lead">
              Napravljeno da se savršeno uklapa u Vaš prostor. Snimci na ovoj stranici
              prikazuju neke od proizvoda naše firme, a u <Link to="/galerija">Galeriji</Link> Vas čeka još
              fotografija - svaka je rezultat desetina sati rada.
            </p>
          </div>
        </div>

        <div className="progress" aria-hidden="true"><span className="progress__fill" ref={fillRef}></span></div>
      </div>
    </section>
  )
}
