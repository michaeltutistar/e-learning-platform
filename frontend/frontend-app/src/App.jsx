import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import ForgotPasswordPage from './components/ForgotPasswordPage'
import ResetPasswordPage from './components/ResetPasswordPage'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <header className="gov-co-banner">
          <a href="https://www.gov.co/" target="_blank" rel="noopener noreferrer">
            <img src="/escudocol.PNG" alt="Escudo de Colombia" className="gov-co-logo" />
            GOV.CO
          </a>
        </header>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
