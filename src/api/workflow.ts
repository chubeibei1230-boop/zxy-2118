import request from './index'

export function getTemplates() {
  return request.get('/workflow/templates')
}

export function getTemplate(id: number) {
  return request.get(`/workflow/templates/${id}`)
}

export function createTemplate(data: Record<string, any>) {
  return request.post('/workflow/templates', data)
}

export function updateTemplate(id: number, data: Record<string, any>) {
  return request.put(`/workflow/templates/${id}`, data)
}

export function deleteTemplate(id: number) {
  return request.delete(`/workflow/templates/${id}`)
}
