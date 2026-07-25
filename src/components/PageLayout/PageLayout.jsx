import Footer from '../Footer/Footer.jsx'
import './PageLayout.css'

export default function PageLayout({ variant, children }) {
  return (
    <div className={`page-shell${variant ? ` page-shell--${variant}` : ''}`}>
      <main className="page-main">{children}</main>
      <Footer />
    </div>
  )
}
