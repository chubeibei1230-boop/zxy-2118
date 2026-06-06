import { Router, type Request, type Response } from 'express'
import { authMiddleware, roleMiddleware } from '../middleware/auth.js'
import * as adminService from '../services/adminService.js'

const router = Router()

router.get('/users', authMiddleware, roleMiddleware('admin'), (req: Request, res: Response): void => {
  try {
    const result = adminService.listUsers()
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/users', authMiddleware, roleMiddleware('admin'), (req: Request, res: Response): void => {
  try {
    const { username, password, name, role } = req.body
    if (!username || !password || !name || !role) {
      res.status(400).json({ success: false, error: '所有字段不能为空' })
      return
    }
    const result = adminService.createUser({ username, password, name, role })
    res.status(201).json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.put('/users/:id', authMiddleware, roleMiddleware('admin'), (req: Request, res: Response): void => {
  try {
    const { name, role, enabled, password } = req.body
    adminService.updateUser(Number(req.params.id), { name, role, enabled, password })
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.get('/groups', authMiddleware, (req: Request, res: Response): void => {
  try {
    const result = adminService.listGroups(req.query.includeDeleted === 'true')
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/groups', authMiddleware, roleMiddleware('admin'), (req: Request, res: Response): void => {
  try {
    const { name, description, member_ids } = req.body
    if (!name) {
      res.status(400).json({ success: false, error: '小组名称不能为空' })
      return
    }
    const result = adminService.createGroup({ name, description, member_ids })
    res.status(201).json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.put('/groups/:id', authMiddleware, roleMiddleware('admin'), (req: Request, res: Response): void => {
  try {
    const { name, description, member_ids } = req.body
    if (!name) {
      res.status(400).json({ success: false, error: '小组名称不能为空' })
      return
    }
    adminService.updateGroup(Number(req.params.id), { name, description, member_ids })
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.delete('/groups/:id', authMiddleware, roleMiddleware('admin'), (req: Request, res: Response): void => {
  try {
    adminService.deleteGroup(Number(req.params.id))
    res.json({ success: true })
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message })
  }
})

router.get('/categories', authMiddleware, (req: Request, res: Response): void => {
  try {
    const result = adminService.listCategories(req.query.includeDeleted === 'true')
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/categories', authMiddleware, roleMiddleware('admin'), (req: Request, res: Response): void => {
  try {
    const { name, description } = req.body
    if (!name) {
      res.status(400).json({ success: false, error: '分类名称不能为空' })
      return
    }
    const result = adminService.createCategory({ name, description })
    res.status(201).json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.put('/categories/:id', authMiddleware, roleMiddleware('admin'), (req: Request, res: Response): void => {
  try {
    const { name, description } = req.body
    if (!name) {
      res.status(400).json({ success: false, error: '分类名称不能为空' })
      return
    }
    adminService.updateCategory(Number(req.params.id), { name, description })
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.delete('/categories/:id', authMiddleware, roleMiddleware('admin'), (req: Request, res: Response): void => {
  try {
    adminService.deleteCategory(Number(req.params.id))
    res.json({ success: true })
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message })
  }
})

export default router
