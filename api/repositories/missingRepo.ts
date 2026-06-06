import { getDb } from '../database/init.js'

export interface MissingRecordRow {
  id: number
  borrow_record_id: number
  missing_parts: string
  damage_desc: string
  responsible_group_id: number | null
  status: string
  resolution: string
  created_at: string
  resolved_at: string | null
}

export function create(data: { borrow_record_id: number; missing_parts: string; damage_desc: string; responsible_group_id?: number }): { id: number } {
  const result = getDb().prepare(
    'INSERT INTO missing_records (borrow_record_id, missing_parts, damage_desc, responsible_group_id) VALUES (?, ?, ?, ?)'
  ).run(data.borrow_record_id, data.missing_parts, data.damage_desc, data.responsible_group_id || null)
  return { id: result.lastInsertRowid as number }
}

export function findById(id: number): MissingRecordRow | undefined {
  return getDb().prepare('SELECT * FROM missing_records WHERE id = ?').get(id) as MissingRecordRow | undefined
}

export function updateStatus(id: number, status: string, resolution?: string): void {
  if (status === 'resolved') {
    getDb().prepare("UPDATE missing_records SET status = ?, resolution = ?, resolved_at = datetime('now') WHERE id = ?").run(status, resolution || '', id)
  } else {
    getDb().prepare('UPDATE missing_records SET status = ? WHERE id = ?').run(status, id)
  }
}

export function findByBorrowRecordId(borrowRecordId: number): MissingRecordRow[] {
  return getDb().prepare('SELECT * FROM missing_records WHERE borrow_record_id = ? ORDER BY id DESC').all(borrowRecordId) as MissingRecordRow[]
}

export function findAll(filters: { status?: string; page: number; pageSize: number }): { list: MissingRecordRow[]; total: number } {
  const conditions: string[] = []
  const values: (string | number)[] = []

  if (filters.status) {
    conditions.push('mr.status = ?')
    values.push(filters.status)
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
  const countResult = getDb().prepare(`SELECT COUNT(*) as total FROM missing_records mr ${where}`).get(...values) as { total: number }
  const offset = (filters.page - 1) * filters.pageSize
  const list = getDb().prepare(`SELECT mr.* FROM missing_records mr ${where} ORDER BY mr.id DESC LIMIT ? OFFSET ?`).all(...values, filters.pageSize, offset) as MissingRecordRow[]

  return { list, total: countResult.total }
}
