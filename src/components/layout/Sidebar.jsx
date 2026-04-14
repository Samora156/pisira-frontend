import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Users, Calculator,
  FileText, BarChart2, LogOut, Wrench, Menu, X,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Separator } from '@/components/ui'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

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

function NavLinks({ onClose, isAdmin, user, onLogout }) {
  return (
    <>
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b px-4 flex-shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Wrench className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold leading-none">PISIRA</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Service Laptop</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 rounded-md hover:bg-accent">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-auto px-2 py-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            onClick={onClose}
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
                onClick={onClose}
                className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}>
                <Icon className="h-4 w-4" />{label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="border-t p-3 space-y-1 flex-shrink-0">
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
            {user?.nama?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none">{user?.nama}</p>
            <p className="mt-0.5 text-[11px] capitalize text-muted-foreground">{user?.role}</p>
          </div>
        </div>
        <button onClick={onLogout}
          className={cn('nav-link w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10')}>
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>
    </>
  )
}

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Berhasil keluar')
    navigate('/login')
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-background border-b flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-md hover:bg-accent">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <Wrench className="h-3 w-3 text-primary-foreground" />
          </div>
          <p className="text-sm font-bold">PISIRA</p>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        'md:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-[260px] bg-background border-r',
        'transition-transform duration-200',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <NavLinks
          onClose={() => setMobileOpen(false)}
          isAdmin={isAdmin}
          user={user}
          onLogout={handleLogout}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-20 flex-col w-[220px] border-r bg-background">
        <NavLinks
          isAdmin={isAdmin}
          user={user}
          onLogout={handleLogout}
        />
      </aside>
    </>
  )
}
