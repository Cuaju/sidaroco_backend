import { Request, Response } from 'express'
import { MailService } from '../services/mail.service'

const mailService = new MailService()

export async function sendMail(req: Request, res: Response) {
  try {
    const { to, subject, template, context } = req.body

    if (!to || !subject) {
      return res.status(400).json({ ok: false, message: 'pa qn y asunto son requeridos' })
    }

    await mailService.sendMail({
      to,
      subject,
      template: template || 'default', 
      context: context || {}          
    })

    res.status(200).json({ ok: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, message: (error as Error).message })
  }
}
