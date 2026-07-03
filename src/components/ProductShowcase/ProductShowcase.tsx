import { useState, useRef, useCallback, useEffect } from 'react'
import { PRODUCTS } from '@/data/products'
import type { Product } from '@/types'
import ProductCard from './ProductCard'
import ClockMenu, { type ClockDialItem } from '../ClockMenu/ClockMenu'
import styles from './ProductShowcase.module.css'

// Category dial — reuses the exact arc slots from the site-wide ClockMenu
// (About/Ring/Necklaces/Earrings/Bracelets) but repurposed as a controlled
// filter selector: "About" is dropped (it already lives in the footer /
// site nav) and its slot is reused for "All".
const CATEGORY_ITEMS: ClockDialItem[] = [
  { key: 'All', label: 'All', slot: { left: 12.14, top: 79.47 } },
  { key: 'Rings', label: 'Rings', slot: { left: 23.13, top: 47.23 } },
  { key: 'Necklaces', label: 'Necklaces', slot: { left: 50, top: 32 } },
  { key: 'Earrings', label: 'Earrings', slot: { left: 76.87, top: 47.23 } },
  { key: 'Bracelets', label: 'Bracelets', slot: { left: 87.86, top: 79.47 } },
]

const LERP_EASE = 0.038
const DRAG_SPEED = 0.75
const FRICTION = 0.978
const MAX_VELOCITY = 35 // px/frame cap so a hard flick can't launch it too fast
const VELOCITY_SAMPLE_WINDOW = 120 // ms

// How far a manual drag can nudge the row away from the scroll-driven
// position. Page scroll is the primary driver now (see the pinned-track
// note below); dragging just offsets it a little, the same way DomeGallery
// layers a manual drag offset on top of its scroll-driven orbit angle.
const DRAG_NUDGE_MAX = 320

// ── Wheel/coverflow feel ──
// As a card's center moves away from the wrapper's center, it curves
// upward on an arc and spins slightly in 3D — like it's riding the
// rim of a wheel that's turning as you drag. No scale or opacity
// change: every card stays full-size and fully opaque, so nothing
// "pops" or fades in/out as it reaches center.
const MAX_ROTATE_Y = 34 // deg — bigger = stronger 3D spin, more depth
const ARC_HEIGHT = 75 // px — bigger = more pronounced wheel-rim arc

// How many cards get cloned onto each end of the row, so that on
// first load — before the user has scrolled at all — there are
// already real product images peeking in on the left of the
// center card, not empty space.
const EDGE_CLONE_COUNT = 3

// The section is a tall scroll "track" (like DomeGallery's gallerySection):
// the inner carousel is pinned via position:sticky while you scroll through
// this height, and vertical scroll progress drives horizontal card movement.
// Once you've scrolled past it, the page continues normally to the next
// section — the carousel never lets the page scroll "through" it uncontrolled.
const TRACK_HEIGHT_VH = 240

