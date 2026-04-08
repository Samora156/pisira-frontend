import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Orders from '@/pages/Orders'
import Customers from '@/pages/Customers'
import Estimasi from '@/pages/Estimasi'
import Invoices from '@/pages/Invoices'
import Laporan from '@/pages/Laporan'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/orders"    element={<Orders />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/estimasi"  element={<Estimasi />} />
        <Route path="/invoices"  element={<Invoices />} />
        <Route path="/laporan"   element={<Laporan />} />
      </Route>
    </Routes>
  )
}
