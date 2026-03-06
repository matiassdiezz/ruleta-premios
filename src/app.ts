import type { WheelConfig } from './config'
import type { Prize } from './prizes'
import { selectPrize } from './prizes'
import { saveSpin } from './db'
import { createWheelSvg, createPointer } from './wheel-renderer'
import { mountWelcomeChrome, unmountWelcomeChrome } from './screens/welcome'
import { showReveal } from './screens/spin'

type State = 'idle' | 'dragging' | 'spinning'

export function createWheelApp(
  root: HTMLElement,
  config: WheelConfig,
  prizes: Prize[],
  deviceId: string,
) {
  let state: State = 'idle'
  let currentRotation = 0
  let prevPointerAngle = 0
  let prevTime = 0
  let angularVelocity = 0

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
  function getPointerAngle(e: PointerEvent): number {
    const rect = wheelContainer.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
  }

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
    wheelContainer.style.cursor = 'grab'

    mountWelcomeChrome(chromeTop, chromeBottom, config)
  }

  function releaseAndSpin() {
    state = 'spinning'
    wheelContainer.style.cursor = ''

    // Select prize
    const prizeIndex = selectPrize(prizes)
    const prize = prizes[prizeIndex]

    // Calculate landing angle
    const segAngle = 360 / prizes.length
    const segCenter = prizeIndex * segAngle + segAngle / 2
    const targetOffset = 360 - segCenter
    const jitter = (Math.random() - 0.5) * segAngle * 0.55

    // Scale rotations + duration based on drag speed
    const speed = Math.max(Math.abs(angularVelocity), 120)
    const t = Math.min(speed / 800, 1)
    const rotationCount = Math.round(2 + 8 * t)
    const duration = 2.5 + 3.5 * t

    const fullRotations = rotationCount * 360
    const normalizedCurrent = ((currentRotation % 360) + 360) % 360
    let needed = targetOffset + jitter - normalizedCurrent
    if (needed < 0) needed += 360

    const finalAngle = currentRotation + fullRotations + needed

    // Spin!
    wheelWrap.style.transition = `transform ${duration.toFixed(1)}s cubic-bezier(0.12, 0, 0.05, 1)`
    wheelWrap.style.transform = `rotate(${finalAngle}deg)`

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

  // --- Drag handlers (pointer capture keeps events on wheelContainer) ---
  wheelContainer.addEventListener('pointerdown', (e) => {
    if (state !== 'idle') return
    e.preventDefault()
    state = 'dragging'

    // Freeze idle animation at current visual position
    const computed = getComputedStyle(wheelWrap)
    const matrix = new DOMMatrix(computed.transform)
    currentRotation = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI)

    wheelWrap.className = ''
    wheelWrap.style.animation = 'none'
    wheelWrap.style.transition = 'none'
    wheelWrap.style.transform = `rotate(${currentRotation}deg)`
    wrapper.classList.remove('wheel-idle-active')

    // Fade out welcome chrome
    unmountWelcomeChrome(chromeTop, chromeBottom, () => {})

    prevPointerAngle = getPointerAngle(e)
    prevTime = performance.now()
    angularVelocity = 0
    wheelContainer.style.cursor = 'grabbing'
    wheelContainer.setPointerCapture(e.pointerId)
  })

  wheelContainer.addEventListener('pointermove', (e) => {
    if (state !== 'dragging') return

    const angle = getPointerAngle(e)
    let delta = angle - prevPointerAngle
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360

    currentRotation += delta
    wheelWrap.style.transform = `rotate(${currentRotation}deg)`

    const now = performance.now()
    const dt = now - prevTime
    if (dt > 0) {
      const instantVel = (delta / dt) * 1000
      angularVelocity = angularVelocity * 0.6 + instantVel * 0.4
    }
    prevPointerAngle = angle
    prevTime = now
  })

  wheelContainer.addEventListener('pointerup', (e) => {
    if (state !== 'dragging') return
    try { wheelContainer.releasePointerCapture(e.pointerId) } catch {}
    releaseAndSpin()
  })

  wheelContainer.addEventListener('pointercancel', (e) => {
    if (state !== 'dragging') return
    try { wheelContainer.releasePointerCapture(e.pointerId) } catch {}
    releaseAndSpin()
  })

  // --- Start ---
  enterIdle()
}

function getWheelSize(): number {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return Math.min(vw * 0.82, vh * 0.52, 600)
}
