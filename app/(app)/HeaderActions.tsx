'use client'
import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'

interface HeaderAction {
  id: string
  label: string
  icon: React.ElementType
  onClick: () => void
}

interface HeaderActionsContextValue {
  actions: HeaderAction[]
  setActions: (actions: HeaderAction[]) => void
}

const HeaderActionsContext = createContext<HeaderActionsContextValue>({ actions: [], setActions: () => {} })

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<HeaderAction[]>([])
  return (
    <HeaderActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </HeaderActionsContext.Provider>
  )
}

export function useHeaderActions() {
  return useContext(HeaderActionsContext)
}

export function useRegisterHeaderAction(id: string, label: string, icon: React.ElementType, onClick: () => void) {
  const { setActions } = useContext(HeaderActionsContext)
  const onClickRef = useRef(onClick)
  onClickRef.current = onClick

  useEffect(() => {
    setActions([{ id, label, icon, onClick: () => onClickRef.current() }])
    return () => setActions([])
  }, [id, label, icon, setActions])
}
