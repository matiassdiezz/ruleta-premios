import type { WheelConfig } from '../config'
import type { Prize } from '../prizes'

const AUTO_RESET_MS = 7_000
const CONFETTI_COUNT = 90
const RIBBON_COUNT = 40

/** Emoji icon for each prize category */
const PRIZE_ICONS: Record<string, string> = {
  'kit-mantenimiento': '🏆',
  lubricante: '🛢️',
  aditivo: '⚙️',
  'descuento-30': '💎',
  'descuento-15': '🔥',
  'gorra-mannol': '🧢',
  'llavero-mannol': '🔑',
}

export function showReveal(
  prize: Prize,
  _config: WheelConfig,
  onDone: () => void,
): void {
  let cleaned = false

  // ---- Full-screen overlay on body ----
  const overlay = document.createElement('div')
  overlay.className = 'wheel-reveal-fullscreen'

  const content = document.createElement('div')
  content.className = 'wheel-reveal-content'

  // "¡GANASTE!" label
  const label = document.createElement('p')
  label.className = 'wheel-reveal-label'
  label.textContent = '¡Ganaste!'

  // Prize icon
  const icon = document.createElement('div')
  icon.className = 'wheel-reveal-icon'
  icon.textContent = PRIZE_ICONS[prize.id] ?? '🎁'

  // Prize name
  const title = document.createElement('h1')
  title.className = 'wheel-reveal-prize-name'
  title.style.color = prize.color
  title.textContent = prize.label

  // Description
  const desc = document.createElement('p')
  desc.className = 'wheel-reveal-desc'
  desc.textContent = prize.description

  // Badge
  const badge = document.createElement('div')
  badge.className = 'wheel-reveal-badge'
  badge.textContent = 'Mostrá esta pantalla en el stand'

  content.append(label, icon, title, desc, badge)
  overlay.appendChild(content)
  document.body.appendChild(overlay)

  // ---- Countdown bar ----
  const countdownBar = document.createElement('div')
  countdownBar.className = 'wheel-countdown-bar'
  document.body.appendChild(countdownBar)

  // ---- Trigger entrance animation ----
  requestAnimationFrame(() => {
    overlay.classList.add('wheel-reveal-visible')
    // Start countdown after a small delay (matches the backdrop transition)
    setTimeout(() => {
      countdownBar.style.animation = `countdownShrink ${AUTO_RESET_MS}ms linear forwards`
    }, 120)
  })

  // ---- Confetti ----
  const confetti = createConfetti(prize.color)
  document.body.appendChild(confetti)

  // ---- Cleanup on wheel-reset event (inactivity) ----
  function cleanup() {
    if (cleaned) return
    cleaned = true
    overlay.remove()
    countdownBar.remove()
    confetti.remove()
  }

  document.addEventListener('wheel-reset', cleanup, { once: true })

  // ---- Auto-reset timer ----
  setTimeout(() => {
    cleanup()
    onDone()
  }, AUTO_RESET_MS)
}

function createConfetti(prizeColor: string): HTMLDivElement {
  const container = document.createElement('div')
  container.className = 'confetti-container'

  const palette = [
    prizeColor,
    '#C62828', '#1565C0', '#2E7D32', '#6A1B9A', '#E65100', '#00838F', '#FFD300',
    '#ffffff', '#fde68a',
  ]

  // Square/circle pieces
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const piece = document.createElement('div')
    piece.className = 'confetti-piece'

    const size = 6 + Math.random() * 9
    const color = palette[Math.floor(Math.random() * palette.length)]
    const drift = (Math.random() - 0.5) * 280
    const rotEnd = 360 + Math.random() * 720

    piece.style.left = `${Math.random() * 105}%`
    piece.style.width = `${size}px`
    piece.style.height = `${size}px`
    piece.style.backgroundColor = color
    piece.style.borderRadius = Math.random() > 0.45 ? '50%' : '2px'
    piece.style.transform = `rotate(${Math.random() * 360}deg)`
    piece.style.animationDuration = `${1.8 + Math.random() * 2.2}s`
    piece.style.animationDelay = `${Math.random() * 0.6}s`
    piece.style.setProperty('--drift', `${drift}px`)
    piece.style.setProperty('--rot-end', `${rotEnd}deg`)

    container.appendChild(piece)
  }

  // Ribbon pieces (long thin strips)
  for (let i = 0; i < RIBBON_COUNT; i++) {
    const ribbon = document.createElement('div')
    ribbon.className = 'confetti-ribbon'

    const height = 16 + Math.random() * 18
    const color = palette[Math.floor(Math.random() * palette.length)]
    const drift = (Math.random() - 0.5) * 320
    const rotEnd = 180 + Math.random() * 360

    ribbon.style.left = `${Math.random() * 105}%`
    ribbon.style.height = `${height}px`
    ribbon.style.backgroundColor = color
    ribbon.style.transform = `rotate(${Math.random() * 360}deg)`
    ribbon.style.animationDuration = `${2.2 + Math.random() * 2.5}s`
    ribbon.style.animationDelay = `${Math.random() * 0.8}s`
    ribbon.style.setProperty('--drift', `${drift}px`)
    ribbon.style.setProperty('--rot-end', `${rotEnd}deg`)

    container.appendChild(ribbon)
  }

  return container
}
