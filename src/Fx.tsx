import { useEffect } from 'react'

const HEART = '<svg width="14" height="12" viewBox="0 0 7 6" shape-rendering="crispEdges" fill="currentColor"><path d="M1 0h2v1H1zM4 0h2v1H4zM0 1h7v2H0zM1 3h5v1H1zM2 4h3v1H2zM3 5h1v1H3z"/></svg>'
const STAR = '<svg width="12" height="12" viewBox="0 0 5 5" shape-rendering="crispEdges" fill="currentColor"><path d="M2 0h1v5H2zM0 2h5v1H0z"/></svg>'
const COLS = ['#ff6fa8', '#6f9bff', '#b08cff', '#ffb585']
const rnd = (a: number, b: number) => a + Math.random() * (b - a)

/** Click ripples, pixel-heart bursts, scroll reveals, parallax and the scroll-shifting sky. */
export default function Fx() {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const layer = document.createElement('div')
    layer.className = 'fx'; layer.setAttribute('aria-hidden', 'true')
    document.body.appendChild(layer)
    const spawn = (html: string, life: number) => {
      const d = document.createElement('div'); d.innerHTML = html
      const el = d.firstElementChild as HTMLElement
      layer.appendChild(el); setTimeout(() => el.remove(), life)
    }
    const ripple = (x: number, y: number) => {
      const px = Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + rnd(0, 0.6), r = rnd(26, 48)
        return `<b style="--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r}px;background:${COLS[i % 4]}"></b>`
      }).join('')
      spawn(`<div class="rip" style="left:${x}px;top:${y}px"><i></i><i></i>${px}</div>`, 900)
    }
    const burst = (x: number, y: number) => {
      for (let i = 0; i < 10; i++)
        spawn(`<div class="hp" style="left:${x}px;top:${y}px;--dx:${rnd(-70, 70)}px;--dy:${rnd(-150, -60)}px;--r:${rnd(-25, 25)}deg;animation-duration:${rnd(900, 1400)}ms;color:${COLS[i % 4]}">${i % 3 ? HEART : STAR}</div>`, 1500)
    }
    let last = 'mouse'
    const down = (e: PointerEvent) => { last = e.pointerType; if (!reduce && e.pointerType !== 'touch') ripple(e.clientX, e.clientY) }
    const click = (e: MouseEvent) => {
      if (reduce) return
      if (last === 'touch') ripple(e.clientX, e.clientY)
      const b = (e.target as Element).closest?.('[data-burst]')
      if (b) { const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 4) }
    }
    addEventListener('pointerdown', down); addEventListener('click', click)

    // Scroll reveal
    const els = document.querySelectorAll('.rv')
    let io: IntersectionObserver | null = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io!.unobserve(en.target) } }), { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
      els.forEach((el) => io!.observe(el))
    } else els.forEach((el) => el.classList.add('in'))

    // Scroll-linked: sky colour shift, progress bar, parallax
    const pars = [...document.querySelectorAll<HTMLElement>('[data-par]')]
    const sky = document.querySelector<HTMLElement>('.sky'), prog = document.querySelector<HTMLElement>('.prog')
    let tick = false
    const upd = () => {
      tick = false
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, y / max) : 0
      sky?.style.setProperty('--p', p.toFixed(3))
      if (prog) prog.style.transform = `scaleX(${p.toFixed(3)})`
      if (!reduce) pars.forEach((el) => { el.style.transform = `translate3d(0,${(y * parseFloat(el.dataset.par!)).toFixed(1)}px,0)` })
    }
    const on = () => { if (!tick) { tick = true; requestAnimationFrame(upd) } }
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); upd()

    return () => {
      removeEventListener('pointerdown', down); removeEventListener('click', click)
      removeEventListener('scroll', on); removeEventListener('resize', on)
      io?.disconnect(); layer.remove()
    }
  }, [])
  return null
}
