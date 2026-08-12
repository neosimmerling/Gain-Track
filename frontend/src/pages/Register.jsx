import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register(form)
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
      <p className="text-muted text-sm mb-8">Leg deinen Account an — nur du siehst deine Daten.</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface rounded-xl p-6 space-y-4">
        <div>
          <label className="text-xs uppercase text-muted tracking-wide">Benutzername</label>
          <input
            className="w-full mt-1 bg-surfaceHi rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-plate"
            value={form.username}
            onChange={update('username')}
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase text-muted tracking-wide">E-Mail</label>
          <input
            type="email"
            className="w-full mt-1 bg-surfaceHi rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-plate"
            value={form.email}
            onChange={update('email')}
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase text-muted tracking-wide">Passwort</label>
          <input
            type="password"
            className="w-full mt-1 bg-surfaceHi rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-plate"
            value={form.password}
            onChange={update('password')}
            required
            minLength={8}
          />
        </div>
        {error && <p className="text-bad text-sm">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-plate text-ink font-semibold rounded-lg py-2.5 hover:bg-plateDark transition-colors disabled:opacity-50"
        >
          {busy ? 'Wird angelegt …' : 'Account anlegen'}
        </button>
      </form>

      <p className="text-muted text-sm mt-6">
        Schon registriert?{' '}
        <Link to="/login" className="text-plate font-medium">
          Anmelden
        </Link>
      </p>
    </div>
  )
}
