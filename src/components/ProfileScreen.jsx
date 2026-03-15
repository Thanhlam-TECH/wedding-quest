import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { useAuth } from '../context/AuthContext'
import { Crown, Sparkles, Trophy, Heart, Calendar, Target, Shield, X, LogOut, Copy, Check } from 'lucide-react'

function formatCurrency(num) {
  if (!num) return '—'
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ'
}

export default function ProfileScreen({ onLogout }) {
  const {
    profiles,
    dispatch,
    totalXP,
    maxXP,
    completedCount,
    totalCount,
    tasks,
    daysUntilWedding,
  } = useGame()

  const { roomId } = useAuth()
  const [editingName, setEditingName] = useState(null)
  const [nameInput, setNameInput] = useState('')
  const [copied, setCopied] = useState(false)

  const copyRoomCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNameSave = (role) => {
    dispatch({
      type: 'SET_PROFILES',
      profiles: { [role]: { ...profiles[role], name: nameInput } },
    })
    setEditingName(null)
  }

  const handleAvatarUpload = (role, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      dispatch({
        type: 'SET_PROFILES',
        profiles: { [role]: { ...profiles[role], avatar: ev.target.result } },
      })
    }
    reader.readAsDataURL(file)
  }

  // Achievements
  const groomDone = tasks.filter((t) => (t.assignee === 'groom' || t.assignee === 'both') && t.completed).length
  const brideDone = tasks.filter((t) => (t.assignee === 'bride' || t.assignee === 'both') && t.completed).length
  const groomXP = tasks.filter((t) => (t.assignee === 'groom' || t.assignee === 'both') && t.completed).reduce((s, t) => s + t.xp, 0)
  const brideXP = tasks.filter((t) => (t.assignee === 'bride' || t.assignee === 'both') && t.completed).reduce((s, t) => s + t.xp, 0)

  const badges = []
  if (completedCount >= 1) badges.push({ icon: '🗡️', name: 'First Blood', desc: 'Hoàn thành nhiệm vụ đầu tiên' })
  if (completedCount >= 10) badges.push({ icon: '⚡', name: 'Getting Started', desc: '10 nhiệm vụ hoàn thành' })
  if (completedCount >= 50) badges.push({ icon: '🔥', name: 'On Fire', desc: '50 nhiệm vụ hoàn thành' })
  if (completedCount >= 100) badges.push({ icon: '💎', name: 'Diamond Hands', desc: '100 nhiệm vụ hoàn thành' })
  if (completedCount === totalCount && totalCount > 0) badges.push({ icon: '👑', name: 'Legendary', desc: 'Hoàn thành TẤT CẢ nhiệm vụ' })

  const tasksWithCost = tasks.filter((t) => t.cost > 0 && t.vendorName)
  const vendorCategories = [...new Set(tasksWithCost.map((t) => t.category))]
  const hasComparisons = vendorCategories.some(
    (cat) => tasksWithCost.filter((t) => t.category === cat).length >= 3
  )
  if (hasComparisons) badges.push({ icon: '🛒', name: 'Smart Shopper', desc: 'So sánh ≥3 vendor trước khi chốt' })

  // Level system
  const level = Math.floor(totalXP / 500) + 1
  const xpInLevel = totalXP % 500
  const xpForNextLevel = 500

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-4 pt-6">
        <h2 className="text-lg font-bold text-royal-200 flex items-center gap-2 mb-4">
          <Crown size={18} className="text-gold-400" /> Profile
        </h2>

        {/* Characters */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { role: 'groom', emoji: '🤴', label: 'Hoàng Tử', xp: groomXP, done: groomDone },
            { role: 'bride', emoji: '👸', label: 'Công Chúa', xp: brideXP, done: brideDone },
          ].map(({ role, emoji, label, xp, done }) => (
            <div
              key={role}
              className="bg-gradient-to-br from-slate-800/80 to-royal-900/20 rounded-2xl p-4 border border-royal-800/20 text-center"
            >
              {/* Avatar */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarUpload(role, e)}
                />
                <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-slate-700 border-2 border-royal-600/30 overflow-hidden flex items-center justify-center">
                  {profiles[role]?.avatar ? (
                    <img src={profiles[role].avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">{emoji}</span>
                  )}
                </div>
                <div className="text-[10px] text-royal-400 mb-1">Nhấn để đổi ảnh</div>
              </label>

              {/* Name */}
              {editingName === role ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="flex-1 bg-slate-700 border border-royal-600/30 rounded px-2 py-1 text-xs text-white text-center focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleNameSave(role)}
                  />
                  <button
                    onClick={() => handleNameSave(role)}
                    className="px-2 py-1 bg-royal-600 text-white text-xs rounded"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingName(role)
                    setNameInput(profiles[role]?.name || label)
                  }}
                  className="text-sm font-semibold text-white hover:text-royal-300"
                >
                  {profiles[role]?.name || label}
                </button>
              )}

              <div className="text-xs text-gold-400 mt-1 flex items-center justify-center gap-1">
                <Sparkles size={10} /> {xp} XP
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {done} nhiệm vụ hoàn thành
              </div>
            </div>
          ))}
        </div>

        {/* Level */}
        <div className="bg-slate-800/40 rounded-xl p-4 mb-4 border border-slate-700/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {level}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Level {level}</div>
              <div className="text-xs text-slate-400">
                {xpInLevel} / {xpForNextLevel} XP
              </div>
            </div>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full transition-all"
              style={{ width: `${(xpInLevel / xpForNextLevel) * 100}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/20 text-center">
            <Target size={16} className="text-royal-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{completedCount}</div>
            <div className="text-[10px] text-slate-500">Nhiệm vụ xong</div>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/20 text-center">
            <Calendar size={16} className="text-rose-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{daysUntilWedding}</div>
            <div className="text-[10px] text-slate-500">Ngày còn lại</div>
          </div>
        </div>

        {/* Room Code */}
        {roomId && (
          <div className="bg-gradient-to-r from-royal-900/40 to-gold-900/20 rounded-xl p-4 mb-4 border border-royal-700/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 mb-1">Mã phòng</div>
                <div className="text-lg font-mono font-bold text-gold-300 tracking-widest">
                  {roomId}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Gửi mã này cho người yêu để tham gia
                </div>
              </div>
              <button
                onClick={copyRoomCode}
                className="flex items-center gap-1.5 px-3 py-2 bg-royal-600/30 border border-royal-500/30 rounded-lg text-xs text-royal-300 hover:bg-royal-600/50 transition-colors"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Đã copy!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
            <Trophy size={14} className="text-gold-400" /> Huy Chương
          </h3>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {badges.map((badge) => (
                <div
                  key={badge.name}
                  className="bg-gold-900/10 border border-gold-700/20 rounded-xl p-3 text-center"
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-semibold text-gold-300">{badge.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{badge.desc}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-600 text-sm">
              Hoàn thành nhiệm vụ để nhận huy chương!
            </div>
          )}
        </div>

        {/* Reset */}
        <ResetConfirm profiles={profiles} onConfirm={() => dispatch({ type: 'RESET_ALL' })} />

        {/* Logout */}
        {onLogout && (
          <div className="mb-8 text-center">
            <button
              onClick={onLogout}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 mx-auto"
            >
              <LogOut size={12} /> Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ResetConfirm({ profiles, onConfirm }) {
  const [showModal, setShowModal] = useState(false)
  const [groomInput, setGroomInput] = useState('')
  const [brideInput, setBrideInput] = useState('')

  const groomName = profiles.groom?.name || 'Hoàng Tử'
  const brideName = profiles.bride?.name || 'Công Chúa'
  const groomOk = groomInput.trim().toLowerCase() === groomName.trim().toLowerCase()
  const brideOk = brideInput.trim().toLowerCase() === brideName.trim().toLowerCase()
  const canReset = groomOk && brideOk

  const handleReset = () => {
    if (canReset) {
      onConfirm()
      setShowModal(false)
      setGroomInput('')
      setBrideInput('')
    }
  }

  return (
    <>
      <div className="mt-8 mb-4 text-center">
        <button
          onClick={() => setShowModal(true)}
          className="text-xs text-red-400/50 hover:text-red-400 flex items-center gap-1 mx-auto"
        >
          <Shield size={10} /> Reset toàn bộ dữ liệu
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-800/40 rounded-2xl p-5 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-red-400">⚠️ Xác nhận Reset</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Hành động này sẽ <span className="text-red-400 font-semibold">xóa toàn bộ dữ liệu</span> và không thể hoàn tác.
              Cần cả 2 người đồng ý bằng cách nhập đúng tên.
            </p>

            <div className="mb-3">
              <label className="text-xs text-slate-500 mb-1 block">
                🤴 Nhập tên Hoàng Tử: <span className="text-slate-400 font-semibold">"{groomName}"</span>
              </label>
              <input
                type="text"
                value={groomInput}
                onChange={(e) => setGroomInput(e.target.value)}
                placeholder={groomName}
                className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${
                  groomOk ? 'border-forest-500' : 'border-slate-700'
                }`}
              />
              {groomOk && <span className="text-xs text-forest-400">✓ Hoàng Tử đồng ý</span>}
            </div>

            <div className="mb-4">
              <label className="text-xs text-slate-500 mb-1 block">
                👸 Nhập tên Công Chúa: <span className="text-slate-400 font-semibold">"{brideName}"</span>
              </label>
              <input
                type="text"
                value={brideInput}
                onChange={(e) => setBrideInput(e.target.value)}
                placeholder={brideName}
                className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${
                  brideOk ? 'border-forest-500' : 'border-slate-700'
                }`}
              />
              {brideOk && <span className="text-xs text-forest-400">✓ Công Chúa đồng ý</span>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-400"
              >
                Hủy
              </button>
              <button
                onClick={handleReset}
                disabled={!canReset}
                className="flex-1 py-2.5 text-xs rounded-xl bg-red-600 text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
