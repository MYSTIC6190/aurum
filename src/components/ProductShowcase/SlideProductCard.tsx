import type { CSSProperties } from 'react'
import type { Product } from '@/types'
import styles from './ProductShowcase.module.css'

// The big "circular wheel" motion (rotateY, arc, scale, fade) is
// applied dynamically per-frame in ProductShowcase.tsx based on
// scroll position. On top of that, each card gets a strong static
// tilt + a big vertical stagger so the row reads like a cascading,
// scattered gallery — the next card's image starts roughly at the
// halfway point of the previous one, not lined up in a flat row.
const ROTATIONS = [-9, 7, -6, 11, -8, 5, -12, 8]
const STAGGER_Y = [0, 230, -190, 260, -240, 200, -270, 210]

const WIDTH_VARIANTS = [300, 360, 270, 340, 310, 350]
const ASPECT_VARIANTS = ['3 / 4.6', '4 / 5.8', '1 / 1.4', '3 / 5', '1 / 1.3', '4 / 6']

// The biggest card in the width lineup — keep these standing straight
// instead of tilted like the rest, with just a soft, subtle bend
// (a couple degrees, pivoting from the card's own center) rather
// than a full corner-to-corner diagonal tilt.
const BIGGEST_WIDTH = Math.max(...WIDTH_VARIANTS)
const BIG_CARD_BEND = 1.5

export default function DragProductCard({
  product,
  index = 0,
}: {
  product: Product
  index?: number
}) {
  const width = WIDTH_VARIANTS[(index * 3 + 1) % WIDTH_VARIANTS.length]
  const isBiggest = width === BIGGEST_WIDTH
  const rotation = isBiggest
    ? (index % 2 === 0 ? -BIG_CARD_BEND : BIG_CARD_BEND)
    : ROTATIONS[index % ROTATIONS.length]
  const staggerY = STAGGER_Y[index % STAGGER_Y.length]
  const aspect = ASPECT_VARIANTS[(index * 2 + 2) % ASPECT_VARIANTS.length]

  const cardVars = {
    '--card-rot': `${rotation}deg`,
    '--stagger-y': `${staggerY}px`,
    width: `${width}px`,
  } as CSSProperties

  return (
    <div className={`${styles.productCard} ${styles.slideCard}`} style={cardVars}>
      <div className={styles.imageContainer} style={{ aspectRatio: aspect }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className={styles.productImage}
          draggable={false}
        />
        <button className={styles.quickAdd}>Quick Add</button>
      </div>

      <span className={styles.categoryLabel}>{product.category}</span>
      <p className={styles.productName}>{product.name}</p>
      <p className={styles.price}>₹ {Number(product.price).toLocaleString('en-IN')}</p>
    </div>
  )
}