import type { WheelConfig } from './config'
import type { Prize } from './prizes'
import { saveSpin } from './db'
import { createWheelSvg, createPointer } from './wheel-renderer'
import { mountWelcomeChrome, unmountWelcomeChrome } from './screens/welcome'
import { mountSpinChrome } from './screens/spin'

type Screen = 'welcome' | 'spin'

const INACTIVITY_MS = 60_000

export function createWheelApp(
  root: HTMLElement,
  config: WheelConfig,
  prizes: Prize[],
  deviceId: string,
) {
  let currentScreen: Screen = 'welcome'
  let inactivityTimer: ReturnType<typeof setTimeout> | null = null

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

  // --- State machine ---
  function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    if (currentScreen !== 'welcome') {
      inactivityTimer = setTimeout(() => goTo('welcome'), INACTIVITY_MS)
    }
  }

  function goTo(screen: Screen) {
    currentScreen = screen
    resetInactivityTimer()
    renderScreen(screen)
  }

  function renderScreen(screen: Screen) {
    switch (screen) {
      case 'welcome':
        // Reset wheel rotation
        wheelWrap.style.transition = 'none'
        wheelWrap.style.transform = ''
        wheelWrap.className = 'wheel-idle'

        mountWelcomeChrome(chromeTop, chromeBottom, config, wrapper, () => {
          unmountWelcomeChrome(chromeTop, chromeBottom, () => goTo('spin'))
        })
        break

      case 'spin':
        // Stop idle, keep current position
        wheelWrap.className = ''

        mountSpinChrome(chromeBottom, wheelContainer, wheelWrap, prizes, config,
          async (prizeIndex) => {
            const prize = prizes[prizeIndex]
            await saveSpin({
              id: crypto.randomUUID(),
              eventId: config.eventId,
              prizeId: prize.id,
              prizeLabel: prize.label,
              deviceId,
              createdAt: new Date().toISOString(),
              synced: 0,
            })
          },
          () => goTo('welcome'),
        )
        break
    }
  }

  document.addEventListener('pointerdown', resetInactivityTimer)
  renderScreen('welcome')
}

function getWheelSize(): number {
  const vw = window.innerWidth
  const vh = window.innerHeight
  // iPad-friendly: use more of the viewport
  return Math.min(vw * 0.82, vh * 0.52, 600)
}
