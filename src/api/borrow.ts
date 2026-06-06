import request from './index'

export function borrowProp(data: Record<string, any>) {
  return request.post('/borrow', data)
}

export function returnProp(data: Record<string, any>) {
  return request.post('/borrow/return', data)
}

export function getRecords(params?: Record<string, any>) {
  return request.get('/borrow/records', { params })
}

export function getOverdueRecords(limit?: number) {
  return request.get('/borrow/overdue', { params: limit ? { limit } : {} })
}