export default function ProductShowcase() {
  const [activeFilter, setActiveFilter] = useState('All')
  const sectionRef = useRef<HTMLElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardMeta = useRef<{ left: number; width: number }[]>([])

  const current = useRef(0)
  const target = useRef(0)
  const maxScroll = useRef(0)
  const openingOffset = useRef(0)
  const progressOffset = useRef(0)
  const rafId = useRef<number | null>(null)

  const isDragging = useRef(false)
  const startX = useRef(0)
  const startDragOffset = useRef(0)
  const dragOffset = useRef(0)
  const velocity = useRef(0)
  const samples = useRef<{ x: number; t: number }[]>([])

  const clamp = (v: number) => Math.min(Math.max(v, 0), maxScroll.current)

  const filtered: Product[] =
    activeFilter === 'All'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeFilter)

  // Pad the row with clones of the tail/head so the very first paint
  // already has real cards sitting to the left (and right) of the
  // visual center, instead of the row starting flush at its own edge.
  const displayItems: (Product & { _slotKey: string })[] =
    filtered.length > EDGE_CLONE_COUNT
      ? [
          ...filtered.slice(-EDGE_CLONE_COUNT).map((p) => ({ ...p, _slotKey: `head-clone-${p.id}` })),
          ...filtered.map((p) => ({ ...p, _slotKey: `real-${p.id}` })),
          ...filtered.slice(0, EDGE_CLONE_COUNT).map((p) => ({ ...p, _slotKey: `tail-clone-${p.id}` })),
        ]
      : filtered.map((p) => ({ ...p, _slotKey: `real-${p.id}` }))

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current
    const grid = gridRef.current
    if (!wrapper || !grid) return
    maxScroll.current = Math.max(0, grid.scrollWidth - wrapper.clientWidth)
    target.current = clamp(target.current)

    cardMeta.current = cardRefs.current.map((el) =>
      el ? { left: el.offsetLeft, width: el.offsetWidth } : { left: 0, width: 0 }
    )

    const realStartIndex = filtered.length > EDGE_CLONE_COUNT ? EDGE_CLONE_COUNT : 0
    const meta = cardMeta.current[realStartIndex]
    if (meta) {
      const PEEK = 90 // px of the previous card left visible at the start
      openingOffset.current = clamp(meta.left - PEEK)
    }
  }, [filtered.length])

  // Applies the wheel-curve transform to every card based on where its
  // center currently sits relative to the wrapper's center. Written
  // directly to the DOM (not React state) so it can run every frame.
  const applyWheelTransforms = useCallback(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const wrapperWidth = wrapper.clientWidth
    const centerX = wrapperWidth / 2

    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const meta = cardMeta.current[i]
      if (!meta) return

      const cardCenter = meta.left + meta.width / 2 - current.current
      const offset = cardCenter - centerX
      const ratio = Math.max(-1.6, Math.min(1.6, offset / centerX))
      const absRatio = Math.min(Math.abs(ratio), 1)

      const rotateY = ratio * MAX_ROTATE_Y
      const arcY = absRatio * ARC_HEIGHT

      el.style.transform = `translateY(${arcY}px) rotateY(${rotateY}deg)`
    })
  }, [])

  // Continuous loop (mirrors DomeGallery): every frame, re-derive the
  // scroll-driven position from how far the pinned track has scrolled,
  // add any manual drag nudge on top, then ease the rendered position
  // toward that target.
  const tick = useCallback(() => {
    const section = sectionRef.current
    if (section) {
      const rect = section.getBoundingClientRect()
      const scrollable = section.offsetHeight - window.innerHeight
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0
      progressOffset.current = openingOffset.current + progress * (maxScroll.current - openingOffset.current)
    }

    if (!isDragging.current) {
      if (Math.abs(velocity.current) > 0.05) {
        dragOffset.current += velocity.current
        velocity.current *= FRICTION
      } else {
        velocity.current = 0
      }
      dragOffset.current = Math.max(-DRAG_NUDGE_MAX, Math.min(DRAG_NUDGE_MAX, dragOffset.current))
    }

    target.current = clamp(progressOffset.current + dragOffset.current)
    current.current += (target.current - current.current) * LERP_EASE

    const grid = gridRef.current
    if (grid) {
      grid.style.transform = `translate3d(${-current.current}px, 0, 0)`
    }
    applyWheelTransforms()

    rafId.current = requestAnimationFrame(tick)
  }, [applyWheelTransforms])

  useEffect(() => {
    measure()
    applyWheelTransforms()
    window.addEventListener('resize', measure)
    rafId.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('resize', measure)
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    isDragging.current = true
    velocity.current = 0
    startX.current = e.clientX
    startDragOffset.current = dragOffset.current
    samples.current = [{ x: e.clientX, t: performance.now() }]
    wrapper.classList.add(styles.dragging)
    wrapper.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    const dx = (e.clientX - startX.current) * DRAG_SPEED
    dragOffset.current = Math.max(
      -DRAG_NUDGE_MAX,
      Math.min(DRAG_NUDGE_MAX, startDragOffset.current - dx)
    )

    const now = performance.now()
    samples.current.push({ x: e.clientX, t: now })
    while (samples.current.length > 1 && now - samples.current[0].t > VELOCITY_SAMPLE_WINDOW) {
      samples.current.shift()
    }
  }, [])

  const endDrag = useCallback((e: React.PointerEvent) => {
    const wrapper = wrapperRef.current
    if (!wrapper || !isDragging.current) return
    isDragging.current = false
    wrapper.classList.remove(styles.dragging)
    wrapper.releasePointerCapture(e.pointerId)

    const buf = samples.current
    if (buf.length >= 2) {
      const first = buf[0]
      const last = buf[buf.length - 1]
      const dt = last.t - first.t
      if (dt > 0) {
        const raw = -((last.x - first.x) / dt) * 16 * DRAG_SPEED
        velocity.current = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, raw))
      }
    }
  }, [])

  const handleFilter = (filter: string) => {
    setActiveFilter(filter)
    velocity.current = 0
    dragOffset.current = 0
    requestAnimationFrame(() => {
      measure()
      applyWheelTransforms()
    })
  }

  return (
    <section ref={sectionRef} className={styles.section} style={{ height: `${TRACK_HEIGHT_VH}svh` }}>
      <div className={styles.sticky}>
        <div className={`container ${styles.header}`}>
          <div>
            <h2 className={styles.title}>Our Pieces</h2>
            <p className={styles.subtitle}>Fine Jewellery</p>
          </div>
        </div>

        <div
          className={styles.scrollWrapper}
          ref={wrapperRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <div className={styles.grid} ref={gridRef}>
            {displayItems.map((product, index) => (
              <div
                key={product._slotKey}
                ref={(el) => { cardRefs.current[index] = el }}
                className={styles.wheelCardSlot}
                aria-hidden={product._slotKey.startsWith('real-') ? undefined : true}
              >
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* Radial clock-menu, repurposed here as the category filter. */}
        <div className={styles.clockDock}>
          <ClockMenu
            items={CATEGORY_ITEMS}
            activeKey={activeFilter}
            onSelect={handleFilter}
            ariaLabel="Filter by category"
          />
        </div>
      </div>
    </section>
  )
}
