import { Resend } from 'resend'

const globalForResend = globalThis as unknown as { resend?: Resend }

export function getResendClient(): Resend {
  if (globalForResend.resend) return globalForResend.resend

  const client = new Resend(process.env.RESEND_API_KEY!)

  if (process.env.NODE_ENV !== 'production') globalForResend.resend = client
  return client
}

export const FROM_ADDRESS = process.env.FROM_EMAIL ?? 'noreply@rihan.cloud'
export const FROM_NAME = process.env.FROM_NAME ?? 'Rihan Consulting'
export const FROM = `${FROM_NAME} <${FROM_ADDRESS}>`
export const REPLY_TO = 'hello@rihan.cloud'
