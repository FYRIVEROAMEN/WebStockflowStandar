import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { CartProvider } from './context/CartContext'
import { LocalProvider } from './context/LocalContext'
import './styles/theme.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    
      <CartProvider>
        <LocalProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#111827',
                color: '#fff',
                fontSize: '.85rem',
                borderRadius: '12px',
                padding: '10px 14px'
              }
            }}
          />
        </LocalProvider>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
)