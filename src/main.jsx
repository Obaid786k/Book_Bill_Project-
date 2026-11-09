import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'
import './styles/tokens.css'
import './styles/invoice.css'

// Must run before Supabase reads (and clears) the URL: remember that this tab
// was opened from a password-recovery email link. ResetPassword.jsx only
// allows setting a new password when this marker exists.
try {
  if (/type=recovery/i.test(window.location.hash + window.location.search)) {
    sessionStorage.setItem('bb_recovery', '1')
  }
} catch { /* storage blocked — reset page will show "link invalid" */ }

// Create a client
const queryClient = new QueryClient()

// Data router (instead of <BrowserRouter>) so useBlocker works — New Bill uses
// it to catch the browser Back button. All routes still live in App/AppRoutes.
const router = createBrowserRouter([{ path: '*', element: <App /> }])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
