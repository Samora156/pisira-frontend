import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Users, FileText, TrendingUp, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getOrders, getCustomers, getInvoices, getLaporanBulanan } from '@/api'
import { LoadingPage, StatusBadge, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { formatRupiah } from '@/lib/utils'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const YEAR = new Date().getFullYear().toString()

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ orders: [], customers: [], invoices: [], laporan: [] })

  useEffect(() => {
    (async () => {
      try {
        const [o, c, i] = await Promise.all([getOrders(), getCustomers(), getInvoices()])
        let laporan = []
        if (isAdmin) laporan = (await getLaporanBulanan(YEAR)).data.data ?? []
        setData({ orders: o.data.data ?? [], customers: c.data.data ?? [], invoices: i.data.data ?? [], laporan })
      } finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <LoadingPage />

  const { orders, customers, invoices, laporan } = data
  const aktif      = orders.filter(o => !['diambil', 'batal'].includes(o.status)).length
  const belumLunas = invoices.filter(i => i.status_bayar === 'belum_lunas').length
  const pendapatan = invoices.filter(i => i.status_bayar === 'lunas').reduce((s, i) => s + i.total_bayar, 0)
  const recent     = orders.slice(0, 5)

  const chartData = laporan.map(l => ({
    bulan: l.bulan?.slice(5),
    order: l.total_order,
    selesai: l.total_selesai,
  }))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg md:text-xl font-semibold">Halo, {user?.nama?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ringkasan aktivitas PISIRA.</p>
      </div>

      {/* Stat cards — 2 kolom di mobile, 4 di desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={ClipboardList} label="Order Aktif"    value={aktif}            color="blue" />
        <StatCard icon={Users}         label="Total Customer" value={customers.length} color="violet" />
        <StatCard icon={FileText}      label="Belum Lunas"    value={belumLunas}       color="orange" />
        {isAdmin &&
          <StatCard icon={TrendingUp} label="Pendapatan" value={formatRupiah(pendapatan)} color="emerald" small />
        }
      </div>

      <div className={`grid gap-5 ${isAdmin ? 'lg:grid-cols-5' : ''}`}>
        {/* Order terbaru */}
        <Card className={isAdmin ? 'lg:col-span-3' : ''}>
          <CardHeader className="pb-3 px-4 md:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm md:text-base">Order Terbaru</CardTitle>
              <Link to="/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
                Lihat semua <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table min-w-[400px]">
                <thead><tr><th>No Order</th><th>Customer</th><th>Laptop</th><th>Status</th></tr></thead>
                <tbody>
                  {recent.length === 0
                    ? <tr><td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">Belum ada order</td></tr>
                    : recent.map(o => (
                      <tr key={o.id}>
                        <td><span className="font-mono text-xs text-primary">{o.no_order}</span></td>
                        <td className="font-medium text-sm">{o.customer_nama}</td>
                        <td className="text-muted-foreground text-xs">{o.merk_laptop}</td>
                        <td><StatusBadge status={o.status} /></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Chart — hanya admin, hanya desktop */}
        {isAdmin && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3 px-4 md:px-6">
              <CardTitle className="text-sm md:text-base">Order per Bulan {YEAR}</CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              {chartData.length === 0
                ? <p className="text-center text-muted-foreground text-sm py-8">Belum ada data</p>
                : <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} barSize={18}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="bulan" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', fontSize: 12 }} cursor={{ fill: 'hsl(var(--muted))' }} />
                      <Bar dataKey="order"   name="Masuk"   fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                      <Bar dataKey="selesai" name="Selesai" fill="#10b981"              radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, small }) {
  const cls = { blue:'bg-blue-50 text-blue-600', violet:'bg-violet-50 text-violet-600', orange:'bg-orange-50 text-orange-600', emerald:'bg-emerald-50 text-emerald-600' }
  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${cls[color]}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className={`font-bold tabular-nums ${small ? 'text-base' : 'text-xl md:text-2xl'}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </Card>
  )
}
