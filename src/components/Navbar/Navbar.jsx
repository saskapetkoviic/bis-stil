import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/', label: 'POČETNA', mobileLabel: 'Početna', homeOnly: false, hideOnHome: true },
  { to: '/galerija', label: 'GALERIJA', mobileLabel: 'Galerija' },
  { to: '/materijali', label: 'MATERIJALI', mobileLabel: 'Materijali' },
  { to: '/kontakt', label: 'KONTAKT', mobileLabel: 'Kontakt' },
]

const FADE_ROUTES = ['/galerija', '/materijali']

export default function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isFadeRoute = FADE_ROUTES.includes(location.pathname)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
  }, [open])

  useEffect(() => {
    if (isHome) {
      setScrolled(false)
      return
    }
    function onScroll() {
      setScrolled(window.scrollY > 40)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const links = NAV_LINKS.filter((link) => !(link.hideOnHome && isHome))

  return (
    <>
      {isHome && <div className="home-corner-scrim" aria-hidden="true" />}
      <header
        className={`topbar${isHome ? '' : ' topbar--onpage'}${isFadeRoute ? ' topbar--fade' : ''}${scrolled ? ' topbar--scrolled' : ''}`}
      >
        <Link className="brand" to="/">
          <span className="brand-name">BIS-STIL</span>
          <span className="brand-sub">NAMEŠTAJ PO MERI — RUČNA IZRADA</span>
        </Link>
        <nav className="topnav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          className={`nav-toggle${open ? ' is-open' : ''}`}
          aria-label={open ? 'Zatvori meni' : 'Otvori meni'}
          aria-expanded={open}
          aria-controls="mobileMenu"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </button>
      </header>

      <nav
        className={`mobile-menu${open ? ' is-open' : ''}`}
        id="mobileMenu"
        aria-hidden={!open}
      >
        {links.map((link) => (
          <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
            {link.mobileLabel}
          </Link>
        ))}
      </nav>
    </>
  )
}
