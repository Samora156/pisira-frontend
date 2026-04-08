import { useEffect, useState } from 'react'
import { Plus, FileText, CheckCircle, XCircle, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { getOrders, getEstimasi, createEstimasi, updatePersetujuan } from '@/api'
import {
  Button, StatusBadge, LoadingPage, EmptyState, PageHeader, Card, CardContent,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  FormField, Input, Textarea, Spinner,
} from '@/components/ui'
import { formatRupiah, cn } from '@/lib/utils'

export default function Estimasi() {
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null) // order yang dipilih
  const [estimasi, setEstimasi]   = useState(null)
  const [loadingEst, setLoadingEst] = useState(false)
  const [addOpen, setAddOpen]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm] = useState({
    deskripsi_pekerjaan: '',
    biaya_jasa: '',
    biaya_sparepart: '0',
    catatan: '',
  })

  const load = async () => {
    setLoading(true)
    try {
      // tampilkan order yang relevan untuk estimasi
      const res = await getOrders({ status: 'diagnosa' })
      const res2 = await getOrders({ status: 'menunggu_persetujuan' })
      const res3 = await getOrders({ status: 'proses' })
      const all = [
        ...(res.data.data ?? []),
        ...(res2.data.data ?? []),
        ...(res3.data.data ?? []),
      ]
      setOrders(all)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSelectOrder = async (order) => {
    setSelected(order)
    setEstimasi(null)
    setLoadingEst(true)
    try {
      const res = await getEstimasi(order.id)
      setEstimasi(res.data.data)
    } catch {
      setEstimasi(null) // belum ada estimasi
    } finally { setLoadingEst(false) }
  }

  const handleCreate = async () => {
    if (!form.deskripsi_pekerjaan || !form.biaya_jasa)
      return toast.error('Deskripsi pekerjaan dan biaya jasa wajib diisi')
    setSaving(true)
    try {
      await createEstimasi({
        order_id:            selected.id,
        deskripsi_pekerjaan: form.deskripsi_pekerjaan,
        biaya_jasa:          Number(form.biaya_jasa),
        biaya_sparepart:     Number(form.biaya_sparepart) || 0,
        catatan:             form.catatan || null,
      })
      toast.success('Estimasi berhasil dibuat!')
      setAddOpen(false)
      setForm({ deskripsi_pekerjaan: '', biaya_jasa: '', biaya_sparepart: '0', catatan: '' })
      // refresh estimasi & list
      const res = await getEstimasi(selected.id)
      setEstimasi(res.data.data)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Gagal membuat estimasi')
    } finally { setSaving(false) }
  }

  const handlePersetujuan = async (status) => {
    const label = status === 'disetujui' ? 'menyetujui' : 'menolak'
    if (!window.confirm(`Apakah Anda yakin ${label} estimasi ini?`)) return
    try {
      await updatePersetujuan(selected.id, { status })
      toast.success(`Estimasi berhasil ${status === 'disetujui' ? 'disetujui' : 'ditolak'}!`)
      const res = await getEstimasi(selected.id)
      setEstimasi(res.data.data)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Gagal update persetujuan')
    }
  }

  // Kirim notifikasi WhatsApp ke customer
  const handleWANotif = () => {
    if (!selected || !estimasi) return
    const total = estimasi.biaya_jasa + estimasi.biaya_sparepart
    const noHP  = selected.customer_no_hp.replace(/^0/, '62')
    const msg   = encodeURIComponent(
      `Halo ${selected.customer_nama},\n\n` +
      `Kami dari *PISIRA Service Laptop* ingin memberitahu bahwa laptop Anda:\n` +
      `🖥️ *${selected.merk_laptop} ${selected.model_laptop}*\n` +
      `📋 No Order: *${selected.no_order}*\n\n` +
      `Telah selesai didiagnosa. Berikut estimasi biaya:\n` +
      `• Biaya Jasa: ${formatRupiah(estimasi.biaya_jasa)}\n` +
      `• Biaya Sparepart: ${formatRupiah(estimasi.biaya_sparepart)}\n` +
      `• *Total: ${formatRupiah(total)}*\n\n` +
      `${estimasi.catatan ? `Catatan: ${estimasi.catatan}\n\n` : ''}` +
      `Mohon konfirmasi persetujuan Anda. Terima kasih! 🙏`
    )
    window.open(`https://wa.me/${noHP}?text=${msg}`, '_blank')
  }

  const biayaJasa     = Number(form.biaya_jasa) || 0
  const biayaSparepart= Number(form.biaya_sparepart) || 0
  const totalPreview  = biayaJasa + biayaSparepart

  if (loading) return <LoadingPage />

  const PERSETUJUAN_COLOR = {
    menunggu:  'text-amber-600 bg-amber-50 border-amber-200',
    disetujui: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    ditolak:   'text-red-600 bg-red-50 border-red-200',
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Estimasi Biaya"
        description="Kelola estimasi biaya perbaikan laptop"
      />

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Kiri: daftar order */}
        <div className="lg:col-span-2 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
            Order Aktif ({orders.length})
          </p>
          {orders.length === 0 ? (
            <Card className="p-8">
              <EmptyState icon={<ClipboardList size={36} />} message="Tidak ada order untuk diestimasi" />
            </Card>
          ) : (
            orders.map(o => (
              <button key={o.id} onClick={() => handleSelectOrder(o)} className={cn(
                'w-full text-left rounded-xl border p-4 transition-all hover:border-primary/50 hover:shadow-sm',
                selected?.id === o.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'bg-card border-border'
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-primary font-medium">{o.no_order}</p>
                    <p className="font-medium text-sm mt-0.5 truncate">{o.customer_nama}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{o.merk_laptop} {o.model_laptop}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{o.keluhan}</p>
              </button>
            ))
          )}
        </div>

        {/* Kanan: detail estimasi */}
        <div className="lg:col-span-3">
          {!selected ? (
            <Card className="h-full flex items-center justify-center p-12">
              <div className="text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Pilih order di kiri untuk melihat atau membuat estimasi</p>
              </div>
            </Card>
          ) : (
            <Card>
              {/* Header order */}
              <div className="p-5 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-primary">{selected.no_order}</p>
                    <h2 className="font-semibold mt-0.5">{selected.customer_nama}</h2>
                    <p className="text-sm text-muted-foreground">{selected.merk_laptop} {selected.model_laptop}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
                <div className="mt-3 p-3 rounded-lg bg-muted/40 text-sm">
                  <p className="font-medium text-xs text-muted-foreground mb-1">Keluhan:</p>
                  <p className="text-foreground">{selected.keluhan}</p>
                  {selected.diagnosa && (
                    <>
                      <p className="font-medium text-xs text-muted-foreground mt-2 mb-1">Diagnosa:</p>
                      <p className="text-foreground">{selected.diagnosa}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Estimasi */}
              <div className="p-5">
                {loadingEst ? (
                  <div className="flex justify-center py-10"><Spinner className="h-6 w-6 text-primary" /></div>
                ) : estimasi ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Detail Estimasi</h3>
                      <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', PERSETUJUAN_COLOR[estimasi.status_persetujuan])}>
                        {estimasi.status_persetujuan === 'menunggu' ? 'Menunggu Persetujuan'
                          : estimasi.status_persetujuan === 'disetujui' ? 'Disetujui'
                          : 'Ditolak'}
                      </span>
                    </div>

                    <div className="rounded-lg border divide-y">
                      <div className="flex justify-between px-4 py-3 text-sm">
                        <span className="text-muted-foreground">Biaya Jasa</span>
                        <span className="font-medium">{formatRupiah(estimasi.biaya_jasa)}</span>
                      </div>
                      <div className="flex justify-between px-4 py-3 text-sm">
                        <span className="text-muted-foreground">Biaya Sparepart</span>
                        <span className="font-medium">{formatRupiah(estimasi.biaya_sparepart)}</span>
                      </div>
                      <div className="flex justify-between px-4 py-3">
                        <span className="font-semibold text-sm">Total</span>
                        <span className="font-bold text-primary">{formatRupiah(estimasi.total)}</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Deskripsi Pekerjaan:</p>
                      <p className="text-sm">{estimasi.deskripsi_pekerjaan}</p>
                      {estimasi.catatan && (
                        <>
                          <p className="text-xs font-medium text-muted-foreground mt-2 mb-1">Catatan:</p>
                          <p className="text-sm">{estimasi.catatan}</p>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Dibuat: {format(new Date(estimasi.created_at), 'd MMM yyyy, HH:mm', { locale: idLocale })}
                    </p>

                    {/* Tombol aksi */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {/* Kirim WA */}
                      <Button variant="outline" size="sm" onClick={handleWANotif}
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Kirim ke WA Customer
                      </Button>

                      {/* Persetujuan — hanya jika masih menunggu */}
                      {estimasi.status_persetujuan === 'menunggu' && (
                        <>
                          <Button size="sm" onClick={() => handlePersetujuan('disetujui')}
                            className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle className="h-4 w-4" /> Setujui
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handlePersetujuan('ditolak')}>
                            <XCircle className="h-4 w-4" /> Tolak
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  // Belum ada estimasi
                  <div className="flex flex-col items-center py-10 gap-4">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Belum ada estimasi untuk order ini</p>
                    </div>
                    <Button onClick={() => setAddOpen(true)}>
                      <Plus className="h-4 w-4" /> Buat Estimasi
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog: Buat Estimasi */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Estimasi Biaya</DialogTitle>
            {selected && (
              <p className="text-xs text-muted-foreground font-mono mt-1">{selected.no_order} — {selected.customer_nama}</p>
            )}
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FormField label="Deskripsi Pekerjaan" required>
              <Textarea placeholder="Contoh: Ganti thermal paste, bersihkan debu, ganti SSD..." className="h-24"
                value={form.deskripsi_pekerjaan}
                onChange={e => setForm(f => ({ ...f, deskripsi_pekerjaan: e.target.value }))} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Biaya Jasa (Rp)" required>
                <Input type="number" min="0" placeholder="0" className="font-mono"
                  value={form.biaya_jasa}
                  onChange={e => setForm(f => ({ ...f, biaya_jasa: e.target.value }))} />
              </FormField>
              <FormField label="Biaya Sparepart (Rp)">
                <Input type="number" min="0" placeholder="0" className="font-mono"
                  value={form.biaya_sparepart}
                  onChange={e => setForm(f => ({ ...f, biaya_sparepart: e.target.value }))} />
              </FormField>
            </div>

            {/* Preview total */}
            {(biayaJasa > 0 || biayaSparepart > 0) && (
              <div className="rounded-lg bg-muted/40 px-4 py-3 flex justify-between text-sm">
                <span className="text-muted-foreground">Total Estimasi</span>
                <span className="font-bold text-primary">{formatRupiah(totalPreview)}</span>
              </div>
            )}

            <FormField label="Catatan" hint="Opsional — saran atau keterangan tambahan">
              <Textarea placeholder="Contoh: Sebaiknya baterai juga diganti karena sudah lemah..."
                className="h-20"
                value={form.catatan}
                onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Spinner className="h-4 w-4" />}
              {saving ? 'Menyimpan...' : 'Simpan Estimasi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
