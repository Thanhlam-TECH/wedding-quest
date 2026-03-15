import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { PHASES, CATEGORIES } from '../data/defaultTasks'
import TaskCard from './TaskCard'
import { ChevronDown, Filter, User, Users, Sparkles } from 'lucide-react'

export default function QuestLog({ onEditTask }) {
  const { tasks } = useGame()
  const [selectedPhase, setSelectedPhase] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [expandedPhase, setExpandedPhase] = useState(null)

  let filtered = tasks
  if (selectedPhase !== 'all') {
    filtered = filtered.filter((t) => t.phaseId === selectedPhase)
  }
  if (assigneeFilter !== 'all') {
    filtered = filtered.filter(
      (t) => t.assignee === assigneeFilter || t.assignee === 'both'
    )
  }
  if (!showCompleted) {
    filtered = filtered.filter((t) => !t.completed)
  }

  // Group by phase
  const grouped = PHASES.map((phase) => ({
    ...phase,
    tasks: filtered.filter((t) => t.phaseId === phase.id),
  })).filter((g) => g.tasks.length > 0)

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-4 pt-6">
        <h2 className="text-lg font-bold text-royal-200 flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-gold-400" />
          Nhật Ký Nhiệm Vụ
        </h2>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 appearance-none min-w-[120px]"
          >
            <option value="all">Tất cả giai đoạn</option>
            {PHASES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.emoji} {p.title}
              </option>
            ))}
          </select>

          <div className="flex bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            {[
              { id: 'all', label: 'Tất cả', icon: Users },
              { id: 'groom', label: '🤴', icon: null },
              { id: 'bride', label: '👸', icon: null },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAssigneeFilter(opt.id)}
                className={`px-3 py-2 text-xs transition-colors ${
                  assigneeFilter === opt.id
                    ? 'bg-royal-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.icon ? <opt.icon size={14} /> : opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-3 py-2 text-xs rounded-lg border transition-colors whitespace-nowrap ${
              showCompleted
                ? 'bg-forest-800/30 border-forest-600/30 text-forest-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {showCompleted ? '✅ Đã xong' : 'Ẩn đã xong'}
          </button>
        </div>

        {/* Task count */}
        <div className="text-xs text-slate-500 mb-3">
          {filtered.length} nhiệm vụ
        </div>

        {/* Grouped tasks */}
        {grouped.map((group) => (
          <div key={group.id} className="mb-4">
            <button
              onClick={() =>
                setExpandedPhase(expandedPhase === group.id ? null : group.id)
              }
              className="w-full flex items-center gap-2 py-2 px-3 bg-slate-800/50 rounded-lg mb-2 border border-slate-700/30"
            >
              <span className="text-base">{group.emoji}</span>
              <span className="text-sm font-semibold text-slate-200 flex-1 text-left">
                {group.title}
              </span>
              <span className="text-xs text-slate-500">{group.tasks.length}</span>
              <ChevronDown
                size={14}
                className={`text-slate-500 transition-transform ${
                  expandedPhase === group.id || selectedPhase !== 'all' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {(expandedPhase === group.id || selectedPhase !== 'all') && (
              <div className="space-y-2 ml-2">
                {group.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={() => onEditTask(task)} />
                ))}
              </div>
            )}
          </div>
        ))}

        {grouped.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-sm">Không có nhiệm vụ nào!</p>
          </div>
        )}
      </div>
    </div>
  )
}
