import { getResendClient, FROM, REPLY_TO } from './client'

export async function sendZipDeliveryEmail(
  to: string,
  customerName: string,
  productName: string,
  downloadUrls: string[],
): Promise<void> {
  const resend = getResendClient()

  const linksHtml = downloadUrls
    .map(
      (url, index) =>
        `<p style="margin: 12px 0;"><a href="${url}" style="display: inline-block; background-color: #4f98a3; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">Download Asset ${
          downloadUrls.length > 1 ? `#${index + 1}` : ''
        }</a></p>`,
    )
    .join('')

  const html = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">
      <h2 style="color: #4f98a3;">Your Order is Ready!</h2>
      <p>Hi ${customerName},</p>
      <p>Thank you for your purchase of <strong>${productName}</strong>. Your downloadable digital assets are ready for download below.</p>
      <p style="color: #666; font-size: 12px; margin-bottom: 20px;">Please note: These download links are secure and will remain active for 48 hours.</p>
      ${linksHtml}
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">
        Rihan Consulting &copy; ${new Date().getFullYear()} · <a href="mailto:hello@rihan.cloud" style="color: #4f98a3;">hello@rihan.cloud</a>
      </p>
    </div>
  `

  await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `Your Delivery: ${productName}`,
    html,
  })
}

export async function sendPdfReportDeliveryEmail(
  to: string,
  customerName: string,
  productName: string,
  reportDownloadUrl: string,
): Promise<void> {
  const resend = getResendClient()

  const html = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">
      <h2 style="color: #4f98a3;">Your Report is Ready!</h2>
      <p>Hi ${customerName},</p>
      <p>We have completed the analysis for your <strong>${productName}</strong>. Your custom-generated PDF report is ready for download.</p>
      <p style="margin: 24px 0;">
        <a href="${reportDownloadUrl}" style="display: inline-block; background-color: #4f98a3; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">Download PDF Report</a>
      </p>
      <p style="color: #666; font-size: 12px; margin-bottom: 20px;">Please note: This download link is secure and will remain active for 48 hours.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">
        Rihan Consulting &copy; ${new Date().getFullYear()} · <a href="mailto:hello@rihan.cloud" style="color: #4f98a3;">hello@rihan.cloud</a>
      </p>
    </div>
  `

  await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `Your Completed Report: ${productName}`,
    html,
  })
}

export async function sendWelcomeEmail(to: string, customerName: string): Promise<void> {
  const resend = getResendClient()

  const html = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">
      <h2 style="color: #4f98a3;">Welcome to the Autonomous Founder Systems Community!</h2>
      <p>Hi ${customerName},</p>
      <p>We are thrilled to welcome you to our community. You now have full access to our network of autonomous founders, tools, and updates.</p>
      <p>Please check your Whop dashboard to access the Discord server / community channels.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">
        Rihan Consulting &copy; ${new Date().getFullYear()} · <a href="mailto:hello@rihan.cloud" style="color: #4f98a3;">hello@rihan.cloud</a>
      </p>
    </div>
  `

  await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Welcome to the Autonomous Founder Systems Community!',
    html,
  })
}
