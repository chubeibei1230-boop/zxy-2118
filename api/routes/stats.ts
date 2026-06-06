import { Router, type Request, type Response } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import * as statsService from '../services/statsService.js'

const router = Router()

router.get('/dashboard', authMiddleware, (req: Request, res: Response): void => {
  try {
    const result = statsService.getDashboard()
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
