import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Crown, Heart, Copy, Check, Loader2, LogOut } from 'lucide-react'

export default function RoomScreen() {
  const { createRoom, joinRoom, logout } = useAuth()
  const [mode, setMode] = useState(null) // 'create' | 'join'
  const [role, setRole] = useState(null) // 'groom' | 'bride'
  const [roomCode, setRoomCode] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!role) return
    setLoading(true)
    setError('')
    try {
      const code = await createRoom(role)
      setCreatedCode(code)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!role || !roomCode.trim()) return
    setLoading(true)
    setError('')
    try {
      await joinRoom(roomCode.trim(), role)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(createdCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // After creating room, show code to share
  if (createdCode) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-lg font-bold text-gold-300 mb-2">Phòng đã tạo!</h2>
          <p className="text-xs text-slate-400">Gửi mã phòng cho người yêu để tham gia</p>
        </div>

        <div className="bg-slate-800/60 border border-gold-700/30 rounded-2xl p-6 w-full max-w-sm text-center">
          <div className="text-xs text-slate-400 mb-2">Mã phòng của bạn</div>
          <div className="text-3xl font-mono font-bold text-gold-300 tracking-widest mb-4">
            {createdCode}
          </div>
          <button
            onClick={copyCode}
            className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-royal-600 text-white text-sm rounded-xl"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Đã copy!' : 'Copy mã phòng'}
          </button>
        </div>

        <p className="text-[10px] text-slate-600 mt-4 text-center">
          Trang sẽ tự động chuyển khi đã kết nối
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown size={24} className="text-gold-400" />
          <Heart size={16} className="text-rose-400" fill="currentColor" />
          <Crown size={24} className="text-gold-400" />
        </div>
        <h1 className="text-xl font-bold text-gold-300">Chọn vai trò của bạn</h1>
        <p className="text-xs text-slate-500 mt-1">Mỗi người chọn 1 nhân vật</p>
      </div>

      {/* Role selection */}
      <div className="flex gap-4 mb-6 w-full max-w-sm">
        <button
          onClick={() => setRole('groom')}
          className={`flex-1 flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${
            role === 'groom'
              ? 'border-royal-500 bg-royal-900/30 shadow-lg shadow-royal-500/20'
              : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
          }`}
        >
          <span className="text-5xl mb-2">🤴</span>
          <span className="text-sm font-semibold text-white">Hoàng Tử</span>
          <span className="text-[10px] text-slate-500 mt-1">Chú rể</span>
        </button>

        <button
          onClick={() => setRole('bride')}
          className={`flex-1 flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${
            role === 'bride'
              ? 'border-rose-500 bg-rose-900/30 shadow-lg shadow-rose-500/20'
              : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
          }`}
        >
          <span className="text-5xl mb-2">👸</span>
          <span className="text-sm font-semibold text-white">Công Chúa</span>
          <span className="text-[10px] text-slate-500 mt-1">Cô dâu</span>
        </button>
      </div>

      {role && !mode && (
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => setMode('create')}
            className="w-full py-4 bg-gradient-to-r from-royal-600 to-royal-700 rounded-xl text-white text-sm font-semibold shadow-lg"
          >
            🏰 Tạo phòng mới
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full py-4 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm"
          >
            🔑 Nhập mã phòng (đã có phòng)
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700/30 rounded-xl p-3 mt-4 text-xs text-red-300 text-center w-full max-w-sm">
          {error}
        </div>
      )}

      {mode === 'create' && (
        <div className="w-full max-w-sm mt-4">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-gold-600 to-gold-700 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : '👑'}
            {loading ? 'Đang tạo...' : 'Tạo phòng ngay'}
          </button>
          <button
            onClick={() => setMode(null)}
            className="w-full text-xs text-slate-500 mt-3 text-center"
          >
            ← Quay lại
          </button>
        </div>
      )}

      {mode === 'join' && (
        <div className="w-full max-w-sm mt-4">
          <label className="text-xs text-slate-400 mb-1 block">Nhập mã phòng</label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="VD: ABC123"
            maxLength={6}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-mono text-gold-300 tracking-widest placeholder-slate-600 focus:outline-none focus:border-royal-500 uppercase mb-3"
          />
          <button
            onClick={handleJoin}
            disabled={loading || !roomCode.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-royal-600 to-royal-700 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : '🔑'}
            {loading ? 'Đang tham gia...' : 'Tham gia phòng'}
          </button>
          <button
            onClick={() => setMode(null)}
            className="w-full text-xs text-slate-500 mt-3 text-center"
          >
            ← Quay lại
          </button>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 mt-8"
      >
        <LogOut size={12} /> Đăng xuất
      </button>
    </div>
  )
}
