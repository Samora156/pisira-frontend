import { useRef } from 'react'
import { Printer, Wrench } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatRupiah } from '@/lib/utils'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import logoImg from '../logo.png'

export default function InvoicePrint({ invoice, order, estimasi, onClose }) {
  const printRef = useRef()

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML
    const win = window.open('', '_blank', 'width=800,height=900')
    win.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8"/>
        <title>Invoice ${invoice.no_invoice}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; }
          .page { max-width: 720px; margin: 0 auto; padding: 40px 48px; }

          /* Header */
          .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #1d4ed8; margin-bottom: 28px; }
          .brand { display: flex; align-items: center; gap: 12px; }
          // .brand-icon { width: 44px; height: 44px; background: #1d4ed8; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
          .brand-icon img { width: 22px; height: 22px; fill: none; stroke: white; stroke-width: 2; stroke-linecap: round; }
          .brand-name { font-size: 22px; font-weight: 700; color: #1d4ed8; line-height: 1; }
          .brand-sub  { font-size: 11px; color: #64748b; margin-top: 3px; }
          .invoice-meta { text-align: right; }
          .invoice-label { font-size: 20px; font-weight: 700; color: #1d4ed8; }
          .invoice-no    { font-family: monospace; font-size: 14px; color: #374151; margin-top: 4px; }
          .invoice-date  { font-size: 12px; color: #64748b; margin-top: 2px; }

          /* Info section */
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
          .info-box { }
          .info-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 8px; }
          .info-value { font-size: 13px; color: #1a1a1a; line-height: 1.6; }
          .info-value strong { font-weight: 600; }

          /* Detail table */
          .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
          thead tr { background: #f8fafc; }
          th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; border-bottom: 1px solid #e2e8f0; }
          td { padding: 11px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          tr:last-child td { border-bottom: none; }

          /* Total */
          .total-section { margin-left: auto; width: 280px; }
          .total-row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 13px; color: #374151; }
          .total-divider { height: 1px; background: #e2e8f0; margin: 6px 0; }
          .total-final { display: flex; justify-content: space-between; padding: 10px 14px; background: #1d4ed8; border-radius: 8px; margin-top: 8px; }
          .total-final span:first-child { color: #bfdbfe; font-size: 13px; font-weight: 500; }
          .total-final span:last-child  { color: white; font-size: 16px; font-weight: 700; }

          /* Status */
          .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }
          .status-lunas       { background: #d1fae5; color: #065f46; }
          .status-belum_lunas { background: #fef3c7; color: #92400e; }

          /* Footer */
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end; }
          .footer-note { font-size: 11px; color: #94a3b8; line-height: 1.6; }
          .ttd-area { text-align: center; }
          .ttd-line { width: 140px; border-bottom: 1px solid #cbd5e1; margin-bottom: 4px; padding-bottom: 40px; }
          .ttd-label { font-size: 11px; color: #64748b; }

          @media print {
            @page { margin: 0; size: A4; }
            body { padding: 0; }
            .page { padding: 32px 40px; }
          }
        </style>
      </head>
      <body>
        <div class="page">${printContents}</div>
      </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }

  const metode = { tunai: 'Tunai', transfer: 'Transfer Bank', qris: 'QRIS' }
  const tglInvoice = invoice.tanggal_invoice
    ? format(new Date(invoice.tanggal_invoice), 'd MMMM yyyy', { locale: idLocale })
    : '-'

  return (
    <div className="flex flex-col gap-4">
      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Tutup</Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Cetak / Simpan PDF
        </Button>
      </div>

      {/* Preview */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <div ref={printRef} className="p-8 text-[13px] text-gray-800 font-[Segoe_UI,Arial,sans-serif]">

          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', paddingBottom:'20px', borderBottom:'2px solid #1d4ed8', marginBottom:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              {/* <div style={{ width:'42px', height:'42px', background:'#1d4ed8', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}> */}
                <img src={logoImg} alt="Logo PISIRA" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
              {/* </div> */}
              <div>
                <div style={{ fontSize:'20px', fontWeight:'700', color:'#1d4ed8', lineHeight:1 }}>PISIRA</div>
                <div style={{ fontSize:'11px', color:'#64748b', marginTop:'3px' }}>Service Laptop Profesional</div>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'18px', fontWeight:'700', color:'#1d4ed8' }}>INVOICE</div>
              <div style={{ fontFamily:'monospace', fontSize:'13px', color:'#374151', marginTop:'4px' }}>{invoice.no_invoice}</div>
              <div style={{ fontSize:'12px', color:'#64748b', marginTop:'2px' }}>{tglInvoice}</div>
              <div style={{ marginTop:'6px' }}>
                <span className={`status-badge status-${invoice.status_bayar}`}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:'5px',
                    padding:'3px 10px', borderRadius:'100px', fontSize:'11px', fontWeight:'600',
                    background: invoice.status_bayar === 'lunas' ? '#d1fae5' : '#fef3c7',
                    color:      invoice.status_bayar === 'lunas' ? '#065f46' : '#92400e',
                  }}>
                  {invoice.status_bayar === 'lunas' ? '✓ LUNAS' : '⏳ BELUM LUNAS'}
                </span>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', marginBottom:'24px' }}>
            <div>
              <div style={{ fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', marginBottom:'8px' }}>Data Customer</div>
              <div style={{ lineHeight:'1.7', fontSize:'13px' }}>
                <strong>{order?.customer_nama}</strong><br />
                {order?.customer_no_hp}<br />
              </div>
            </div>
            <div>
              <div style={{ fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', marginBottom:'8px' }}>Detail Servis</div>
              <div style={{ lineHeight:'1.7', fontSize:'13px' }}>
                <strong>No Order:</strong> {order?.no_order}<br />
                <strong>Laptop:</strong> {order?.merk_laptop} {order?.model_laptop}<br />
                {order?.sn_laptop && <><strong>SN:</strong> {order.sn_laptop}<br /></>}
              </div>
            </div>
          </div>

          {/* Deskripsi pekerjaan */}
          {estimasi && (
            <div style={{ background:'#f8fafc', borderRadius:'8px', padding:'12px 16px', marginBottom:'20px', fontSize:'13px' }}>
              <div style={{ fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', marginBottom:'6px' }}>Deskripsi Pekerjaan</div>
              <div>{estimasi.deskripsi_pekerjaan}</div>
              {estimasi.catatan && <div style={{ marginTop:'6px', color:'#64748b' }}>Catatan: {estimasi.catatan}</div>}
            </div>
          )}

          {/* Tabel biaya */}
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'20px' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                <th style={{ padding:'9px 14px', textAlign:'left', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'#64748b', borderBottom:'1px solid #e2e8f0' }}>Keterangan</th>
                <th style={{ padding:'9px 14px', textAlign:'right', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'#64748b', borderBottom:'1px solid #e2e8f0' }}>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding:'10px 14px', borderBottom:'1px solid #f1f5f9' }}>Biaya Jasa Servis</td>
                <td style={{ padding:'10px 14px', textAlign:'right', borderBottom:'1px solid #f1f5f9' }}>{formatRupiah(estimasi?.biaya_jasa ?? 0)}</td>
              </tr>
              {(estimasi?.biaya_sparepart ?? 0) > 0 && (
                <tr>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid #f1f5f9' }}>Biaya Sparepart</td>
                  <td style={{ padding:'10px 14px', textAlign:'right', borderBottom:'1px solid #f1f5f9' }}>{formatRupiah(estimasi.biaya_sparepart)}</td>
                </tr>
              )}
              {invoice.diskon > 0 && (
                <tr>
                  <td style={{ padding:'10px 14px', color:'#dc2626' }}>Diskon</td>
                  <td style={{ padding:'10px 14px', textAlign:'right', color:'#dc2626' }}>- {formatRupiah(invoice.diskon)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Total */}
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'32px' }}>
            <div style={{ width:'260px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:'13px', color:'#374151' }}>
                <span>Subtotal</span><span>{formatRupiah(invoice.subtotal)}</span>
              </div>
              {invoice.diskon > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:'13px', color:'#dc2626' }}>
                  <span>Diskon</span><span>- {formatRupiah(invoice.diskon)}</span>
                </div>
              )}
              <div style={{ height:'1px', background:'#e2e8f0', margin:'8px 0' }} />
              <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'#1d4ed8', borderRadius:'8px' }}>
                <span style={{ color:'#bfdbfe', fontSize:'13px', fontWeight:'500' }}>Total Bayar ({metode[invoice.metode_bayar]})</span>
                <span style={{ color:'white', fontSize:'15px', fontWeight:'700' }}>{formatRupiah(invoice.total_bayar)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', borderTop:'1px solid #e2e8f0', paddingTop:'20px' }}>
            <div style={{ fontSize:'11px', color:'#94a3b8', lineHeight:'1.7' }}>
              <div>Terima kasih telah mempercayakan servis laptop Anda</div>
              <div>kepada <strong style={{ color:'#1d4ed8' }}>PISIRA Service Laptop</strong>.</div>
              <div style={{ marginTop:'4px' }}>Garansi servis 14 hari sejak tanggal pengambilan.</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ width:'120px', borderBottom:'1px solid #cbd5e1', paddingBottom:'36px', marginBottom:'4px' }} />
              <div style={{ fontSize:'11px', color:'#64748b' }}>Petugas</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
