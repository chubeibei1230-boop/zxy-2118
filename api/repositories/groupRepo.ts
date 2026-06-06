import { getDb } from '../database/init.js'

export interface GroupRow {
  id: number
  name: string
  description: string
  is_deleted: number
  created_at: string
}

export interface GroupMemberRow {
  id: number
  group_id: number
  user_id: number
}

export function findAll(includeDeleted = false): GroupRow[] {
  if (includeDeleted) {
    return getDb().prepare('SELECT * FROM groups ORDER BY id').all() as GroupRow[]
  }
  return getDb().prepare('SELECT * FROM groups WHERE is_deleted = 0 ORDER BY id').all() as GroupRow[]
}

export function findById(id: number): GroupRow | undefined {
  return getDb().prepare('SELECT * FROM groups WHERE id = ?').get(id) as GroupRow | undefined
}

export function create(name: string, description: string): { id: number } {
  const result = getDb().prepare('INSERT INTO groups (name, description) VALUES (?, ?)').run(name, description)
  return { id: result.lastInsertRowid as number }
}

export function update(id: number, name: string, description: string): void {
  getDb().prepare('UPDATE groups SET name = ?, description = ? WHERE id = ?').run(name, description, id)
}

export function softDelete(id: number): void {
  getDb().prepare('UPDATE groups SET is_deleted = 1 WHERE id = ?').run(id)
  getDb().prepare('DELETE FROM group_members WHERE group_id = ?').run(id)
}

export function getMembers(groupId: number): GroupMemberRow[] {
  return getDb().prepare('SELECT * FROM group_members WHERE group_id = ?').all(groupId) as GroupMemberRow[]
}

export function addMember(groupId: number, userId: number): void {
  getDb().prepare('INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)').run(groupId, userId)
}

export function removeMember(groupId: number, userId: number): void {
  getDb().prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?').run(groupId, userId)
}

export function findGroupsByUserId(userId: number): GroupRow[] {
  return getDb().prepare(
    'SELECT g.* FROM groups g JOIN group_members gm ON g.id = gm.group_id WHERE gm.user_id = ? AND g.is_deleted = 0'
  ).all(userId) as GroupRow[]
}
