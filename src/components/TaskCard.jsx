import { useGame } from '../context/GameContext'
import { CATEGORIES } from '../data/defaultTasks'
import { Clock, Coins, Star, ChevronRight } from 'lucide-react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date() && new Date(dateStr).toDateString() !== new Date().toDateString()
}

function formatCurrency(num) {
  if (!num) return ''
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ'
}

export default function TaskCard({ task, onEdit }) {
  const { dispatch } = useGame()
  const category = CATEGORIES.find((c) => c.id === task.category)
  const overdue = !task.completed && isOverdue(task.deadline)

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
        task.completed
          ? 'bg-forest-900/10 border-forest-800/20 opacity-70'
          : overdue
            ? 'bg-red-900/10 border-red-800/30'
            : 'bg-slate-800/40 border-slate-700/30'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_TASK', taskId: task.id })}
        className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          task.completed
            ? 'bg-forest-500 border-forest-400 text-white'
            : 'border-slate-600 hover:border-royal-400'
        }`}
      >
        {task.completed && <span className="text-xs">✓</span>}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0" onClick={onEdit}>
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-tight ${
              task.completed ? 'line-through text-slate-500' : 'text-slate-200'
            }`}
          >
            {task.title}
          </p>
          <ChevronRight size={14} className="text-slate-600 flex-shrink-0 mt-0.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {/* Category */}
          <span className="text-[10px] bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-400">
            {category?.emoji} {category?.label}
          </span>

          {/* Assignee */}
          <span className="text-[10px]">
            {task.assignee === 'groom' ? '🤴' : task.assignee === 'bride' ? '👸' : '👫'}
          </span>

          {/* XP */}
          <span className="text-[10px] text-gold-400 flex items-center gap-0.5">
            <Star size={8} fill="currentColor" /> {task.xp}
          </span>

          {/* Deadline */}
          {task.deadline && (
            <span
              className={`text-[10px] flex items-center gap-0.5 ${
                overdue ? 'text-red-400' : 'text-slate-500'
              }`}
            >
              <Clock size={8} /> {formatDate(task.deadline)}
            </span>
          )}

          {/* Cost */}
          {task.cost > 0 && (
            <span className="text-[10px] text-gold-300 flex items-center gap-0.5">
              <Coins size={8} /> {formatCurrency(task.cost)}
            </span>
          )}

          {/* Priority */}
          {task.priority === 'high' && (
            <span className="text-[10px] text-red-400">●</span>
          )}
        </div>
      </div>
    </div>
  )
}
