import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount = 0) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount)
}

export const STATUS_LABEL = {
  menunggu:             'Menunggu',
  diagnosa:             'Diagnosa',
  menunggu_persetujuan: 'Tunggu Persetujuan',
  proses:               'Diproses',
  selesai:              'Selesai',
  diambil:              'Diambil',
  batal:                'Batal',
  lunas:                'Lunas',
  belum_lunas:          'Belum Lunas',
}
