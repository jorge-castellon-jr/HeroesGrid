import React from 'react'
import { headers as getHeaders } from 'next/headers'
import './styles.css'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { getPayloadClient } from '@/getPayloadClient'
import { isEditorOrAdmin } from '@/access/roles'

export const metadata = {
  description: 'Tough Project description',
  title: 'Tough Project',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const headers = await getHeaders()
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers })
  const showAdminLink = isEditorOrAdmin(user as any)

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
              {showAdminLink && (
                <Link className="rm-navLink" href="/admin">
                  Admin
                </Link>
              )}
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
