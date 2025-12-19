import nodemailer from 'nodemailer'
import { renderTemplate } from '../utils/template.utils'

interface SendMailDto {
  to: string
  subject: string
  template: string
  context: Record<string, any>
}

export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  async sendMail(data: SendMailDto) {
    const html = renderTemplate(data.template, data.context)

    await this.transporter.sendMail({
      from: `"Sidaroco" <${process.env.SMTP_FROM}>`,
      to: data.to,
      subject: data.subject,
      html
    })
  }
}
