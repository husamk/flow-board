import google from '@/assets/google.svg'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function SignIn() {
  const provider = new GoogleAuthProvider()
  const handleLogin = async () => await signInWithPopup(auth, provider)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
            Welcome to <span className="text-blue-600">FlowBoard</span>
          </h1>
          <p className="text-gray-500">Organize your work beautifully. Sign in to get started.</p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleLogin}
            className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-lg shadow-md transition-colors cursor-pointer"
          >
            <img src={google} alt="Google" width={24} height={24} />
            Continue with Google
          </button>
        </div>

        <div className="mt-10 text-sm text-gray-400">
          By continuing, you agree to FlowBoard’s{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  )
}
