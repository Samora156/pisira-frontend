import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { getCustomers, createCustomer, updateCustomer } from '@/api'
import {
  Button, Input, LoadingPage, EmptyState, PageHeader, Card, CardContent,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  FormField, Textarea, Spinner,
} from '@/components/ui'

const EMPTY = { nama: '', no_hp: '', email: '', alamat: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null) // null | 'add' | {customer}
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)

  const load = async (q = '') => {
    setLoading(true)
    try { setCustomers((await getCustomers(q)).data.data ?? []) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd  = () => { setForm(EMPTY); setModal('add') }
  const openEdit = (c) => { setForm({ nama: c.nama, no_hp: c.no_hp, email: c.email ?? '', alamat: c.alamat ?? '' }); setModal(c) }

  const handleSave = async () => {
    if (!form.nama || !form.no_hp) return toast.error('Nama dan No HP wajib diisi')
    setSaving(true)
    try {
      const payload = { ...form, email: form.email || null, alamat: form.alamat || null }
      if (modal === 'add') {
        await createCustomer(payload); toast.success('Customer berhasil ditambahkan!')
      } else {
        await updateCustomer(modal.id, payload); toast.success('Data berhasil diupdate!')
      }
      setModal(null); load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Gagal menyimpan') }
    finally { setSaving(false) }
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Data Customer" description={`${customers.length} customer terdaftar`}
        action={<Button onClick={openAdd}><Plus className="h-4 w-4" />Tambah Customer</Button>} />

      <form onSubmit={e => { e.preventDefault(); load(search) }} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Cari nama atau No HP..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button type="submit" variant="outline">Cari</Button>
        <Button type="button" variant="ghost" onClick={() => { setSearch(''); load() }}>Reset</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          <table className="data-table">
            <thead><tr>
              <th>#</th><th>Nama</th><th>No HP</th><th>Email</th><th>Alamat</th><th>Terdaftar</th><th></th>
            </tr></thead>
            <tbody>
              {customers.length === 0
                ? <tr><td colSpan={7}><EmptyState icon={<Users size={40}/>} message="Belum ada customer" /></td></tr>
                : customers.map((c, i) => (
                  <tr key={c.id}>
                    <td className="text-muted-foreground text-sm">{i + 1}</td>
                    <td className="font-medium">{c.nama}</td>
                    <td>
                      <a href={`https://wa.me/62${c.no_hp.replace(/^0/, '')}`} target="_blank" rel="noreferrer"
                        className="font-mono text-xs text-primary hover:underline">{c.no_hp}</a>
                    </td>
                    <td className="text-sm text-muted-foreground">{c.email ?? <span className="text-muted-foreground/40">—</span>}</td>
                    <td className="text-sm text-muted-foreground max-w-[160px] truncate">{c.alamat ?? <span className="text-muted-foreground/40">—</span>}</td>
                    <td className="text-xs text-muted-foreground">
                      {format(new Date(c.created_at), 'd MMM yyyy', { locale: idLocale })}
                    </td>
                    <td>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                        <Pencil className="h-3.5 w-3.5" />Edit
                      </Button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!modal} onOpenChange={v => !v && setModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{modal === 'add' ? 'Tambah Customer Baru' : `Edit: ${modal?.nama}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FormField label="Nama Lengkap" required>
              <Input placeholder="Budi Santoso" value={form.nama} onChange={f('nama')} />
            </FormField>
            <FormField label="Nomor HP" required hint="Format: 081234567890">
              <Input className="font-mono" placeholder="081234567890" value={form.no_hp} onChange={f('no_hp')} />
            </FormField>
            <FormField label="Email" hint="Opsional">
              <Input type="email" placeholder="email@contoh.com" value={form.email} onChange={f('email')} />
            </FormField>
            <FormField label="Alamat" hint="Opsional">
              <Textarea placeholder="Jl. Merdeka No. 1, Malang" className="h-20" value={form.alamat} onChange={f('alamat')} />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Spinner className="h-4 w-4" />}{saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
