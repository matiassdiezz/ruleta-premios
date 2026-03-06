export interface Prize {
  id: string
  label: string
  shortLabel: string
  description: string
  color: string
  textColor: string
  probability: number
  maxInventory?: number
}

export const DEFAULT_PRIZES: Prize[] = [
  {
    id: 'kit-mantenimiento',
    label: 'Kit de Mantenimiento',
    shortLabel: 'KIT PREMIUM',
    description: 'Lubricante + aditivo gratis',
    color: '#C62828',
    textColor: '#ffffff',
    probability: 0.05,
  },
  {
    id: 'lubricante',
    label: 'Lubricante Mannol',
    shortLabel: 'LUBRICANTE',
    description: 'Retiralo en el stand',
    color: '#1565C0',
    textColor: '#ffffff',
    probability: 0.10,
  },
  {
    id: 'aditivo',
    label: 'Aditivo para motor',
    shortLabel: 'ADITIVO',
    description: 'Retiralo en el stand',
    color: '#2E7D32',
    textColor: '#ffffff',
    probability: 0.15,
  },
  {
    id: 'descuento-30',
    label: '30% de descuento',
    shortLabel: '30% OFF',
    description: 'En productos Mannol',
    color: '#6A1B9A',
    textColor: '#ffffff',
    probability: 0.10,
  },
  {
    id: 'descuento-15',
    label: '15% de descuento',
    shortLabel: '15% OFF',
    description: 'En productos Mannol',
    color: '#E65100',
    textColor: '#ffffff',
    probability: 0.20,
  },
  {
    id: 'gorra-mannol',
    label: 'Gorra Mannol',
    shortLabel: 'GORRA',
    description: 'Retirala en el stand',
    color: '#00838F',
    textColor: '#ffffff',
    probability: 0.15,
  },
  {
    id: 'llavero-mannol',
    label: 'Llavero Mannol',
    shortLabel: 'LLAVERO',
    description: 'Retiralo en el stand',
    color: '#FFD300',
    textColor: '#242F4C',
    probability: 0.25,
  },
]

export function selectPrize(prizes: Prize[]): number {
  const r = Math.random()
  let cumulative = 0
  for (let i = 0; i < prizes.length; i++) {
    cumulative += prizes[i].probability
    if (r <= cumulative) return i
  }
  return prizes.length - 1
}
