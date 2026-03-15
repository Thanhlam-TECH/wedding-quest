import { useState } from 'react'
import { GameProvider } from './context/GameContext'
import Navigation from './components/Navigation'
import MapScreen from './components/MapScreen'
import QuestLog from './components/QuestLog'
import AddTaskScreen from './components/AddTaskScreen'
import TreasuryScreen from './components/TreasuryScreen'
import ProfileScreen from './components/ProfileScreen'

function AppContent() {
  const [activeTab, setActiveTab] = useState('map')
  const [editTask, setEditTask] = useState(null)

  const handleEditTask = (task) => {
    setEditTask(task)
    setActiveTab('add')
  }

  const handleAddDone = () => {
    setEditTask(null)
    setActiveTab('quests')
  }

  const handleTabChange = (tab) => {
    if (tab !== 'add') {
      setEditTask(null)
    }
    setActiveTab(tab)
  }

  return (
    <div className="flex flex-col min-h-dvh max-w-lg mx-auto relative">
      {activeTab === 'map' && <MapScreen />}
      {activeTab === 'quests' && <QuestLog onEditTask={handleEditTask} />}
      {activeTab === 'add' && <AddTaskScreen editTask={editTask} onDone={handleAddDone} />}
      {activeTab === 'treasury' && <TreasuryScreen />}
      {activeTab === 'profile' && <ProfileScreen />}
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}
