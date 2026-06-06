<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6" v-for="card in statCards" :key="card.key">
        <el-card shadow="hover" class="stat-card">
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

    <el-card shadow="hover" class="recent-card">
      <template #header>最近活动</template>
      <el-table :data="recentLogs" stripe style="width: 100%">
        <el-table-column prop="action" label="操作" width="120" />
        <el-table-column prop="prop_name" label="道具" width="150" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="detail" label="详情" />
        <el-table-column prop="created_at" label="时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getDashboardStats, getRecentLogs } from '@/api/stats'

const authStore = useAuthStore()

const stats = ref<Record<string, number>>({
  pending_borrow: 0,
  pending_return: 0,
  missing_pending: 0,
  pending_placement: 0,
})

const recentLogs = ref<any[]>([])

const statCards = computed(() => [
  { key: 'pending_borrow', label: '待借出', value: stats.value.pending_borrow, color: '#e8723a' },
  { key: 'pending_return', label: '待回收', value: stats.value.pending_return, color: '#e6a23c' },
  { key: 'missing_pending', label: '缺件待处理', value: stats.value.missing_pending, color: '#f56c6c' },
  { key: 'pending_placement', label: '待归位', value: stats.value.pending_placement, color: '#1e3a5f' },
])

const actions = computed(() => {
  const role = authStore.role
  const list: { label: string; path: string; type: string }[] = []
  if (['reception', 'admin'].includes(role)) {
    list.push({ label: '借出登记', path: '/borrow', type: 'primary' })
    list.push({ label: '回收登记', path: '/return', type: 'warning' })
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
    const [statsRes, logsRes]: any[] = await Promise.all([
      getDashboardStats(),
      getRecentLogs({ limit: 5 }),
    ])
    stats.value = statsRes
    recentLogs.value = logsRes.list || logsRes || []
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
</style>
