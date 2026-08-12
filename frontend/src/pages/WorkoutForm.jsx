import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const emptySet = () => ({ exercise_id: '', set_number: 1, reps: '', weight: '', rpe: '' })

export default function WorkoutForm() {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState([])
  const [notes, setNotes] = useState('')
  const [sets, setSets] = useState([emptySet()])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.listExercises().then((list) => {
      setExercises(list)
      if (list.length) {
        setSets([{ ...emptySet(), exercise_id: list[0].id }])
      }
    })
  }, [])

  const updateSet = (index, key, value) => {
    const next = [...sets]
    next[index] = { ...next[index], [key]: value }
    setSets(next)
  }

  const addSet = () => {
    const last = sets[sets.length - 1]
    setSets([...sets, { ...emptySet(), exercise_id: last?.exercise_id || exercises[0]?.id, set_number: sets.length + 1 }])
  }

  const removeSet = (index) => setSets(sets.filter((_, i) => i !== index))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.createWorkout({
        notes,
        sets: sets
          .filter((s) => s.exercise_id && s.reps !== '' && s.weight !== '')
          .map((s) => ({
            exercise_id: Number(s.exercise_id),
            set_number: Number(s.set_number) || 1,
            reps: Number(s.reps),
            weight: Number(s.weight),
            rpe: s.rpe === '' ? null : Number(s.rpe),
          })),
      })
      navigate('/history')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-28 max-w-lg mx-auto">
      <h1 className="font-display text-2xl uppercase mb-4">Training eintragen</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {sets.map((s, i) => (
          <div key={i} className="bg-surface rounded-xl p-4 space-y-2 relative">
            {sets.length > 1 && (
              <button
                type="button"
                onClick={() => removeSet(i)}
                className="absolute top-3 right-3 text-muted text-xs"
              >
                Entfernen
              </button>
            )}
            <select
              value={s.exercise_id}
              onChange={(e) => updateSet(i, 'exercise_id', e.target.value)}
              className="w-full bg-surfaceHi rounded-lg px-3 py-2 outline-none"
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted">Satz</label>
                <input
                  type="number"
                  min={1}
                  value={s.set_number}
                  onChange={(e) => updateSet(i, 'set_number', e.target.value)}
                  className="w-full bg-surfaceHi rounded-lg px-2 py-2 font-mono outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted">Wdh.</label>
                <input
                  type="number"
                  min={0}
                  value={s.reps}
                  onChange={(e) => updateSet(i, 'reps', e.target.value)}
                  className="w-full bg-surfaceHi rounded-lg px-2 py-2 font-mono outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted">Gewicht (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={s.weight}
                  onChange={(e) => updateSet(i, 'weight', e.target.value)}
                  className="w-full bg-surfaceHi rounded-lg px-2 py-2 font-mono outline-none"
                  required
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addSet}
          className="w-full border border-dashed border-surfaceHi text-muted rounded-xl py-3 text-sm"
        >
          + Satz hinzufügen
        </button>

        <textarea
          placeholder="Notizen (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-surface rounded-xl px-3 py-2 outline-none text-sm"
          rows={2}
        />

        {error && <p className="text-bad text-sm">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-plate text-ink font-semibold rounded-lg py-3 disabled:opacity-50"
        >
          {busy ? 'Speichert …' : 'Training speichern'}
        </button>
      </form>
    </div>
  )
}
