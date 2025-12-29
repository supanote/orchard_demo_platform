import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './routes'
import { ClaimsProvider } from './modules/claims/ClaimsProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClaimsProvider>
      <RouterProvider router={router} />
    </ClaimsProvider>
  </StrictMode>,
)
