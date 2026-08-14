import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const emptyItem = (exerciseId) => ({
  exercise_id: exerciseId || '',
  target_sets: 3,
  target_reps: '8-12',
  notes: '',
})

export default function TemplateForm() {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState([])
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.listExercises().then((list) => {
      setExercises(list)
      if (list.length) setItems([emptyItem(list[0].id)])
    })
  }, [])

  const updateItem = (index, key, value) => {
    const next = [...items]
    next[index] = { ...next[index], [key]: value }
    setItems(next)
  }

  const addItem = () => setItems([...items, emptyItem(exercises[0]?.id)])
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Bitte einen Namen für die Vorlage angeben.')
      return
    }
    setBusy(true)
    try {
      await api.createTemplate({
        name,
        notes,
        items: items
          .filter((it) => it.exercise_id)
          .map((it, i) => ({
            exercise_id: Number(it.exercise_id),
            order_index: i,
            target_sets: it.target_sets ? Number(it.target_sets) : null,
            target_reps: it.target_reps || null,
            notes: it.notes || null,
          })),
      })
      navigate('/templates')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-28 max-w-lg mx-auto">
      <h1 className="font-display text-2xl uppercase mb-4">Neue Vorlage</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-surface rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs uppercase text-muted tracking-wide">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Push Day A"
              className="w-full mt-1 bg-surfaceHi rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-plate"
            />
          </div>
          <div>
            <label className="text-xs uppercase text-muted tracking-wide">Notiz (optional)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Fokus Brust/Trizeps"
              className="w-full mt-1 bg-surfaceHi rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-plate"
            />
          </div>
        </div>

        {items.map((item, i) => (
          <div key={i} className="bg-surface rounded-xl p-4 space-y-2 relative">
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="absolute top-3 right-3 text-muted text-xs"
              >
                Entfernen
              </button>
            )}
            <select
              value={item.exercise_id}
              onChange={(e) => updateItem(i, 'exercise_id', e.target.value)}
              className="w-full bg-surfaceHi rounded-lg px-3 py-2 outline-none"
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted">Ziel-Sätze</label>
                <input
                  type="number"
                  min={1}
                  value={item.target_sets}
                  onChange={(e) => updateItem(i, 'target_sets', e.target.value)}
                  className="w-full bg-surfaceHi rounded-lg px-2 py-2 font-mono outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted">Ziel-Wdh.</label>
                <input
                  value={item.target_reps}
                  onChange={(e) => updateItem(i, 'target_reps', e.target.value)}
                  placeholder="z.B. 8-12"
                  className="w-full bg-surfaceHi rounded-lg px-2 py-2 font-mono outline-none"
                />
              </div>
            </div>
            <input
              value={item.notes}
              onChange={(e) => updateItem(i, 'notes', e.target.value)}
              placeholder="Notiz, z.B. Untergriff, eng"
              className="w-full bg-surfaceHi rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="w-full border border-dashed border-surfaceHi text-muted rounded-xl py-3 text-sm"
        >
          + Übung hinzufügen
        </button>

        {error && <p className="text-bad text-sm">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-plate text-ink font-semibold rounded-lg py-3 disabled:opacity-50"
        >
          {busy ? 'Speichert …' : 'Vorlage speichern'}
        </button>
      </form>
    </div>
  )
}
