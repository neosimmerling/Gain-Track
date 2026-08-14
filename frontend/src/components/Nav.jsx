import React from 'react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Übersicht', icon: '🏠' },
  { to: '/templates', label: 'Pläne', icon: '📑' },
  { to: '/log', label: 'Eintragen', icon: '➕' },
  { to: '/history', label: 'Verlauf', icon: '📋' },
  { to: '/friends', label: 'Freunde', icon: '🤝' },
]

export default function Nav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surfaceHi flex justify-around py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] z-20">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-1.5 py-1 text-[10px] leading-tight font-medium ${
              isActive ? 'text-plate' : 'text-muted'
            }`
          }
        >
          <span className="text-base leading-none">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
