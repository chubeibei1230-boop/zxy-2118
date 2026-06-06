import { getDb } from '../database/init.js'

export interface BorrowRecordRow {
  id: number
  prop_id: number
  borrower_id: number
  purpose: string
  status: string
  borrowed_at: string
  expected_return_at: string | null
  returned_at: string | null
  workflow_template_id: number | null
  current_node_index: number
  created_at: string
}

export function create(data: { prop_id: number; borrower_id: number; purpose: string; expected_return_at?: string; workflow_template_id?: number; current_node_index?: number }): { id: number } {
  const result = getDb().prepare(
    'INSERT INTO borrow_records (prop_id, borrower_id, purpose, expected_return_at, workflow_template_id, current_node_index) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(data.prop_id, data.borrower_id, data.purpose, data.expected_return_at || null, data.workflow_template_id || null, data.current_node_index || 0)
  return { id: result.lastInsertRowid as number }
}

export function findById(id: number): BorrowRecordRow | undefined {
  return getDb().prepare('SELECT * FROM borrow_records WHERE id = ?').get(id) as BorrowRecordRow | undefined
}

export function findActiveByPropId(propId: number): BorrowRecordRow | undefined {
  return getDb().prepare("SELECT * FROM borrow_records WHERE prop_id = ? AND status IN ('borrowed', 'checking', 'missing_parts') ORDER BY id DESC LIMIT 1").get(propId) as BorrowRecordRow | undefined
}

export function updateStatus(id: number, status: string, returnedAt?: string): void {
  if (returnedAt) {
    getDb().prepare("UPDATE borrow_records SET status = ?, returned_at = ? WHERE id = ?").run(status, returnedAt, id)
  } else {
    getDb().prepare('UPDATE borrow_records SET status = ? WHERE id = ?').run(status, id)
  }
}

export function updateNodeIndex(id: number, nodeIndex: number): void {
  getDb().prepare('UPDATE borrow_records SET current_node_index = ? WHERE id = ?').run(nodeIndex, id)
}

export function findAll(filters: { status?: string; borrower_id?: number; page: number; pageSize: number }): { list: BorrowRecordRow[]; total: number } {
  const conditions: string[] = []
  const values: (string | number)[] = []

  if (filters.status) {
    conditions.push('br.status = ?')
    values.push(filters.status)
  }
  if (filters.borrower_id) {
    conditions.push('br.borrower_id = ?')
    values.push(filters.borrower_id)
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
  const countResult = getDb().prepare(`SELECT COUNT(*) as total FROM borrow_records br ${where}`).get(...values) as { total: number }
  const offset = (filters.page - 1) * filters.pageSize
  const list = getDb().prepare(`SELECT br.* FROM borrow_records br ${where} ORDER BY br.id DESC LIMIT ? OFFSET ?`).all(...values, filters.pageSize, offset) as BorrowRecordRow[]

  return { list, total: countResult.total }
}

export function findByPropId(propId: number): BorrowRecordRow[] {
  return getDb().prepare('SELECT * FROM borrow_records WHERE prop_id = ? ORDER BY id DESC').all(propId) as BorrowRecordRow[]
}
