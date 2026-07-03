import type { Product } from '../../types'
import SlideProductCard from './SlideProductCard'
import GalleryProductCard from './GalleryProductCard'

const SLIDE_REVEAL_CATEGORIES = ['Rings', 'Necklaces']

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product
  index?: number
}) {
  if (SLIDE_REVEAL_CATEGORIES.includes(product.category)) {
    return <SlideProductCard product={product} index={index} />
  }
  return <GalleryProductCard product={product} index={index} />
}