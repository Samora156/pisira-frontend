import { useEffect, useState } from 'react'
import { Plus, CheckCircle, FileText, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { getInvoices, createInvoice, lunaskanInvoice, getOrders, getEstimasi, getOrder } from '@/api'
import {
  Button, StatusBadge, LoadingPage, EmptyState, PageHeader, Card, CardContent,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  FormField, Input, Spinner,
} from '@/components/ui'
import InvoicePrint from '@/components/InvoicePrint'
import { formatRupiah, cn } from '@/lib/utils'

export default function Invoices() {
  const [invoices, setInvoices]           = useState([])
  const [selesaiOrders, setSelesaiOrders] = useState([])
  const [loading, setLoading]             = useState(true)
  const [filterBayar, setFilterBayar]     = useState('')
  const [addOpen, setAddOpen]             = useState(false)
  const [printData, setPrintData]         = useState(null) // { invoice, order, estimasi }
  const [form, setForm]     = useState({ order_id: '', diskon: '0', metode_bayar: 'tunai' })
  const [estimasiPreview, setEst]         = useState(null)
  const [saving, setSaving]               = useState(false)
  const [loadingPrint, setLoadingPrint]   = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = filterBayar ? { status_bayar: filterBayar } : {}
      const [inv, ord] = await Promise.all([getInvoices(params), getOrders({ status: 'selesai' })])
      setInvoices(inv.data.data ?? [])
      setSelesaiOrders(ord.data.data ?? [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterBayar])

  // Saat dialog dibuka, jika ada order selesai langsung load estimasi order pertama
  useEffect(() => {
    if (addOpen && selesaiOrders.length > 0 && !form.order_id) {
      const firstId = String(selesaiOrders[0].id)
      handleOrderChange(firstId)
    }
  }, [addOpen, selesaiOrders])

  const handleOrderChange = async (orderId) => {
    setForm(f => ({ ...f, order_id: orderId }))
    if (!orderId) { setEst(null); return }
    try { setEst((await getEstimasi(orderId)).data.data) }
    catch { setEst(null); toast.error('Estimasi belum dibuat untuk order ini') }
  }

  const handleCreate = async () => {
    if (!form.order_id) return toast.error('Pilih order terlebih dahulu')
    if (!estimasiPreview) return toast.error('Order ini belum memiliki estimasi')
    setSaving(true)
    try {
      await createInvoice({ ...form, order_id: Number(form.order_id), diskon: Number(form.diskon) || 0 })
      toast.success('Invoice berhasil dibuat!')
      setAddOpen(false)
      setForm({ order_id: '', diskon: '0', metode_bayar: 'tunai' })
      setEst(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Gagal membuat invoice') }
    finally { setSaving(false) }
  }

  const handleLunas = async (inv) => {
    if (!window.confirm(`Tandai invoice ${inv.no_invoice} sebagai LUNAS?`)) return
    try {
      await lunaskanInvoice(inv.order_id)
      toast.success('Invoice berhasil dilunaskan!')
      load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Gagal melunaskan') }
  }

  const handlePrint = async (inv) => {
    setLoadingPrint(true)
    try {
      const [orderRes, estRes] = await Promise.all([
        getOrder(inv.order_id),
        getEstimasi(inv.order_id).catch(() => ({ data: { data: null } })),
      ])
      setPrintData({ invoice: inv, order: orderRes.data.data, estimasi: estRes.data.data })
    } catch { toast.error('Gagal memuat data invoice') }
    finally { setLoadingPrint(false) }
  }

  const diskon     = Number(form.diskon) || 0
  const totalBayar = (estimasiPreview?.total ?? 0) - diskon

  if (loading) return <LoadingPage />

  const TABS = [['', 'Semua'], ['belum_lunas', 'Belum Lunas'], ['lunas', 'Lunas']]

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Invoice" description={`${invoices.length} invoice`}
        action={<Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Buat Invoice</Button>} />

      <div className="flex gap-1.5">
        {TABS.map(([v, l]) => (
          <button key={v} onClick={() => setFilterBayar(v)}
            className={cn('px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
              filterBayar === v
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-input text-muted-foreground hover:bg-accent')}>
            {l}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="data-table min-w-[700px]">
            <thead><tr>
              <th>No Invoice</th><th>No Order</th><th>Customer</th>
              <th>Total</th><th>Metode</th><th>Tanggal</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {invoices.length === 0
                ? <tr><td colSpan={8}><EmptyState icon={<FileText size={40}/>} message="Belum ada invoice" /></td></tr>
                : invoices.map(inv => (
                  <tr key={inv.id}>
                    <td><span className="font-mono text-xs text-primary font-medium">{inv.no_invoice}</span></td>
                    <td><span className="font-mono text-xs text-muted-foreground">{inv.no_order}</span></td>
                    <td className="font-medium text-sm">{inv.customer_nama}</td>
                    <td className="font-semibold tabular-nums">{formatRupiah(inv.total_bayar)}</td>
                    <td className="capitalize text-sm text-muted-foreground">{inv.metode_bayar}</td>
                    <td className="text-xs text-muted-foreground">
                      {format(new Date(inv.tanggal_invoice), 'd MMM yyyy', { locale: idLocale })}
                    </td>
                    <td><StatusBadge status={inv.status_bayar} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        {/* Tombol cetak */}
                        <Button variant="ghost" size="sm" onClick={() => handlePrint(inv)} disabled={loadingPrint}>
                          {loadingPrint ? <Spinner className="h-3.5 w-3.5" /> : <Printer className="h-3.5 w-3.5" />}
                        </Button>
                        {inv.status_bayar === 'belum_lunas' && (
                          <Button variant="ghost" size="sm"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleLunas(inv)}>
                            <CheckCircle className="h-3.5 w-3.5" /> Lunas
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table></div>
        </CardContent>
      </Card>

      {/* Dialog: Buat Invoice */}
      <Dialog open={addOpen} onOpenChange={v => { if (!v) { setAddOpen(false); setEst(null) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Buat Invoice Baru</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <FormField label="Order (status: Selesai)" required>
              <select
                style={{ width:'100%', height:'36px', padding:'0 12px', borderRadius:'6px', border:'1px solid hsl(240 5.9% 90%)', background:'hsl(0 0% 100%)', fontSize:'14px', color:'hsl(240 10% 3.9%)', outline:'none', cursor:'pointer' }}
                value={form.order_id}
                onChange={e => handleOrderChange(e.target.value)}
              >
                <option value="">-- Pilih Order Selesai --</option>
                {selesaiOrders.map(o => (
                  <option key={o.id} value={String(o.id)}>
                    {o.no_order} — {o.customer_nama}
                  </option>
                ))}
              </select>
              {selesaiOrders.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">Belum ada order dengan status Selesai.</p>
              )}
            </FormField>

            {estimasiPreview && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Biaya Jasa</span><span>{formatRupiah(estimasiPreview.biaya_jasa)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Biaya Sparepart</span><span>{formatRupiah(estimasiPreview.biaya_sparepart)}</span>
                </div>
                {diskon > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Diskon</span><span>- {formatRupiah(diskon)}</span>
                  </div>
                )}
                <div className="h-px bg-border" />
                <div className="flex justify-between font-semibold">
                  <span>Total Bayar</span>
                  <span className="text-primary">{formatRupiah(totalBayar)}</span>
                </div>
              </div>
            )}

            <FormField label="Diskon (Rp)" hint="Isi 0 jika tidak ada diskon">
              <Input type="number" min="0" placeholder="0" className="font-mono"
                value={form.diskon} onChange={e => setForm(f => ({ ...f, diskon: e.target.value }))} />
            </FormField>

            <FormField label="Metode Pembayaran" required>
              <select
                style={{ width:'100%', height:'36px', padding:'0 12px', borderRadius:'6px', border:'1px solid hsl(240 5.9% 90%)', background:'hsl(0 0% 100%)', fontSize:'14px', color:'hsl(240 10% 3.9%)', outline:'none', cursor:'pointer' }}
                value={form.metode_bayar}
                onChange={e => setForm(f => ({ ...f, metode_bayar: e.target.value }))}
              >
                <option value="tunai">Tunai</option>
                <option value="transfer">Transfer Bank</option>
                <option value="qris">QRIS</option>
              </select>
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEst(null) }}>Batal</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Spinner className="h-4 w-4" />}{saving ? 'Menyimpan...' : 'Buat Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Cetak Invoice */}
      <Dialog open={!!printData} onOpenChange={v => !v && setPrintData(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Invoice — {printData?.invoice?.no_invoice}</DialogTitle>
          </DialogHeader>
          {printData && (
            <InvoicePrint
              invoice={printData.invoice}
              order={printData.order}
              estimasi={printData.estimasi}
              onClose={() => setPrintData(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
