import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Nav from './components/Nav.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WorkoutForm from './pages/WorkoutForm.jsx'
import History from './pages/History.jsx'
import Friends from './pages/Friends.jsx'

function AppShell({ children }) {
  const { user } = useAuth()
  return (
    <>
      {children}
      {user && <Nav />}
    </>
  )
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/log"
          element={
            <ProtectedRoute>
              <WorkoutForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppShell>
  )
}
