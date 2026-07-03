import { useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import type { Product } from '@/types'
import styles from './ProductShowcase.module.css'
import { useGalleryReveal } from '@/hooks/useGalleryReveal'

const MAX_TILT = 12 // degrees — keep it bold but not disorienting

export default function GalleryProductCard({
  product,
  index = 0,
}: {
  product: Product
  index?: number
}) {
  const { ref, revealed } = useGalleryReveal(index)
  const tiltRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 })
  const [flipped, setFlipped] = useState(false)

  // deterministic scatter angle per card, -4deg to +4deg, differs by index
  const scatterRotation = ((index * 37) % 9) - 4

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = tiltRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height

    setTilt({
      rx: (0.5 - py) * MAX_TILT * 2,
      ry: (px - 0.5) * MAX_TILT * 2,
      gx: px * 100,
      gy: py * 100,
    })
  }

  function handleLeave() {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 })
    setFlipped(false)
  }

  const tiltVars = {
    '--rx': `${tilt.rx}deg`,
    '--ry': `${tilt.ry}deg`,
    '--gx': `${tilt.gx}%`,
    '--gy': `${tilt.gy}%`,
  } as CSSProperties

  const cardVars = {
    '--card-rot': `${scatterRotation}deg`,
  } as CSSProperties

  return (
    <div
      ref={ref}
      className={`${styles.productCard} ${styles.galleryCard} ${revealed ? styles.revealed : ''}`}
      style={cardVars}
    >
      <div
        ref={tiltRef}
        className={styles.tiltCard}
        style={tiltVars}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={handleLeave}
      >
        <div className={`${styles.tiltInner} ${flipped ? styles.tiltFlipped : ''}`}>
          {/* FRONT — image, gold sheen follows the cursor */}
          <div className={`${styles.tiltFace} ${styles.tiltFront}`}>
            <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
            <div className={styles.tiltSheen} />
          </div>

          {/* BACK — revealed on flip, same box as the image */}
          <div className={`${styles.tiltFace} ${styles.tiltBack}`}>
            <span className={styles.categoryLabel}>{product.category}</span>
            <p className={styles.tiltBackName}>{product.name}</p>
            <p className={styles.tiltBackPrice}>₹ {new Intl.NumberFormat('en-IN').format(Number(product.price))}</p>
            <button className={styles.tiltBackCta}>Quick Add</button>
          </div>
        </div>
      </div>

      <span className={styles.categoryLabel}>{product.category}</span>
      <p className={styles.productName}>{product.name}</p>
      <p className={styles.price}>₹ {new Intl.NumberFormat('en-IN').format(Number(product.price))}</p>
    </div>
  )
}