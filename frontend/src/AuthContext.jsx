import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function parseRole(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // Spring Security zet de rol als "ROLE_ADMIN" of "ROLE_CREATOR"
    if (payload.authorities?.includes('ROLE_ADMIN')) return 'ADMIN'
    return 'CREATOR'
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const role = token ? parseRole(token) : null

  function saveToken(t) {
    localStorage.setItem('token', t)
    setToken(t)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, role, saveToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
