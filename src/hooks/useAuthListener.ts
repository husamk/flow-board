import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/store/auth'

export const useAuthListener = () => {
  const setUser = useAuthStore((s) => s.setUser)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUser(user ?? null))
    return () => unsub()
  }, [setUser])
}
