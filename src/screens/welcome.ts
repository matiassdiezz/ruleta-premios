import type { WheelConfig } from '../config'

/**
 * Mounts logo + CTA into the chrome slots (no interaction — drag is handled by app).
 */
export function mountWelcomeChrome(
  top: HTMLElement,
  bottom: HTMLElement,
  config: WheelConfig,
  hintText = 'Arrastra para girar',
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

  // Hint pill with pulsing dot
  const hint = document.createElement('div')
  hint.className = 'wheel-welcome-hint wheel-fade-in'

  const dot = document.createElement('span')
  dot.className = 'wheel-hint-dot'

  const text = document.createElement('span')
  text.textContent = hintText

  hint.append(dot, text)
  bottom.appendChild(hint)
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
