'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'bible-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored ?? (prefersDark ? 'dark' : 'light')
    setTheme(initial)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.classList.remove('dark')
    if (theme === 'dark') root.classList.add('dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme, mounted])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  // The context is provided during SSR too. Skipping it used to make
  // useTheme() throw on the server, which aborted server rendering of the whole
  // page and left crawlers with an empty document. `theme` starts as 'light' on
  // both server and client, so the first render matches and the real theme is
  // applied by the effect above; the inline script in the layout has already
  // set the `dark` class, so there is no flash.
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
