# QR Code Designer
React + TypeScript + Vite. Runs fully in the browser (no backend).

    npm install
    npm run dev        # local dev server
    npm test           # unit tests (validation, warnings, renderer)
    npm run build      # outputs dist/

Deploy: push to GitHub, then import the repo in Vercel (auto-detects Vite)
or Netlify (build `npm run build`, publish `dist`).

Structure: src/lib/qr.ts (pure logic), src/App.tsx (state + layout), src/ui.tsx (accordion section, color field),
src/Fx.tsx (click ripples, scroll reveal and parallax), src/styles.css (tokens, layout, pixel cursors).
