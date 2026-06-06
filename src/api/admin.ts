import request from './index'

export function getUsers() {
  return request.get('/admin/users')
}

export function createUser(data: Record<string, any>) {
  return request.post('/admin/users', data)
}

export function updateUser(id: number, data: Record<string, any>) {
  return request.put(`/admin/users/${id}`, data)
}

export function getGroups(params?: Record<string, any>) {
  return request.get('/admin/groups', { params })
}

export function createGroup(data: Record<string, any>) {
  return request.post('/admin/groups', data)
}

export function updateGroup(id: number, data: Record<string, any>) {
  return request.put(`/admin/groups/${id}`, data)
}

export function deleteGroup(id: number) {
  return request.delete(`/admin/groups/${id}`)
}

export function getCategories(params?: Record<string, any>) {
  return request.get('/admin/categories', { params })
}

export function createCategory(data: Record<string, any>) {
  return request.post('/admin/categories', data)
}

export function updateCategory(id: number, data: Record<string, any>) {
  return request.put(`/admin/categories/${id}`, data)
}

export function deleteCategory(id: number) {
  return request.delete(`/admin/categories/${id}`)
}
