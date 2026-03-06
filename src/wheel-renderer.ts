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
  // Leave 12px margin for the metallic outer rings
  const r = size / 2 - 12
  const segAngle = 360 / prizes.length

  // ---- Defs ----
  const defs = document.createElementNS(SVG_NS, 'defs')

  // Segment radial gradients
  for (let i = 0; i < prizes.length; i++) {
    const grad = document.createElementNS(SVG_NS, 'radialGradient')
    grad.setAttribute('id', `seg-grad-${i}`)
    grad.setAttribute('cx', '30%')
    grad.setAttribute('cy', '30%')
    grad.setAttribute('r', '80%')

    const stop1 = document.createElementNS(SVG_NS, 'stop')
    stop1.setAttribute('offset', '0%')
    stop1.setAttribute('stop-color', lighten(prizes[i].color, 28))

    const stop2 = document.createElementNS(SVG_NS, 'stop')
    stop2.setAttribute('offset', '70%')
    stop2.setAttribute('stop-color', prizes[i].color)

    const stop3 = document.createElementNS(SVG_NS, 'stop')
    stop3.setAttribute('offset', '100%')
    stop3.setAttribute('stop-color', darken(prizes[i].color, 15))

    grad.append(stop1, stop2, stop3)
    defs.appendChild(grad)
  }

  // Hub gradient (gold)
  const hubGrad = document.createElementNS(SVG_NS, 'linearGradient')
  hubGrad.setAttribute('id', 'hub-grad')
  hubGrad.setAttribute('x1', '0%')
  hubGrad.setAttribute('y1', '0%')
  hubGrad.setAttribute('x2', '100%')
  hubGrad.setAttribute('y2', '100%')
  const hg1 = document.createElementNS(SVG_NS, 'stop')
  hg1.setAttribute('offset', '0%')
  hg1.setAttribute('stop-color', '#ffe566')
  const hg2 = document.createElementNS(SVG_NS, 'stop')
  hg2.setAttribute('offset', '50%')
  hg2.setAttribute('stop-color', '#d4920e')
  const hg3 = document.createElementNS(SVG_NS, 'stop')
  hg3.setAttribute('offset', '100%')
  hg3.setAttribute('stop-color', '#b8780a')
  hubGrad.append(hg1, hg2, hg3)
  defs.appendChild(hubGrad)

  // Outer metallic ring gradient (conic-ish via multiple stops)
  const ringGrad = document.createElementNS(SVG_NS, 'linearGradient')
  ringGrad.setAttribute('id', 'ring-grad')
  ringGrad.setAttribute('x1', '0%')
  ringGrad.setAttribute('y1', '0%')
  ringGrad.setAttribute('x2', '100%')
  ringGrad.setAttribute('y2', '100%')
  const rg1 = document.createElementNS(SVG_NS, 'stop')
  rg1.setAttribute('offset', '0%')
  rg1.setAttribute('stop-color', '#ffe566')
  const rg2 = document.createElementNS(SVG_NS, 'stop')
  rg2.setAttribute('offset', '40%')
  rg2.setAttribute('stop-color', '#c8960c')
  const rg3 = document.createElementNS(SVG_NS, 'stop')
  rg3.setAttribute('offset', '70%')
  rg3.setAttribute('stop-color', '#8b6000')
  const rg4 = document.createElementNS(SVG_NS, 'stop')
  rg4.setAttribute('offset', '100%')
  rg4.setAttribute('stop-color', '#ffe566')
  ringGrad.append(rg1, rg2, rg3, rg4)
  defs.appendChild(ringGrad)

  // Pointer gradient
  const ptrGrad = document.createElementNS(SVG_NS, 'linearGradient')
  ptrGrad.setAttribute('id', 'ptr-grad')
  ptrGrad.setAttribute('x1', '0%')
  ptrGrad.setAttribute('y1', '0%')
  ptrGrad.setAttribute('x2', '100%')
  ptrGrad.setAttribute('y2', '100%')
  const pg1 = document.createElementNS(SVG_NS, 'stop')
  pg1.setAttribute('offset', '0%')
  pg1.setAttribute('stop-color', '#ffe566')
  const pg2 = document.createElementNS(SVG_NS, 'stop')
  pg2.setAttribute('offset', '100%')
  pg2.setAttribute('stop-color', '#c8800a')
  ptrGrad.append(pg1, pg2)
  defs.appendChild(ptrGrad)

  svg.appendChild(defs)

  // ---- Segments ----
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
  }

  // ---- Segment separators (inner hub to rim, skipping hub area) ----
  const hubR = r * 0.16
  for (let i = 0; i < prizes.length; i++) {
    const angle = i * segAngle - 90
    const rad = (angle * Math.PI) / 180

    const x1 = cx + (hubR + 4) * Math.cos(rad)
    const y1 = cy + (hubR + 4) * Math.sin(rad)
    const x2 = cx + r * Math.cos(rad)
    const y2 = cy + r * Math.sin(rad)

    const sep = document.createElementNS(SVG_NS, 'line')
    sep.setAttribute('x1', String(x1))
    sep.setAttribute('y1', String(y1))
    sep.setAttribute('x2', String(x2))
    sep.setAttribute('y2', String(y2))
    sep.setAttribute('stroke', 'rgba(0,0,0,0.25)')
    sep.setAttribute('stroke-width', '2')
    svg.appendChild(sep)

    // Lighter highlight on one side
    const sepHL = document.createElementNS(SVG_NS, 'line')
    sepHL.setAttribute('x1', String(x1))
    sepHL.setAttribute('y1', String(y1))
    sepHL.setAttribute('x2', String(x2))
    sepHL.setAttribute('y2', String(y2))
    sepHL.setAttribute('stroke', 'rgba(255,255,255,0.15)')
    sepHL.setAttribute('stroke-width', '1')
    svg.appendChild(sepHL)
  }

  // ---- Text labels ----
  for (let i = 0; i < prizes.length; i++) {
    const startAngle = i * segAngle - 90
    const midAngle = startAngle + segAngle / 2
    const midRad = (midAngle * Math.PI) / 180
    const textR = r * 0.62
    const tx = cx + textR * Math.cos(midRad)
    const ty = cy + textR * Math.sin(midRad)
    const fontSize = Math.min(size / 15, 22)

    // Shadow text
    const shadow = document.createElementNS(SVG_NS, 'text')
    shadow.setAttribute('x', String(tx + 1))
    shadow.setAttribute('y', String(ty + 1))
    shadow.setAttribute('text-anchor', 'middle')
    shadow.setAttribute('dominant-baseline', 'central')
    shadow.setAttribute('fill', 'rgba(0,0,0,0.35)')
    shadow.setAttribute('font-size', String(fontSize))
    shadow.setAttribute('font-weight', '900')
    shadow.setAttribute('font-family', "'Nunito Sans', sans-serif")
    shadow.setAttribute('transform', `rotate(${midAngle}, ${tx + 1}, ${ty + 1})`)
    shadow.textContent = prizes[i].shortLabel
    svg.appendChild(shadow)

    // Main text
    const text = document.createElementNS(SVG_NS, 'text')
    text.setAttribute('x', String(tx))
    text.setAttribute('y', String(ty))
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('dominant-baseline', 'central')
    text.setAttribute('fill', prizes[i].textColor)
    text.setAttribute('font-size', String(fontSize))
    text.setAttribute('font-weight', '900')
    text.setAttribute('font-family', "'Nunito Sans', sans-serif")
    text.setAttribute('transform', `rotate(${midAngle}, ${tx}, ${ty})`)
    text.textContent = prizes[i].shortLabel
    svg.appendChild(text)
  }

  // ---- Metallic outer rings ----
  // Dark outer border
  addRing(svg, cx, cy, r + 9, 'none', 'rgba(0,0,0,0.6)', 6)
  // Gold main ring
  addRing(svg, cx, cy, r + 5, 'none', 'url(#ring-grad)', 6)
  // Dark inner shadow
  addRing(svg, cx, cy, r + 2, 'none', 'rgba(0,0,0,0.35)', 2)
  // Highlight
  addRing(svg, cx, cy, r + 8, 'none', 'rgba(255,240,150,0.4)', 1)

  // Decorative dots at segment boundaries on the rim
  for (let i = 0; i < prizes.length; i++) {
    const angle = i * segAngle - 90
    const rad = (angle * Math.PI) / 180
    const dotR = r + 5
    const dx = cx + dotR * Math.cos(rad)
    const dy = cy + dotR * Math.sin(rad)

    const dot = document.createElementNS(SVG_NS, 'circle')
    dot.setAttribute('cx', String(dx))
    dot.setAttribute('cy', String(dy))
    dot.setAttribute('r', '3.5')
    dot.setAttribute('fill', '#ffe566')
    dot.setAttribute('stroke', 'rgba(0,0,0,0.3)')
    dot.setAttribute('stroke-width', '1')
    svg.appendChild(dot)
  }

  // ---- Hub redesign ----
  // Outer gold ring
  const hubOuter = document.createElementNS(SVG_NS, 'circle')
  hubOuter.setAttribute('cx', String(cx))
  hubOuter.setAttribute('cy', String(cy))
  hubOuter.setAttribute('r', String(hubR + 5))
  hubOuter.setAttribute('fill', 'url(#hub-grad)')
  svg.appendChild(hubOuter)

  // Dark center
  const hubDark = document.createElementNS(SVG_NS, 'circle')
  hubDark.setAttribute('cx', String(cx))
  hubDark.setAttribute('cy', String(cy))
  hubDark.setAttribute('r', String(hubR))
  hubDark.setAttribute('fill', '#08081a')
  hubDark.setAttribute('stroke', 'rgba(0,0,0,0.4)')
  hubDark.setAttribute('stroke-width', '1')
  svg.appendChild(hubDark)

  // Gold star in center
  const star = document.createElementNS(SVG_NS, 'path')
  star.setAttribute('d', createStarPath(cx, cy, hubR * 0.7, hubR * 0.35, 6))
  star.setAttribute('fill', 'url(#hub-grad)')
  svg.appendChild(star)

  // Hub shine
  const hubShine = document.createElementNS(SVG_NS, 'circle')
  hubShine.setAttribute('cx', String(cx - hubR * 0.28))
  hubShine.setAttribute('cy', String(cy - hubR * 0.28))
  hubShine.setAttribute('r', String(hubR * 0.32))
  hubShine.setAttribute('fill', 'rgba(255,255,255,0.28)')
  svg.appendChild(hubShine)

  return svg
}

