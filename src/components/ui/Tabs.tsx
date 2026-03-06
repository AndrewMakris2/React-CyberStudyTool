import React, { createContext, useContext, useState } from 'react'

interface TabsContextValue { activeTab: string; setActiveTab: (tab: string) => void }
const TabsContext = createContext<TabsContextValue>({ activeTab: '', setActiveTab: () => {} })

export function Tabs({ defaultTab, children, className = '', onChange }: { defaultTab: string; children: React.ReactNode; className?: string; onChange?: (tab: string) => void }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const handleChange = (tab: string) => { setActiveTab(tab); onChange?.(tab) }
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleChange }}>
      <div className={`tabs ${className}`}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`tab-list ${className}`}>{children}</div>
}

export function TabTrigger({ value, children, className = '', disabled }: { value: string; children: React.ReactNode; className?: string; disabled?: boolean }) {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  return (
    <button
      onClick={() => !disabled && setActiveTab(value)}
      disabled={disabled}
      className={`tab-trigger ${activeTab === value ? 'active' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

export function TabContent({ value, children, className = '' }: { value: string; children: React.ReactNode; className?: string }) {
  const { activeTab } = useContext(TabsContext)
  if (activeTab !== value) return null
  return <div className={`animate-fade-in ${className}`}>{children}</div>
}