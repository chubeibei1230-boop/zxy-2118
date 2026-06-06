import { Router, type Request, type Response } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import * as borrowService from '../services/borrowService.js'

const router = Router()

router.post('/', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { prop_id, purpose, expected_return_at } = req.body
    if (!prop_id) {
      res.status(400).json({ success: false, error: '道具ID不能为空' })
      return
    }
    const result = borrowService.borrowProp({
      prop_id,
      borrower_id: req.user!.id,
      purpose: purpose || '',
      expected_return_at
    })
    res.status(201).json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.post('/return', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { borrow_record_id } = req.body
    if (!borrow_record_id) {
      res.status(400).json({ success: false, error: '借还记录ID不能为空' })
      return
    }
    const result = borrowService.returnProp({
      borrow_record_id,
      operator_id: req.user!.id,
      operator_role: req.user!.role
    })
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.get('/records', authMiddleware, (req: Request, res: Response): void => {
  try {
    const result = borrowService.listRecords({
      status: req.query.status as string | undefined,
      borrower_id: req.query.borrower_id ? Number(req.query.borrower_id) : undefined,
      overdue_status: req.query.overdue_status as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20
    })
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/overdue', authMiddleware, (req: Request, res: Response): void => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const result = borrowService.getOverdueRecords(limit)
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
