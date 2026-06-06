import { getDb } from '../database/init.js'

export interface UserRow {
  id: number
  username: string
  password_hash: string
  name: string
  role: string
  enabled: number
  created_at: string
}

export function findByUsername(username: string): UserRow | undefined {
  return getDb().prepare('SELECT * FROM users WHERE username = ?').get(username) as UserRow | undefined
}

export function findById(id: number): UserRow | undefined {
  return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined
}

export function findAll(): UserRow[] {
  return getDb().prepare('SELECT * FROM users ORDER BY id').all() as UserRow[]
}

export function create(username: string, passwordHash: string, name: string, role: string): { id: number } {
  const stmt = getDb().prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)')
  const result = stmt.run(username, passwordHash, name, role)
  return { id: result.lastInsertRowid as number }
}

export function update(id: number, data: { name?: string; role?: string; enabled?: number; password_hash?: string }): void {
  const sets: string[] = []
  const values: (string | number)[] = []
  if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name) }
  if (data.role !== undefined) { sets.push('role = ?'); values.push(data.role) }
  if (data.enabled !== undefined) { sets.push('enabled = ?'); values.push(data.enabled) }
  if (data.password_hash !== undefined) { sets.push('password_hash = ?'); values.push(data.password_hash) }
  if (sets.length === 0) return
  values.push(id)
  getDb().prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values)
}
