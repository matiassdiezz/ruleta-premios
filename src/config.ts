import { get, set } from 'idb-keyval'

export interface WheelConfig {
  eventId: string
  brand: string
  logoUrl: string
  bgColor: string
  textColor: string
  accentColor: string
}

const CONFIG_KEY = 'wheel-config'

const DEFAULTS: WheelConfig = {
  eventId: 'default',
  brand: 'Mannol Argentina',
  logoUrl: '/mannol-logo.png',
  bgColor: '#08081a',
  textColor: '#ffffff',
  accentColor: '#FFD300',
}

export async function loadWheelConfig(): Promise<WheelConfig> {
  const params = new URLSearchParams(window.location.search)

  const fromUrl: Partial<WheelConfig> = {}
  if (params.has('event')) fromUrl.eventId = params.get('event')!
  if (params.has('brand')) fromUrl.brand = params.get('brand')!
  if (params.has('logo')) fromUrl.logoUrl = params.get('logo')!
  if (params.has('bg')) fromUrl.bgColor = params.get('bg')!
  if (params.has('text')) fromUrl.textColor = params.get('text')!
  if (params.has('accent')) fromUrl.accentColor = params.get('accent')!

  if (Object.keys(fromUrl).length > 0) {
    const config = { ...DEFAULTS, ...fromUrl }
    await set(CONFIG_KEY, config)
    return config
  }

  const stored = await get<WheelConfig>(CONFIG_KEY)
  return stored ?? DEFAULTS
}

export function applyBranding(config: WheelConfig): void {
  const root = document.documentElement
  root.style.setProperty('--wheel-bg', config.bgColor)
  root.style.setProperty('--wheel-text', config.textColor)
  root.style.setProperty('--wheel-accent', config.accentColor)
}
