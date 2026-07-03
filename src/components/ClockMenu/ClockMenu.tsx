import { useEffect, useState } from 'react'
import styles from './ClockMenu.module.css'

/**
 * ClockMenu — the shared radial "clock" dial ported from meech213.com.
 *
 * Five items sit at fixed points along an arc anchored at the bottom-centre
 * of the viewport. The active item lights up in place, and the clock hand
 * rotates to point directly at it. Slot geometry + styling are lifted from
 * the original.
 *
 * Two modes:
 *  - Uncontrolled (default, no props) — the original site-wide nav. Items
 *    are pages, the active one comes from the URL hash, and clicking
 *    navigates via hash change. Used by DomeGallery.
 *  - Controlled (pass `items` + `activeKey` + `onSelect`) — the dial becomes
 *    a plain selector: no hash routing, the caller owns the active state and
 *    is told when a slot is picked. Used by ProductShowcase to drive its
 *    category filter.
 */

export type ClockDialItem = {
  key: string
  label: string
  sub?: string[]
  slot: { left: number; top: number } // % within the dial viewport
}

type ClockMenuProps = {
  items?: ClockDialItem[]
  activeKey?: string
  onSelect?: (key: string) => void
  ariaLabel?: string
}

type Page = ClockDialItem & { route: string }

// Each page pinned to one arc slot (positions from the original nth-child rules).
const PAGES: Page[] = [
  { key: 'about', label: 'About', route: 'about', sub: [], slot: { left: 12.14, top: 79.47 } },
  { key: 'ring', label: 'Ring', route: 'ring', sub: [/** 'Brands', 'Magazines', 'Personal'*/], slot: { left: 23.13, top: 47.23 } },
  { key: 'necklaces', label: 'Necklaces', route: 'necklaces', sub: [/**'Beauty', 'Brands', 'Artiste', 'Fashion', 'Magazines'**/], slot: { left: 50, top: 32 } },
  { key: 'earrings', label: 'Earrings', route: 'earrings', sub: [], slot: { left: 76.87, top: 47.23 } },
  { key: 'bracelets', label: 'Bracelets', route: '', sub: [], slot: { left: 87.86, top: 79.47 } },
]

// Dial anchor (transform-origin of the hands) and its 2:1 aspect (W = 2·H),
// so we must scale the horizontal delta when aiming the hand.
const CENTER = { left: 50, top: 84 }
const ASPECT = 2

function aimDeg(slot: { left: number; top: number }) {
  const dx = (slot.left - CENTER.left) * ASPECT
  const dy = slot.top - CENTER.top
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

const routeToKey: Record<string, string> = {
  '': 'bracelets',
  necklacess: 'necklaces',
  about: 'about',
  ring: 'ring',
  earrings: 'earrings',
}

function currentKey() {
  const route = window.location.hash.replace(/^#\/?/, '')
  return routeToKey[route] ?? 'necklaces'
}

export default function ClockMenu({ items, activeKey: activeKeyProp, onSelect, ariaLabel = 'Primary' }: ClockMenuProps = {}) {
  const controlled = items !== undefined
  const [hashKey, setHashKey] = useState(currentKey())

  useEffect(() => {
    if (controlled) return
    const onHash = () => setHashKey(currentKey())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [controlled])

  const dialItems: ClockDialItem[] = items ?? PAGES
  const activeKey = controlled ? activeKeyProp : hashKey
  const activePage = dialItems.find((p) => p.key === activeKey) ?? dialItems[Math.floor(dialItems.length / 2)]
  const aim = aimDeg(activePage.slot)

  const go = (page: Page) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (controlled) {
      onSelect?.(page.key)
      return
    }
    window.location.hash = page.route ? `#/${page.route}` : '#/'
  }

  return (
    <nav className={styles.clockMenu} aria-label={ariaLabel}>
      <div className={styles.viewport}>
        <ul className={styles.dial}>
          {dialItems.map((item) => {
            const page = item as Page
            const isActive = item.key === activeKey
            return (
              <li
                key={item.key}
                className={styles.item}
                data-active={isActive}
                style={
                  {
                    '--slot-left': `${item.slot.left}%`,
                    '--slot-top': `${item.slot.top}%`,
                  } as React.CSSProperties
                }
              >
                {controlled ? (
                  <button
                    type="button"
                    className={styles.primaryLink}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={go(page)}
                  >
                    {item.label}
                  </button>
                ) : (
                  <a
                    className={styles.primaryLink}
                    href={page.route ? `#/${page.route}` : '#/'}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={go(page)}
                  >
                    {item.label}
                  </a>
                )}
                {isActive && item.sub && item.sub.length > 0 && (
                  <ul className={styles.subnavPanel}>
                    {item.sub.map((label) => (
                      <li key={label} className={styles.subnavItem}>
                        <button type="button" className={styles.subnavLink}>
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>

        {/* Hands point at the active item's slot; --aim drives the rotation. */}
        <div className={styles.clock} aria-hidden="true" style={{ '--aim': aim } as React.CSSProperties}>
          <span className={`${styles.hand} ${styles.handMinute}`} />
          <span className={`${styles.hand} ${styles.handHour}`} />
          <span className={styles.pin} />
        </div>
      </div>
    </nav>
  )
}
