import './GalleryCategories.css'

export default function GalleryCategories({ categories, activeCategory, onSelect }) {
  return (
    <div className="cat-tiles">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`cat-tile${activeCategory === cat.id ? ' is-active' : ''}`}
          type="button"
          aria-pressed={activeCategory === cat.id}
          onClick={() => onSelect(cat.id)}
        >
          {cat.tile && <img src={cat.tile} alt="" loading="lazy" />}
          <span className="cat-tile__label">{cat.label}</span>
        </button>
      ))}
    </div>
  )
}
