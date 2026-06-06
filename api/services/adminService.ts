import bcrypt from 'bcryptjs'
import * as userRepo from '../repositories/userRepo.js'
import * as categoryRepo from '../repositories/categoryRepo.js'
import * as groupRepo from '../repositories/groupRepo.js'

export function listUsers() {
  return userRepo.findAll().map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    enabled: u.enabled,
    created_at: u.created_at
  }))
}

export function createUser(data: { username: string; password: string; name: string; role: string }) {
  const existing = userRepo.findByUsername(data.username)
  if (existing) {
    throw new Error('用户名已存在')
  }
  const salt = bcrypt.genSaltSync(10)
  const passwordHash = bcrypt.hashSync(data.password, salt)
  return userRepo.create(data.username, passwordHash, data.name, data.role)
}

export function updateUser(id: number, data: { name?: string; role?: string; enabled?: number; password?: string }) {
  const user = userRepo.findById(id)
  if (!user) {
    throw new Error('用户不存在')
  }
  const updateData: { name?: string; role?: string; enabled?: number; password_hash?: string } = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.role !== undefined) updateData.role = data.role
  if (data.enabled !== undefined) updateData.enabled = data.enabled
  if (data.password) {
    const salt = bcrypt.genSaltSync(10)
    updateData.password_hash = bcrypt.hashSync(data.password, salt)
  }
  userRepo.update(id, updateData)
}

export function listCategories(includeDeleted = false) {
  return categoryRepo.findAll(includeDeleted)
}

export function createCategory(data: { name: string; description?: string }) {
  return categoryRepo.create(data.name, data.description || '')
}

export function updateCategory(id: number, data: { name: string; description?: string }) {
  const category = categoryRepo.findById(id)
  if (!category) {
    throw new Error('分类不存在')
  }
  categoryRepo.update(id, data.name, data.description || '')
}

export function deleteCategory(id: number) {
  const category = categoryRepo.findById(id)
  if (!category) {
    throw new Error('分类不存在')
  }
  categoryRepo.softDelete(id)
}

export function listGroups(includeDeleted = false) {
  const groups = groupRepo.findAll(includeDeleted)
  return groups.map(g => {
    const members = groupRepo.getMembers(g.id)
    return { ...g, member_count: members.length, members }
  })
}

export function createGroup(data: { name: string; description?: string; member_ids?: number[] }) {
  const group = groupRepo.create(data.name, data.description || '')
  if (data.member_ids && data.member_ids.length > 0) {
    for (const userId of data.member_ids) {
      groupRepo.addMember(group.id, userId)
    }
  }
  return group
}

export function updateGroup(id: number, data: { name: string; description?: string; member_ids?: number[] }) {
  const group = groupRepo.findById(id)
  if (!group) {
    throw new Error('小组不存在')
  }
  groupRepo.update(id, data.name, data.description || '')

  if (data.member_ids !== undefined) {
    const currentMembers = groupRepo.getMembers(id)
    for (const m of currentMembers) {
      groupRepo.removeMember(id, m.user_id)
    }
    for (const userId of data.member_ids) {
      groupRepo.addMember(id, userId)
    }
  }
}

export function deleteGroup(id: number) {
  const group = groupRepo.findById(id)
  if (!group) {
    throw new Error('小组不存在')
  }
  groupRepo.softDelete(id)
}
