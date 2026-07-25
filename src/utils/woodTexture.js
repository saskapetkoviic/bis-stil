function toRGB(hex) {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
}

function clamp(n) {
  return Math.max(0, Math.min(255, Math.round(n)))
}

function shade(hex, amt) {
  const c = toRGB(hex)
  const t = amt < 0 ? 0 : 255
  const p = Math.abs(amt)
  return `rgb(${clamp(c.r + (t - c.r) * p)},${clamp(c.g + (t - c.g) * p)},${clamp(c.b + (t - c.b) * p)})`
}

const W = 100
const H = 350

function chipboardURI(hex, seed) {
  const base = hex
  const fleckLight = shade(hex, 0.32)
  const fleckLight2 = shade(hex, 0.18)
  const fleckDark = shade(hex, -0.34)
  const fleckDark2 = shade(hex, -0.2)
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='" + W + "' height='" + H + "' viewBox='0 0 " + W + " " + H + "' preserveAspectRatio='none'>" +
      "<defs>" +
        "<filter id='cbCoarse'>" +
          "<feTurbulence type='fractalNoise' baseFrequency='0.09 0.05' numOctaves='2' seed='" + seed + "' result='n'/>" +
          "<feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 4.5 -2.1'/>" +
        "</filter>" +
        "<filter id='cbFineDark'>" +
          "<feTurbulence type='fractalNoise' baseFrequency='0.35 0.16' numOctaves='2' seed='" + (seed + 3) + "' result='n'/>" +
          "<feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 6 -3.2'/>" +
        "</filter>" +
        "<filter id='cbFineLight'>" +
          "<feTurbulence type='fractalNoise' baseFrequency='0.4 0.2' numOctaves='2' seed='" + (seed + 9) + "' result='n'/>" +
          "<feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 6 -3.4'/>" +
        "</filter>" +
      "</defs>" +
      "<rect width='" + W + "' height='" + H + "' fill='" + base + "'/>" +
      "<rect width='" + W + "' height='" + H + "' fill='" + fleckDark2 + "' filter='url(#cbCoarse)' opacity='0.45'/>" +
      "<rect width='" + W + "' height='" + H + "' fill='" + fleckDark + "' filter='url(#cbFineDark)' opacity='0.5'/>" +
      "<rect width='" + W + "' height='" + H + "' fill='" + fleckLight2 + "' filter='url(#cbFineLight)' opacity='0.45'/>" +
      "<rect width='" + W + "' height='" + H + "' fill='" + fleckLight + "' filter='url(#cbFineLight)' opacity='0.28'/>" +
    "</svg>"
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
}

export function woodURI(hex, seed, solid, chip) {
  const base = hex
  let svg

  if (chip) {
    return chipboardURI(hex, seed)
  } else if (solid) {
    svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='" + W + "' height='" + H + "' viewBox='0 0 " + W + " " + H + "' preserveAspectRatio='none'>" +
        "<defs><filter id='n'>" +
          "<feTurbulence type='fractalNoise' baseFrequency='0.12 0.05' numOctaves='2' seed='" + seed + "' result='t'/>" +
          "<feColorMatrix in='t' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0'/>" +
        "</filter></defs>" +
        "<rect width='" + W + "' height='" + H + "' fill='" + base + "'/>" +
        "<rect width='" + W + "' height='" + H + "' filter='url(#n)'/>" +
      "</svg>"
  } else {
    const grain = shade(hex, -0.24)
    const grain2 = shade(hex, -0.14)
    svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='" + W + "' height='" + H + "' viewBox='0 0 " + W + " " + H + "' preserveAspectRatio='none'>" +
        "<defs>" +
          "<filter id='w'>" +
            "<feTurbulence type='fractalNoise' baseFrequency='0.2 0.01' numOctaves='3' seed='" + seed + "' result='t'/>" +
            "<feColorMatrix in='t' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.9 -0.4'/>" +
          "</filter>" +
          "<filter id='w2'>" +
            "<feTurbulence type='fractalNoise' baseFrequency='0.06 0.006' numOctaves='2' seed='" + (seed + 7) + "' result='t2'/>" +
            "<feColorMatrix in='t2' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.8 -0.3'/>" +
          "</filter>" +
        "</defs>" +
        "<rect width='" + W + "' height='" + H + "' fill='" + base + "'/>" +
        "<rect width='" + W + "' height='" + H + "' fill='" + grain + "' filter='url(#w)' opacity='0.5'/>" +
        "<rect width='" + W + "' height='" + H + "' fill='" + grain2 + "' filter='url(#w2)' opacity='0.4'/>" +
      "</svg>"
  }

  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
}
