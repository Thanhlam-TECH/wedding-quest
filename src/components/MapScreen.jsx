import { useGame } from '../context/GameContext'
import { Crown, Heart, Sparkles, Flame } from 'lucide-react'

export default function MapScreen() {
  const { phaseProgress, totalXP, maxXP, completedCount, totalCount, daysUntilWedding, progressPercent } = useGame()

  const currentPhaseIdx = phaseProgress.findIndex((p) => p.percent < 100)
  const activePhase = currentPhaseIdx === -1 ? phaseProgress.length - 1 : currentPhaseIdx

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown size={20} className="text-gold-400" />
          <h1 className="text-lg font-bold text-gold-300">Wedding Quest</h1>
          <Crown size={20} className="text-gold-400" />
        </div>

        {/* Countdown */}
        <div className="bg-gradient-to-r from-royal-900/80 to-rose-900/40 rounded-2xl p-4 mb-4 border border-royal-700/30">
          <div className="text-3xl font-bold text-white mb-1">
            {daysUntilWedding > 0 ? daysUntilWedding : 0}
          </div>
          <div className="text-xs text-rose-300 flex items-center justify-center gap-1">
            <Flame size={12} />
            ngày còn lại đến Lâu Đài Tình Yêu
          </div>
        </div>

        {/* XP Bar */}
        <div className="bg-slate-800/60 rounded-xl p-3 mb-2 border border-slate-700/30">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-royal-300 flex items-center gap-1">
              <Sparkles size={12} /> {totalXP} XP
            </span>
            <span className="text-slate-400">
              {completedCount}/{totalCount} nhiệm vụ
            </span>
          </div>
          <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-royal-500 to-gold-400 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Map Path */}
      <div className="px-4 pb-8">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-slate-700/50" />

          {phaseProgress.map((phase, idx) => {
            const isActive = idx === activePhase
            const isDone = phase.percent === 100
            const isLocked = idx > activePhase

            return (
              <div key={phase.id} className="relative flex items-start mb-6 last:mb-0">
                {/* Node */}
                <div
                  className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl
                    ${isDone
                      ? 'bg-gradient-to-br from-forest-400 to-forest-600 shadow-lg shadow-forest-500/30'
                      : isActive
                        ? 'bg-gradient-to-br from-royal-500 to-royal-700 shadow-lg shadow-royal-500/40 ring-2 ring-royal-400/50 ring-offset-2 ring-offset-slate-900'
                        : 'bg-slate-800 border-2 border-slate-600'
                    }`}
                >
                  {isDone ? '✅' : phase.emoji}
                </div>

                {/* Content */}
                <div
                  className={`ml-4 flex-1 rounded-xl p-3 transition-all ${
                    isActive
                      ? 'bg-royal-900/40 border border-royal-600/30'
                      : isDone
                        ? 'bg-forest-900/20 border border-forest-700/20'
                        : 'bg-slate-800/30 border border-slate-700/20'
                  } ${isLocked ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3
                        className={`font-bold text-sm ${
                          isActive ? 'text-royal-200' : isDone ? 'text-forest-300' : 'text-slate-400'
                        }`}
                      >
                        {phase.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{phase.description}</p>
                    </div>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                        isDone
                          ? 'bg-forest-800/50 text-forest-300'
                          : isActive
                            ? 'bg-royal-800/50 text-royal-300'
                            : 'bg-slate-700/50 text-slate-500'
                      }`}
                    >
                      {phase.done}/{phase.total}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone
                          ? 'bg-forest-400'
                          : isActive
                            ? 'bg-gradient-to-r from-royal-400 to-gold-400'
                            : 'bg-slate-600'
                      }`}
                      style={{ width: `${phase.percent}%` }}
                    />
                  </div>

                  {/* Characters on active phase */}
                  {isActive && (
                    <div className="flex gap-1 mt-2">
                      <span className="text-base">🤴</span>
                      <span className="text-base">👸</span>
                      <span className="text-xs text-royal-400 ml-1 self-center">Đang ở đây!</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Castle at bottom */}
          <div className="text-center mt-4 relative z-10">
            <div className="inline-flex flex-col items-center">
              <div className="text-4xl mb-1">🏰</div>
              <div className="flex items-center gap-1 text-gold-400">
                <Heart size={12} fill="currentColor" />
                <span className="text-xs font-bold">Lâu Đài Tình Yêu</span>
                <Heart size={12} fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
