import 'dotenv/config'
import express from 'express'
import mailRoutes from './routes/mail.routes'


const app = express()
app.use(express.json())

app.use('/mail', mailRoutes)

const port = process.env.PORT || 3002
app.listen(port, () => {
  console.log(`corriendo en ${port}`)
})
