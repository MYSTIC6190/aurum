import Nav from './components/Nav/Nav'
import Hero from './components/Hero/Hero'
import ProductShowcase from './components/ProductShowcase/ProductShowcase'
import DomeGallery from './components/Gallery/DomeGallery'
import Footer from './components/Footer/Footer'
import { useLenis } from './hooks/useLenis'

// Single-page AURUM layout, top to bottom:
//   Nav + Hero       → the fixed nav over the full-screen hero
//   ProductShowcase  → "Our Pieces" — scroll-pinned product carousel with
//                       the radial clock dial as its category filter
//   DomeGallery      → the WebGL photo dome (centrepiece, drag to explore)
//   Footer           → closing footer
function App() {
  // Smooth scrolling for the whole page
  useLenis()

  return (
    <>
      <Nav />
      <Hero />
      <ProductShowcase />
      <DomeGallery />
      <Footer />
    </>
  )
}

export default App
