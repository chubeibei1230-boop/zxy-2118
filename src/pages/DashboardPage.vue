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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getDashboardStats } from '@/api/stats'

const authStore = useAuthStore()

const stats = ref<Record<string, number>>({
  totalProps: 0,
  inStockCount: 0,
  borrowedCount: 0,
  missingPartsCount: 0,
})

const statCards = computed(() => [
  { key: 'totalProps', label: '道具总数', value: stats.value.totalProps, color: '#1e3a5f' },
  { key: 'inStockCount', label: '在库', value: stats.value.inStockCount, color: '#67c23a' },
  { key: 'borrowedCount', label: '借出中', value: stats.value.borrowedCount, color: '#e8723a' },
  { key: 'missingPartsCount', label: '缺件', value: stats.value.missingPartsCount, color: '#f56c6c' },
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
    const statsRes: any = await getDashboardStats()
    stats.value = statsRes
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
