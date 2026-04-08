import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import { login } from '@/api'
import { useAuth } from '@/lib/auth'
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, Spinner } from '@/components/ui'
import logo from '../logo.png'

export default function LoginPage() {
  const { saveLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(form)
      saveLogin(res.data.data.token, res.data.data.user)
      toast.success(`Selamat datang, ${res.data.data.user.nama}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <img src={logo} alt="logo" style={{ width: '90%', height: '90%', marginBottom: '-80px' }} />
          {/*<h1 className="text-xl font-bold">PISIRA</h1>*/}
          <p className="text-sm text-muted-foreground padding-top=0">Sistem Manajemen Service Laptop</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Masuk</CardTitle>
            <CardDescription>Masukkan email dan password Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@pisira.com" required
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" required
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Spinner className="h-4 w-4" />}
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
