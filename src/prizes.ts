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
    id: 'gorra',
    label: 'Gorra premium',
    shortLabel: 'GORRA',
    description: 'Retirala en el stand',
    color: '#FF6B35',
    textColor: '#ffffff',
    probability: 0.10,
  },
  {
    id: 'llavero',
    label: 'Llavero exclusivo',
    shortLabel: 'LLAVERO',
    description: 'Retiralo en el stand',
    color: '#2EC4B6',
    textColor: '#ffffff',
    probability: 0.25,
  },
  {
    id: 'sticker',
    label: 'Pack de stickers',
    shortLabel: 'STICKERS',
    description: 'Retiralos en el stand',
    color: '#1B998B',
    textColor: '#ffffff',
    probability: 0.30,
  },
  {
    id: 'descuento-10',
    label: '10% de descuento',
    shortLabel: '10% OFF',
    description: 'En tu proxima compra',
    color: '#7B2FBE',
    textColor: '#ffffff',
    probability: 0.20,
  },
  {
    id: 'descuento-20',
    label: '20% de descuento',
    shortLabel: '20% OFF',
    description: 'En tu proxima compra',
    color: '#E71D36',
    textColor: '#ffffff',
    probability: 0.10,
  },
  {
    id: 'remera',
    label: 'Remera oficial',
    shortLabel: 'REMERA',
    description: 'Retirala en el stand',
    color: '#FFD23F',
    textColor: '#000000',
    probability: 0.05,
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
