import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import { useAuth } from '../../lib/auth'

export default function AppLayout() {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto" style={{ marginLeft: 'var(--sidebar-w)' }}>
                <div className="max-w-6xl mx-auto px-6 py-7">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}