import './BojeGrid.css'

export default function BojeGrid({ swatches, onSwatchClick }) {
  return (
    <div className="boje-grid">
      {swatches.map((sw) => (
        <button
          key={sw.id}
          type="button"
          className="boje-tile"
          onClick={() => onSwatchClick(sw)}
          aria-label={sw.code ? `${sw.name} — ${sw.code}` : sw.name}
        >
          <img
            className="boje-tile__swatch"
            src={sw.thumbUrl || sw.url}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          />
          <span className="boje-tile__tag">
            <span className="boje-tile__name">{sw.name}</span>
            {sw.code && <span className="boje-tile__code">{sw.code}</span>}
          </span>
        </button>
      ))}
    </div>
  )
}
