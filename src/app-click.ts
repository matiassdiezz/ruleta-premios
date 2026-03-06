import type { WheelConfig } from './config'
import type { Prize } from './prizes'
import { selectPrize } from './prizes'
import { saveSpin } from './db'
import { createWheelSvg, createPointer } from './wheel-renderer'
import { mountWelcomeChrome, unmountWelcomeChrome } from './screens/welcome'
import { showReveal } from './screens/spin'

type State = 'idle' | 'spinning'

export function createWheelApp(
  root: HTMLElement,
  config: WheelConfig,
  prizes: Prize[],
  deviceId: string,
) {
  let state: State = 'idle'

  // --- Persistent wheel (never destroyed) ---
  const wrapper = document.createElement('div')
  wrapper.className = 'wheel-layout'

  const chromeTop = document.createElement('div')
  chromeTop.className = 'wheel-chrome-top'

  const wheelSize = getWheelSize()
  const wheelContainer = document.createElement('div')
  wheelContainer.className = 'wheel-container'
  wheelContainer.style.width = `${wheelSize}px`
  wheelContainer.style.height = `${wheelSize}px`

  const wheelWrap = document.createElement('div')
  wheelWrap.className = 'wheel-idle'
  wheelWrap.appendChild(createWheelSvg(prizes, wheelSize))
  wheelContainer.appendChild(wheelWrap)
  wheelContainer.appendChild(createPointer(wheelSize))

  const chromeBottom = document.createElement('div')
  chromeBottom.className = 'wheel-chrome-bottom'

  wrapper.append(chromeTop, wheelContainer, chromeBottom)
  root.appendChild(wrapper)

  // --- Helpers ---
  function enterIdle() {
    state = 'idle'

    // Signal any active reveal to clean up
    document.dispatchEvent(new Event('wheel-reset'))

    // Reset wheel rotation
    wheelWrap.style.transition = 'none'
    wheelWrap.style.transform = ''
    wheelWrap.style.animation = ''
    wheelWrap.className = 'wheel-idle'

    // Show idle emanating rings
    wrapper.classList.add('wheel-idle-active')
    wheelContainer.style.cursor = 'pointer'

    mountWelcomeChrome(chromeTop, chromeBottom, config, 'Toca para girar')
  }

  function spinFromClick() {
    state = 'spinning'
    wheelContainer.style.cursor = ''

    // Freeze idle animation at current visual position
    const computed = getComputedStyle(wheelWrap)
    const matrix = new DOMMatrix(computed.transform)
    const currentRotation = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI)

    wheelWrap.className = ''
    wheelWrap.style.animation = 'none'
    wheelWrap.style.transition = 'none'
    wheelWrap.style.transform = `rotate(${currentRotation}deg)`
    wrapper.classList.remove('wheel-idle-active')

    // Fade out welcome chrome
    unmountWelcomeChrome(chromeTop, chromeBottom, () => {})

    // Select prize
    const prizeIndex = selectPrize(prizes)
    const prize = prizes[prizeIndex]

    // Calculate landing angle
    const segAngle = 360 / prizes.length
    const segCenter = prizeIndex * segAngle + segAngle / 2
    const targetOffset = 360 - segCenter
    const jitter = (Math.random() - 0.5) * segAngle * 0.55

    // Random speed for natural feel
    const speed = 300 + Math.random() * 500
    const t = Math.min(speed / 800, 1)
    const rotationCount = Math.round(2 + 8 * t)
    const duration = 2.5 + 3.5 * t

    const fullRotations = rotationCount * 360
    const normalizedCurrent = ((currentRotation % 360) + 360) % 360
    const target = (((targetOffset + jitter) % 360) + 360) % 360
    let needed = target - normalizedCurrent
    if (needed < 0) needed += 360

    const finalAngle = currentRotation + fullRotations + needed

    // Spin!
    requestAnimationFrame(() => {
      wheelWrap.style.transition = `transform ${duration.toFixed(1)}s cubic-bezier(0.12, 0, 0.05, 1)`
      wheelWrap.style.transform = `rotate(${finalAngle}deg)`
    })

    wheelWrap.addEventListener('transitionend', () => {
      saveSpin({
        id: crypto.randomUUID(),
        eventId: config.eventId,
        prizeId: prize.id,
        prizeLabel: prize.label,
        deviceId,
        createdAt: new Date().toISOString(),
        synced: 0,
      })
      showReveal(prize, config, () => enterIdle())
    }, { once: true })
  }

  // --- Click handler ---
  wheelContainer.addEventListener('click', () => {
    if (state !== 'idle') return
    spinFromClick()
  })

  // --- Start ---
  enterIdle()
}

function getWheelSize(): number {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return Math.min(vw * 0.82, vh * 0.52, 600)
}
