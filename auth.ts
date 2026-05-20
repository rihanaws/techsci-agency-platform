import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Resend({
      from: process.env.FROM_EMAIL ?? 'noreply@rihan.cloud',
    }),
  ],
  callbacks: {
    signIn({ user }) {
      // Only allow ADMIN_EMAIL
      return user.email === process.env.ADMIN_EMAIL
    },
  },
  pages: {
    signIn: '/admin/login',
  },
})
