import { useEffect, useMemo, useState } from 'react'
import Fx from './Fx'
import { Sec, ColorField, Glyph, useMobile } from './ui'
import { TYPES, FIELDS, SEC, S0, PRESETS, payload, build, check, toPNG, Settings } from './lib/qr'

function useLS<T>(key: string, init: T): [T, (v: T) => void] {
  const [v, set] = useState<T>(() => {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : init } catch { return init }
  })
  return [v, (n: T) => { set(n); try { localStorage.setItem(key, JSON.stringify(n)) } catch {} }]
}

const saveBlob = (blob: Blob, name: string) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

export default function App() {
  const [type, setType] = useState('url')
  const [vals, setVals] = useState<Record<string, any>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [s, setS] = useState<Settings>({ ...S0 })
  const [recent, setRecent] = useLS<any[]>('qrd:recent', [])
  const [theme, setTheme] = useLS<string>('qrd:theme', '')
  const [toast, setToast] = useState('')
  const [toastOn, setToastOn] = useState(false)
  const [scan, setScan] = useState<{ ok: boolean | null; msg: string }>({ ok: null, msg: '' })

  const v = vals[type] || {}
  const { d, e } = useMemo(() => payload(type, v), [type, vals])
  const out: any = useMemo(() => {
    if (Object.keys(e).length || !d) return null
    try { return build(d, s, '100%', 'p') } catch { return { long: true } }
  }, [d, e, s])
  const ok = !!out && !out.long
  const warns = ok ? check(out.n, s) : []

  const set = (p: Partial<Settings>) => setS((x) => ({ ...x, ...p }))
  const flash = (m: string) => { setToast(m); setToastOn(true); clearTimeout((flash as any).t); (flash as any).t = setTimeout(() => setToastOn(false), 2800) }

  useEffect(() => { if (theme) document.documentElement.dataset.theme = theme }, [theme])

  // Live scan test (only where the browser has BarcodeDetector)
  useEffect(() => {
    setScan({ ok: null, msg: '' })
    if (!d || !ok) return
    let live = true
    const t = setTimeout(async () => {
      if (!('BarcodeDetector' in window)) {
        live && setScan({ ok: null, msg: 'Live scan test is not available in this browser. Try your phone camera before printing.' })
        return
      }
      try {
        const bmp = await createImageBitmap(await toPNG(build(d, s, 400, 'x').svg, 400))
        const r = await new (window as any).BarcodeDetector({ formats: ['qr_code'] }).detect(bmp)
        const pass = r.some((b: any) => b.rawValue === d)
        live && setScan({ ok: pass, msg: pass ? 'Scan test passed: this browser decoded the code.' : 'Scan test failed: this browser could not decode the code. Raise contrast or simplify the style.' })
      } catch {}
    }, 300)
    return () => { live = false; clearTimeout(t) }
  }, [d, s, ok])

  const onField = (k: string, val: any) => {
    setVals({ ...vals, [type]: { ...v, [k]: val } })
    setTouched({ ...touched, [k]: true })
  }

  const remember = () => {
    if (!ok) return
    const key = type + '|' + d + '|' + JSON.stringify(s)
    const entry = { key, type, vals: { ...v }, s: { ...s }, label: String(v[FIELDS[type][0][0]] || '').slice(0, 40) }
    setRecent([entry, ...recent.filter((r) => r.key !== key)].slice(0, 12))
  }
  const reuse = (r: any) => {
    setType(r.type); setVals({ ...vals, [r.type]: { ...r.vals } }); setS({ ...S0, ...r.s }); setTouched({})
    window.scrollTo({ top: 0, behavior: 'smooth' }); flash('Code restored. Edit it or download again.')
  }

  const png = async () => {
    try { saveBlob(await toPNG(build(d, s, s.size, 'x').svg, s.size), `qr-${type}.png`); remember(); flash('PNG downloaded.') }
    catch { flash('Could not create the PNG.') }
  }
  const svg = () => {
    saveBlob(new Blob([build(d, s, s.size, 'x').svg], { type: 'image/svg+xml' }), `qr-${type}.svg`); remember(); flash('SVG downloaded.')
  }
  const copy = async () => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': toPNG(build(d, s, s.size, 'x').svg, s.size) })])
      remember(); flash('Image copied.')
    } catch { flash('Copying is not supported here. Use Download PNG instead.') }
  }

  const onLogo = (f?: File) => {
    if (!f) return
    if (!f.type.startsWith('image/') || f.size > 2e6) return flash('Choose an image file under 2 MB.')
    const rd = new FileReader()
    rd.onload = () => {
      const im = new Image()
      im.onload = () => {
        const k = Math.min(1, 160 / Math.max(im.width, im.height))
        const c = document.createElement('canvas')
        c.width = Math.max(1, im.width * k); c.height = Math.max(1, im.height * k)
        c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height)
        set({ logo: c.toDataURL('image/png'), ecc: 'H' })
        flash('Logo added. Error correction set to H so the code stays readable.')
      }
      im.onerror = () => flash('That image could not be read.')
      im.src = rd.result as string
    }
    rd.readAsDataURL(f)
  }

  const toggleTheme = () => {
    const dark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(dark ? 'light' : 'dark')
  }

  const names = Object.keys(PRESETS)
  const [hp, setHp] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setHp((x) => (x + 1) % names.length), 2800)
    return () => clearInterval(t)
  }, [])
  const hero = useMemo(() => build('https://example.com/hello', { ...S0, ...PRESETS[names[hp]], margin: 2, ecc: 'Q' }, '100%', 'h').svg, [hp])
  const pre = useMemo(() => Object.fromEntries(names.map((n) => [n, build('QR', { ...S0, ...PRESETS[n], margin: 1 }, '100%', 'pc' + n).svg])), [])
  const isDark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches

  const mobile = useMobile()
  const [openId, setOpenId] = useState('content')
  const [preset, setPreset] = useState('')
  const mini = useMemo(() => (ok ? build(d, s, '100%', 'm').svg : ''), [d, s, ok])
  const sp = (id: string) => ({ id, mobile, open: mobile ? openId === id : true, onToggle: () => setOpenId(openId === id ? '' : id) })

  const seg = (k: string, opts: [string, string, string?][]) => (
    <div className="seg" role="group" aria-label={k}>
      {opts.map(([val, label, gl]) => (
        <button key={val} type="button" aria-pressed={s[k] === val} onClick={() => set({ [k]: val })}>{gl && <Glyph k={gl} />}{label}</button>
      ))}
    </div>
  )
  const range = (k: string, label: string, min: number, max: number, step: number, unit: string) => (
    <label className="fld">
      <span className="lbl">{label}<output>{s[k]}{unit}</output></span>
      <input type="range" min={min} max={max} step={step} value={s[k]} style={{ '--pct': ((s[k] - min) / (max - min)) * 100 + '%' } as any} onChange={(ev) => set({ [k]: +ev.target.value })} />
    </label>
  )

  const placeholder = out?.long
    ? 'That is too much content for this error-correction level. Shorten it or choose a lower level.'
    : Object.keys(e).some((k) => touched[k]) ? 'Fix the highlighted fields to see your code.' : 'Fill in the details to see your code.'

  const ix = (i: number) => ({ '--i': i } as any)
  const note = (l: string, m: string, k?: any) => <div key={k} className={'note ' + l}><span aria-hidden="true">{l === 'ok' ? '♥' : l === 'warn' ? '✦' : '✕'}</span>{m}</div>
  return (
    <div className="page">
      <Fx />
      <div className="sky" aria-hidden="true"><div className="stars">{STARS.map((st, i) => <i key={i} style={{ left: st.x + '%', top: st.y + '%', animationDelay: st.d + 's', width: st.z, height: st.z }} />)}</div></div>
      <div className="scenery" aria-hidden="true">
        {CLOUDS.map((c, i) => (
          <div key={i} className="cl" data-par={c.sp} style={{ top: c.top, left: c.left, width: c.w }}>
            <svg viewBox="0 0 120 60" style={{ animationDelay: -i * 9 + 's' }}><path d="M25 50a18 18 0 0 1 2-36 24 24 0 0 1 46-4 20 20 0 0 1 22 16 15 15 0 0 1-2 24z" /></svg>
          </div>
        ))}
      </div>
      <div className="grain" aria-hidden="true" />
      <div className="prog" />

      <nav className="nav">
        <a className="brand" href="#top">
          <svg width="24" height="24" viewBox="0 0 8 8" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true"><path d="M0 0h3v3H0zM5 0h3v3H5zM0 5h3v3H0zM4 4h1v1H4zM6 5h2v1H6zM5 6h1v2H5zM7 7h1v1H7z" /></svg>
          qr<em>studio</em>
        </a>
        <div className="navl"><a href="#studio">Studio</a><a href="#s-recent">Recent</a></div>
        <button className="tg" role="switch" aria-checked={isDark} aria-label="Dark mode" type="button" onClick={toggleTheme}>
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <mask id="mk"><rect width="24" height="24" fill="#fff" /><circle className="mk" cx="24" cy="0" r="8" fill="#000" /></mask>
            <circle cx="12" cy="12" r="6" fill="currentColor" mask="url(#mk)" />
            <g className="rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1="12" y1="1.5" x2="12" y2="3.5" transform={`rotate(${a} 12 12)`} />)}</g>
          </svg>
        </button>
      </nav>

      <header className="hero wrap" id="top">
        <div className="hero-t">
          <p className="eyebrow rise" style={ix(0)}>a cozy little qr maker</p>
          <h1>
            {['Codes', 'people', 'actually'].map((w, i) => <span className="w" style={ix(i + 1)} key={w}>{w}</span>)}
            <span className="w acc" style={ix(4)}>scan.<svg className="squig" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M2 7q12 -9 24 0t24 0 24 0 24 0 24 0 24 0 24 0 24 0" /></svg></span>
          </h1>
          <p className="lead rise" style={ix(6)}>Type something, dress it up, and let the live scan check tell you it works before anyone points a phone at it.</p>
          <div className="hero-a rise" style={ix(7)}>
            <a className="btn pri" href="#studio">Start making</a>
            <span className="px">png · svg · logo · gradient</span>
          </div>
        </div>
        <div className="art" aria-hidden="true">
          <div className="par" data-par="0.1"><div className="sun" /></div>
          <div className="par qrf" data-par="-0.07">
            <div className="qrwrap">
              <div className="crop"><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /></div>
              <div className="hqs" key={hp} dangerouslySetInnerHTML={{ __html: hero }} />
              <span className="px tag">{names[hp]}</span>
            </div>
          </div>
          <svg className="badge" viewBox="0 0 120 120">
            <defs><path id="circ" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" /></defs>
            <text><textPath href="#circ">free · private · no sign-up · </textPath></text>
            <path className="bh" d="M52 54h4v-3h4v3h4v-3h4v3h4v6h-4v4h-4v4h-4v-4h-4v-4h-4z" transform="translate(-6 -4)" />
          </svg>
          <i className="spk" style={{ left: '8%', top: '14%', '--z': '22px' } as any} />
          <i className="spk" style={{ right: '6%', top: '58%', '--z': '16px', animationDelay: '-1.2s' } as any} />
          <i className="spk" style={{ left: '46%', top: '2%', '--z': '14px', animationDelay: '-2.1s' } as any} />
        </div>
      </header>

      <div className="ticker" aria-hidden="true"><div className="tk">
        {[0, 1].map((k) => <span key={k}>{['link', 'text', 'email', 'phone', 'wi-fi', 'png', 'svg', 'logo', 'gradient', 'scan check'].map((t) => <b key={t}>{t}<u>✦</u></b>)}</span>)}
      </div></div>

      <main className="studio wrap" id="studio">
        <aside className="stage rv" id="preview">
          <p className="live px"><i />live preview</p>
          <div className="frame">
            <div className="crop"><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /></div>
            {ok
              ? <div id="qr" role="img" aria-label="QR code preview" dangerouslySetInnerHTML={{ __html: out.svg }} />
              : <div id="qr"><p className="ph">{placeholder}</p></div>}
          </div>
          <div className="meta px">{ok && `${out.n}×${out.n} modules · ${s.size}px`}</div>
          <div className="notes" aria-live="polite">
            {ok && (warns.length ? warns.map(([l, m]: any, i: number) => note(l, m, i)) : note('ok', 'Looks scannable: strong contrast and a safe quiet zone.'))}
            {scan.msg && note(scan.ok === true ? 'ok' : scan.ok === false ? 'bad' : 'warn', scan.msg, 'sc')}
          </div>
          <div className="btns">
            <button className="btn pri" type="button" data-burst disabled={!ok} onClick={png}>Download PNG</button>
            <button className="btn" type="button" data-burst disabled={!ok} onClick={svg}>Download SVG</button>
            <button className="btn" type="button" data-burst disabled={!ok} onClick={copy}>Copy image</button>
            <button className="btn" type="button" data-burst disabled={!ok} onClick={() => { remember(); flash('Saved to recent codes.') }}>Save for later</button>
          </div>
        </aside>

        <div className="flow">
          <Sec {...sp('content')} n="01" title="What it says" summary={TYPES[type]}>
            <div className="tabs" role="group" aria-label="QR code type">
              {Object.keys(TYPES).map((k) => (
                <button key={k} type="button" aria-pressed={k === type} onClick={() => { setType(k); setTouched({}) }}>{TYPES[k]}</button>
              ))}
            </div>
            {FIELDS[type].map(([k, label, kind, ph]: any) => {
              if (kind === 'check')
                return <label key={k} className="chk"><input type="checkbox" checked={!!v[k]} onChange={(ev) => onField(k, ev.target.checked)} /> {label}</label>
              if (k === 'pass' && v.sec === 'nopass') return null
              const err = touched[k] && e[k]
              const common = { id: 'f-' + k, 'aria-invalid': !!err, onChange: (ev: any) => onField(k, ev.target.value) }
              return (
                <div className="fld" key={k}>
                  <label className="lbl" htmlFor={'f-' + k}>{label}</label>
                  {kind === 'textarea' ? <textarea {...common} rows={3} placeholder={ph} value={v[k] ?? ''} />
                    : kind === 'select' ? <select {...common} value={v[k] ?? ph[0]}>{ph.map((o: string) => <option key={o} value={o}>{SEC[o]}</option>)}</select>
                    : <input {...common} type={kind} placeholder={ph} autoComplete="off" value={v[k] ?? ''} />}
                  <div className="err">{err}</div>
                </div>
              )
            })}
          </Sec>

          <Sec {...sp('presets')} n="02" title="Pick a mood" summary={preset || 'custom'}>
            <div className="presets">
              {names.map((n) => (
                <button key={n} type="button" className={'pc' + (preset === n ? ' sel' : '')} aria-pressed={preset === n} onClick={() => { set(PRESETS[n] as any); setPreset(n); flash(n + ' applied. Tweak anything below.') }}>
                  <span dangerouslySetInnerHTML={{ __html: pre[n] }} /><b>{n}</b>
                </button>
              ))}
            </div>
          </Sec>

          <Sec {...sp('color')} n="03" title="Colors" summary={<><i className="dot" style={{ background: s.fg }} /><i className="dot" style={{ background: s.bg }} /></>}>
            <div className="row2">
              <ColorField label="Foreground" value={s.fg} onChange={(c) => set({ fg: c })} />
              <ColorField label="Background" value={s.bg} onChange={(c) => set({ bg: c })} />
            </div>
            <label className="chk"><input type="checkbox" checked={s.grad} onChange={(ev) => set({ grad: ev.target.checked })} /> Fade the foreground into a gradient</label>
            {s.grad && (
              <div className="row2 pop">
                <ColorField label="Second color" value={s.fg2} onChange={(c) => set({ fg2: c })} />
                {range('angle', 'Angle', 0, 345, 15, '°')}
              </div>
            )}
          </Sec>

          <Sec {...sp('shape')} n="04" title="Shape" summary={`${s.pattern} / ${s.eye}`}>
            <div className="fld"><span className="lbl">Dots</span>
              {seg('pattern', [['square', 'Square', 'square'], ['rounded', 'Soft', 'rounded'], ['dots', 'Dots', 'dots'], ['diamond', 'Gem', 'diamond']])}</div>
            <div className="fld"><span className="lbl">Corner eyes</span>
              {seg('eye', [['square', 'Square', 'e-square'], ['rounded', 'Soft', 'e-rounded'], ['circle', 'Round', 'e-circle']])}</div>
          </Sec>

          <Sec {...sp('quality')} n="05" title="Strength" summary={`${s.ecc} · ${s.size}px`}>
            <div className="fld"><span className="lbl">Error correction</span>
              {seg('ecc', [['L', 'L · 7%'], ['M', 'M · 15%'], ['Q', 'Q · 25%'], ['H', 'H · 30%']])}
              <p className="hint">Higher survives scuffs or a logo, but makes the code denser.</p></div>
            {range('size', 'Size', 128, 1024, 32, ' px')}
            {range('margin', 'Quiet margin', 0, 10, 1, ' modules')}
          </Sec>

          <Sec {...sp('logo')} n="06" title="Your logo" summary={s.logo ? 'added' : 'none'}>
            <label className="drop" htmlFor="logo">{s.logo ? <img src={s.logo} alt="Your logo" /> : <span>Choose an image<small>PNG, JPG or SVG, up to 2 MB</small></span>}</label>
            <input type="file" id="logo" className="sr" key={s.logo ? 1 : 0} accept="image/*" onChange={(ev) => onLogo(ev.target.files?.[0])} />
            {s.logo && (
              <div className="pop" style={{ marginTop: 28 }}>
                {range('logoPct', 'Logo size', 10, 35, 1, '%')}
                <button className="btn" type="button" onClick={() => set({ logo: '' })}>Remove logo</button>
              </div>
            )}
          </Sec>

          <Sec {...sp('recent')} n="07" title="Recently made" summary={String(recent.length)}>
            {recent.length > 0 && <button className="btn clear" type="button" onClick={() => setRecent([])}>Clear all</button>}
            <div className="strip">
              {recent.length === 0 && <p className="mut">Codes you download, copy or save land here and stay after a refresh.</p>}
              {recent.map((r, i) => {
                let thumb = ''
                try { thumb = build(payload(r.type, r.vals).d, r.s, 96, 't' + i).svg } catch {}
                return (
                  <button key={r.key} type="button" className="rc" title="Use this code again" onClick={() => reuse(r)}>
                    <span dangerouslySetInnerHTML={{ __html: thumb }} />
                    <b>{TYPES[r.type]}</b><small>{r.label}</small>
                  </button>
                )
              })}
            </div>
          </Sec>
        </div>
      </main>

      <footer className="foot wrap"><span className="px">made with care<i className="pxh" aria-hidden="true" /></span><span className="mut">Nothing you type ever leaves your browser.</span></footer>

      <div className={'toast px' + (toastOn ? ' on' : '')} role="status">{toast}</div>
      <div className="mbar">
        <a className="mthumb" href="#preview" aria-label="Jump to preview">{ok ? <span dangerouslySetInnerHTML={{ __html: mini }} /> : <span className="mq">?</span>}</a>
        <button className="btn pri" type="button" data-burst disabled={!ok} onClick={png}>Download PNG</button>
      </div>
    </div>
  )
}

const STARS = Array.from({ length: 46 }, (_, i) => ({ x: (i * 61.8 + 7) % 100, y: (i * 37.3 + 11) % 100, d: (i % 9) * 0.7, z: i % 6 === 0 ? 3 : 2 }))
const CLOUDS = [
  { top: 150, left: '58%', w: 170, sp: 0.14 }, { top: 700, left: '-3%', w: 220, sp: -0.08 },
  { top: 1250, left: '70%', w: 190, sp: 0.18 }, { top: 1900, left: '8%', w: 160, sp: 0.1 }, { top: 2500, left: '62%', w: 230, sp: -0.1 },
]
