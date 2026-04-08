import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

// ─── Badge Status ─────────────────────────────────────────────
const STATUS_LABEL = {
    menunggu:              'Menunggu',
    diagnosa:              'Diagnosa',
    menunggu_persetujuan:  'Tunggu Persetujuan',
    proses:                'Diproses',
    selesai:               'Selesai',
    diambil:               'Diambil',
    batal:                 'Batal',
    lunas:                 'Lunas',
    belum_lunas:           'Belum Lunas',
}

export function StatusBadge({ status }) {
    return (
        <span className={clsx('badge', `badge-${status}`)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {STATUS_LABEL[status] ?? status}
    </span>
    )
}

// ─── Loading Spinner ──────────────────────────────────────────
export function Spinner({ className }) {
    return <Loader2 size={18} className={clsx('animate-spin text-brand-500', className)} />
}

export function LoadingPage() {
    return (
        <div className="flex items-center justify-center py-24">
            <Spinner className="w-8 h-8" />
        </div>
    )
}

// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ message = 'Tidak ada data', icon }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            {icon && <div className="opacity-30">{icon}</div>}
            <p className="text-sm">{message}</p>
        </div>
    )
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none">&times;</button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
                {footer && <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">{footer}</div>}
            </div>
        </div>
    )
}

// ─── Form Field ───────────────────────────────────────────────
export function Field({ label, required, children, hint }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
    )
}

// ─── Page Header ──────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    )
}

// ─── Format Rupiah ────────────────────────────────────────────
export function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}