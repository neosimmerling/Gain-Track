import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => api.listTemplates().then((data) => {
    setTemplates(data)
    setLoading(false)
  })

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Vorlage wirklich löschen?')) return
    await api.deleteTemplate(id)
    load()
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl uppercase">Trainingspläne</h1>
        <Link
          to="/templates/new"
          className="bg-plate text-ink font-semibold rounded-lg px-3 py-1.5 text-sm"
        >
          + Neu
        </Link>
      </div>

      {loading && <p className="text-muted text-sm">Lädt …</p>}
      {!loading && templates.length === 0 && (
        <p className="text-muted text-sm">
          Noch keine Vorlagen. Leg dir eine an, z.B. "Push Day A", damit du sie mit Timer starten kannst.
        </p>
      )}

      <div className="space-y-3">
        {templates.map((t) => (
          <div
            key={t.id}
            onClick={() => navigate(`/templates/${t.id}/start`)}
            className="bg-surface rounded-xl p-4 active:bg-surfaceHi cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{t.name}</p>
                {t.notes && <p className="text-muted text-sm">{t.notes}</p>}
              </div>
              <button
                onClick={(e) => handleDelete(t.id, e)}
                className="text-xs text-bad shrink-0 ml-2"
              >
                Löschen
              </button>
            </div>
            <p className="text-xs text-muted mt-2 font-mono">
              {t.items.length} Übung{t.items.length !== 1 ? 'en' : ''}
            </p>
            <ul className="mt-1 text-sm text-muted">
              {t.items.slice(0, 3).map((item) => (
                <li key={item.id}>
                  {item.exercise_name}
                  {item.target_sets && item.target_reps ? ` — ${item.target_sets}×${item.target_reps}` : ''}
                </li>
              ))}
              {t.items.length > 3 && <li>+ {t.items.length - 3} weitere</li>}
            </ul>
            <div className="mt-3 bg-plate text-ink text-sm font-semibold rounded-lg py-2 text-center">
              ▶ Starten
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
