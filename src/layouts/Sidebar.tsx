import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon, { type IconName } from '../components/Icon'

type NavBase = {
  id: string
  name: string
  icon: IconName
  section: 'main' | 'modules' | 'settings'
  path?: string
}

type NavSeparator = {
  id: string
  type: 'separator'
}

type NavItem = NavBase | NavSeparator

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
}

const navItems: NavItem[] = [
  { id: 'control-tower', name: 'Control Tower', icon: 'dashboard', section: 'main', path: '/' },
  { id: 'inbox', name: 'Inbox & Communication', icon: 'mail', section: 'main' },
  { id: 'separator-1', type: 'separator' },
  { id: 'intake', name: 'Intake & Scheduling', icon: 'user-plus', section: 'modules', path: '/intake' },
  { id: 'benefits', name: 'Benefits Verification', icon: 'shield-check', section: 'modules' },
  { id: 'claims', name: 'Claims & Charges', icon: 'document', section: 'modules', path: '/charge-review' },
  { id: 'payments', name: 'Payment Posting', icon: 'credit-card', section: 'modules' },
  { id: 'denials', name: 'Denials & AR', icon: 'alert', section: 'modules' },
  { id: 'separator-2', type: 'separator' },
  { id: 'rules', name: 'Custom Rules', icon: 'sliders', section: 'settings' },
  { id: 'settings', name: 'Practice Settings', icon: 'cog', section: 'settings' },
]

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [activeNav, setActiveNav] = useState<string>('control-tower')

  useEffect(() => {
    const match = navItems.find(
      (item): item is NavBase =>
        'path' in item &&
        Boolean(item.path) &&
        (item.path === '/'
          ? pathname === '/'
          : pathname === item.path || pathname.startsWith(`${item.path}/`)),
    )

    if (match) {
      setActiveNav(match.id)
    }
  }, [pathname])

  const handleNavClick = (item: NavItem) => {
    if ('type' in item) return

    setActiveNav(item.id)

    if (item.path) {
      navigate(item.path)
    }
    
    // Handle Practice Settings - dispatch custom event
    if (item.id === 'settings') {
      // Navigate to intake first if not already there, then open settings
      if (pathname !== '/intake') {
        navigate('/intake')
      }
      // Dispatch event to open settings panel
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openSettings'))
      }, 100)
    }
  }

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-60'
      } bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 transition-all duration-300`}
    >
      <div className="px-4 py-5 border-b border-slate-800 flex items-center justify-between">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-slate-900 font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-semibold text-white">Supa</span>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              title="Collapse sidebar"
            >
              <Icon name="chevron-left" className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="w-full flex flex-col items-center gap-2"
            title="Expand sidebar"
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-slate-900 font-bold text-sm">S</span>
            </div>
            <Icon name="chevron-right" className="w-3 h-3 text-slate-400 hover:text-white transition-colors" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((item) => {
          if ('type' in item) {
            return <div key={item.id} className="my-3 mx-3 border-t border-slate-700" />
          }

          const isActive = activeNav === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all mb-1
                  ${isActive ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-normal'}
                  ${collapsed ? 'justify-center' : ''}
                `}
              title={collapsed ? item.name : ''}
            >
              <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </button>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">Powered by Supa AI</p>
        </div>
      )}
    </aside>
  )
}

export default Sidebar

