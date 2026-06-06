<template>
  <div class="placement-page">
    <el-card shadow="hover">
      <template #header>待归位道具</template>
      <el-table :data="placementList" stripe style="width: 100%">
        <el-table-column prop="prop_name" label="道具名称" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'checking'" type="warning">检查中</el-tag>
            <el-tag v-else-if="row.status === 'missing_parts' && !row.missing_resolved" type="danger">缺件未解决</el-tag>
            <el-tag v-else-if="row.status === 'missing_parts' && row.missing_resolved" type="success">缺件已解决</el-tag>
            <el-tag v-else type="info">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="borrower_name" label="上次借用人" width="120" />
        <el-table-column prop="returned_at" label="归还时间" width="180" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="handleConfirm(row)">归位确认</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { confirmPlacement } from '@/api/warehouse'
import { getRecords } from '@/api/borrow'
import { ElMessage, ElMessageBox } from 'element-plus'

const placementList = ref<any[]>([])

async function loadPlacement() {
  try {
    const res: any = await getRecords()
    const allRecords = res.list || res || []
    placementList.value = allRecords.filter(
      (r: any) => ['returned', 'checking', 'missing_parts'].includes(r.status)
    )
  } catch {
    // silently fail
  }
}

async function handleConfirm(row: any) {
  try {
    await ElMessageBox.confirm('确认该道具已归位？归位后道具状态将恢复为在库。', '归位确认', {
      confirmButtonText: '确认归位',
      cancelButtonText: '取消',
      type: 'info',
    })
    await confirmPlacement({ borrow_record_id: row.id })
    ElMessage.success('归位成功')
    loadPlacement()
  } catch (err: any) {
    if (err !== 'cancel' && err?.message !== 'cancel') {
      ElMessage.error(err.response?.data?.message || '归位失败')
    }
  }
}

onMounted(() => {
  loadPlacement()
})
</script>

<style scoped>
.placement-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
