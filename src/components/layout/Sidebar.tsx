import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Target, MessageSquare, FileText,
  Layers, Dumbbell, ClipboardList, FlaskConical,
  BookOpen, Settings, ChevronLeft, ChevronRight, Shield,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { CERTS_DATA } from '../../data/objectives'
import type { CertId } from '../../types'

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/objectives', icon: Target,           label: 'Objectives' },
  { to: '/tutor',      icon: MessageSquare,    label: 'AI Tutor' },
  { to: '/notes',      icon: FileText,         label: 'Notes' },
  { to: '/flashcards', icon: Layers,           label: 'Flashcards' },
  { to: '/practice',   icon: Dumbbell,         label: 'Practice' },
  { to: '/exam',       icon: ClipboardList,    label: 'Exam Mode' },
  { to: '/labs',       icon: FlaskConical,     label: 'Labs' },
  { to: '/knowledge',  icon: BookOpen,         label: 'Knowledge' },
  { to: '/settings',   icon: Settings,         label: 'Settings' },
]

export default function Sidebar() {
  const sidebarOpen   = useAppStore(s => s.sidebarOpen)
  const toggleSidebar = useAppStore(s => s.toggleSidebar)
  const activeCertId  = useAppStore(s => s.activeCertId)
  const setActiveCert = useAppStore(s => s.setActiveCert)
  const activeCertIds = useSettingsStore(s => s.activeCertIds)

  const availableCerts = CERTS_DATA.filter(c => activeCertIds.includes(c.id))
  const activeCert     = CERTS_DATA.find(c => c.id === activeCertId)

  return (
    <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>

      {/* ── Logo row — always visible ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Shield size={16} color="#fff" />
        </div>

        {/* Text only when open */}
        {sidebarOpen && (
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sidebar-logo-text">CyberCert</div>
            <div className="sidebar-logo-sub">Study App</div>
          </div>
        )}

        {/* Toggle always rendered */}
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          style={{ marginLeft: sidebarOpen ? 'auto' : 0 }}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* ── Cert selector — only when open ── */}
      {sidebarOpen && (
        <div className="sidebar-section">
          <div className="sidebar-section-label">Active Cert</div>
          {availableCerts.map(cert => (
            <button
              key={cert.id}
              className={`cert-btn ${activeCertId === cert.id ? 'active' : ''}`}
              onClick={() => setActiveCert(cert.id as CertId)}
            >
              <div className="cert-dot" style={{ backgroundColor: cert.color }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cert.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={!sidebarOpen ? label : undefined}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer — only when open ── */}
      {sidebarOpen && activeCert && (
        <div className="sidebar-footer">
          <div className="cert-dot" style={{ backgroundColor: activeCert.color }} />
          <span style={{ fontSize: 12, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeCert.name}
          </span>
        </div>
      )}
    </aside>
  )
}