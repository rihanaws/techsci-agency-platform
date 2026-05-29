import { getResendClient, FROM, REPLY_TO } from './client'
import DeliveryEmail from '@/emails/delivery'
import BundleDeliveryEmail from '@/emails/bundle-delivery'
import IntakeLinkEmail from '@/emails/intake-link'
import WelcomeEmail from '@/emails/welcome'

export async function sendZipDeliveryEmail(
  to: string,
  customerName: string,
  productName: string,
  downloadUrls: string[],
): Promise<void> {
  const resend = getResendClient()
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  if (downloadUrls.length === 1) {
    await resend.emails.send({
      from: FROM, replyTo: REPLY_TO, to,
      subject: `Your Delivery: ${productName}`,
      react: DeliveryEmail({ productName, customerName, downloadUrl: downloadUrls[0], expiresAt }),
    })
  } else {
    await resend.emails.send({
      from: FROM, replyTo: REPLY_TO, to,
      subject: `Your Bundle: ${productName}`,
      react: BundleDeliveryEmail({
        bundleName: productName, customerName, expiresAt,
        downloads: downloadUrls.map((url, i) => ({ label: `Asset ${i + 1}`, url })),
      }),
    })
  }
}

export async function sendBundleDeliveryEmail(
  to: string,
  customerName: string,
  bundleName: string,
  downloads: Array<{ label: string; url: string }>,
): Promise<void> {
  const resend = getResendClient()
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  await resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `Your Bundle: ${bundleName}`,
    react: BundleDeliveryEmail({ bundleName, customerName, downloads, expiresAt }),
  })
}

export async function sendPdfReportDeliveryEmail(
  to: string,
  customerName: string,
  productName: string,
  reportDownloadUrl: string,
): Promise<void> {
  const resend = getResendClient()
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  await resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `Your Completed Report: ${productName}`,
    react: DeliveryEmail({ productName, customerName, downloadUrl: reportDownloadUrl, expiresAt }),
  })
}

export async function sendIntakeLinkEmail(
  to: string,
  customerName: string,
  productName: string,
  intakeUrl: string,
): Promise<void> {
  const resend = getResendClient()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  await resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: `Complete your intake: ${productName}`,
    react: IntakeLinkEmail({ productName, customerName, intakeUrl, expiresAt }),
  })
}

export async function sendWelcomeEmail(
  to: string,
  customerName: string,
  communityUrl = 'https://whop.com',
): Promise<void> {
  const resend = getResendClient()
  await resend.emails.send({
    from: FROM, replyTo: REPLY_TO, to,
    subject: 'Welcome to the Autonomous Founder Systems Community!',
    react: WelcomeEmail({ customerName, communityUrl }),
  })
}
