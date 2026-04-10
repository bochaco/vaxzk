import { Buffer } from 'buffer';
// Midnight SDK uses Buffer (Node.js built-in) which isn't available in browsers.
// Polyfill it on the global object before any other module initialises.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).Buffer = Buffer;

// JubjubPoint interning patch: the circuit simulation uses JavaScript `===`
// for JubjubPoint equality (assert(lhs == rhs)). ecMulGenerator/ecAdd return
// new objects each call, so equal points fail `===` without interning.
import { CompactTypeJubjubPoint, type JubjubPoint } from '@midnight-ntwrk/compact-runtime';
const _jubjubCache = new Map<string, JubjubPoint>();
const _origFromValue = CompactTypeJubjubPoint.fromValue.bind(CompactTypeJubjubPoint);
(CompactTypeJubjubPoint as any).fromValue = function (value: any[]): JubjubPoint {
  const pt = _origFromValue(value);
  const key = `${pt.x},${pt.y}`;
  if (!_jubjubCache.has(key)) _jubjubCache.set(key, pt);
  return _jubjubCache.get(key)!;
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
