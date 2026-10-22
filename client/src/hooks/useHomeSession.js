import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser, logoutUser } from '../services/userService'

const GUEST_SESSION = {
  status: 'guest',
  name: '',
  role: '',
}

const clearStoredSession = () => {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('user')
}

function useHomeSession() {
  const [session, setSession] = useState(() => ({
    ...GUEST_SESSION,
    status: sessionStorage.getItem('accessToken') ? 'loading' : 'guest',
  }))

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')

    if (!token) {
      return undefined
    }

    let ignore = false

    getCurrentUser(token)
      .then((user) => {
        if (!ignore) {
          setSession({
            status: 'member',
            name: user.name,
            role: user.role,
          })
        }
      })
      .catch(() => {
        clearStoredSession()

        if (!ignore) {
          setSession(GUEST_SESSION)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const logout = useCallback(() => {
    const token = sessionStorage.getItem('accessToken')

    clearStoredSession()
    setSession(GUEST_SESSION)
    logoutUser(token).catch(() => {})
  }, [])

  return { session, logout }
}

export default useHomeSession
