import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar.jsx'
import Home from './pages/Home/Home.jsx'
import Gallery from './pages/Gallery/Gallery.jsx'
import Materials from './pages/Materials/Materials.jsx'
import Contact from './pages/Contact/Contact.jsx'

const BODY_CLASS_BY_PATH = {
  '/': '',
  '/galerija': 'page gallery-page',
  '/materijali': 'page materials-page',
  '/kontakt': 'page contact-page',
}

export default function App() {
  const location = useLocation()

  useEffect(() => {
    document.body.className = BODY_CLASS_BY_PATH[location.pathname] || ''
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/galerija" element={<Gallery />} />
        <Route path="/materijali" element={<Materials />} />
        <Route path="/kontakt" element={<Contact />} />
      </Routes>
    </>
  )
}
