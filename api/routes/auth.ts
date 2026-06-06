import { Router, type Request, type Response } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import * as authService from '../services/authService.js'

const router = Router()

router.post('/login', (req: Request, res: Response): void => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      res.status(400).json({ success: false, error: '用户名和密码不能为空' })
      return
    }
    const result = authService.login(username, password)
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message })
  }
})

router.get('/me', authMiddleware, (req: Request, res: Response): void => {
  try {
    const user = authService.getCurrentUser(req.user!.id)
    res.json({ success: true, data: user })
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message })
  }
})

export default router
