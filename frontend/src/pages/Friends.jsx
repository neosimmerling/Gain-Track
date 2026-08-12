import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [feed, setFeed] = useState({})

  const load = () => api.listFriends().then(setFriends)

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    friends
      .filter((f) => f.status === 'accepted')
      .forEach((f) => {
        api.friendMilestones(f.id).then((milestones) =>
          setFeed((prev) => ({ ...prev, [f.id]: milestones }))
        )
      })
  }, [friends])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.sendFriendRequest(username)
      setUsername('')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAccept = async (id) => {
    await api.acceptFriendRequest(id)
    load()
  }

  const pending = friends.filter((f) => f.status === 'pending')
  const accepted = friends.filter((f) => f.status === 'accepted')

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      <h1 className="font-display text-2xl uppercase mb-1">Freunde</h1>
      <p className="text-muted text-sm mb-4">
        Freunde sehen nur deine Erfolge (z.B. "3x diese Woche im Gym"), nie deine echten Trainingsdaten.
      </p>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Benutzername"
          className="flex-1 bg-surface rounded-lg px-3 py-2 outline-none text-sm"
        />
        <button type="submit" className="bg-plate text-ink font-semibold rounded-lg px-4 text-sm">
          Hinzufügen
        </button>
      </form>
      {error && <p className="text-bad text-sm mb-4">{error}</p>}

      {pending.length > 0 && (
        <div className="mb-6">
          <p className="text-xs uppercase text-muted tracking-wide mb-2">Anfragen</p>
          <div className="space-y-2">
            {pending.map((f) => (
              <div key={f.id} className="bg-surface rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-sm">{f.username}</span>
                <button onClick={() => handleAccept(f.id)} className="text-xs text-plate font-medium">
                  Annehmen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {accepted.map((f) => (
          <div key={f.id} className="bg-surface rounded-xl p-4">
            <p className="font-medium mb-2">{f.username}</p>
            <ul className="space-y-1.5">
              {(feed[f.id] || []).length === 0 && (
                <li className="text-muted text-sm">Noch keine Erfolge geteilt.</li>
              )}
              {(feed[f.id] || []).map((m) => (
                <li key={m.id} className="text-sm bg-surfaceHi rounded-lg px-3 py-1.5">
                  {m.message}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
