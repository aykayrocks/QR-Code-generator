import { ReactNode, useEffect, useState } from 'react'

export function useMobile(q = '(max-width: 899px)') {
  const [m, set] = useState(() => matchMedia(q).matches)
  useEffect(() => {
    const mq = matchMedia(q), f = () => set(mq.matches)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [q])
  return m
}

/** Section that is an accordion on mobile and an always-open block on desktop. */
export function Sec(p: { id: string; n: string; title: string; summary?: ReactNode; open: boolean; mobile: boolean; onToggle: () => void; children: ReactNode }) {
  const inert: any = p.open ? {} : { inert: '' }
  return (
    <section className={'sec rv' + (p.open ? ' open' : '')} id={'s-' + p.id}>
      <h2 className="sec-h">
        <button type="button" className="sec-b" aria-expanded={p.open} aria-controls={'p-' + p.id} tabIndex={p.mobile ? 0 : -1} onClick={p.mobile ? p.onToggle : undefined}>
          <span className="num">{p.n}</span><span className="ttl">{p.title}</span>
          <span className="sum">{p.summary}</span><span className="chev" aria-hidden="true" />
        </button>
      </h2>
      <div className="sec-p" id={'p-' + p.id} role="region" {...inert}>
        <div className="sec-in"><div className="sec-c stagger">{p.children}</div></div>
      </div>
    </section>
  )
}

export function ColorField(p: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="fld">
      <span className="lbl">{p.label}</span>
      <label className="clr">
        <input type="color" value={p.value} aria-label={p.label} onChange={(e) => p.onChange(e.target.value)} />
        <span className="clr-sw" style={{ background: p.value }} />
        <span className="clr-hex">{p.value.toUpperCase()}</span>
      </label>
    </div>
  )
}

const ring = (rx: number, ri: number) => `<rect x="2" y="2" width="12" height="12" rx="${rx}" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="6" y="6" width="4" height="4" rx="${ri}"/>`
const G: Record<string, string> = {
  square: '<rect x="2" y="2" width="12" height="12"/>',
  rounded: '<rect x="2" y="2" width="12" height="12" rx="5"/>',
  dots: '<circle cx="5" cy="5" r="2.6"/><circle cx="11" cy="5" r="2.6"/><circle cx="5" cy="11" r="2.6"/><circle cx="11" cy="11" r="2.6"/>',
  diamond: '<path d="M8 1l7 7-7 7-7-7z"/>',
  'e-square': ring(0, 0), 'e-rounded': ring(4, 1.5), 'e-circle': ring(6, 2),
}
export const Glyph = ({ k }: { k: string }) => <svg className="gl" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" dangerouslySetInnerHTML={{ __html: G[k] }} />
