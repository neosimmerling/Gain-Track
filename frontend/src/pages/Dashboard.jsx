import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api } from '../api'
import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [summary, setSummary] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [exercises, setExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [progress, setProgress] = useState([])

  useEffect(() => {
    api.summary().then(setSummary)
    api.myMilestones().then(setMilestones)
    api.listExercises().then((list) => {
      setExercises(list)
      if (list.length) setSelectedExercise(list[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedExercise) return
    api.exerciseProgress(selectedExercise).then((points) =>
      setProgress(points.map((p) => ({ ...p, date: new Date(p.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) })))
    )
  }, [selectedExercise])

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted text-sm">Willkommen zurück,</p>
          <h1 className="font-display text-2xl uppercase">{user?.username}</h1>
        </div>
        <button onClick={logout} className="text-xs text-muted border border-surfaceHi rounded-full px-3 py-1.5">
          Abmelden
        </button>
      </div>

      <div className="bg-surface rounded-xl p-4 mb-4">
        <p className="text-xs uppercase text-muted tracking-wide">Trainings gesamt</p>
        <p className="font-mono text-3xl text-plate">{summary?.total_workouts ?? '–'}</p>
      </div>

      {exercises.length > 0 && (
        <div className="bg-surface rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase text-muted tracking-wide">Trend</p>
            <select
              value={selectedExercise || ''}
              onChange={(e) => setSelectedExercise(Number(e.target.value))}
              className="bg-surfaceHi text-sm rounded-lg px-2 py-1 outline-none"
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
          {progress.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={progress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262B34" />
                <XAxis dataKey="date" stroke="#8A909C" fontSize={12} />
                <YAxis stroke="#8A909C" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#1D2027', border: '1px solid #262B34', borderRadius: 8 }}
                  labelStyle={{ color: '#EDEDE6' }}
                />
                <Line type="monotone" dataKey="max_weight" stroke="#F2C14E" strokeWidth={2} dot={false} name="Max. Gewicht" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-sm py-8 text-center">Noch keine Daten für diese Übung.</p>
          )}
        </div>
      )}

      <div className="bg-surface rounded-xl p-4">
        <p className="text-xs uppercase text-muted tracking-wide mb-2">Deine Erfolge</p>
        {milestones.length === 0 && <p className="text-muted text-sm">Noch keine Meilensteine erreicht.</p>}
        <ul className="space-y-2">
          {milestones.map((m) => (
            <li key={m.id} className="text-sm bg-surfaceHi rounded-lg px-3 py-2">
              {m.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
