import { createContext, useContext, useReducer, useEffect } from 'react'
import { createDefaultTasks, PHASES } from '../data/defaultTasks'

const GameContext = createContext()

const STORAGE_KEY = 'wedding-quest-data'

const XP_MAP = { high: 200, medium: 100, low: 50 }

function getInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load saved state', e)
  }

  return {
    tasks: createDefaultTasks(),
    totalXP: 0,
    weddingDate: '2027-10-27',
    profiles: {
      groom: { name: 'Hoàng Tử', avatar: null },
      bride: { name: 'Công Chúa', avatar: null },
    },
    totalBudget: null,
    createdAt: new Date().toISOString(),
  }
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_TASK': {
      const tasks = state.tasks.map((t) => {
        if (t.id !== action.taskId) return t
        const completed = !t.completed
        return {
          ...t,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        }
      })
      const totalXP = tasks
        .filter((t) => t.completed)
        .reduce((sum, t) => sum + t.xp, 0)
      return { ...state, tasks, totalXP }
    }

    case 'UPDATE_TASK': {
      const tasks = state.tasks.map((t) =>
        t.id === action.taskId ? { ...t, ...action.updates } : t
      )
      const totalXP = tasks
        .filter((t) => t.completed)
        .reduce((sum, t) => sum + t.xp, 0)
      return { ...state, tasks, totalXP }
    }

    case 'ADD_TASK': {
      return { ...state, tasks: [...state.tasks, action.task] }
    }

    case 'DELETE_TASK': {
      const tasks = state.tasks.filter((t) => t.id !== action.taskId)
      const totalXP = tasks
        .filter((t) => t.completed)
        .reduce((sum, t) => sum + t.xp, 0)
      return { ...state, tasks, totalXP }
    }

    case 'SET_PROFILES': {
      return { ...state, profiles: { ...state.profiles, ...action.profiles } }
    }

    case 'SET_BUDGET': {
      return { ...state, totalBudget: action.budget }
    }

    case 'RESET_ALL': {
      return {
        tasks: createDefaultTasks(),
        totalXP: 0,
        weddingDate: '2027-10-27',
        profiles: {
          groom: { name: 'Hoàng Tử', avatar: null },
          bride: { name: 'Công Chúa', avatar: null },
        },
        totalBudget: null,
        createdAt: new Date().toISOString(),
      }
    }

    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, null, getInitialState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.error('Failed to save state', e)
    }
  }, [state])

  const maxXP = state.tasks.reduce((sum, t) => sum + t.xp, 0)

  const completedCount = state.tasks.filter((t) => t.completed).length
  const totalCount = state.tasks.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  // Phase progress
  const phaseProgress = PHASES.map((phase) => {
    const phaseTasks = state.tasks.filter((t) => t.phaseId === phase.id)
    const done = phaseTasks.filter((t) => t.completed).length
    return {
      ...phase,
      total: phaseTasks.length,
      done,
      percent: phaseTasks.length > 0 ? (done / phaseTasks.length) * 100 : 0,
    }
  })

  // Finance summary
  const financeSummary = {
    totalBudget: state.totalBudget,
    quotes: 0,
    committed: 0,
    paid: 0,
  }
  state.tasks.forEach((t) => {
    if (t.cost && t.cost > 0) {
      if (t.costType === 'quote') financeSummary.quotes += t.cost
      else if (t.costType === 'committed') financeSummary.committed += t.cost
      else if (t.costType === 'paid') financeSummary.paid += t.cost
    }
  })

  // Days until wedding
  const daysUntilWedding = Math.ceil(
    (new Date(state.weddingDate) - new Date()) / (1000 * 60 * 60 * 24)
  )

  const value = {
    ...state,
    dispatch,
    maxXP,
    completedCount,
    totalCount,
    progressPercent,
    phaseProgress,
    financeSummary,
    daysUntilWedding,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
