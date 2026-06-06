import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDb } from './database/init.js'
import authRoutes from './routes/auth.js'
import propsRoutes from './routes/props.js'
import borrowRoutes from './routes/borrow.js'
import warehouseRoutes from './routes/warehouse.js'
import workflowRoutes from './routes/workflow.js'
import adminRoutes from './routes/admin.js'
import statsRoutes from './routes/stats.js'

dotenv.config()

initDb()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/props', propsRoutes)
app.use('/api/borrow', borrowRoutes)
app.use('/api/warehouse', warehouseRoutes)
app.use('/api/workflow', workflowRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/stats', statsRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
