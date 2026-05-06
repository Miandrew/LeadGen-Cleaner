import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, html: string, from?: string) {
  try {
    await resend.emails.send({
      from: from || 'CommercialCleaningNearMe.com <leads@commercialcleaningnearme.com>',
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Email send failed:', error)
  }
}
