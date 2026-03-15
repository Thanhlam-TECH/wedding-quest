import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { GameProvider, useGame } from './context/GameContext'
import Navigation from './components/Navigation'
import MapScreen from './components/MapScreen'
import QuestLog from './components/QuestLog'
import AddTaskScreen from './components/AddTaskScreen'
import TreasuryScreen from './components/TreasuryScreen'
import ProfileScreen from './components/ProfileScreen'
import LoginScreen from './components/LoginScreen'
import RoomScreen from './components/RoomScreen'
import { Cloud, CloudOff, Loader2 } from 'lucide-react'

function SyncIndicator() {
  const { synced, saving } = useGame()

  return (
    <div className="fixed top-2 right-2 z-50">
      {saving ? (
        <div className="flex items-center gap-1 bg-yellow-900/60 text-yellow-300 text-[9px] px-2 py-1 rounded-full">
          <Loader2 size={8} className="animate-spin" /> Đang lưu...
        </div>
      ) : synced ? (
        <div className="flex items-center gap-1 bg-forest-900/60 text-forest-300 text-[9px] px-2 py-1 rounded-full">
          <Cloud size={8} /> Đã sync
        </div>
      ) : (
        <div className="flex items-center gap-1 bg-slate-800/60 text-slate-400 text-[9px] px-2 py-1 rounded-full">
          <CloudOff size={8} /> Đang kết nối...
        </div>
      )}
    </div>
  )
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('map')
  const [editTask, setEditTask] = useState(null)
  const { logout } = useAuth()

  const handleEditTask = (task) => {
    setEditTask(task)
    setActiveTab('add')
  }

  const handleAddDone = () => {
    setEditTask(null)
    setActiveTab('quests')
  }

  const handleTabChange = (tab) => {
    if (tab !== 'add') setEditTask(null)
    setActiveTab(tab)
  }

  return (
    <div className="flex flex-col min-h-dvh max-w-lg mx-auto relative">
      <SyncIndicator />
      {activeTab === 'map' && <MapScreen />}
      {activeTab === 'quests' && <QuestLog onEditTask={handleEditTask} />}
      {activeTab === 'add' && <AddTaskScreen editTask={editTask} onDone={handleAddDone} />}
      {activeTab === 'treasury' && <TreasuryScreen />}
      {activeTab === 'profile' && <ProfileScreen onLogout={logout} />}
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}

function AuthGate() {
  const { user, loading, roomId, needsRoom } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-royal-400 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginScreen />

  if (needsRoom || !roomId) return <RoomScreen />

  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
