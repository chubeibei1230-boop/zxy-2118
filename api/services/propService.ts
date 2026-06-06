import * as propRepo from '../repositories/propRepo.js'
import * as borrowRepo from '../repositories/borrowRepo.js'
import * as flowLogRepo from '../repositories/flowLogRepo.js'
import * as categoryRepo from '../repositories/categoryRepo.js'
import * as groupRepo from '../repositories/groupRepo.js'

export function listProps(filters: { status?: string; category_id?: number; keyword?: string; page?: number; pageSize?: number; includeDeleted?: boolean }) {
  const page = filters.page || 1
  const pageSize = filters.pageSize || 20
  const { list, total } = propRepo.findAll({ ...filters, page, pageSize })
  const categories = categoryRepo.findAll(true)

  const enriched = list.map(p => ({
    ...p,
    category_name: categories.find(c => c.id === p.category_id)?.name || ''
  }))

  return { list: enriched, total, page, pageSize }
}

export function getPropDetail(id: number) {
  const prop = propRepo.findById(id)
  if (!prop) {
    throw new Error('道具不存在')
  }

  const categories = categoryRepo.findAll(true)
  const records = borrowRepo.findByPropId(id)
  const logs = records.map(r => flowLogRepo.findByBorrowRecordId(r.id)).flat()

  const enrichedRecords = records.map(r => {
    const flowLogs = flowLogRepo.findByBorrowRecordId(r.id)
    return { ...r, flow_logs: flowLogs }
  })

  return {
    ...prop,
    category_name: categories.find(c => c.id === prop.category_id)?.name || '',
    borrow_records: enrichedRecords
  }
}

export function createProp(data: { name: string; category_id: number; description?: string; quantity?: number }) {
  const category = categoryRepo.findById(data.category_id)
  if (!category) {
    throw new Error('分类不存在')
  }
  return propRepo.create({
    name: data.name,
    category_id: data.category_id,
    description: data.description || '',
    quantity: data.quantity || 1
  })
}

export function updateProp(id: number, data: { name?: string; category_id?: number; description?: string; quantity?: number; status?: string }) {
  const prop = propRepo.findById(id)
  if (!prop) {
    throw new Error('道具不存在')
  }
  propRepo.update(id, data)
}

export function deleteProp(id: number, hard: boolean) {
  const prop = propRepo.findById(id)
  if (!prop) {
    throw new Error('道具不存在')
  }

  const hasRecords = propRepo.hasBorrowRecords(id)

  if (hasRecords) {
    if (hard) {
      throw new Error('该道具有流转记录，仅允许软删除')
    }
    propRepo.softDelete(id)
    return { deleted: true, hard: false }
  }

  if (hard) {
    propRepo.hardDelete(id)
    return { deleted: true, hard: true }
  }

  propRepo.softDelete(id)
  return { deleted: true, hard: false }
}
