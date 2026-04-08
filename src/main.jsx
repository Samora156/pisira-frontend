import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '8px', fontSize: '14px', border: '1px solid hsl(240 5.9% 90%)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
)
