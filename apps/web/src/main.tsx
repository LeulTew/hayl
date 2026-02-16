import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.tsx'
import { ConvexSetupError } from './components/ui/ConvexSetupError'

const convexUrl = import.meta.env.VITE_CONVEX_URL || __HAYL_CONVEX_URL__;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {convexUrl ? (
      <ConvexProvider client={new ConvexReactClient(convexUrl)}>
        <App />
      </ConvexProvider>
    ) : (
      <ConvexSetupError />
    )}
  </StrictMode>,
)
