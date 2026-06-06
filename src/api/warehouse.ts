import request from './index'

export function reportMissing(data: Record<string, any>) {
  return request.post('/warehouse/missing', data)
}

export function getMissingRecords(params?: Record<string, any>) {
  return request.get('/warehouse/missing', { params })
}

export function resolveMissing(id: number, data: Record<string, any>) {
  return request.put(`/warehouse/missing/${id}/resolve`, data)
}

export function confirmPlacement(data: Record<string, any>) {
  return request.post('/warehouse/placement', data)
}

export function getInventory() {
  return request.get('/warehouse/inventory')
}
