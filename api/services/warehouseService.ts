import * as propRepo from '../repositories/propRepo.js'
import * as borrowRepo from '../repositories/borrowRepo.js'
import * as missingRepo from '../repositories/missingRepo.js'
import * as flowLogRepo from '../repositories/flowLogRepo.js'
import * as categoryRepo from '../repositories/categoryRepo.js'
import * as groupRepo from '../repositories/groupRepo.js'
import * as userRepo from '../repositories/userRepo.js'

export function reportMissing(data: { borrow_record_id: number; missing_parts: string; damage_desc: string; responsible_group_id?: number; operator_id: number; operator_role: string }) {
  const record = borrowRepo.findById(data.borrow_record_id)
  if (!record) {
    throw new Error('借还记录不存在')
  }

  const missing = missingRepo.create({
    borrow_record_id: data.borrow_record_id,
    missing_parts: data.missing_parts,
    damage_desc: data.damage_desc,
    responsible_group_id: data.responsible_group_id
  })

  borrowRepo.updateStatus(record.id, 'missing_parts')
  propRepo.update(record.prop_id, { status: 'missing_parts' })

  flowLogRepo.create({
    borrow_record_id: record.id,
    action: 'missing_report',
    operator_role: data.operator_role,
    operator_id: data.operator_id,
    notes: `缺件登记: ${data.missing_parts}`
  })

  return missing
}

export function resolveMissing(id: number, resolution: string, operatorId: number, operatorRole: string) {
  const missing = missingRepo.findById(id)
  if (!missing) {
    throw new Error('缺件记录不存在')
  }
  if (missing.status === 'resolved') {
    throw new Error('该缺件记录已处理完成')
  }

  missingRepo.updateStatus(id, 'resolved', resolution)

  const record = borrowRepo.findById(missing.borrow_record_id)
  if (record) {
    flowLogRepo.create({
      borrow_record_id: record.id,
      action: 'missing_resolve',
      operator_role: operatorRole,
      operator_id: operatorId,
      notes: `缺件处理完成: ${resolution}`
    })
  }

  return missing
}

export function confirmPlacement(data: { borrow_record_id: number; operator_id: number; operator_role: string }) {
  const record = borrowRepo.findById(data.borrow_record_id)
  if (!record) {
    throw new Error('借还记录不存在')
  }

  const validStatuses = ['returned', 'checking', 'missing_parts']
  if (!validStatuses.includes(record.status)) {
    throw new Error('该记录当前状态不可归位')
  }

  borrowRepo.updateStatus(record.id, 'placed', new Date().toISOString())
  propRepo.update(record.prop_id, { status: 'in_stock' })

  flowLogRepo.create({
    borrow_record_id: record.id,
    action: 'placement',
    operator_role: data.operator_role,
    operator_id: data.operator_id,
    notes: '归位确认'
  })

  return record
}

export function getInventory() {
  const categories = categoryRepo.findAll(false)
  const allProps = propRepo.findAll({ page: 1, pageSize: 9999 }).list

  const inventory = categories.map(cat => {
    const catProps = allProps.filter(p => p.category_id === cat.id)
    return {
      category_id: cat.id,
      category_name: cat.name,
      total: catProps.length,
      in_stock: catProps.filter(p => p.status === 'in_stock').length,
      borrowed: catProps.filter(p => p.status === 'borrowed').length,
      checking: catProps.filter(p => p.status === 'checking').length,
      missing_parts: catProps.filter(p => p.status === 'missing_parts').length,
      props: catProps
    }
  })

  return inventory
}

export function listMissingRecords(filters: { status?: string; page?: number; pageSize?: number }) {
  const page = filters.page || 1
  const pageSize = filters.pageSize || 20
  const { list, total } = missingRepo.findAll({ ...filters, page, pageSize })

  const enriched = list.map(m => {
    const record = borrowRepo.findById(m.borrow_record_id)
    const prop = record ? propRepo.findById(record.prop_id) : null
    const group = m.responsible_group_id ? groupRepo.findById(m.responsible_group_id) : null
    return {
      ...m,
      prop_name: prop?.name || '',
      responsible_group_name: group?.name || ''
    }
  })

  return { list: enriched, total, page, pageSize }
}

export function listPlacementRecords() {
  const records = borrowRepo.findAll({ page: 1, pageSize: 100 }).list.filter(
    (r: any) => ['returned', 'checking', 'missing_parts'].includes(r.status)
  )
  return records.map(r => {
    const prop = propRepo.findById(r.prop_id)
    const borrower = r.borrower_id ? userRepo.findById(r.borrower_id) : null
    let missingResolved = false
    if (r.status === 'missing_parts') {
      const missings = missingRepo.findByBorrowRecordId(r.id)
      missingResolved = missings.length > 0 && missings.every((m: any) => m.status === 'resolved')
    }
    return {
      ...r,
      prop_name: prop?.name || '',
      borrower_name: borrower?.name || '',
      missing_resolved: missingResolved
    }
  })
}
