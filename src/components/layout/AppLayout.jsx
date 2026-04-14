import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '@/lib/auth'

export default function AppLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Desktop: margin kiri untuk sidebar. Mobile: padding atas untuk header */}
      <main className="md:ml-[220px] pt-14 md:pt-0">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 md:py-7 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
