import { Search, Bell, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { CERTS_DATA } from '../../data/objectives'
import GlobalSearch from './GlobalSearch'

export default function TopBar() {
  const activeCertId  = useAppStore(s => s.activeCertId)
  const searchOpen    = useAppStore(s => s.searchOpen)
  const setSearchOpen = useAppStore(s => s.setSearchOpen)
  const groqApiKey    = useSettingsStore(s => s.groqApiKey)
  const navigate      = useNavigate()
  const activeCert    = CERTS_DATA.find(c => c.id === activeCertId)

  return (
    <>
      <header className="topbar">
        <div className="topbar-cert">
          {activeCert && (
            <>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: activeCert.color, flexShrink: 0 }} />
              {activeCert.name}
            </>
          )}
        </div>

        <button className="search-btn" onClick={() => setSearchOpen(true)}>
          <Search size={14} />
          <span>Search...</span>
          <kbd style={{ fontSize: 11, background: '#222', padding: '2px 6px', borderRadius: 4, color: '#555' }}>⌘K</kbd>
        </button>

        {!groqApiKey && (
          <button className="topbar-action-btn" onClick={() => navigate('/settings')}>
            <Bell size={12} /> Add API Key
          </button>
        )}

        <button className="topbar-icon-btn" onClick={() => navigate('/settings')}>
          <Settings size={18} />
        </button>
      </header>
      {searchOpen && <GlobalSearch />}
    </>
  )
}