import * as statsRepo from '../repositories/statsRepo.js'

export function getDashboard() {
  return statsRepo.getDashboardStats()
}
