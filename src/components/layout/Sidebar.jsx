import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Users, Calculator,
  FileText, BarChart2, LogOut, Wrench,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Separator } from '@/components/ui'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import logo from '../../logo.png'

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders',    icon: ClipboardList,   label: 'Order Servis' },
  { to: '/customers', icon: Users,           label: 'Customer' },
  { to: '/estimasi',  icon: Calculator,      label: 'Estimasi' },
  { to: '/invoices',  icon: FileText,        label: 'Invoice' },
]
const ADMIN_NAV = [
  { to: '/laporan', icon: BarChart2, label: 'Laporan' },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Berhasil keluar')
    navigate('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[220px] flex-col border-r bg-background">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b px-4">
        <img src={logo} alt={logo} />
        {/*<div>*/}
        {/*  <p className="text-sm font-bold leading-none">PISIRA</p>*/}
        {/*  <p className="text-[10px] text-muted-foreground mt-0.5">Service Laptop</p>*/}
        {/*</div>*/}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-auto px-2 py-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}>
            <Icon className="h-4 w-4" />{label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <Separator className="my-3" />
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Admin
            </p>
            {ADMIN_NAV.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}>
                <Icon className="h-4 w-4" />{label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="border-t p-3 space-y-1">
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
            {user?.nama?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none">{user?.nama}</p>
            <p className="mt-0.5 text-[11px] capitalize text-muted-foreground">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className={cn('nav-link w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10')}>
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>
    </aside>
  )
}
