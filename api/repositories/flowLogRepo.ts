import { getDb } from '../database/init.js'

export interface FlowLogRow {
  id: number
  borrow_record_id: number
  node_id: number | null
  action: string
  operator_role: string
  operator_id: number
  notes: string
  created_at: string
}

export function create(data: { borrow_record_id: number; node_id?: number; action: string; operator_role: string; operator_id: number; notes?: string }): { id: number } {
  const result = getDb().prepare(
    'INSERT INTO flow_logs (borrow_record_id, node_id, action, operator_role, operator_id, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(data.borrow_record_id, data.node_id || null, data.action, data.operator_role, data.operator_id, data.notes || '')
  return { id: result.lastInsertRowid as number }
}

export function findByBorrowRecordId(borrowRecordId: number): FlowLogRow[] {
  return getDb().prepare('SELECT * FROM flow_logs WHERE borrow_record_id = ? ORDER BY id ASC').all(borrowRecordId) as FlowLogRow[]
}
