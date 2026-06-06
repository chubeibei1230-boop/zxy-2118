import { Router, type Request, type Response } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import * as propService from '../services/propService.js'

const router = Router()

router.get('/', authMiddleware, (req: Request, res: Response): void => {
  try {
    const result = propService.listProps({
      status: req.query.status as string | undefined,
      category_id: req.query.category_id ? Number(req.query.category_id) : undefined,
      keyword: req.query.keyword as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
      includeDeleted: req.query.includeDeleted === 'true'
    })
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/:id', authMiddleware, (req: Request, res: Response): void => {
  try {
    const result = propService.getPropDetail(Number(req.params.id))
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message })
  }
})

router.post('/', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { name, category_id, description, quantity } = req.body
    if (!name || !category_id) {
      res.status(400).json({ success: false, error: '名称和分类不能为空' })
      return
    }
    const result = propService.createProp({ name, category_id, description, quantity })
    res.status(201).json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.put('/:id', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { name, category_id, description, quantity, status } = req.body
    propService.updateProp(Number(req.params.id), { name, category_id, description, quantity, status })
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.delete('/:id', authMiddleware, (req: Request, res: Response): void => {
  try {
    const hard = req.query.hard === 'true'
    const result = propService.deleteProp(Number(req.params.id), hard)
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

export default router
