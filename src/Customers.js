import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCustomers, createCustomer, updateCustomer } from '../api'
import { LoadingPage, EmptyState, Modal, Field, PageHeader } from '../components/ui'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const EMPTY_FORM = { nama: '', no_hp: '', email: '', alamat: '' }

export default function Customers() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading]     = useState(true)
    const [search, setSearch]       = useState('')
    const [modal, setModal]         = useState(null) // null | 'add' | customer object (edit)
    const [form, setForm]           = useState(EMPTY_FORM)
    const [saving, setSaving]       = useState(false)

    const load = async (q = search) => {
        setLoading(true)
        try {
            const res = await getCustomers(q)
            setCustomers(res.data.data ?? [])
        } finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const openAdd  = () => { setForm(EMPTY_FORM); setModal('add') }
    const openEdit = (c)  => { setForm({ nama: c.nama, no_hp: c.no_hp, email: c.email ?? '', alamat: c.alamat ?? '' }); setModal(c) }

    const handleSave = async () => {
        if (!form.nama || !form.no_hp) return toast.error('Nama dan No HP wajib diisi')
        setSaving(true)
        try {
            const payload = { ...form, email: form.email || null, alamat: form.alamat || null }
            if (modal === 'add') {
                await createCustomer(payload)
                toast.success('Customer berhasil ditambahkan!')
            } else {
                await updateCustomer(modal.id, payload)
                toast.success('Data customer berhasil diupdate!')
            }
            setModal(null)
            load('')
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Gagal menyimpan')
        } finally { setSaving(false) }
    }

    const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

    if (loading) return <LoadingPage />

    return (
        <div className="space-y-5">
            <PageHeader
                title="Data Customer"
                subtitle={`${customers.length} customer terdaftar`}
                action={
                    <button className="btn-primary" onClick={openAdd}>
                        <Plus size={16} /> Tambah Customer
                    </button>
                }
            />

            {/* Search */}
            <form onSubmit={e => { e.preventDefault(); load(search) }} className="flex gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="input pl-9" placeholder="Cari nama atau nomor HP..."
                           value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button type="submit" className="btn-secondary">Cari</button>
                <button type="button" className="btn-secondary" onClick={() => { setSearch(''); load('') }}>Reset</button>
            </form>

            {/* Tabel */}
            <div className="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>#</th><th>Nama</th><th>No HP</th><th>Email</th><th>Alamat</th><th>Terdaftar</th><th>Aksi</th>
                    </tr>
                    </thead>
                    <tbody>
                    {customers.length === 0
                        ? <tr><td colSpan={7}><EmptyState message="Tidak ada customer" icon={<Users size={40} />} /></td></tr>
                        : customers.map((c, i) => (
                            <tr key={c.id}>
                                <td className="text-slate-400">{i + 1}</td>
                                <td className="font-medium text-slate-800">{c.nama}</td>
                                <td>
                                    <a href={`https://wa.me/62${c.no_hp.replace(/^0/, '')}`} target="_blank" rel="noreferrer"
                                       className="text-brand-600 hover:underline font-mono text-sm">{c.no_hp}</a>
                                </td>
                                <td className="text-slate-500">{c.email ?? <span className="text-slate-300">—</span>}</td>
                                <td className="text-slate-500 max-w-[160px] truncate">{c.alamat ?? <span className="text-slate-300">—</span>}</td>
                                <td className="text-slate-400 text-xs">
                                    {format(new Date(c.created_at), 'd MMM yyyy', { locale: id })}
                                </td>
                                <td>
                                    <button className="btn-ghost text-xs py-1.5 px-2.5" onClick={() => openEdit(c)}>
                                        <Pencil size={13} /> Edit
                                    </button>
                                </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <Modal open={!!modal} onClose={() => setModal(null)}
                   title={modal === 'add' ? 'Tambah Customer Baru' : `Edit: ${modal?.nama}`}
                   footer={<>
                       <button className="btn-secondary" onClick={() => setModal(null)}>Batal</button>
                       <button className="btn-primary" onClick={handleSave} disabled={saving}>
                           {saving ? 'Menyimpan...' : 'Simpan'}
                       </button>
                   </>}>
                <div className="flex flex-col gap-4">
                    <Field label="Nama Lengkap" required>
                        <input className="input" placeholder="Budi Santoso" value={form.nama} onChange={f('nama')} />
                    </Field>
                    <Field label="Nomor HP" required hint="Contoh: 081234567890">
                        <input className="input font-mono" placeholder="081234567890" value={form.no_hp} onChange={f('no_hp')} />
                    </Field>
                    <Field label="Email" hint="Opsional">
                        <input className="input" type="email" placeholder="email@contoh.com" value={form.email} onChange={f('email')} />
                    </Field>
                    <Field label="Alamat" hint="Opsional">
            <textarea className="input h-20 resize-none" placeholder="Jl. Merdeka No. 1, Malang"
                      value={form.alamat} onChange={f('alamat')} />
                    </Field>
                </div>
            </Modal>
        </div>
    )
}