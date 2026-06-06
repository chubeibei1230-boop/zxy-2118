<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="4" v-for="card in statCards" :key="card.key">
        <el-card shadow="hover" class="stat-card" :class="{ 'overdue-card': card.key === 'overdueCount' }">
          <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <div class="quick-actions" v-if="actions.length">
      <el-card shadow="hover">
        <template #header>快捷操作</template>
        <el-space wrap>
          <el-button v-for="action in actions" :key="action.path" :type="action.type" @click="$router.push(action.path)">
            {{ action.label }}
          </el-button>
        </el-space>
      </el-card>
    </div>

    <el-row :gutter="20" v-if="overdueRecords.length > 0">
      <el-col :span="24">
        <el-card shadow="hover" class="overdue-card">
          <template #header>
            <div class="card-header">
              <span class="overdue-title">
                <el-icon><Warning /></el-icon>
                逾期催办提醒
              </span>
              <el-button text type="primary" @click="$router.push('/records?overdue_status=overdue')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="overdueRecords" stripe style="width: 100%" size="small">
            <el-table-column prop="prop_name" label="道具名称" width="140" />
            <el-table-column prop="borrower_name" label="借用人" width="100" />
            <el-table-column prop="purpose" label="用途" show-overflow-tooltip />
            <el-table-column label="逾期状态" width="120">
              <template #default="{ row }">
                <el-tag :type="overdueStatusType(row.overdue_status)" effect="dark">
                  {{ overdueStatusLabel(row.overdue_status) }}
                  <span v-if="row.overdue_days > 0">({{ row.overdue_days }}天)</span>
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="expected_return_at" label="预计归还时间" width="180">
              <template #default="{ row }">
                <span class="text-red-500 font-bold">{{ row.expected_return_at }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getDashboardStats } from '@/api/stats'
import { getOverdueRecords } from '@/api/borrow'
import { Warning } from '@element-plus/icons-vue'
import { overdueStatusLabel, overdueStatusType } from '@/lib/utils'

const authStore = useAuthStore()

const stats = ref<Record<string, number>>({
  totalProps: 0,
  inStockCount: 0,
  borrowedCount: 0,
  missingPartsCount: 0,
  overdueCount: 0,
  upcomingDueCount: 0,
})

const statCards = computed(() => [
  { key: 'totalProps', label: '道具总数', value: stats.value.totalProps, color: '#1e3a5f' },
  { key: 'inStockCount', label: '在库', value: stats.value.inStockCount, color: '#67c23a' },
  { key: 'borrowedCount', label: '借出中', value: stats.value.borrowedCount, color: '#e8723a' },
  { key: 'upcomingDueCount', label: '即将到期', value: stats.value.upcomingDueCount, color: '#e6a23c' },
  { key: 'overdueCount', label: '已逾期', value: stats.value.overdueCount, color: '#f56c6c' },
  { key: 'missingPartsCount', label: '缺件', value: stats.value.missingPartsCount, color: '#f56c6c' },
])

const overdueRecords = ref<any[]>([])

const actions = computed(() => {
  const role = authStore.role
  const list: { label: string; path: string; type: string }[] = []
  if (['reception', 'admin'].includes(role)) {
    list.push({ label: '借出登记', path: '/borrow', type: 'primary' })
    list.push({ label: '回收登记', path: '/return', type: 'warning' })
    if (stats.value.overdueCount > 0) {
      list.push({ label: `逾期催办(${stats.value.overdueCount})`, path: '/records?overdue_status=overdue', type: 'danger' })
    }
  }
  if (['warehouse', 'admin'].includes(role)) {
    list.push({ label: '缺件处理', path: '/warehouse/missing', type: 'danger' })
    list.push({ label: '归位确认', path: '/warehouse/placement', type: 'success' })
  }
  list.push({ label: '道具管理', path: '/props', type: 'info' })
  return list
})

onMounted(async () => {
  try {
    const statsRes: any = await getDashboardStats()
    stats.value = statsRes.data || statsRes
  } catch {
    // silently fail
  }

  try {
    const res: any = await getOverdueRecords(5)
    overdueRecords.value = res.data || res || []
  } catch {
    // silently fail
  }
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-cards {
  margin-bottom: 0;
}

.stat-card {
  text-align: center;
  transition: all 0.3s;
}

.stat-card.overdue-card {
  border: 2px solid #f56c6c;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(245, 108, 108, 0);
  }
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 8px;
}

.quick-actions {
  margin-bottom: 0;
}

.recent-card {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overdue-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #f56c6c;
  font-size: 16px;
}

.overdue-card :deep(.el-card__header) {
  background-color: rgba(245, 108, 108, 0.05);
  border-bottom: 1px solid rgba(245, 108, 108, 0.2);
}

.text-red-500 {
  color: #f56c6c;
}

.font-bold {
  font-weight: 700;
}
</style>
