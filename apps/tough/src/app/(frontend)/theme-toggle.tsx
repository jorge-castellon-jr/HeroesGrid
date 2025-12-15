'use client'

import React from 'react'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  window.localStorage.setItem('theme', theme)
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>('light')

  React.useEffect(() => {
    const t = getInitialTheme()
    setTheme(t)
    applyTheme(t)
  }, [])

  return (
    <button
      type="button"
      className="rm-iconButton"
      onClick={() => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        applyTheme(next)
      }}
      title="Toggle theme"
    >
      <span aria-hidden>{theme === 'dark' ? '🌙' : '☀️'}</span>
      <span className="rm-iconCount">{theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  )
}

