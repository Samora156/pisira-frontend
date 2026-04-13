import { useEffect, useState } from 'react'
import { Plus, Search, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { getOrders, createOrder, updateOrderStatus, getCustomers } from '@/api'
import {
  Button, Input, StatusBadge, LoadingPage, EmptyState, PageHeader,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  FormField, Textarea, Spinner, Card, CardContent,
} from '@/components/ui'
import { cn } from '@/lib/utils'

const STATUSES = [
  { value: '',                     label: 'Semua' },
  { value: 'menunggu',             label: 'Menunggu' },
  { value: 'diagnosa',             label: 'Diagnosa' },
  { value: 'menunggu_persetujuan', label: 'Tunggu Persetujuan' },
  { value: 'proses',               label: 'Diproses' },
  { value: 'selesai',              label: 'Selesai' },
  { value: 'diambil',              label: 'Diambil' },
  { value: 'batal',                label: 'Batal' },
]

const EMPTY_ORDER  = { customer_id: '', merk_laptop: '', model_laptop: '', sn_laptop: '', keluhan: '' }
const EMPTY_STATUS = { status: '', diagnosa: '', catatan_teknisi: '' }

const nativeSelectStyle = {
  width: '100%',
  height: '36px',
  padding: '0 12px',
  borderRadius: '6px',
  border: '1px solid hsl(240 5.9% 90%)',
  background: 'hsl(0 0% 100%)',
  fontSize: '14px',
  color: 'hsl(240 10% 3.9%)',
  outline: 'none',
  cursor: 'pointer',
}

export default function Orders() {
  const [orders, setOrders]             = useState([])
  const [customers, setCustomers]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilter]       = useState('')
  const [addOpen, setAddOpen]           = useState(false)
  const [statusTarget, setStatusTarget] = useState(null)
  const [form, setForm]                 = useState(EMPTY_ORDER)
  const [statusForm, setStatusForm]     = useState(EMPTY_STATUS)
  const [saving, setSaving]             = useState(false)

  const load = async (s = filterStatus, q = search) => {
    setLoading(true)
    try {
      const params = {}
      if (s) params.status = s
      if (q) params.search = q
      const [o, c] = await Promise.all([getOrders(params), getCustomers()])
      setOrders(o.data.data ?? [])
      setCustomers(c.data.data ?? [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterStatus])

  // Refresh customers setiap kali dialog dibuka
  const openAdd = async () => {
    try {
      const c = await getCustomers()
      setCustomers(c.data.data ?? [])
    } catch {}
    setForm(EMPTY_ORDER)
    setAddOpen(true)
  }

  const handleAdd = async () => {
    if (!form.customer_id || !form.merk_laptop || !form.model_laptop || !form.keluhan)
      return toast.error('Harap isi semua field yang wajib')
    setSaving(true)
    try {
      await createOrder({
        ...form,
        customer_id: Number(form.customer_id),
        sn_laptop: form.sn_laptop || null,
      })
      toast.success('Order berhasil dibuat!')
      setAddOpen(false)
      setForm(EMPTY_ORDER)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Gagal membuat order')
    } finally { setSaving(false) }
  }

  const openStatus = (o) => {
    setStatusTarget(o)
    setStatusForm({ status: o.status, diagnosa: o.diagnosa ?? '', catatan_teknisi: o.catatan_teknisi ?? '' })
  }

  const handleUpdateStatus = async () => {
    setSaving(true)
    try {
      await updateOrderStatus(statusTarget.id, statusForm)
      toast.success('Status berhasil diupdate!')
      setStatusTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Gagal update')
    } finally { setSaving(false) }
  }

  if (loading) return <LoadingPage />

  return (
      <div className="space-y-5 animate-fade-in">
        <PageHeader
            title="Order Servis"
            description={`${orders.length} order ditemukan`}
            action={<Button onClick={openAdd}><Plus className="h-4 w-4" />Order Baru</Button>}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <form onSubmit={e => { e.preventDefault(); load(filterStatus, search) }} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8 w-52" placeholder="Cari order / customer..."
                     value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button type="submit" variant="outline" size="sm">Cari</Button>
          </form>
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map(s => (
                <button key={s.value} onClick={() => setFilter(s.value)}
                        className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                            filterStatus === s.value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-input text-muted-foreground hover:bg-accent')}>
                  {s.label}
                </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <table className="data-table">
              <thead>
              <tr>
                <th>No Order</th><th>Customer</th><th>Laptop</th>
                <th>Keluhan</th><th>Tgl Masuk</th><th>Status</th><th></th>
              </tr>
              </thead>
              <tbody>
              {orders.length === 0
                  ? <tr><td colSpan={7}><EmptyState icon={<ClipboardList size={40} />} message="Tidak ada order" /></td></tr>
                  : orders.map(o => (
                      <tr key={o.id}>
                        <td><span className="font-mono text-xs text-primary font-medium">{o.no_order}</span></td>
                        <td>
                          <p className="font-medium text-sm">{o.customer_nama}</p>
                          <p className="text-xs text-muted-foreground">{o.customer_no_hp}</p>
                        </td>
                        <td className="text-sm">{o.merk_laptop} {o.model_laptop}</td>
                        <td className="max-w-[160px]">
                          <p className="text-xs text-muted-foreground truncate">{o.keluhan}</p>
                        </td>
                        <td className="text-xs text-muted-foreground">
                          {format(new Date(o.tanggal_masuk), 'd MMM yyyy', { locale: idLocale })}
                        </td>
                        <td><StatusBadge status={o.status} /></td>
                        <td>
                          <Button variant="ghost" size="sm" onClick={() => openStatus(o)}>Update</Button>
                        </td>
                      </tr>
                  ))
              }
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Dialog: Tambah Order */}
        <Dialog open={addOpen} onOpenChange={v => { if (!v) { setAddOpen(false); setForm(EMPTY_ORDER) } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Order Servis Baru</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">

              {/* Native select — tidak konflik dengan Dialog */}
              <FormField label="Customer" required>
                <select
                    style={nativeSelectStyle}
                    value={form.customer_id}
                    onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
                >
                  <option value="">-- Pilih Customer --</option>
                  {customers.map(c => (
                      <option key={c.id} value={String(c.id)}>
                        {c.nama} — {c.no_hp}
                      </option>
                  ))}
                </select>
                {customers.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Belum ada customer. Tambahkan di menu Customer terlebih dahulu.
                    </p>
                )}
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Merk" required>
                  <Input placeholder="ASUS, Lenovo, HP..."
                         value={form.merk_laptop}
                         onChange={e => setForm(f => ({ ...f, merk_laptop: e.target.value }))} />
                </FormField>
                <FormField label="Model" required>
                  <Input placeholder="VivoBook 14..."
                         value={form.model_laptop}
                         onChange={e => setForm(f => ({ ...f, model_laptop: e.target.value }))} />
                </FormField>
              </div>

              <FormField label="Serial Number" hint="Opsional">
                <Input className="font-mono text-sm" placeholder="SN/IMEI..."
                       value={form.sn_laptop}
                       onChange={e => setForm(f => ({ ...f, sn_laptop: e.target.value }))} />
              </FormField>

              <FormField label="Keluhan" required>
                <Textarea placeholder="Deskripsi keluhan customer..." className="h-24"
                          value={form.keluhan}
                          onChange={e => setForm(f => ({ ...f, keluhan: e.target.value }))} />
              </FormField>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAddOpen(false); setForm(EMPTY_ORDER) }}>Batal</Button>
              <Button onClick={handleAdd} disabled={saving}>
                {saving && <Spinner className="h-4 w-4" />}
                {saving ? 'Menyimpan...' : 'Simpan Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Update Status */}
        <Dialog open={!!statusTarget} onOpenChange={v => !v && setStatusTarget(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Status</DialogTitle>
              <p className="text-xs text-muted-foreground font-mono mt-1">{statusTarget?.no_order}</p>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <FormField label="Status Baru" required>
                <select
                    style={nativeSelectStyle}
                    value={statusForm.status}
                    onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="">-- Pilih Status --</option>
                  {STATUSES.filter(s => s.value).map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Hasil Diagnosa">
                <Textarea placeholder="Temuan setelah diperiksa..." className="h-20"
                          value={statusForm.diagnosa}
                          onChange={e => setStatusForm(f => ({ ...f, diagnosa: e.target.value }))} />
              </FormField>
              <FormField label="Catatan Teknisi">
                <Textarea placeholder="Catatan pengerjaan..." className="h-20"
                          value={statusForm.catatan_teknisi}
                          onChange={e => setStatusForm(f => ({ ...f, catatan_teknisi: e.target.value }))} />
              </FormField>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusTarget(null)}>Batal</Button>
              <Button onClick={handleUpdateStatus} disabled={saving}>
                {saving && <Spinner className="h-4 w-4" />}
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}