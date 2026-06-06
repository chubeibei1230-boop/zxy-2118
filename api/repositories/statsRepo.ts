import { getDb } from '../database/init.js'

export interface DashboardStats {
  totalProps: number
  inStockCount: number
  borrowedCount: number
  checkingCount: number
  missingPartsCount: number
  pendingMissingCount: number
  todayBorrowCount: number
  todayReturnCount: number
}

export function getDashboardStats(): DashboardStats {
  const totalProps = (getDb().prepare('SELECT COUNT(*) as count FROM props WHERE is_deleted = 0').get() as { count: number }).count
  const inStockCount = (getDb().prepare("SELECT COUNT(*) as count FROM props WHERE status = 'in_stock' AND is_deleted = 0").get() as { count: number }).count
  const borrowedCount = (getDb().prepare("SELECT COUNT(*) as count FROM props WHERE status = 'borrowed' AND is_deleted = 0").get() as { count: number }).count
  const checkingCount = (getDb().prepare("SELECT COUNT(*) as count FROM props WHERE status = 'checking' AND is_deleted = 0").get() as { count: number }).count
  const missingPartsCount = (getDb().prepare("SELECT COUNT(*) as count FROM props WHERE status = 'missing_parts' AND is_deleted = 0").get() as { count: number }).count
  const pendingMissingCount = (getDb().prepare("SELECT COUNT(*) as count FROM missing_records WHERE status = 'pending'").get() as { count: number }).count
  const todayBorrowCount = (getDb().prepare("SELECT COUNT(*) as count FROM borrow_records WHERE date(borrowed_at) = date('now')").get() as { count: number }).count
  const todayReturnCount = (getDb().prepare("SELECT COUNT(*) as count FROM borrow_records WHERE status = 'returned' AND date(returned_at) = date('now')").get() as { count: number }).count

  return {
    totalProps,
    inStockCount,
    borrowedCount,
    checkingCount,
    missingPartsCount,
    pendingMissingCount,
    todayBorrowCount,
    todayReturnCount
  }
}