function addRing(
  svg: SVGSVGElement,
  cx: number,
  cy: number,
  r: number,
  fill: string,
  stroke: string,
  width: number,
): void {
  const circle = document.createElementNS(SVG_NS, 'circle')
  circle.setAttribute('cx', String(cx))
  circle.setAttribute('cy', String(cy))
  circle.setAttribute('r', String(r))
  circle.setAttribute('fill', fill)
  circle.setAttribute('stroke', stroke)
  circle.setAttribute('stroke-width', String(width))
  svg.appendChild(circle)
}

function createStarPath(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const step = Math.PI / points
  let d = ''
  for (let i = 0; i < points * 2; i++) {
    const rad = i * step - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    const x = cx + r * Math.cos(rad)
    const y = cy + r * Math.sin(rad)
    d += (i === 0 ? 'M' : 'L') + ` ${x.toFixed(2)} ${y.toFixed(2)} `
  }
  return d + 'Z'
}

export function createPointer(size: number): HTMLDivElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'wheel-pointer'
  wrapper.style.width = `${size}px`

  const pointerSize = size * 0.11
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 40 54')
  svg.setAttribute('width', String(pointerSize))
  svg.setAttribute('height', String(pointerSize * 1.35))

  // Define gradient in pointer SVG
  const defs = document.createElementNS(SVG_NS, 'defs')
  const grad = document.createElementNS(SVG_NS, 'linearGradient')
  grad.setAttribute('id', 'ptr-fill')
  grad.setAttribute('x1', '0%')
  grad.setAttribute('y1', '0%')
  grad.setAttribute('x2', '100%')
  grad.setAttribute('y2', '100%')
  const gs1 = document.createElementNS(SVG_NS, 'stop')
  gs1.setAttribute('offset', '0%')
  gs1.setAttribute('stop-color', '#fff0a0')
  const gs2 = document.createElementNS(SVG_NS, 'stop')
  gs2.setAttribute('offset', '55%')
  gs2.setAttribute('stop-color', '#f59e0b')
  const gs2b = document.createElementNS(SVG_NS, 'stop')
  gs2b.setAttribute('offset', '100%')
  gs2b.setAttribute('stop-color', '#b06000')
  grad.append(gs1, gs2, gs2b)
  defs.appendChild(grad)
  svg.appendChild(defs)

  // Teardrop / carrot pointer — smooth curved shape pointing down
  // M cx 54 = tip, Q/C curves up to a rounded top
  const body = document.createElementNS(SVG_NS, 'path')
  body.setAttribute('d', 'M 20 54 C 6 40 2 26 2 16 A 18 18 0 0 1 38 16 C 38 26 34 40 20 54 Z')
  body.setAttribute('fill', 'url(#ptr-fill)')
  body.setAttribute('stroke', 'rgba(0,0,0,0.45)')
  body.setAttribute('stroke-width', '1.5')
  body.setAttribute('stroke-linejoin', 'round')
  svg.appendChild(body)

  // Highlight streak
  const shine = document.createElementNS(SVG_NS, 'ellipse')
  shine.setAttribute('cx', '14')
  shine.setAttribute('cy', '18')
  shine.setAttribute('rx', '4')
  shine.setAttribute('ry', '7')
  shine.setAttribute('fill', 'rgba(255,255,255,0.35)')
  shine.setAttribute('transform', 'rotate(-12, 14, 18)')
  svg.appendChild(shine)

  // Drop shadow via filter
  svg.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.6)) drop-shadow(0 0 8px rgba(245,158,11,0.4))'

  wrapper.appendChild(svg)
  return wrapper
}

/**
 * Calculate the rotation angle to land a specific prize segment under the top pointer.
 */
export function calcSpinAngle(prizeIndex: number, totalPrizes: number): number {
  const segAngle = 360 / totalPrizes
  const segCenter = prizeIndex * segAngle + segAngle / 2
  const targetOffset = 360 - segCenter
  const jitter = (Math.random() - 0.5) * segAngle * 0.55
  const fullRotations = (6 + Math.floor(Math.random() * 4)) * 360
  return fullRotations + targetOffset + jitter
}

export function spinWheel(wheelEl: HTMLElement, angle: number): Promise<void> {
  return new Promise((resolve) => {
    wheelEl.style.transition = 'transform 5.5s cubic-bezier(0.12, 0, 0.05, 1)'
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

/** Darken a hex color by a percentage */
function darken(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent))
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(2.55 * percent))
  const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
