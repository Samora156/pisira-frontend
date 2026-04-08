import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('pisira_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.clear()
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

export const login             = d  => api.post('/auth/login', d)
export const getCustomers      = (s='') => api.get(`/customers?search=${s}`)
export const getCustomer       = id => api.get(`/customers/${id}`)
export const createCustomer    = d  => api.post('/customers', d)
export const updateCustomer    = (id,d) => api.put(`/customers/${id}`, d)
export const getOrders         = (p={}) => api.get('/orders', { params: p })
export const getOrder          = id => api.get(`/orders/${id}`)
export const createOrder       = d  => api.post('/orders', d)
export const updateOrderStatus = (id,d) => api.patch(`/orders/${id}/status`, d)
export const getEstimasi       = id => api.get(`/orders/${id}/estimasi`)
export const createEstimasi    = d  => api.post('/estimasi', d)
export const updatePersetujuan = (id,d) => api.patch(`/orders/${id}/estimasi/persetujuan`, d)
export const getInvoices       = (p={}) => api.get('/invoices', { params: p })
export const createInvoice     = d  => api.post('/invoices', d)
export const lunaskanInvoice   = id => api.patch(`/invoices/${id}/lunas`)
export const getLaporanBulanan = y  => api.get(`/laporan/bulanan?tahun=${y}`)
