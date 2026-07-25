const images = import.meta.glob('../assets/images/slika*.jpg', { eager: true, import: 'default' })

function img(n) {
  const key = Object.keys(images).find((k) => k.endsWith(`/slika${n}.jpg`))
  return images[key]
}

function items(label, numbers) {
  return numbers.map((n) => ({ src: img(n), alt: `${label} — Slika ${n}` }))
}

export const categories = [
  {
    id: 'kuhinje',
    label: 'Kuhinje',
    tile: img(34),
    items: items('Kuhinja', [1, 2, 3, 4, 7, 9, 14, 16, 17, 19, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 34, 35, 37]),
  },
  {
    id: 'ormani',
    label: 'Ormani',
    tile: img(5),
    items: items('Orman', [5, 8, 13, 18, 20, 30, 33, 38, 40]),
  },
  {
    id: 'police',
    label: 'Police',
    tile: img(10),
    items: items('Polica', [10, 11, 15, 25, 39]),
  },
  {
    id: 'kreveti',
    label: 'Kreveti',
    tile: img(12),
    items: items('Krevet', [6, 12, 36]),
  },
]
