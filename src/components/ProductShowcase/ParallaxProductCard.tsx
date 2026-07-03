import type { Product } from '@/types'
import styles from './ProductShowcase.module.css'
import { useParallaxTilt } from '@/hooks/useParallaxTilt'

export default function ParallaxProductCard({ product }: { product: Product }) {
  const { ref, style } = useParallaxTilt()

  return (
    <div
      ref={ref}
      className={`${styles.productCard} ${styles.parallaxCard}`}
      style={style}
    >
      <div className={styles.imageContainer}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className={styles.productImage}
        />
        <button className={styles.quickAdd}>Quick Add</button>
      </div>

      <span className={styles.categoryLabel}>{product.category}</span>
      <p className={styles.productName}>{product.name}</p>
      <p className={styles.price}>₹ {product.price.toLocaleString()}</p>
    </div>
  )
}