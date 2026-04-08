import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts'
import { getLaporanBulanan } from '@/api'
import { LoadingPage, PageHeader, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatRupiah } from '@/lib/utils'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui'

const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const YEARS  = ['2026', '2025', '2024']

export default function Laporan() {
  const [tahun, setTahun]   = useState(new Date().getFullYear().toString())
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getLaporanBulanan(tahun)
      .then(r => setData(r.data.data ?? []))
      .finally(() => setLoading(false))
  }, [tahun])

  const chart = data.map(d => ({
    bulan:      BULAN[Number(d.bulan?.slice(5)) - 1] ?? d.bulan,
    order:      d.total_order,
    selesai:    d.total_selesai,
    pendapatan: Number(d.total_pendapat),
  }))

  const totalOrder      = data.reduce((s, d) => s + d.total_order, 0)
  const totalSelesai    = data.reduce((s, d) => s + d.total_selesai, 0)
  const totalPendapatan = data.reduce((s, d) => s + Number(d.total_pendapat), 0)
  const rate            = totalOrder > 0 ? Math.round(totalSelesai / totalOrder * 100) : 0

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Laporan Tahunan" description="Performa bisnis PISIRA"
        action={
          <Select value={tahun} onValueChange={setTahun}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Order Masuk',  value: totalOrder,              sub: `Tahun ${tahun}`,           color: 'text-foreground' },
          { label: 'Order Selesai',      value: totalSelesai,            sub: `${rate}% completion rate`, color: 'text-emerald-600' },
          { label: 'Total Pendapatan',   value: formatRupiah(totalPendapatan), sub: 'Invoice lunas',     color: 'text-primary' },
        ].map(s => (
          <Card key={s.label} className="p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold tabular-nums mt-1.5 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Chart order */}
      <Card>
        <CardHeader><CardTitle>Jumlah Order per Bulan</CardTitle></CardHeader>
        <CardContent>
          {chart.length === 0
            ? <p className="text-center text-muted-foreground text-sm py-10">Belum ada data untuk tahun {tahun}</p>
            : <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chart} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', fontSize: 12 }}
                    cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="order"   name="Masuk"   fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                  <Bar dataKey="selesai" name="Selesai" fill="#10b981"              radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
          }
        </CardContent>
      </Card>

      {/* Chart pendapatan */}
      <Card>
        <CardHeader><CardTitle>Pendapatan per Bulan</CardTitle></CardHeader>
        <CardContent>
          {chart.length === 0
            ? <p className="text-center text-muted-foreground text-sm py-10">Belum ada data untuk tahun {tahun}</p>
            : <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={60}
                    tickFormatter={v => v >= 1_000_000 ? `${(v/1_000_000).toFixed(0)}jt` : v} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', fontSize: 12 }}
                    cursor={{ stroke: 'hsl(var(--border))' }}
                    formatter={v => [formatRupiah(v), 'Pendapatan']} />
                  <Line dataKey="pendapatan" stroke="hsl(var(--primary))" strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
          }
        </CardContent>
      </Card>

      {/* Tabel detail */}
      <Card>
        <CardHeader><CardTitle>Detail per Bulan</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="data-table">
            <thead><tr>
              <th>Bulan</th><th>Total Order</th><th>Selesai</th><th>Completion Rate</th><th>Pendapatan</th>
            </tr></thead>
            <tbody>
              {data.length === 0
                ? <tr><td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">Belum ada data</td></tr>
                : data.map((d, i) => {
                    const r = d.total_order > 0 ? Math.round(d.total_selesai / d.total_order * 100) : 0
                    return (
                      <tr key={i}>
                        <td className="font-medium">{BULAN[Number(d.bulan?.slice(5)) - 1]} {tahun}</td>
                        <td>{d.total_order}</td>
                        <td>{d.total_selesai}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${r}%` }} />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground">{r}%</span>
                          </div>
                        </td>
                        <td className="font-semibold">{formatRupiah(d.total_pendapat)}</td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
