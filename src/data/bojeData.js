const modules = import.meta.glob('../assets/boje/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

const thumbModules = import.meta.glob('../assets/boje/thumbs/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})
const thumbByFile = {}
for (const [path, url] of Object.entries(thumbModules)) {
  thumbByFile[path.split('/').pop()] = url
}

const CODE_RE = /^[ADF]\d{3}$/i
const NUM_CODE_RE = /^\d{3}$/

function titleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function parse(path, url) {
  const file = path.split('/').pop()
  const thumb = thumbByFile[file] || url
  const base = file.replace(/\.[^.]+$/, '')
  const parts = base.split('_')
  const number = parseInt(parts[0], 10)

  let codeIdx = parts.findIndex((p, i) => i > 0 && CODE_RE.test(p))
  if (codeIdx === -1) {
    codeIdx = parts.findIndex((p, i) => i > 0 && NUM_CODE_RE.test(p))
  }

  let name
  let code
  let ps
  if (codeIdx === -1) {
    name = parts.slice(1).join(' ')
    code = ''
    ps = ''
  } else {
    name = parts.slice(1, codeIdx).join(' ')
    code = parts[codeIdx].toUpperCase()
    ps = parts.slice(codeIdx + 1).join(' ')
  }

  return {
    id: base,
    number: Number.isNaN(number) ? 9999 : number,
    name: titleCase(name),
    code,
    ps,
    uri: `url("${url}")`,
    url,
    thumbUrl: thumb,
    thumbUri: `url("${thumb}")`,
  }
}

export const boje = Object.entries(modules)
  .map(([path, url]) => parse(path, url))
  .sort((a, b) => a.number - b.number || a.id.localeCompare(b.id))

export const bojeFan = boje.slice(0, 30)
