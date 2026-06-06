import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type OverdueStatus = 'normal' | 'upcoming' | 'overdue'

export interface OverdueInfo {
  overdue_status: OverdueStatus
  overdue_days: number
}

export function calculateOverdueStatus(
  expectedReturnAt: string | null | undefined,
  status: string
): OverdueInfo {
  const now = new Date()
  let overdueStatus: OverdueStatus = 'normal'
  let overdueDays = 0

  if (expectedReturnAt && status !== 'returned' && status !== 'placed') {
    const expectedReturn = new Date(expectedReturnAt)
    const diffMs = now.getTime() - expectedReturn.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    if (diffDays > 0) {
      overdueStatus = 'overdue'
      overdueDays = Math.floor(diffDays)
    } else if (diffDays > -1) {
      overdueStatus = 'upcoming'
      overdueDays = 0
    } else {
      overdueStatus = 'normal'
      overdueDays = 0
    }
  }

  return {
    overdue_status: overdueStatus,
    overdue_days: overdueDays
  }
}

export function overdueStatusLabel(status: OverdueStatus): string {
  const map: Record<OverdueStatus, string> = {
    normal: '正常',
    upcoming: '即将到期',
    overdue: '已逾期'
  }
  return map[status] || status
}

export function overdueStatusType(status: OverdueStatus): string {
  const map: Record<OverdueStatus, string> = {
    normal: 'success',
    upcoming: 'warning',
    overdue: 'danger'
  }
  return map[status] || 'info'
}
