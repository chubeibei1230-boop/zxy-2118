import { getDb } from '../database/init.js'

export interface CategoryRow {
  id: number
  name: string
  description: string
  is_deleted: number
  created_at: string
}

export function findAll(includeDeleted = false): CategoryRow[] {
  if (includeDeleted) {
    return getDb().prepare('SELECT * FROM categories ORDER BY id').all() as CategoryRow[]
  }
  return getDb().prepare('SELECT * FROM categories WHERE is_deleted = 0 ORDER BY id').all() as CategoryRow[]
}

export function findById(id: number): CategoryRow | undefined {
  return getDb().prepare('SELECT * FROM categories WHERE id = ?').get(id) as CategoryRow | undefined
}

export function create(name: string, description: string): { id: number } {
  const result = getDb().prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name, description)
  return { id: result.lastInsertRowid as number }
}

export function update(id: number, name: string, description: string): void {
  getDb().prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?').run(name, description, id)
}

export function softDelete(id: number): void {
  getDb().prepare('UPDATE categories SET is_deleted = 1 WHERE id = ?').run(id)
}
