import { Link } from 'react-router-dom'
import PageLayout from '../../components/PageLayout/PageLayout.jsx'
import './Contact.css'

export default function Contact() {
  return (
    <PageLayout variant="contact">
      <div className="page-head">
        <h1>Kontakt</h1>
      </div>

      <section className="contact">
        <div className="contact__left">
          <div className="contact__intro">
            <p>
              Za upite, ponude i cene, kontaktirajte nas telefonom ili mejlom, ili nas posetite u
              radionici u Aleksandrovcu. Rado ćemo vam pomoći da vaš komad nastane baš onako kako želite.
            </p>
          </div>

          <div className="contact__map">
            <iframe
              title="Lokacija radionice — Josipa Pančića 1, Aleksandrovac"
              src="https://maps.google.com/maps?q=43.459748,21.039147&z=16&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        <ul className="info-list">
          <li>
            <span className="label">Vlasnik</span>
            <span className="value">Saša Petković</span>
          </li>
          <li>
            <span className="label">Email</span>
            <span className="value"><a href="mailto:sasa.petkovic125@gmail.com">sasa.petkovic125@gmail.com</a></span>
          </li>
          <li>
            <span className="label">Telefon</span>
            <span className="value"><a href="tel:+38162314377">+381 62 314 377</a></span>
          </li>
          <li>
            <span className="label">Adresa</span>
            <span className="value">Josipa Pančića 1, Aleksandrovac 37230</span>
          </li>
          <li>
            <span className="label">Radno vreme</span>
            <div className="hours">
              <div><span>Ponedeljak – Petak</span><span>08–16h</span></div>
              <div><span>Subota</span><span>08–14h</span></div>
              <div><span>Nedelja</span><span className="muted">neradan dan</span></div>
            </div>
          </li>
        </ul>
      </section>

      <Link className="back-link back-link--desktop" to="/">← Nazad na početnu</Link>
      <button
        className="back-link back-link--mobile"
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑ Nazad na vrh
      </button>
    </PageLayout>
  )
}
