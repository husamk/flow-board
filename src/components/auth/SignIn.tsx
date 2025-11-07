import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function SignIn() {
  const provider = new GoogleAuthProvider()
  const handleLogin = async () => await signInWithPopup(auth, provider)

  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      onClick={handleLogin}
    >
      Sign in with Google
    </button>
  )
}
