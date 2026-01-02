import 'dotenv/config'
import express from 'express'
import mailRoutes from './routes/mail.routes'
import cors from "cors"

const app = express()
app.use(express.json())

const corsURL =  String(process.env.CORS_DOMAIN || "http://localhost:5173");

app.use(cors({
  origin: [corsURL], 
  credentials: true
}));

app.use('/mail', mailRoutes)

const port = process.env.PORT || 3002
app.listen(port, () => {
  console.log(`corriendo en ${port}`)
})
