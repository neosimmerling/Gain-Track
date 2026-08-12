import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="font-display text-4xl uppercase tracking-wide mb-1">
        Gain<span className="text-plate">Track</span>
      </h1>
      <p className="text-muted text-sm mb-8">Melde dich an, um dein Training zu tracken.</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface rounded-xl p-6 space-y-4">
        <div>
          <label className="text-xs uppercase text-muted tracking-wide">Benutzername</label>
          <input
            className="w-full mt-1 bg-surfaceHi rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-plate"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase text-muted tracking-wide">Passwort</label>
          <input
            type="password"
            className="w-full mt-1 bg-surfaceHi rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-plate"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-bad text-sm">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-plate text-ink font-semibold rounded-lg py-2.5 hover:bg-plateDark transition-colors disabled:opacity-50"
        >
          {busy ? 'Anmelden …' : 'Anmelden'}
        </button>
      </form>

      <p className="text-muted text-sm mt-6">
        Noch keinen Account?{' '}
        <Link to="/register" className="text-plate font-medium">
          Registrieren
        </Link>
      </p>
    </div>
  )
}
