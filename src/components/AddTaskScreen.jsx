import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { PHASES, CATEGORIES, createEmptyTask } from '../data/defaultTasks'
import { X, Save, Trash2, Coins, Star, MessageSquare } from 'lucide-react'

const XP_MAP = { high: 200, medium: 100, low: 50 }

const COST_TYPES = [
  { id: 'quote', label: '💭 Báo giá', color: 'text-blue-300' },
  { id: 'committed', label: '📝 Cam kết', color: 'text-yellow-300' },
  { id: 'paid', label: '✅ Đã thanh toán', color: 'text-green-300' },
]

export default function AddTaskScreen({ editTask, onDone }) {
  const { dispatch } = useGame()
  const isEdit = !!editTask

  const [form, setForm] = useState(() => {
    if (editTask) return { ...editTask }
    return createEmptyTask()
  })

  useEffect(() => {
    if (editTask) setForm({ ...editTask })
    else setForm(createEmptyTask())
  }, [editTask])

  const updateField = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'priority') {
        updated.xp = XP_MAP[value]
      }
      return updated
    })
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    if (isEdit) {
      dispatch({ type: 'UPDATE_TASK', taskId: form.id, updates: form })
    } else {
      dispatch({ type: 'ADD_TASK', task: { ...form, id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` } })
    }
    onDone()
  }

  const handleDelete = () => {
    if (isEdit) {
      dispatch({ type: 'DELETE_TASK', taskId: form.id })
      onDone()
    }
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-royal-200">
            {isEdit ? '✏️ Sửa Nhiệm Vụ' : '⚔️ Nhiệm Vụ Mới'}
          </h2>
          {isEdit && (
            <button
              onClick={onDone}
              className="p-2 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 mb-1 block">Tên nhiệm vụ *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="VD: Gọi điện hỏi giá nhà hàng ABC"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-royal-500"
          />
        </div>

        {/* Phase + Category */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Giai đoạn</label>
            <select
              value={form.phaseId}
              onChange={(e) => updateField('phaseId', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white appearance-none"
            >
              {PHASES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Danh mục</label>
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white appearance-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignee */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 mb-1 block">Giao cho</label>
          <div className="flex gap-2">
            {[
              { id: 'groom', label: '🤴 Chú rể' },
              { id: 'bride', label: '👸 Cô dâu' },
              { id: 'both', label: '👫 Cả hai' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateField('assignee', opt.id)}
                className={`flex-1 py-2.5 text-xs rounded-xl border transition-colors ${
                  form.assignee === opt.id
                    ? 'bg-royal-600 border-royal-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 mb-1 block">
            Mức ưu tiên (= XP nhận được)
          </label>
          <div className="flex gap-2">
            {[
              { id: 'low', label: '🟢 Thấp', xp: 50 },
              { id: 'medium', label: '🟡 Trung bình', xp: 100 },
              { id: 'high', label: '🔴 Cao', xp: 200 },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateField('priority', opt.id)}
                className={`flex-1 py-2.5 text-xs rounded-xl border transition-colors ${
                  form.priority === opt.id
                    ? 'bg-royal-600 border-royal-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <div>{opt.label}</div>
                <div className="text-gold-400 mt-0.5 flex items-center justify-center gap-0.5">
                  <Star size={8} fill="currentColor" /> {opt.xp} XP
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Deadline */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 mb-1 block">Deadline</label>
          <input
            type="date"
            value={form.deadline || ''}
            onChange={(e) => updateField('deadline', e.target.value || null)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-royal-500"
          />
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 mb-1 flex items-center gap-1">
            <MessageSquare size={10} /> Ghi chú
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Ghi chú thêm..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-royal-500 resize-none"
          />
        </div>

        {/* Finance Section */}
        <div className="mb-4 p-4 bg-gold-900/10 border border-gold-700/20 rounded-xl">
          <h3 className="text-sm font-semibold text-gold-300 flex items-center gap-1.5 mb-3">
            <Coins size={14} /> Thông tin tài chính
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Số tiền (VNĐ)</label>
              <input
                type="number"
                value={form.cost || ''}
                onChange={(e) =>
                  updateField('cost', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Loại</label>
              <select
                value={form.costType || ''}
                onChange={(e) => updateField('costType', e.target.value || null)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white appearance-none"
              >
                <option value="">-- Chọn --</option>
                {COST_TYPES.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-slate-400 mb-1 block">Tên vendor</label>
            <input
              type="text"
              value={form.vendorName}
              onChange={(e) => updateField('vendorName', e.target.value)}
              placeholder="VD: Studio ABC, Nhà hàng XYZ"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="mb-3">
            <label className="text-xs text-slate-400 mb-1 block">Đánh giá</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => updateField('vendorRating', form.vendorRating === star ? null : star)}
                  className={`text-xl transition-transform hover:scale-110 ${
                    star <= (form.vendorRating || 0) ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Ghi chú vendor</label>
            <textarea
              value={form.vendorNotes}
              onChange={(e) => updateField('vendorNotes', e.target.value)}
              placeholder="Gói bao gồm gì, điều kiện thanh toán..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-4">
          {isEdit && !form.isDefault && (
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-1.5 px-4 py-3 bg-red-900/30 border border-red-700/30 rounded-xl text-red-400 text-sm"
            >
              <Trash2 size={14} /> Xóa
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-gradient-to-r from-royal-600 to-royal-700 rounded-xl text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-royal-700/30"
          >
            <Save size={14} />
            {isEdit ? 'Lưu thay đổi' : 'Tạo nhiệm vụ ⚔️'}
          </button>
        </div>
      </div>
    </div>
  )
}
