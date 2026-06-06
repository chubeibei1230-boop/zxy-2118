import bcrypt from 'bcryptjs'
import * as userRepo from '../repositories/userRepo.js'
import { generateToken, type JwtPayload } from '../middleware/auth.js'

export function login(username: string, password: string): { token: string; user: JwtPayload } {
  const user = userRepo.findByUsername(username)
  if (!user) {
    throw new Error('用户名或密码错误')
  }
  if (!user.enabled) {
    throw new Error('用户已被禁用')
  }
  const valid = bcrypt.compareSync(password, user.password_hash)
  if (!valid) {
    throw new Error('用户名或密码错误')
  }

  const payload: JwtPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name
  }

  return {
    token: generateToken(payload),
    user: payload
  }
}

export function getCurrentUser(userId: number): JwtPayload & { enabled: number; created_at: string } {
  const user = userRepo.findById(userId)
  if (!user) {
    throw new Error('用户不存在')
  }
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    enabled: user.enabled,
    created_at: user.created_at
  }
}
