import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '@/lib/auth'

export default function AppLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[220px] flex-1">
        <div className="mx-auto max-w-5xl px-6 py-7 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
