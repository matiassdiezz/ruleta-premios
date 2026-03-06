import type { Prize } from './prizes'

const SVG_NS = 'http://www.w3.org/2000/svg'

export function createWheelSvg(prizes: Prize[], size: number): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`)
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.classList.add('wheel-svg')

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 8
  const segAngle = 360 / prizes.length

  // Defs for gradients
  const defs = document.createElementNS(SVG_NS, 'defs')
  for (let i = 0; i < prizes.length; i++) {
    const grad = document.createElementNS(SVG_NS, 'radialGradient')
    grad.setAttribute('id', `seg-grad-${i}`)
    grad.setAttribute('cx', '30%')
    grad.setAttribute('cy', '30%')
    grad.setAttribute('r', '70%')

    const stop1 = document.createElementNS(SVG_NS, 'stop')
    stop1.setAttribute('offset', '0%')
    stop1.setAttribute('stop-color', lighten(prizes[i].color, 20))

    const stop2 = document.createElementNS(SVG_NS, 'stop')
    stop2.setAttribute('offset', '100%')
    stop2.setAttribute('stop-color', prizes[i].color)

    grad.append(stop1, stop2)
    defs.appendChild(grad)
  }
  svg.appendChild(defs)

  // Segments
  for (let i = 0; i < prizes.length; i++) {
    const startAngle = i * segAngle - 90
    const endAngle = startAngle + segAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)

    const largeArc = segAngle > 180 ? 1 : 0

    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute(
      'd',
      `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
    )
    path.setAttribute('fill', `url(#seg-grad-${i})`)
    svg.appendChild(path)

    // White separator line
    const sep = document.createElementNS(SVG_NS, 'line')
    sep.setAttribute('x1', String(cx))
    sep.setAttribute('y1', String(cy))
    sep.setAttribute('x2', String(x1))
    sep.setAttribute('y2', String(y1))
    sep.setAttribute('stroke', 'rgba(255,255,255,0.3)')
    sep.setAttribute('stroke-width', '2')
    svg.appendChild(sep)
  }

  // Outer ring
  const outerRing = document.createElementNS(SVG_NS, 'circle')
  outerRing.setAttribute('cx', String(cx))
  outerRing.setAttribute('cy', String(cy))
  outerRing.setAttribute('r', String(r))
  outerRing.setAttribute('fill', 'none')
  outerRing.setAttribute('stroke', 'rgba(255,255,255,0.25)')
  outerRing.setAttribute('stroke-width', '4')
  svg.appendChild(outerRing)

  // Text labels — radially aligned
  for (let i = 0; i < prizes.length; i++) {
    const startAngle = i * segAngle - 90
    const midAngle = startAngle + segAngle / 2
    const midRad = (midAngle * Math.PI) / 180
    const textR = r * 0.6
    const tx = cx + textR * Math.cos(midRad)
    const ty = cy + textR * Math.sin(midRad)

    const text = document.createElementNS(SVG_NS, 'text')
    text.setAttribute('x', String(tx))
    text.setAttribute('y', String(ty))
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('dominant-baseline', 'central')
    text.setAttribute('fill', prizes[i].textColor)
    text.setAttribute('font-size', String(Math.min(size / 16, 24)))
    text.setAttribute('font-weight', '800')
    text.setAttribute('font-family', "'Nunito Sans', sans-serif")
    text.setAttribute('transform', `rotate(${midAngle}, ${tx}, ${ty})`)
    text.textContent = prizes[i].shortLabel
    svg.appendChild(text)
  }

  // Center hub (larger, with glow)
  const hubR = r * 0.15
  const hubShadow = document.createElementNS(SVG_NS, 'circle')
  hubShadow.setAttribute('cx', String(cx))
  hubShadow.setAttribute('cy', String(cy))
  hubShadow.setAttribute('r', String(hubR + 2))
  hubShadow.setAttribute('fill', 'rgba(0,0,0,0.15)')
  svg.appendChild(hubShadow)

  const hub = document.createElementNS(SVG_NS, 'circle')
  hub.setAttribute('cx', String(cx))
  hub.setAttribute('cy', String(cy))
  hub.setAttribute('r', String(hubR))
  hub.setAttribute('fill', '#ffffff')
  hub.setAttribute('stroke', 'rgba(0,0,0,0.1)')
  hub.setAttribute('stroke-width', '2')
  svg.appendChild(hub)

  // Inner hub shine
  const hubShine = document.createElementNS(SVG_NS, 'circle')
  hubShine.setAttribute('cx', String(cx - hubR * 0.2))
  hubShine.setAttribute('cy', String(cy - hubR * 0.2))
  hubShine.setAttribute('r', String(hubR * 0.4))
  hubShine.setAttribute('fill', 'rgba(255,255,255,0.6)')
  svg.appendChild(hubShine)

  return svg
}

export function createPointer(size: number): HTMLDivElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'wheel-pointer'
  wrapper.style.width = `${size}px`

  const pointerSize = size * 0.1
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 40 50')
  svg.setAttribute('width', String(pointerSize))
  svg.setAttribute('height', String(pointerSize * 1.25))
  svg.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'

  const polygon = document.createElementNS(SVG_NS, 'polygon')
  polygon.setAttribute('points', '20,50 0,0 40,0')
  polygon.setAttribute('fill', 'var(--wheel-accent, #f59e0b)')
  svg.appendChild(polygon)

  wrapper.appendChild(svg)
  return wrapper
}

/**
 * Calculate the rotation angle to land a specific prize segment under the top pointer.
 * Adds 5-8 full rotations for visual effect.
 */
export function calcSpinAngle(prizeIndex: number, totalPrizes: number): number {
  const segAngle = 360 / totalPrizes
  const segCenter = prizeIndex * segAngle + segAngle / 2
  const targetOffset = 360 - segCenter

  // Randomness within the segment
  const jitter = (Math.random() - 0.5) * segAngle * 0.6

  // 5-8 full rotations
  const fullRotations = (5 + Math.floor(Math.random() * 4)) * 360

  return fullRotations + targetOffset + jitter
}

export function spinWheel(wheelEl: HTMLElement, angle: number): Promise<void> {
  return new Promise((resolve) => {
    wheelEl.style.transition = 'transform 5s cubic-bezier(0.15, 0, 0.05, 1)'
    wheelEl.style.transform = `rotate(${angle}deg)`
    wheelEl.addEventListener('transitionend', () => resolve(), { once: true })
  })
}

/** Lighten a hex color by a percentage */
function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent))
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(2.55 * percent))
  const b = Math.min(255, (num & 0x0000ff) + Math.round(2.55 * percent))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
