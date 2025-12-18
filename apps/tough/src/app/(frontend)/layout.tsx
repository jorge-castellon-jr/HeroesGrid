import React from 'react'
import './styles.css'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'

export const metadata = {
  description: 'Tough Project description',
  title: 'Tough Project',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          // Prevent theme flash before hydration.
          dangerouslySetInnerHTML={{
            __html: `
(() => {
  try {
    const stored = localStorage.getItem('theme');
    const theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`,
          }}
        />
        <header className="rm-topbar">
          <div className="rm-topbarInner">
            <Link className="rm-brand" href="/">
              Tough Project
            </Link>
            <nav className="rm-nav">
              <Link className="rm-navLink" href="/roadmap">
                Roadmap
              </Link>
              <Link className="rm-navLink" href="/polls">
                Polls
              </Link>
            </nav>
            <div className="rm-topbarRight">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="rm-main">{children}</main>
      </body>
    </html>
  )
}
