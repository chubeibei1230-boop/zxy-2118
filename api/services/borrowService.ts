import * as borrowRepo from '../repositories/borrowRepo.js'
import * as propRepo from '../repositories/propRepo.js'
import * as flowLogRepo from '../repositories/flowLogRepo.js'
import * as workflowRepo from '../repositories/workflowRepo.js'
import * as userRepo from '../repositories/userRepo.js'
import * as categoryRepo from '../repositories/categoryRepo.js'

export function borrowProp(data: { prop_id: number; borrower_id: number; purpose: string; expected_return_at?: string }) {
  const prop = propRepo.findById(data.prop_id)
  if (!prop) {
    throw new Error('道具不存在')
  }
  if (prop.status !== 'in_stock') {
    throw new Error('道具当前不可借出')
  }

  const activeRecord = borrowRepo.findActiveByPropId(data.prop_id)
  if (activeRecord) {
    throw new Error('该道具已有未完成的借出记录')
  }

  let workflowTemplateId: number | undefined
  let currentNodeIndex = 0

  const category = categoryRepo.findById(prop.category_id)
  if (category) {
    const template = workflowRepo.findTemplateByCategoryId(category.id)
    if (template) {
      workflowTemplateId = template.id
      const nodes = workflowRepo.findNodesByTemplateId(template.id)
      if (nodes.length > 0) {
        currentNodeIndex = 0
      }
    }
  }

  const record = borrowRepo.create({
    prop_id: data.prop_id,
    borrower_id: data.borrower_id,
    purpose: data.purpose,
    expected_return_at: data.expected_return_at,
    workflow_template_id: workflowTemplateId,
    current_node_index: currentNodeIndex
  })

  propRepo.update(data.prop_id, { status: 'borrowed' })

  if (workflowTemplateId) {
    const nodes = workflowRepo.findNodesByTemplateId(workflowTemplateId)
    if (nodes.length > 0) {
      const borrower = userRepo.findById(data.borrower_id)
      flowLogRepo.create({
        borrow_record_id: record.id,
        node_id: nodes[0].id,
        action: 'borrow',
        operator_role: borrower?.role || 'reception',
        operator_id: data.borrower_id,
        notes: '借出登记'
      })
    }
  } else {
    flowLogRepo.create({
      borrow_record_id: record.id,
      action: 'borrow',
      operator_role: 'reception',
      operator_id: data.borrower_id,
      notes: '借出登记'
    })
  }

  return record
}

export function returnProp(data: { borrow_record_id: number; operator_id: number; operator_role: string }) {
  const record = borrowRepo.findById(data.borrow_record_id)
  if (!record) {
    throw new Error('借还记录不存在')
  }
  if (record.status !== 'borrowed') {
    throw new Error('该记录当前状态不可回收')
  }

  if (record.workflow_template_id) {
    const nodes = workflowRepo.findNodesByTemplateId(record.workflow_template_id)
    if (nodes.length > 0) {
      const nextNodeIndex = record.current_node_index + 1
      if (nextNodeIndex < nodes.length) {
        const nextNode = nodes[nextNodeIndex]
        if (nextNode.handler_role !== data.operator_role) {
          throw new Error(`当前节点需要${nextNode.handler_role}角色操作`)
        }
        borrowRepo.updateNodeIndex(record.id, nextNodeIndex)
        borrowRepo.updateStatus(record.id, 'checking')

        flowLogRepo.create({
          borrow_record_id: record.id,
          node_id: nextNode.id,
          action: 'advance',
          operator_role: data.operator_role,
          operator_id: data.operator_id,
          notes: `推进到节点: ${nextNode.name}`
        })

        propRepo.update(record.prop_id, { status: 'checking' })
        return { ...record, status: 'checking', current_node_index: nextNodeIndex }
      }
    }
  }

  borrowRepo.updateStatus(record.id, 'returned', new Date().toISOString())
  propRepo.update(record.prop_id, { status: 'in_stock' })

  flowLogRepo.create({
    borrow_record_id: record.id,
    action: 'return',
    operator_role: data.operator_role,
    operator_id: data.operator_id,
    notes: '回收完成'
  })

  return { ...record, status: 'returned' }
}

export function listRecords(filters: { status?: string; borrower_id?: number; page?: number; pageSize?: number }) {
  const page = filters.page || 1
  const pageSize = filters.pageSize || 20
  const { list, total } = borrowRepo.findAll({ ...filters, page, pageSize })

  const enriched = list.map(r => {
    const borrower = userRepo.findById(r.borrower_id)
    const prop = propRepo.findById(r.prop_id)
    return {
      ...r,
      borrower_name: borrower?.name || '',
      prop_name: prop?.name || ''
    }
  })

  return { list: enriched, total, page, pageSize }
}
