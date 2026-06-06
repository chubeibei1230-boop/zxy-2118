import { getDb } from '../database/init.js'

export interface WorkflowTemplateRow {
  id: number
  name: string
  description: string
  enabled: number
  is_deleted: number
  created_at: string
  updated_at: string
}

export interface WorkflowNodeRow {
  id: number
  template_id: number
  name: string
  handler_role: string
  time_limit_hours: number
  sort_order: number
}

export interface WorkflowTemplateCategoryRow {
  id: number
  template_id: number
  category_id: number
}

export function findAllTemplates(): WorkflowTemplateRow[] {
  return getDb().prepare('SELECT * FROM workflow_templates WHERE is_deleted = 0 ORDER BY id').all() as WorkflowTemplateRow[]
}

export function findTemplateById(id: number): WorkflowTemplateRow | undefined {
  return getDb().prepare('SELECT * FROM workflow_templates WHERE id = ? AND is_deleted = 0').get(id) as WorkflowTemplateRow | undefined
}

export function createTemplate(name: string, description: string): { id: number } {
  const result = getDb().prepare("INSERT INTO workflow_templates (name, description) VALUES (?, ?)").run(name, description)
  return { id: result.lastInsertRowid as number }
}

export function updateTemplate(id: number, name: string, description: string, enabled: number): void {
  getDb().prepare("UPDATE workflow_templates SET name = ?, description = ?, enabled = ?, updated_at = datetime('now') WHERE id = ?").run(name, description, enabled, id)
}

export function softDeleteTemplate(id: number): void {
  getDb().prepare("UPDATE workflow_templates SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?").run(id)
}

export function findNodesByTemplateId(templateId: number): WorkflowNodeRow[] {
  return getDb().prepare('SELECT * FROM workflow_nodes WHERE template_id = ? ORDER BY sort_order').all(templateId) as WorkflowNodeRow[]
}

export function createNode(templateId: number, name: string, handlerRole: string, timeLimitHours: number, sortOrder: number): { id: number } {
  const result = getDb().prepare(
    'INSERT INTO workflow_nodes (template_id, name, handler_role, time_limit_hours, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(templateId, name, handlerRole, timeLimitHours, sortOrder)
  return { id: result.lastInsertRowid as number }
}

export function deleteNodesByTemplateId(templateId: number): void {
  getDb().prepare('DELETE FROM workflow_nodes WHERE template_id = ?').run(templateId)
}

export function findTemplateCategories(templateId: number): WorkflowTemplateCategoryRow[] {
  return getDb().prepare('SELECT * FROM workflow_template_categories WHERE template_id = ?').all(templateId) as WorkflowTemplateCategoryRow[]
}

export function addTemplateCategory(templateId: number, categoryId: number): void {
  getDb().prepare('INSERT OR IGNORE INTO workflow_template_categories (template_id, category_id) VALUES (?, ?)').run(templateId, categoryId)
}

export function deleteTemplateCategories(templateId: number): void {
  getDb().prepare('DELETE FROM workflow_template_categories WHERE template_id = ?').run(templateId)
}

export function findTemplateByCategoryId(categoryId: number): WorkflowTemplateRow | undefined {
  return getDb().prepare(
    'SELECT wt.* FROM workflow_templates wt JOIN workflow_template_categories wtc ON wt.id = wtc.template_id WHERE wtc.category_id = ? AND wt.is_deleted = 0 AND wt.enabled = 1'
  ).get(categoryId) as WorkflowTemplateRow | undefined
}

export function findNodeById(id: number): WorkflowNodeRow | undefined {
  return getDb().prepare('SELECT * FROM workflow_nodes WHERE id = ?').get(id) as WorkflowNodeRow | undefined
}
