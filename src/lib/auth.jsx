import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pisira_user')) } catch { return null }
  })

  const saveLogin = (token, userData) => {
    localStorage.setItem('pisira_token', token)
    localStorage.setItem('pisira_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('pisira_token')
    localStorage.removeItem('pisira_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, saveLogin, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
