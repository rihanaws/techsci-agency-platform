import type { Metadata } from 'next'
import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Admin — Rihan Consulting',
  robots: 'noindex, nofollow',
}

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: '⬛' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/products', label: 'Products', icon: '🗂' },
  { href: '/admin/campaign', label: 'Campaign', icon: '📣' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-[#171614]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-56 flex-col border-r border-[#2e2d2a] bg-[#1c1b19]">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-[#2e2d2a] px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4f98a3]">
            <span className="text-sm font-bold text-white">R</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#e8e5de]">Agency Platform</p>
            <p className="text-[10px] text-[#6b6861]">TechSci Inc</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <ul className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#9c9890] transition-colors hover:bg-[#2e2d2a] hover:text-[#e8e5de]"
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User / Sign out */}
        <div className="border-t border-[#2e2d2a] px-4 py-3">
          <p className="truncate text-xs text-[#6b6861]">{session.user?.email}</p>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/admin/login' })
            }}
          >
            <button
              type="submit"
              className="mt-1 text-xs text-[#9c9890] hover:text-red-400 transition-colors"
            >
              Sign out →
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-8">{children}</main>
    </div>
  )
}
