import type { WheelConfig } from '../config'
import type { Prize } from '../prizes'
import { selectPrize } from '../prizes'
import { calcSpinAngle, spinWheel } from '../wheel-renderer'

const AUTO_RESET_MS = 6_000
const CONFETTI_COUNT = 60

/**
 * Mounts spin chrome (prompt) and wires up the spin interaction.
 * The wheel DOM is persistent — only the chrome and behavior change.
 */
export function mountSpinChrome(
  bottom: HTMLElement,
  wheelContainer: HTMLElement,
  wheelWrap: HTMLElement,
  prizes: Prize[],
  config: WheelConfig,
  onSave: (prizeIndex: number) => Promise<void>,
  onDone: () => void,
): void {
  bottom.innerHTML = ''

  // Tap prompt
  const prompt = document.createElement('p')
  prompt.className = 'tap-to-spin wheel-fade-in'
  prompt.textContent = 'Toca la rueda para girar'
  bottom.appendChild(prompt)

  // Spin interaction
  let spinning = false
  wheelContainer.style.cursor = 'pointer'

  const handler = async () => {
    if (spinning) return
    spinning = true
    wheelContainer.style.cursor = ''
    prompt.classList.add('wheel-fade-out')

    const prizeIndex = selectPrize(prizes)
    const prize = prizes[prizeIndex]
    const angle = calcSpinAngle(prizeIndex, prizes.length)

    await spinWheel(wheelWrap, angle)

    // Save spin (fire and forget)
    onSave(prizeIndex)

    // Show reveal overlay
    showReveal(bottom, wheelContainer, prize, config, onDone)
  }

  wheelContainer.addEventListener('click', handler, { once: true })
}

function showReveal(
  bottom: HTMLElement,
  wheelContainer: HTMLElement,
  prize: Prize,
  _config: WheelConfig,
  onDone: () => void,
): void {
  bottom.innerHTML = ''

  // Overlay on top of the wheel
  const overlay = document.createElement('div')
  overlay.className = 'wheel-reveal-overlay'

  const card = document.createElement('div')
  card.className = 'wheel-reveal-card'

  const title = document.createElement('h1')
  title.className = 'wheel-reveal-title'
  title.style.color = prize.color
  title.textContent = prize.label

  const desc = document.createElement('p')
  desc.className = 'wheel-reveal-desc'
  desc.textContent = prize.description

  const badge = document.createElement('div')
  badge.className = 'wheel-reveal-badge'
  badge.textContent = 'Retiralo en el stand'

  card.append(title, desc, badge)
  overlay.appendChild(card)
  wheelContainer.appendChild(overlay)

  // Trigger animation
  requestAnimationFrame(() => {
    overlay.classList.add('wheel-reveal-visible')
  })

  // Confetti
  const confetti = createConfetti()
  document.body.appendChild(confetti)

  // Auto-reset
  const timer = setTimeout(() => {
    cleanup()
    onDone()
  }, AUTO_RESET_MS)

  function cleanup() {
    clearTimeout(timer)
    confetti.remove()
    overlay.remove()
    wheelContainer.style.cursor = ''
  }

  // Cleanup if navigated away early (inactivity reset)
  const observer = new MutationObserver(() => {
    if (!wheelContainer.contains(overlay)) {
      cleanup()
      observer.disconnect()
    }
  })
  observer.observe(wheelContainer, { childList: true })
}

function createConfetti(): HTMLDivElement {
  const container = document.createElement('div')
  container.className = 'confetti-container'

  const colors = ['#FF6B35', '#2EC4B6', '#E71D36', '#7B2FBE', '#FFD23F', '#1B998B']

  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const piece = document.createElement('div')
    piece.className = 'confetti-piece'
    piece.style.left = `${Math.random() * 100}%`
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    piece.style.animationDuration = `${1.5 + Math.random() * 2}s`
    piece.style.animationDelay = `${Math.random() * 0.8}s`
    piece.style.width = `${6 + Math.random() * 8}px`
    piece.style.height = `${6 + Math.random() * 8}px`
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
    piece.style.transform = `rotate(${Math.random() * 360}deg)`
    container.appendChild(piece)
  }

  return container
}
