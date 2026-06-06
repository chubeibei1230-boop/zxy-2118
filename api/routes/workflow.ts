import { Router, type Request, type Response } from 'express'
import { authMiddleware, roleMiddleware } from '../middleware/auth.js'
import * as workflowService from '../services/workflowService.js'

const router = Router()

router.get('/templates', authMiddleware, (req: Request, res: Response): void => {
  try {
    const result = workflowService.listTemplates()
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/templates/:id', authMiddleware, (req: Request, res: Response): void => {
  try {
    const result = workflowService.getTemplateDetail(Number(req.params.id))
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message })
  }
})

router.post('/templates', authMiddleware, roleMiddleware('admin'), (req: Request, res: Response): void => {
  try {
    const { name, description, categories, nodes } = req.body
    if (!name) {
      res.status(400).json({ success: false, error: '模板名称不能为空' })
      return
    }
    if (!nodes || nodes.length === 0) {
      res.status(400).json({ success: false, error: '至少需要一个工作流节点' })
      return
    }
    const result = workflowService.createTemplate({ name, description, categories, nodes })
    res.status(201).json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.put('/templates/:id', authMiddleware, roleMiddleware('admin'), (req: Request, res: Response): void => {
  try {
    const { name, description, enabled, categories, nodes } = req.body
    if (!name) {
      res.status(400).json({ success: false, error: '模板名称不能为空' })
      return
    }
    const result = workflowService.updateTemplate(Number(req.params.id), { name, description, enabled, categories, nodes })
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

router.delete('/templates/:id', authMiddleware, roleMiddleware('admin'), (req: Request, res: Response): void => {
  try {
    const result = workflowService.deleteTemplate(Number(req.params.id))
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message })
  }
})

export default router
