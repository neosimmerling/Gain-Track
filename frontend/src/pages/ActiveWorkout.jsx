import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export default function ActiveWorkout() {
  const { templateId } = useParams()
  const navigate = useNavigate()
  const [template, setTemplate] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // { [templateExerciseId]: [{reps, weight}, ...] }
  const [entries, setEntries] = useState({})

  const startTimeRef = useRef(Date.now())
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    api.getTemplate(templateId).then((t) => {
      setTemplate(t)
      const initial = {}
      t.items.forEach((item) => {
        const count = item.target_sets || 1
        initial[item.id] = Array.from({ length: count }, () => ({ reps: '', weight: '' }))
      })
      setEntries(initial)
    })
  }, [templateId])

  useEffect(() => {
    startTimeRef.current = Date.now()
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const updateEntry = (itemId, setIndex, key, value) => {
    setEntries((prev) => {
      const next = { ...prev }
      const list = [...(next[itemId] || [])]
      list[setIndex] = { ...list[setIndex], [key]: value }
      next[itemId] = list
      return next
    })
  }

  const addSet = (itemId) => {
    setEntries((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), { reps: '', weight: '' }],
    }))
  }

  const totalLoggedSets = useMemo(
    () =>
      Object.values(entries)
        .flat()
        .filter((s) => s.reps !== '' && s.weight !== '').length,
    [entries]
  )

  const handleFinish = async () => {
    if (!template) return
    setError('')
    setBusy(true)
    try {
      const sets = []
      template.items.forEach((item) => {
        const list = entries[item.id] || []
        list.forEach((s, idx) => {
          if (s.reps !== '' && s.weight !== '') {
            sets.push({
              exercise_id: item.exercise_id,
              set_number: idx + 1,
              reps: Number(s.reps),
              weight: Number(s.weight),
            })
          }
        })
      })

      await api.createWorkout({
        template_id: template.id,
        duration_seconds: elapsed,
        notes: template.name,
        sets,
      })
      navigate('/history')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = () => {
    if (confirm('Training abbrechen? Bisher eingetragene Sätze gehen verloren.')) {
      navigate('/templates')
    }
  }

  if (!template) {
    return <div className="px-4 pt-6 text-muted text-sm">Lädt …</div>
  }

  return (
    <div className="px-4 pt-6 pb-32 max-w-lg mx-auto">
      <div className="sticky top-0 bg-ink pt-1 pb-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted text-xs uppercase tracking-wide">{template.name}</p>
            <p className="font-mono text-4xl text-plate leading-tight">{formatDuration(elapsed)}</p>
          </div>
          <button onClick={handleCancel} className="text-xs text-muted border border-surfaceHi rounded-full px-3 py-1.5">
            Abbrechen
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {template.items.map((item) => (
          <div key={item.id} className="bg-surface rounded-xl p-4">
            <div className="flex items-baseline justify-between mb-1">
              <p className="font-semibold">{item.exercise_name}</p>
              {item.target_sets && item.target_reps && (
                <p className="text-xs text-muted font-mono">Ziel: {item.target_sets}×{item.target_reps}</p>
              )}
            </div>
            {item.notes && <p className="text-xs text-muted italic mb-2">{item.notes}</p>}

            <div className="space-y-1.5">
              {(entries[item.id] || []).map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-muted font-mono w-5">{idx + 1}.</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Wdh."
                    value={s.reps}
                    onChange={(e) => updateEntry(item.id, idx, 'reps', e.target.value)}
                    className="flex-1 bg-surfaceHi rounded-lg px-2 py-2 font-mono text-sm outline-none"
                  />
                  <span className="text-muted text-xs">×</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    placeholder="kg"
                    value={s.weight}
                    onChange={(e) => updateEntry(item.id, idx, 'weight', e.target.value)}
                    className="flex-1 bg-surfaceHi rounded-lg px-2 py-2 font-mono text-sm outline-none"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addSet(item.id)}
              className="mt-2 text-xs text-plate font-medium"
            >
              + Satz
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-bad text-sm mt-4">{error}</p>}

      <div className="fixed bottom-16 left-0 right-0 px-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleFinish}
            disabled={busy || totalLoggedSets === 0}
            className="w-full bg-plate text-ink font-semibold rounded-lg py-3.5 shadow-lg disabled:opacity-50"
          >
            {busy ? 'Speichert …' : `Training beenden (${totalLoggedSets} Sätze)`}
          </button>
        </div>
      </div>
    </div>
  )
}
