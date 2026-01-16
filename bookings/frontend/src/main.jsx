import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Dashboard from './components/Dashboard.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public booking page */}
        <Route path="/" element={<App />} />
        
        {/* Admin page */}
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)