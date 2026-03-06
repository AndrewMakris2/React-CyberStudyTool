import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useAppStore } from '../../store/useAppStore'

export default function Layout() {
  const sidebarOpen = useAppStore(s => s.sidebarOpen)

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        marginLeft: sidebarOpen ? '256px' : '64px',
        transition: 'margin-left 0.3s ease',
      }}>
        <TopBar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}