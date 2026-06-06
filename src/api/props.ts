import request from './index'

export function getProps(params?: Record<string, any>) {
  return request.get('/props', { params })
}

export function getProp(id: number) {
  return request.get(`/props/${id}`)
}

export function createProp(data: Record<string, any>) {
  return request.post('/props', data)
}

export function updateProp(id: number, data: Record<string, any>) {
  return request.put(`/props/${id}`, data)
}

export function deleteProp(id: number, hard?: boolean) {
  return request.delete(`/props/${id}`, { params: { hard } })
}
