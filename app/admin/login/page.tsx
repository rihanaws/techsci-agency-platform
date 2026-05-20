import type { Metadata } from 'next'
import { signIn } from '@/auth'

export const metadata: Metadata = {
  title: 'Admin Login — Rihan Consulting',
  description: 'Sign in to the agency platform admin panel.',
  robots: 'noindex, nofollow',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#171614] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4f98a3]">
            <span className="text-xl font-bold text-white">R</span>
          </div>
          <h1 className="text-xl font-bold text-[#e8e5de]">Admin Panel</h1>
          <p className="text-sm text-[#6b6861]">Rihan Consulting × TechSci Inc</p>
        </div>

        {/* Login card */}
        <div className="rounded-xl border border-[#2e2d2a] bg-[#1c1b19] p-6">
          <h2 className="mb-1 text-base font-semibold text-[#e8e5de]">Sign in with magic link</h2>
          <p className="mb-5 text-sm text-[#9c9890]">
            Enter your admin email and we&apos;ll send you a sign-in link.
          </p>

          <form
            action={async (formData: FormData) => {
              'use server'
              await signIn('resend', {
                email: formData.get('email') as string,
                redirectTo: '/admin',
              })
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#c9c7c0]">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none focus:ring-1 focus:ring-[#4f98a3] transition-colors"
                placeholder="admin@yourdomain.com"
              />
            </div>
            <button
              id="login-submit-btn"
              type="submit"
              className="flex items-center justify-center rounded-lg bg-[#4f98a3] px-6 py-2.5 font-semibold text-white transition-all hover:bg-[#3d7a84] active:scale-[0.98]"
            >
              Send Magic Link
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
