import { useState } from 'react'
import Nav from './components/Nav/Nav'
import Hero from './components/Hero/Hero'
import DomeGallery from './components/Gallery/DomeGallery'
import ProductShowcase from './components/ProductShowcase/ProductShowcase'
import ExploreByOccasion from './components/ExploreByOccasion/ExploreByOccasion'
import Footer from './components/Footer/Footer'
import Intro from './components/Intro/Intro'
import { CategoryProvider } from './context/CategoryContext'
import CartDrawer from './components/CartDrawer/CartDrawer'
import { CartProvider } from './components/CartDrawer/CartContext'
import { useLenis } from './hooks/useLenis'

// Boot sequence, in order:
//   'preloader'  → only Intro renders: counter + video-through-lettering.
//   'revealing'  → Intro is STILL rendered (on top, mid fade-out) but the
//                  real site now mounts underneath it and starts its own
//                  entrance (Hero's `ready` prop flips true here). This is
//                  what makes the handoff a true crossfade instead of a
//                  "fade to blank, then hard-cut to Hero" gap — by the
//                  time Intro's overlay reaches opacity 0, Hero is already
//                  sitting there, partway into its own reveal.
//   'ready'      → Intro has fully finished fading and unmounts.
type BootPhase = 'preloader' | 'revealing' | 'ready'

function App() {
  const [bootPhase, setBootPhase] = useState<BootPhase>('preloader')
  const siteVisible = bootPhase === 'revealing' || bootPhase === 'ready'
  useLenis(bootPhase === 'ready')

  return (
    <CartProvider>
      <>
        {bootPhase !== 'ready' && (
          <Intro
            onRevealStart={() => setBootPhase('revealing')}
            onComplete={() => setBootPhase('ready')}
          />
        )}

        {/* Mounts as soon as the reveal begins, not only once Intro is
            fully gone — see the bootPhase note above. */}
        {siteVisible && (
          <CategoryProvider>
            <Nav />
            <Hero ready={siteVisible} />
            <DomeGallery />
            <ExploreByOccasion />
            <ProductShowcase />
            <Footer />
            <CartDrawer />
          </CategoryProvider>
        )}
      </>
    </CartProvider>
  )
}

export default App