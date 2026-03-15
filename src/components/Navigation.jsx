import { Map, ScrollText, PlusCircle, Coins, User } from 'lucide-react'

const tabs = [
  { id: 'map', label: 'Map', icon: Map },
  { id: 'quests', label: 'Quests', icon: ScrollText },
  { id: 'add', label: 'Thêm', icon: PlusCircle },
  { id: 'treasury', label: 'Kho Bạc', icon: Coins },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function Navigation({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-royal-800/50 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const isAdd = tab.id === 'add'
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-3 transition-all duration-200 ${
                isAdd
                  ? 'relative -top-3'
                  : ''
              } ${
                isActive
                  ? 'text-royal-400'
                  : 'text-slate-500'
              }`}
            >
              <div
                className={
                  isAdd
                    ? `p-3 rounded-full ${
                        isActive
                          ? 'bg-royal-600 text-white shadow-lg shadow-royal-600/50'
                          : 'bg-royal-700/60 text-royal-300'
                      }`
                    : ''
                }
              >
                <Icon size={isAdd ? 24 : 20} />
              </div>
              <span className={`text-[10px] mt-0.5 ${isAdd ? 'mt-1' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
