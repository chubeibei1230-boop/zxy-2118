<template>
  <div class="prop-detail">
    <el-card shadow="hover" class="info-card">
      <template #header>
        <div class="card-header">
          <span>道具信息</span>
          <el-button type="warning" size="small" @click="$router.push(`/props/${propId}?edit=1`)">编辑</el-button>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="名称">{{ propInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ propInfo.category_name }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ propInfo.quantity }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(propInfo.status)">{{ statusLabel(propInfo.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ propInfo.description || '暂无' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="hover" class="timeline-card">
      <template #header>流转历史</template>
      <el-timeline v-if="flowLogs.length">
        <el-timeline-item
          v-for="(log, index) in flowLogs"
          :key="index"
          :timestamp="log.created_at"
          placement="top"
          :type="logType(log.action)"
        >
          <el-card shadow="never">
            <p><strong>{{ log.action }}</strong> <span v-if="log.notes">- {{ log.notes }}</span></p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无流转记录" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProp } from '@/api/props'

const route = useRoute()
const propId = route.params.id as string

const propInfo = ref<Record<string, any>>({})
const flowLogs = ref<any[]>([])

function statusTagType(status: string) {
  const map: Record<string, string> = {
    in_stock: 'success', borrowed: 'warning', checking: '',
    missing_parts: 'danger', deleted: 'info',
  }
  return map[status] || 'info'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    in_stock: '在库', borrowed: '借出', checking: '检查中',
    missing_parts: '缺件', deleted: '已删除',
  }
  return map[status] || status
}

function logType(action: string) {
  if (action.includes('borrow') || action.includes('借出')) return 'warning'
  if (action.includes('return') || action.includes('回收') || action.includes('placement') || action.includes('归位')) return 'success'
  if (action.includes('missing') || action.includes('缺件')) return 'danger'
  return 'primary'
}

onMounted(async () => {
  try {
    const res: any = await getProp(Number(propId))
    propInfo.value = res
    const records = res.borrow_records || []
    const allLogs: any[] = []
    records.forEach((r: any) => {
      const logs = r.flow_logs || []
      allLogs.push(...logs)
    })
    allLogs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    flowLogs.value = allLogs
  } catch {
    // silently fail
  }
})
</script>

<style scoped>
.prop-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-card :deep(.el-timeline-item__card) {
  margin-top: 0;
}
</style>
