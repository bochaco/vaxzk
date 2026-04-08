import { Buffer } from 'buffer';
// Midnight SDK uses Buffer (Node.js built-in) which isn't available in browsers.
// Polyfill it on the global object before any other module initialises.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).Buffer = Buffer;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
