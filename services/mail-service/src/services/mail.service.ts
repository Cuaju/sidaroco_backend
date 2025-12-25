import nodemailer from 'nodemailer'
import path from "path";
import { renderTemplate } from '../utils/template.utils'


const logoPath = path.resolve(process.cwd(), "src", "assets", "Sidaroco.png");
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
    const html = renderTemplate(data.template, {
      ...data.context,
      logoCid: "sidaroco-logo",
    });
    
    await this.transporter.sendMail({
      from: `"Sidaroco" <${process.env.SMTP_FROM}>`,
      to: data.to,
      subject: data.subject,
      html,
      attachments: [
        {
          filename: "logo.png",
          // put your real path here:
          path: logoPath,
          cid: "sidaroco-logo", // <- referenced in the template as cid:sidaroco-logo
        },
      ],
    })
  }
}
