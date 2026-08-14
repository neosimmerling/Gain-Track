import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function History() {
  const [workouts, setWorkouts] = useState([])

  const load = () => api.listWorkouts().then(setWorkouts)

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id) => {
    await api.deleteWorkout(id)
    load()
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      <h1 className="font-display text-2xl uppercase mb-4">Verlauf</h1>

      {workouts.length === 0 && <p className="text-muted text-sm">Noch keine Trainings erfasst.</p>}

      <div className="space-y-3">
        {workouts.map((w) => (
          <div key={w.id} className="bg-surface rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">
                {new Date(w.date).toLocaleDateString('de-DE', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </p>
              <div className="flex items-center gap-2">
                {w.duration_seconds && (
                  <span className="text-xs font-mono text-muted">
                    {Math.round(w.duration_seconds / 60)} min
                  </span>
                )}
                <button onClick={() => handleDelete(w.id)} className="text-xs text-bad">
                  Löschen
                </button>
              </div>
            </div>
            <ul className="text-sm space-y-1">
              {w.sets.map((s) => (
                <li key={s.id} className="flex justify-between font-mono text-muted">
                  <span className="text-chalk">{s.exercise_name}</span>
                  <span>
                    {s.exercise_unit === 'min'
                      ? `${Math.round(s.duration_seconds / 60)} min`
                      : `${s.reps} × ${s.weight}kg`}
                  </span>
                </li>
              ))}
            </ul>
            {w.notes && <p className="text-xs text-muted mt-2 italic">{w.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
