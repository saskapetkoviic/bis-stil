import { useMemo } from 'react'
import { woodURI } from './woodTexture.js'

const ivericaPhotos = import.meta.glob('../assets/images/iverica/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})
const ivericaPhotoList = Object.keys(ivericaPhotos)
  .sort()
  .map((path) => ivericaPhotos[path])

function hexToHsl(hex) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let hue = 0
  let s = 0
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    if (max === r) hue = ((g - b) / d) % 6
    else if (max === g) hue = (b - r) / d + 2
    else hue = (r - g) / d + 4
    hue *= 60
    if (hue < 0) hue += 360
  }
  return { h: hue, s, l }
}

export function useOrderedSwatches(categories) {
  return useMemo(() => {
    const withTexture = categories.map((cat) => {
      const catSwatches = cat.swatches
        .map((sw, i) => {
          const photoUrl = cat.id === 'iverica' ? ivericaPhotoList[i] : undefined
          return {
            ...sw,
            catId: cat.id,
            catTitle: cat.title,
            price: cat.price,
            uri: photoUrl ? `url("${photoUrl}")` : woodURI(sw.hex, sw.seed, !!sw.solid, !!sw.chip),
            hsl: hexToHsl(sw.hex),
          }
        })
        .sort((a, b) => b.hsl.l - a.hsl.l)
      const avgH = catSwatches.reduce((s, x) => s + x.hsl.h, 0) / catSwatches.length
      const avgS = catSwatches.reduce((s, x) => s + x.hsl.s, 0) / catSwatches.length
      const avgL = catSwatches.reduce((s, x) => s + x.hsl.l, 0) / catSwatches.length
      return { ...cat, swatches: catSwatches, avgH, avgS, avgL }
    })
    withTexture.sort((a, b) => {
      const aGray = a.avgS < 0.08
      const bGray = b.avgS < 0.08
      if (aGray !== bGray) return aGray ? 1 : -1
      if (aGray && bGray) return b.avgL - a.avgL
      if (Math.abs(a.avgH - b.avgH) > 6) return a.avgH - b.avgH
      return b.avgL - a.avgL
    })
    return withTexture.flatMap((cat) => cat.swatches)
  }, [categories])
}
