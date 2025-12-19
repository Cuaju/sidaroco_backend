import { Router } from 'express'
import { sendMail } from '../controllers/mail.controller'

const router = Router()

router.post('/send', sendMail)

export default router
