import { useState } from 'react';

export default function CategoryGrid() {
  // Kaun sa card hover ho raha hai uski state (Siblings Dimming)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Click handle karne ka function
  const handleCategoryClick = (categoryName: string) => {
    console.log(`Navigating to ${categoryName} collection...`);
    alert(`Opening ${categoryName} collection!`);
  };

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-primary, #fcfbf9)', color: 'var(--text-primary, #111)' }}>
      {/* Advanced interactive styles */}
      <style>{`
        /* 1. Zoom Effect */
        .gallery-card:hover .gallery-img {
          transform: scale(1.04);
        }

        /* 2. Quick View Explore Overlay Smooth Slide & Fade */
        .explore-overlay {
          position: absolute;
          bottom: 20px;
          left: 20px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          font-family: var(--font-body, sans-serif);
          font-size: 10px;
          letter-spacing: 0.15em;
          color: #fff;
          background: rgba(17, 17, 17, 0.75);
          padding: 8px 14px;
          backdrop-filter: blur(4px);
          text-transform: uppercase;
        }
        .gallery-card:hover .explore-overlay {
          opacity: 1;
          transform: translateY(0);
        }

        /* 3. Text Line Reveal Effect */
        .category-title {
          position: relative;
          display: inline-block;
          font-family: var(--font-display, serif);
          font-size: 11px;
          letter-spacing: 0.2em;
          margin-top: 16px;
          font-weight: 400;
          text-transform: uppercase;
        }
        .category-title::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 1px;
          bottom: -4px;
          left: 0;
          background-color: var(--text-primary, #111);
          transform-origin: bottom left;
          transition: transform 0.4s ease-out;
        }
        .gallery-card:hover .category-title::after {
          transform: scaleX(1);
        }
      `}</style>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 4%' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '60px', textAlign: 'left' }}>
          <span style={{ 
            fontFamily: 'var(--font-body, sans-serif)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.3em', 
            fontSize: '11px',
            color: 'var(--accent, #666)',
            display: 'block',
            marginBottom: '12px'
          }}>
            NEW COLLECTION
          </span>
          <h2 style={{ 
            fontFamily: 'var(--font-display, serif)', 
            fontSize: '32px', 
            fontWeight: 300,
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Discover Our World
          </h2>
        </div>

        {/* Asymmetric Gallery Grid Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 0.6fr 1.2fr',
          gridTemplateRows: 'auto auto',
          gap: '32px',
          alignItems: 'stretch'
        }}>
          
          {/* 1. RINGS */}
          <div 
            onClick={() => handleCategoryClick('RINGS')}
            onMouseEnter={() => setHoveredCard('RINGS')}
            onMouseLeave={() => setHoveredCard(null)}
            className="gallery-card" 
            style={{ 
              gridColumn: '1', 
              gridRow: '1 / span 2', 
              display: 'flex', 
              flexDirection: 'column', 
              cursor: 'pointer',
              transition: 'opacity 0.4s ease',
              opacity: hoveredCard && hoveredCard !== 'RINGS' ? 0.4 : 1
            }}
          >
            <div style={{ overflow: 'hidden', height: '600px', backgroundColor: 'var(--color-mist, #eaeaea)', position: 'relative' }}>
              <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop" alt="Rings" className="gallery-img" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' }} />
              <div className="explore-overlay">Explore Collection +</div>
            </div>
            <div><span className="category-title">RINGS</span></div>
          </div>

          {/* 2. NECKLACES */}
          <div 
            onClick={() => handleCategoryClick('NECKLACES')}
            onMouseEnter={() => setHoveredCard('NECKLACES')}
            onMouseLeave={() => setHoveredCard(null)}
            className="gallery-card" 
            style={{ 
              gridColumn: '2', 
              gridRow: '1 / span 2', 
              display: 'flex', 
              flexDirection: 'column', 
              cursor: 'pointer',
              transition: 'opacity 0.4s ease',
              opacity: hoveredCard && hoveredCard !== 'NECKLACES' ? 0.4 : 1
            }}
          >
            <div style={{ overflow: 'hidden', height: '700px', backgroundColor: 'var(--color-mist, #eaeaea)', position: 'relative' }}>
              <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop" alt="Necklaces" className="gallery-img" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' }} />
              <div className="explore-overlay">Explore Collection +</div>
            </div>
            <div><span className="category-title">NECKLACES</span></div>
          </div>

          {/* 3. BRACELETS */}
          <div 
            onClick={() => handleCategoryClick('BRACELETS')}
            onMouseEnter={() => setHoveredCard('BRACELETS')}
            onMouseLeave={() => setHoveredCard(null)}
            className="gallery-card" 
            style={{ 
              gridColumn: '3', 
              gridRow: '1', 
              display: 'flex', 
              flexDirection: 'column', 
              cursor: 'pointer',
              transition: 'opacity 0.4s ease',
              opacity: hoveredCard && hoveredCard !== 'BRACELETS' ? 0.4 : 1
            }}
          >
            <div style={{ overflow: 'hidden', height: '360px', backgroundColor: 'var(--color-mist, #eaeaea)', position: 'relative' }}>
              <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop" alt="Bracelets" className="gallery-img" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' }} />
              <div className="explore-overlay">Explore Collection +</div>
            </div>
            <div><span className="category-title">BRACELETS</span></div>
          </div>

          {/* 4. EARRINGS */}
          <div 
            onClick={() => handleCategoryClick('EARRINGS')}
            onMouseEnter={() => setHoveredCard('EARRINGS')}
            onMouseLeave={() => setHoveredCard(null)}
            className="gallery-card" 
            style={{ 
              gridColumn: '3', 
              gridRow: '2', 
              display: 'flex', 
              flexDirection: 'column', 
              cursor: 'pointer', 
              marginTop: '16px',
              transition: 'opacity 0.4s ease',
              opacity: hoveredCard && hoveredCard !== 'EARRINGS' ? 0.4 : 1
            }}
          >
            <div style={{ overflow: 'hidden', height: '240px', backgroundColor: 'var(--color-mist, #eaeaea)', position: 'relative' }}>
              <img src="https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop" alt="Earrings" className="gallery-img" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' }} />
              <div className="explore-overlay">Explore Collection +</div>
            </div>
            <div><span className="category-title">EARRINGS</span></div>
          </div>

        </div>

      </div>
    </section>
  );
}