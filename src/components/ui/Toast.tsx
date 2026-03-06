import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

export default function Toast() {
  const toastMessage = useAppStore(s => s.toastMessage)
  const toastType    = useAppStore(s => s.toastType)
  const clearToast   = useAppStore(s => s.clearToast)

  if (!toastMessage) return null

  const icons = {
    success: <CheckCircle size={16} style={{ color: '#4ade80', flexShrink: 0 }} />,
    error:   <XCircle size={16} style={{ color: '#f87171', flexShrink: 0 }} />,
    info:    <Info size={16} style={{ color: '#c084fc', flexShrink: 0 }} />,
    warning: <AlertTriangle size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />,
  }

  return (
    <div className={`toast toast-${toastType}`}>
      {icons[toastType]}
      <span style={{ flex: 1, fontSize: 13 }}>{toastMessage}</span>
      <button className="toast-close" onClick={clearToast}><X size={14} /></button>
    </div>
  )
}