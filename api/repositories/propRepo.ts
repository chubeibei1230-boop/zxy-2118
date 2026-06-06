import { getDb } from '../database/init.js'

export interface PropRow {
  id: number
  name: string
  category_id: number
  description: string
  quantity: number
  status: string
  is_deleted: number
  created_at: string
  updated_at: string
}

export function findAll(filters: { status?: string; category_id?: number; keyword?: string; page: number; pageSize: number; includeDeleted?: boolean }): { list: PropRow[]; total: number } {
  const conditions: string[] = []
  const values: (string | number)[] = []

  if (!filters.includeDeleted) {
    conditions.push('p.is_deleted = 0')
  }
  if (filters.status) {
    conditions.push('p.status = ?')
    values.push(filters.status)
  }
  if (filters.category_id) {
    conditions.push('p.category_id = ?')
    values.push(filters.category_id)
  }
  if (filters.keyword) {
    conditions.push('p.name LIKE ?')
    values.push(`%${filters.keyword}%`)
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
  const countResult = getDb().prepare(`SELECT COUNT(*) as total FROM props p ${where}`).get(...values) as { total: number }
  const offset = (filters.page - 1) * filters.pageSize
  const list = getDb().prepare(`SELECT p.* FROM props p ${where} ORDER BY p.id DESC LIMIT ? OFFSET ?`).all(...values, filters.pageSize, offset) as PropRow[]

  return { list, total: countResult.total }
}

export function findById(id: number): PropRow | undefined {
  return getDb().prepare('SELECT * FROM props WHERE id = ?').get(id) as PropRow | undefined
}

export function create(data: { name: string; category_id: number; description: string; quantity: number }): { id: number } {
  const result = getDb().prepare(
    'INSERT INTO props (name, category_id, description, quantity) VALUES (?, ?, ?, ?)'
  ).run(data.name, data.category_id, data.description, data.quantity)
  return { id: result.lastInsertRowid as number }
}

export function update(id: number, data: { name?: string; category_id?: number; description?: string; quantity?: number; status?: string }): void {
  const sets: string[] = []
  const values: (string | number)[] = []
  if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name) }
  if (data.category_id !== undefined) { sets.push('category_id = ?'); values.push(data.category_id) }
  if (data.description !== undefined) { sets.push('description = ?'); values.push(data.description) }
  if (data.quantity !== undefined) { sets.push('quantity = ?'); values.push(data.quantity) }
  if (data.status !== undefined) { sets.push('status = ?'); values.push(data.status) }
  if (sets.length === 0) return
  sets.push("updated_at = datetime('now')")
  values.push(id)
  getDb().prepare(`UPDATE props SET ${sets.join(', ')} WHERE id = ?`).run(...values)
}

export function softDelete(id: number): void {
  getDb().prepare("UPDATE props SET is_deleted = 1, status = 'deleted', updated_at = datetime('now') WHERE id = ?").run(id)
}

export function hardDelete(id: number): void {
  getDb().prepare('DELETE FROM props WHERE id = ?').run(id)
}

export function hasBorrowRecords(propId: number): boolean {
  const result = getDb().prepare('SELECT COUNT(*) as count FROM borrow_records WHERE prop_id = ?').get(propId) as { count: number }
  return result.count > 0
}
