import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Crown, Heart, LogIn, UserPlus, Loader2 } from 'lucide-react'

export default function LoginScreen() {
  const { login, signup } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignup) {
        await signup(email, password)
      } else {
        await login(email, password)
      }
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'Tài khoản không tồn tại',
        'auth/wrong-password': 'Sai mật khẩu',
        'auth/invalid-credential': 'Email hoặc mật khẩu không đúng',
        'auth/email-already-in-use': 'Email đã được sử dụng',
        'auth/weak-password': 'Mật khẩu phải ít nhất 6 ký tự',
        'auth/invalid-email': 'Email không hợp lệ',
      }
      setError(messages[err.code] || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Crown size={28} className="text-gold-400" />
          <Heart size={20} className="text-rose-400" fill="currentColor" />
          <Crown size={28} className="text-gold-400" />
        </div>
        <h1 className="text-2xl font-bold text-gold-300">Wedding Quest</h1>
        <p className="text-xs text-slate-500 mt-1">Hành Trình Đến Lâu Đài Tình Yêu</p>
      </div>

      {/* Characters */}
      <div className="flex items-center gap-4 mb-8">
        <div className="text-center">
          <div className="text-4xl mb-1">🤴</div>
          <div className="text-[10px] text-royal-400">Hoàng Tử</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Heart size={16} className="text-rose-400" fill="currentColor" />
          <div className="w-12 h-0.5 bg-gradient-to-r from-royal-500 to-rose-500 rounded-full" />
        </div>
        <div className="text-center">
          <div className="text-4xl mb-1">👸</div>
          <div className="text-[10px] text-rose-400">Công Chúa</div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-royal-200 mb-4 text-center">
            {isSignup ? '✨ Tạo tài khoản mới' : '⚔️ Đăng nhập vào hành trình'}
          </h2>

          {error && (
            <div className="bg-red-900/30 border border-red-700/30 rounded-xl p-3 mb-4 text-xs text-red-300 text-center">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label className="text-xs text-slate-400 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-royal-500"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs text-slate-400 mb-1 block">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-royal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-royal-600 to-royal-700 rounded-xl text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-royal-700/30"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isSignup ? (
              <UserPlus size={16} />
            ) : (
              <LogIn size={16} />
            )}
            {loading ? 'Đang xử lý...' : isSignup ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup)
              setError('')
            }}
            className="text-xs text-royal-400 hover:text-royal-300"
          >
            {isSignup ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-6">
          Cả 2 người dùng chung 1 tài khoản để sync dữ liệu
        </p>
      </form>
    </div>
  )
}
