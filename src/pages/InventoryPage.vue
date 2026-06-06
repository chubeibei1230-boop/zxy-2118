<template>
  <div class="inventory-page">
    <el-row :gutter="20">
      <el-col :span="8" v-for="item in inventoryList" :key="item.category">
        <el-card shadow="hover" class="inventory-card">
          <template #header>
            <span class="category-title">{{ item.category }}</span>
          </template>
          <div class="inventory-stats">
            <div class="stat-row">
              <span class="stat-label">在库</span>
              <el-progress :percentage="calcPercent(item.in_stock, item.total)" :color="'#67c23a'" :stroke-width="18" :text-inside="true" />
              <span class="stat-num green">{{ item.in_stock }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">借出</span>
              <el-progress :percentage="calcPercent(item.borrowed, item.total)" :color="'#e8723a'" :stroke-width="18" :text-inside="true" />
              <span class="stat-num orange">{{ item.borrowed }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">缺件</span>
              <el-progress :percentage="calcPercent(item.missing, item.total)" :color="'#f56c6c'" :stroke-width="18" :text-inside="true" />
              <span class="stat-num red">{{ item.missing }}</span>
            </div>
          </div>
          <div class="total-line">
            合计: <strong>{{ item.total }}</strong>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getInventory } from '@/api/warehouse'

const inventoryList = ref<any[]>([])

function calcPercent(value: number, total: number) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

async function loadInventory() {
  try {
    const res: any = await getInventory()
    inventoryList.value = res.list || res || []
  } catch {
    // silently fail
  }
}

onMounted(() => {
  loadInventory()
})
</script>

<style scoped>
.inventory-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.inventory-card {
  margin-bottom: 20px;
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
}

.inventory-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-label {
  width: 40px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.stat-row .el-progress {
  flex: 1;
}

.stat-num {
  width: 36px;
  text-align: right;
  font-weight: 600;
  font-size: 15px;
}

.stat-num.green { color: #67c23a; }
.stat-num.orange { color: #e8723a; }
.stat-num.red { color: #f56c6c; }

.total-line {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
