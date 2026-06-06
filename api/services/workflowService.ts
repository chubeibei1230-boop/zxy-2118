import * as workflowRepo from '../repositories/workflowRepo.js'
import * as categoryRepo from '../repositories/categoryRepo.js'

export function listTemplates() {
  const templates = workflowRepo.findAllTemplates()
  return templates.map(t => {
    const nodes = workflowRepo.findNodesByTemplateId(t.id)
    const templateCategories = workflowRepo.findTemplateCategories(t.id)
    const categories = templateCategories.map(tc => {
      const cat = categoryRepo.findById(tc.category_id)
      return cat ? { id: cat.id, name: cat.name } : null
    }).filter(Boolean)
    return { ...t, nodes, categories }
  })
}

export function getTemplateDetail(id: number) {
  const template = workflowRepo.findTemplateById(id)
  if (!template) {
    throw new Error('工作流模板不存在')
  }
  const nodes = workflowRepo.findNodesByTemplateId(template.id)
  const templateCategories = workflowRepo.findTemplateCategories(template.id)
  const categories = templateCategories.map(tc => {
    const cat = categoryRepo.findById(tc.category_id)
    return cat ? { id: cat.id, name: cat.name } : null
  }).filter(Boolean)
  return { ...template, nodes, categories }
}

export function createTemplate(data: { name: string; description?: string; categories?: number[]; nodes: { name: string; handler_role: string; time_limit_hours?: number; sort_order?: number }[] }) {
  const template = workflowRepo.createTemplate(data.name, data.description || '')

  if (data.categories && data.categories.length > 0) {
    for (const categoryId of data.categories) {
      workflowRepo.addTemplateCategory(template.id, categoryId)
    }
  }

  if (data.nodes && data.nodes.length > 0) {
    for (let i = 0; i < data.nodes.length; i++) {
      const node = data.nodes[i]
      workflowRepo.createNode(
        template.id,
        node.name,
        node.handler_role,
        node.time_limit_hours || 24,
        node.sort_order ?? i
      )
    }
  }

  return template
}

export function updateTemplate(id: number, data: { name: string; description?: string; enabled?: number; categories?: number[]; nodes?: { name: string; handler_role: string; time_limit_hours?: number; sort_order?: number }[] }) {
  const template = workflowRepo.findTemplateById(id)
  if (!template) {
    throw new Error('工作流模板不存在')
  }

  workflowRepo.updateTemplate(id, data.name, data.description || '', data.enabled ?? 1)

  if (data.categories !== undefined) {
    workflowRepo.deleteTemplateCategories(id)
    for (const categoryId of data.categories) {
      workflowRepo.addTemplateCategory(id, categoryId)
    }
  }

  if (data.nodes !== undefined) {
    workflowRepo.deleteNodesByTemplateId(id)
    for (let i = 0; i < data.nodes.length; i++) {
      const node = data.nodes[i]
      workflowRepo.createNode(
        id,
        node.name,
        node.handler_role,
        node.time_limit_hours || 24,
        node.sort_order ?? i
      )
    }
  }

  return getTemplateDetail(id)
}

export function deleteTemplate(id: number) {
  const template = workflowRepo.findTemplateById(id)
  if (!template) {
    throw new Error('工作流模板不存在')
  }
  workflowRepo.softDeleteTemplate(id)
  return { deleted: true }
}
