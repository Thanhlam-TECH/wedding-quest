import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { createDefaultTasks, PHASES } from '../data/defaultTasks'

const GameContext = createContext()

const STORAGE_KEY = 'wedding-quest-data'

function createInitialState() {
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

function recalcXP(tasks) {
  return tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.xp, 0)
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.state

    case 'TOGGLE_TASK': {
      const tasks = state.tasks.map((t) => {
        if (t.id !== action.taskId) return t
        const completed = !t.completed
        return { ...t, completed, completedAt: completed ? new Date().toISOString() : null }
      })
      return { ...state, tasks, totalXP: recalcXP(tasks) }
    }

    case 'UPDATE_TASK': {
      const tasks = state.tasks.map((t) =>
        t.id === action.taskId ? { ...t, ...action.updates } : t
      )
      return { ...state, tasks, totalXP: recalcXP(tasks) }
    }

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] }

    case 'DELETE_TASK': {
      const tasks = state.tasks.filter((t) => t.id !== action.taskId)
      return { ...state, tasks, totalXP: recalcXP(tasks) }
    }

    case 'SET_PROFILES':
      return { ...state, profiles: { ...state.profiles, ...action.profiles } }

    case 'SET_BUDGET':
      return { ...state, totalBudget: action.budget }

    case 'RESET_ALL':
      return createInitialState()

    default:
      return state
  }
}

export function GameProvider({ children }) {
  const { user, roomId } = useAuth()
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState)
  const [synced, setSynced] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fromFirestore, setFromFirestore] = useState(false)

  // Use roomId as the Firestore document ID — both users read/write same doc
  const docPath = roomId ? `games/${roomId}` : null

  // Listen to Firestore for real-time updates
  useEffect(() => {
    if (!user || !docPath) return

    const docRef = doc(db, ...docPath.split('/'))
    const unsub = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          if (data && data.tasks) {
            setFromFirestore(true)
            dispatch({ type: 'LOAD_STATE', state: data })
          }
        } else {
          const initial = createInitialState()
          setDoc(docRef, initial)
          dispatch({ type: 'LOAD_STATE', state: initial })
        }
        setSynced(true)
      },
      (error) => {
        console.error('Firestore listen error:', error)
        try {
          const saved = localStorage.getItem(STORAGE_KEY)
          if (saved) dispatch({ type: 'LOAD_STATE', state: JSON.parse(saved) })
        } catch (e) {
          console.error('localStorage fallback failed:', e)
        }
        setSynced(true)
      }
    )

    return unsub
  }, [user, docPath])

  // Save to Firestore when state changes (debounced)
  useEffect(() => {
    if (!user || !docPath || !synced) return

    if (fromFirestore) {
      setFromFirestore(false)
      return
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      // ignore
    }

    const timer = setTimeout(() => {
      const docRef = doc(db, ...docPath.split('/'))
      setSaving(true)
      setDoc(docRef, { ...state, updatedAt: new Date().toISOString() })
        .then(() => setSaving(false))
        .catch((err) => {
          console.error('Failed to save to Firestore:', err)
          setSaving(false)
        })
    }, 500)

    return () => clearTimeout(timer)
  }, [state, user, docPath, synced])

  const maxXP = state.tasks.reduce((sum, t) => sum + t.xp, 0)
  const completedCount = state.tasks.filter((t) => t.completed).length
  const totalCount = state.tasks.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

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

  const financeSummary = { totalBudget: state.totalBudget, quotes: 0, committed: 0, paid: 0 }
  state.tasks.forEach((t) => {
    if (t.cost && t.cost > 0) {
      if (t.costType === 'quote') financeSummary.quotes += t.cost
      else if (t.costType === 'committed') financeSummary.committed += t.cost
      else if (t.costType === 'paid') financeSummary.paid += t.cost
    }
  })

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
    synced,
    saving,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
