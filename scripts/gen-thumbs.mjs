/* Generiše sitne thumbnail-ove boja u src/assets/boje/thumbs/.
   Lepeza i grid koriste ove thumbnail-ove (brzo učitavanje), dok se pun
   original prikazuje tek u uvećanom prikazu (modal).

   Pokreni posle dodavanja novih slika u src/assets/boje/:
     npm run thumbs

   Preskače slike koje već imaju thumbnail (osim uz --force). */

import sharp from 'sharp'
import { readdir, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, extname, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC = join(__dirname, '..', 'src', 'assets', 'boje')
const OUT = join(SRC, 'thumbs')
const MAX = 640          // maks. duža strana thumbnail-a (px)
const Q = 80             // JPEG kvalitet
const FORCE = process.argv.includes('--force')

await mkdir(OUT, { recursive: true })

const files = (await readdir(SRC)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
let totalIn = 0
let totalOut = 0
let made = 0
let skipped = 0

for (const f of files) {
  const inPath = join(SRC, f)
  const outPath = join(OUT, f)
  if (!FORCE && existsSync(outPath)) { skipped++; continue }
  const ext = extname(f).toLowerCase()
  try {
    const inSize = (await stat(inPath)).size
    let pipe = sharp(inPath).resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    if (ext === '.png') pipe = pipe.png({ compressionLevel: 9, palette: true })
    else pipe = pipe.jpeg({ quality: Q, progressive: true, mozjpeg: true })
    await pipe.toFile(outPath)
    totalIn += inSize
    totalOut += (await stat(outPath)).size
    made++
  } catch (e) {
    console.error('FAIL', f, e.message)
  }
}

const mb = (n) => (n / 1048576).toFixed(1)
console.log(`Thumbnails: ${made} novih, ${skipped} preskočeno (od ${files.length}).`)
if (made) console.log(`Novi originali: ${mb(totalIn)} MB  ->  thumbs: ${mb(totalOut)} MB`)
