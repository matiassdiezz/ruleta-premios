import type { WheelConfig } from '../config'

/**
 * Mounts logo + CTA into the chrome slots. The wheel itself is persistent.
 */
export function mountWelcomeChrome(
  top: HTMLElement,
  bottom: HTMLElement,
  config: WheelConfig,
  tapTarget: HTMLElement,
  onTap: () => void,
): void {
  top.innerHTML = ''
  bottom.innerHTML = ''

  // Logo
  const logo = document.createElement('img')
  logo.src = config.logoUrl
  logo.alt = config.brand
  logo.className = 'wheel-welcome-logo wheel-fade-in'
  logo.onerror = () => { logo.style.display = 'none' }
  top.appendChild(logo)

  // CTA
  const cta = document.createElement('div')
  cta.className = 'wheel-welcome-cta wheel-fade-in'
  cta.textContent = 'GIRA Y GANA'
  bottom.appendChild(cta)

  // Hint
  const hint = document.createElement('p')
  hint.className = 'wheel-welcome-hint wheel-fade-in'
  hint.textContent = 'Toca para jugar'
  bottom.appendChild(hint)

  // Full-screen tap
  tapTarget.style.cursor = 'pointer'
  tapTarget.addEventListener('click', onTap, { once: true })
}

/**
 * Fades out chrome, then calls onDone.
 */
export function unmountWelcomeChrome(
  top: HTMLElement,
  bottom: HTMLElement,
  onDone: () => void,
): void {
  const elements = [...top.children, ...bottom.children] as HTMLElement[]
  elements.forEach((el) => el.classList.add('wheel-fade-out'))

  setTimeout(() => {
    top.innerHTML = ''
    bottom.innerHTML = ''
    onDone()
  }, 250)
}
