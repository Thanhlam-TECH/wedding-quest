import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { CATEGORIES } from '../data/defaultTasks'
import { Coins, TrendingUp, AlertTriangle, PiggyBank, ChevronDown, Star } from 'lucide-react'

function formatCurrency(num) {
  if (!num && num !== 0) return '—'
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ'
}

export default function TreasuryScreen() {
  const { tasks, financeSummary, dispatch, totalBudget } = useGame()
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState(totalBudget || '')
  const [expandedCategory, setExpandedCategory] = useState(null)

  const totalSpent = financeSummary.committed + financeSummary.paid
  const budgetPercent = totalBudget ? (totalSpent / totalBudget) * 100 : 0

  // Group costs by category
  const categoryFinance = CATEGORIES.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat.id && t.cost > 0)
    const quotes = catTasks
      .filter((t) => t.costType === 'quote')
      .reduce((s, t) => s + t.cost, 0)
    const committed = catTasks
      .filter((t) => t.costType === 'committed')
      .reduce((s, t) => s + t.cost, 0)
    const paid = catTasks
      .filter((t) => t.costType === 'paid')
      .reduce((s, t) => s + t.cost, 0)
    return { ...cat, tasks: catTasks, quotes, committed, paid, total: quotes + committed + paid }
  }).filter((c) => c.total > 0)

  // Vendor comparison: group tasks by category + vendorName
  const vendorComparisons = CATEGORIES.map((cat) => {
    const vendors = tasks.filter(
      (t) => t.category === cat.id && t.vendorName && t.cost > 0
    )
    if (vendors.length < 2) return null
    return { category: cat, vendors }
  }).filter(Boolean)

  const handleSaveBudget = () => {
    dispatch({ type: 'SET_BUDGET', budget: Number(budgetInput) || null })
    setEditingBudget(false)
  }

  // Payment timeline
  const paymentTimeline = tasks
    .filter((t) => t.cost > 0 && t.deadline)
    .sort((a, b) => (a.deadline > b.deadline ? 1 : -1))

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-4 pt-6">
        <h2 className="text-lg font-bold text-gold-300 flex items-center gap-2 mb-4">
          <Coins size={18} /> Kho Bạc Hoàng Gia
        </h2>

        {/* Budget Overview */}
        <div className="bg-gradient-to-br from-gold-900/20 to-royal-900/20 rounded-2xl p-4 mb-4 border border-gold-700/20">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Ngân sách tổng</div>
              {editingBudget ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="Nhập ngân sách..."
                    className="bg-slate-800 border border-gold-600/30 rounded-lg px-3 py-1.5 text-sm text-gold-300 w-36 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveBudget}
                    className="px-3 py-1.5 bg-gold-600 text-white text-xs rounded-lg"
                  >
                    Lưu
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingBudget(true)}
                  className="text-xl font-bold text-gold-300 hover:text-gold-200"
                >
                  {totalBudget ? formatCurrency(totalBudget) : 'Chưa đặt — Nhấn để nhập'}
                </button>
              )}
            </div>
            <PiggyBank size={24} className="text-gold-500/50" />
          </div>

          {totalBudget > 0 && (
            <>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    budgetPercent > 90
                      ? 'bg-gradient-to-r from-red-500 to-red-400'
                      : budgetPercent > 70
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                        : 'bg-gradient-to-r from-forest-500 to-forest-400'
                  }`}
                  style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                />
              </div>
              <div className="text-xs text-slate-400">
                {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)} ({budgetPercent.toFixed(1)}%)
              </div>
              {budgetPercent > 90 && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                  <AlertTriangle size={10} /> Sắp vượt ngân sách!
                </div>
              )}
            </>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-blue-900/20 border border-blue-800/20 rounded-xl p-3 text-center">
            <div className="text-[10px] text-blue-300 mb-1">💭 Báo giá</div>
            <div className="text-sm font-bold text-blue-200">{formatCurrency(financeSummary.quotes)}</div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-800/20 rounded-xl p-3 text-center">
            <div className="text-[10px] text-yellow-300 mb-1">📝 Cam kết</div>
            <div className="text-sm font-bold text-yellow-200">{formatCurrency(financeSummary.committed)}</div>
          </div>
          <div className="bg-green-900/20 border border-green-800/20 rounded-xl p-3 text-center">
            <div className="text-[10px] text-green-300 mb-1">✅ Đã trả</div>
            <div className="text-sm font-bold text-green-200">{formatCurrency(financeSummary.paid)}</div>
          </div>
        </div>

        {/* By Category */}
        {categoryFinance.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <TrendingUp size={14} /> Theo hạng mục
            </h3>
            {categoryFinance.map((cat) => (
              <div key={cat.id} className="mb-2">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                  className="w-full flex items-center gap-2 p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl"
                >
                  <span>{cat.emoji}</span>
                  <span className="text-sm text-slate-200 flex-1 text-left">{cat.label}</span>
                  <span className="text-xs text-gold-300">{formatCurrency(cat.total)}</span>
                  <ChevronDown
                    size={12}
                    className={`text-slate-500 transition-transform ${
                      expandedCategory === cat.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedCategory === cat.id && (
                  <div className="ml-4 mt-1 space-y-1">
                    {cat.tasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2 p-2 bg-slate-800/20 rounded-lg text-xs"
                      >
                        <span className="text-slate-400 flex-1 truncate">{t.title}</span>
                        {t.vendorName && (
                          <span className="text-royal-400 truncate max-w-[80px]">{t.vendorName}</span>
                        )}
                        <span
                          className={
                            t.costType === 'paid'
                              ? 'text-green-300'
                              : t.costType === 'committed'
                                ? 'text-yellow-300'
                                : 'text-blue-300'
                          }
                        >
                          {formatCurrency(t.cost)}
                        </span>
                        {t.vendorRating && (
                          <span className="flex items-center text-gold-400">
                            {t.vendorRating}<Star size={8} fill="currentColor" className="ml-0.5" />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Vendor Comparison */}
        {vendorComparisons.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">📊 So sánh Vendor</h3>
            {vendorComparisons.map((comp) => (
              <div
                key={comp.category.id}
                className="mb-3 p-3 bg-slate-800/30 border border-slate-700/20 rounded-xl"
              >
                <div className="text-xs text-slate-400 mb-2">
                  {comp.category.emoji} {comp.category.label}
                </div>
                <div className="space-y-1.5">
                  {comp.vendors
                    .sort((a, b) => a.cost - b.cost)
                    .map((v) => (
                      <div key={v.id} className="flex items-center gap-2 text-xs">
                        <span className="text-slate-300 flex-1 truncate">{v.vendorName}</span>
                        <span className="text-gold-300 font-mono">{formatCurrency(v.cost)}</span>
                        {v.vendorRating && (
                          <span className="text-gold-400 flex items-center">
                            {'⭐'.repeat(v.vendorRating)}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Timeline */}
        {paymentTimeline.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">📅 Lịch thanh toán</h3>
            <div className="space-y-1.5">
              {paymentTimeline.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${
                    t.costType === 'paid'
                      ? 'bg-green-900/10 text-green-300/50 line-through'
                      : 'bg-slate-800/30 text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 w-20 flex-shrink-0">
                    {new Date(t.deadline).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex-1 truncate">{t.title}</span>
                  <span className="text-gold-300 font-mono">{formatCurrency(t.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {categoryFinance.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-sm">Chưa có dữ liệu tài chính.</p>
            <p className="text-xs mt-1">Thêm chi phí khi sửa nhiệm vụ!</p>
          </div>
        )}
      </div>
    </div>
  )
}
