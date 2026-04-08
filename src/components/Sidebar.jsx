import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Users, FileText, BarChart2, LogOut, Wrench } from 'lucide-react'
import { useAuth } from '../lib/auth'
import toast from 'react-hot-toast'

const links = [
    { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/orders',    icon: ClipboardList,   label: 'Order Servis' },
    { to: '/customers', icon: Users,           label: 'Customer' },
    { to: '/invoices',  icon: FileText,        label: 'Invoice' },
]

const adminLinks = [
    { to: '/laporan', icon: BarChart2, label: 'Laporan' },
]

export default function Sidebar() {
    const { user, logout, isAdmin } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        toast.success('Berhasil logout')
        navigate('/login')
    }

    return (
        <aside className="fixed top-0 left-0 h-screen bg-white border-r border-slate-100 flex flex-col z-10"
               style={{ width: 'var(--sidebar-w)' }}>
            {/* Logo */}
            <div className="px-5 py-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                        <Wrench size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 leading-none">PISIRA</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Service Laptop</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} end={to === '/'}
                             className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <Icon size={17} />
                        {label}
                    </NavLink>
                ))}

                {isAdmin && (
                    <>
                        <div className="mt-4 mb-1 px-3">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Admin</p>
                        </div>
                        {adminLinks.map(({ to, icon: Icon, label }) => (
                            <NavLink key={to} to={to}
                                     className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                                <Icon size={17} />
                                {label}
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>

            {/* User info + logout */}
            <div className="px-3 py-4 border-t border-slate-100">
                <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                        {user?.nama?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{user?.nama}</p>
                        <p className="text-[11px] text-slate-400 capitalize">{user?.role}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut size={16} /> Keluar
                </button>
            </div>
        </aside>
    )
}