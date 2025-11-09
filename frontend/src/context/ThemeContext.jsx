import React, { createContext, useContext, useEffect, useState } from 'react'
const ThemeContext = createContext()
export function useTheme(){ return useContext(ThemeContext) }
export function ThemeProvider({children}){
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system')
  useEffect(() => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const enableDark = theme === 'dark' || (theme === 'system' && prefersDark)
    root.classList.toggle('dark', enableDark)
    localStorage.setItem('theme', theme)
  }, [theme])
  return <ThemeContext.Provider value={{theme, setTheme}}>{children}</ThemeContext.Provider>
}
