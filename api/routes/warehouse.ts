import { Router, type Request, type Response } from 'express'
import { authMiddleware, roleMiddleware } from '../middleware/auth.js'
import * as warehouseService from '../services/warehouseService.js'

const router = Router()

router.post('/missing', authMiddleware, roleMiddleware('warehouse', 'admin'), (req: Request, res: Response): void => {
  try {
    const { borrow_record_id, missing_parts, damage_desc, responsible_group_id } = req.body
    if (!borrow_record_id || !missing_parts) {
      res.status(400).json({ success: false, error: '借还记录ID和缺件描述不能为空' })
      return
    }
    const result = warehouseService.reportMissing({
      borrow_record_id,
      missing_parts,
      damage_desc: damage_desc || '',
      responsible_group_id,
      operator_id: req.user!.id,
      operator_role: req.user!.role
    })
    res.status(201).json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.put('/missing/:id/resolve', authMiddleware, roleMiddleware('warehouse', 'admin'), (req: Request, res: Response): void => {
  try {
    const { resolution } = req.body
    if (!resolution) {
      res.status(400).json({ success: false, error: '处理结果不能为空' })
      return
    }
    const result = warehouseService.resolveMissing(
      Number(req.params.id),
      resolution,
      req.user!.id,
      req.user!.role
    )
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.post('/placement', authMiddleware, roleMiddleware('warehouse', 'admin'), (req: Request, res: Response): void => {
  try {
    const { borrow_record_id } = req.body
    if (!borrow_record_id) {
      res.status(400).json({ success: false, error: '借还记录ID不能为空' })
      return
    }
    const result = warehouseService.confirmPlacement({
      borrow_record_id,
      operator_id: req.user!.id,
      operator_role: req.user!.role
    })
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.get('/inventory', authMiddleware, (req: Request, res: Response): void => {
  try {
    const result = warehouseService.getInventory()
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/placement', authMiddleware, (req: Request, res: Response): void => {
  try {
    const result = warehouseService.listPlacementRecords()
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/missing', authMiddleware, (req: Request, res: Response): void => {
  try {
    const result = warehouseService.listMissingRecords({
      status: req.query.status as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20
    })
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
