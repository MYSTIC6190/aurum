import { useEffect, useState } from 'react'
import styles from './IntroOverlay.module.css'

const INTRO_MS = 3400

export default function IntroOverlay({ onComplete }: { onComplete: () => void }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const prevHtmlBg = document.documentElement.style.backgroundColor
    const prevBodyBg = document.body.style.backgroundColor
    document.documentElement.style.backgroundColor = '#000'
    document.body.style.backgroundColor = '#000'
    document.documentElement.style.overflow = 'hidden'

    const exitTimer = window.setTimeout(() => setExiting(true), INTRO_MS - 1100)
    const doneTimer = window.setTimeout(() => {
      document.documentElement.style.overflow = ''
      document.documentElement.style.backgroundColor = prevHtmlBg
      document.body.style.backgroundColor = prevBodyBg
      onComplete()
    }, INTRO_MS)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(doneTimer)
      document.documentElement.style.overflow = ''
      document.documentElement.style.backgroundColor = prevHtmlBg
      document.body.style.backgroundColor = prevBodyBg
    }
  }, [onComplete])

  return (
    <div className={`${styles.overlay} ${exiting ? styles.exiting : ''}`} aria-hidden="true">
      <span className={styles.title}>AURUM</span>
    </div>
  )
}
