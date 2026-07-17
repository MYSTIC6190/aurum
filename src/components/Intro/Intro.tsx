import { useEffect, useRef, useState } from 'react'
import styles from './Intro.module.css'

// ── Timing ──
const LOADING_DURATION_MS = 14000
// Once the counter hits 100: a short beat where the text/video just grows
// a little (still fully legible), THEN everything fades together, THEN
// this component unmounts. onRevealStart() fires the instant that beat
// begins — App.tsx uses it to mount the real Hero etc. *underneath* this
// still-visible overlay, so by the time the overlay finishes fading out,
// the real page is already there (mid its own entrance), not a blank gap.
const CROSSFADE_START_MS = 500
const REVEAL_DURATION_MS = 1400

function progressCurve(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1)
  if (clamped < 0.15) return (clamped / 0.15) * 20
  if (clamped < 0.82) return 20 + ((clamped - 0.15) / (0.82 - 0.15)) * 8
  const rushT = (clamped - 0.82) / (1 - 0.82)
  return 28 + rushT * rushT * 72
}

type Phase = 'loading' | 'revealing'

function useViewportSize() {
  const [size, setSize] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1440,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  }))
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

// Boot sequence (see App.tsx's bootPhase state machine). Calls
// onRevealStart() once, right as the reveal beat begins (real site mounts
// behind this, still-visible overlay), then onComplete() once the fade is
// fully finished and this can be safely unmounted with no visual jump.
export default function Intro({
  onRevealStart,
  onComplete,
}: {
  onRevealStart: () => void
  onComplete: () => void
}) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [count, setCount] = useState(0)
  const [crossfading, setCrossfading] = useState(false)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const skippedRef = useRef(false)
  const completedRef = useRef(false)
  const revealStartedRef = useRef(false)
  const { w, h } = useViewportSize()

  const fontSize = Math.min(220, Math.max(80, w * 0.14))

  const finish = () => {
    if (completedRef.current) return
    completedRef.current = true
    document.documentElement.style.overflow = ''
    onComplete()
  }

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'

    const runLoading = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const t = elapsed / LOADING_DURATION_MS
      const value = skippedRef.current ? 100 : progressCurve(t)
      setCount(Math.round(value))

      if (value >= 100) {
        setPhase('revealing')
        return
      }
      rafRef.current = requestAnimationFrame(runLoading)
    }

    rafRef.current = requestAnimationFrame(runLoading)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'revealing') return

    if (!revealStartedRef.current) {
      revealStartedRef.current = true
      onRevealStart()
    }

    const crossfadeTimer = setTimeout(() => setCrossfading(true), CROSSFADE_START_MS)
    const doneTimer = setTimeout(finish, REVEAL_DURATION_MS)
    return () => {
      clearTimeout(crossfadeTimer)
      clearTimeout(doneTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const handleSkip = () => {
    if (phase === 'loading') {
      skippedRef.current = true
    } else {
      finish()
    }
  }

  const revealing = phase === 'revealing'
  // Outline disappears the instant the reveal begins — deliberately NOT
  // synced with `crossfading` like the rest of the UI. The video-mask
  // starts zooming the moment `revealing` flips true too, and since the
  // outline never scales with it, leaving the two visible together even
  // briefly produces a "ghost double" — a bigger blurry zoomed shape
  // overlapping a smaller crisp static one. Dropping the outline first
  // avoids that entirely.
  const outlineFade = revealing ? styles.hide : ''
  const fade = crossfading ? styles.hide : ''

  return (
    <div className={styles.intro} onClick={handleSkip} role="button" aria-label="Skip intro">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <clipPath id="aurumClip" clipPathUnits="userSpaceOnUse">
            {/* The stroke here isn't decorative — clip-path shapes union
                fill + stroke, so adding one fattens the cut-out window
                itself beyond what font-weight alone gives, letting more
                of the video (and, once revealed, the real Hero behind it)
                show through each letter. */}
            <text
              x={w / 2}
              y={h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              stroke="black"
              strokeWidth={fontSize * 0.045}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize,
                letterSpacing: '0.02em',
              }}
            >
              AURUM
            </text>
          </clipPath>
        </defs>
      </svg>

      <div className={`${styles.overlay} ${crossfading ? styles.overlayFadeOut : ''}`}>
        <div className={styles.bg} />

        <div
          className={`${styles.maskedVideoWrap} ${revealing ? styles.maskedVideoZoom : ''}`}
          style={{ clipPath: 'url(#aurumClip)', WebkitClipPath: 'url(#aurumClip)' }}
        >
          <video
            className={styles.maskedVideo}
            src="/videos/hero-loop.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        {/* Thin gold outline on top of the masked video, visible only
            during the loading count — just enough for the letterforms to
            have a defined edge while the video underneath is dark. Gone
            before the zoom/reveal starts (see outlineFade above), so it
            never overlaps the zoomed video at a mismatched size. */}
        <svg className={`${styles.outline} ${outlineFade}`} width={w} height={h} aria-hidden="true">
          <text
            x={w / 2}
            y={h / 2}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize,
              letterSpacing: '0.02em',
            }}
          >
            AURUM
          </text>
        </svg>
      </div>

      <div className={`${styles.mark} ${fade}`}>
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="30" stroke="var(--color-gold)" strokeWidth="1" />
          <text
            x="32"
            y="42"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize="28"
            fill="var(--color-gold)"
          >
            A
          </text>
        </svg>
      </div>

      <div className={`${styles.lower} ${fade}`}>
        <p className={styles.subtitle}>Fine Jewellery</p>
        <div className={styles.rule} />
        <p className={styles.counter}>{count}</p>
      </div>

      <div className={`${styles.previewBadge} ${fade}`}>Scroll</div>

      <button className={`${styles.skip} ${fade}`} onClick={handleSkip} type="button">
        Skip
      </button>
    </div>
  )
}