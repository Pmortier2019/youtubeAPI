import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function parseRole(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    if (payload.authorities?.includes('ROLE_ADMIN')) return 'ADMIN'
    return 'CREATOR'
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token')
    if (!stored || parseRole(stored) === null) {
      localStorage.removeItem('token')
      return null
    }
    return stored
  })
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
