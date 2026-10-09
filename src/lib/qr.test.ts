import { describe, it, expect } from 'vitest'
import { payload, check, build, S0 } from './qr'

describe('payload validation', () => {
  it('accepts a bare domain as a URL', () => expect(payload('url', { url: 'example.com' }).d).toBe('https://example.com'))
  it('rejects an invalid URL', () => expect(payload('url', { url: 'not a url' }).e.url).toBeTruthy())
  it('rejects an invalid email', () => expect(payload('email', { to: 'nope' }).e.to).toBeTruthy())
  it('builds a mailto link', () => expect(payload('email', { to: 'a@b.co', subject: 'Hi there' }).d).toBe('mailto:a@b.co?subject=Hi%20there'))
  it('rejects a short phone number', () => expect(payload('phone', { phone: '12' }).e.phone).toBeTruthy())
  it('builds a tel link', () => expect(payload('phone', { phone: '+91 98765 43210' }).d).toBe('tel:+919876543210'))
  it('requires a Wi-Fi password', () => expect(payload('wifi', { ssid: 'x', sec: 'WPA', pass: '' }).e.pass).toBeTruthy())
  it('escapes Wi-Fi special characters', () =>
    expect(payload('wifi', { ssid: 'a;b', sec: 'WPA', pass: 'pass:word1' }).d).toBe('WIFI:T:WPA;S:a\\;b;P:pass\\:word1;;'))
})

describe('scan reliability checks', () => {
  it('flags low contrast', () => expect(check(25, { ...S0, fg: '#cccccc', bg: '#ffffff' }).some((w) => w[0] === 'bad')).toBe(true))
  it('flags a tiny margin', () => expect(check(25, { ...S0, margin: 0 }).some((w) => w[0] === 'bad')).toBe(true))
  it('is quiet for the defaults', () => expect(check(25, S0)).toHaveLength(0))
})

describe('renderer', () => {
  it('produces an SVG', () => expect(build('hello', S0, 100, 'x').svg).toContain('<svg'))
})
