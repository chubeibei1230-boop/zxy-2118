<template>
  <div class="records-page">
    <el-card shadow="hover" class="filter-card">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-select v-model="filters.status" placeholder="状态筛选" clearable @change="loadRecords">
            <el-option label="借出中" value="borrowed" />
            <el-option label="已归还" value="returned" />
            <el-option label="检查中" value="checking" />
            <el-option label="缺件" value="missing_parts" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input v-model="filters.prop_name" placeholder="道具名称" clearable @clear="loadRecords" @keyup.enter="loadRecords" />
        </el-col>
        <el-col :span="6">
          <el-input v-model="filters.borrower_name" placeholder="借用人" clearable @clear="loadRecords" @keyup.enter="loadRecords" />
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="loadRecords">查询</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="hover">
      <el-table :data="recordsList" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="prop_name" label="道具名" width="140" />
        <el-table-column prop="borrower_name" label="借用人" width="100" />
        <el-table-column prop="purpose" label="用途" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="recordStatusType(row.status)">{{ recordStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="borrowed_at" label="借出时间" width="170" />
        <el-table-column prop="expected_return_at" label="预计归还" width="170" />
        <el-table-column prop="returned_at" label="实际归还" width="170" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="handleView(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getRecords } from '@/api/borrow'
import { ElMessageBox } from 'element-plus'

const filters = reactive({
  status: '',
  prop_name: '',
  borrower_name: '',
})

const recordsList = ref<any[]>([])

function recordStatusType(status: string) {
  const map: Record<string, string> = {
    borrowed: 'warning', returned: 'success', checking: '', missing_parts: 'danger',
  }
  return map[status] || 'info'
}

function recordStatusLabel(status: string) {
  const map: Record<string, string> = {
    borrowed: '借出中', returned: '已归还', checking: '检查中', missing_parts: '缺件',
  }
  return map[status] || status
}

async function loadRecords() {
  try {
    const params: Record<string, any> = {}
    if (filters.status) params.status = filters.status
    if (filters.prop_name) params.prop_name = filters.prop_name
    if (filters.borrower_name) params.borrower_name = filters.borrower_name
    const res: any = await getRecords(params)
    recordsList.value = res.list || res || []
  } catch {
    // silently fail
  }
}

function handleView(row: any) {
  const detail = JSON.stringify(row, null, 2)
  ElMessageBox.alert(`<pre style="white-space:pre-wrap;font-size:13px;">${detail}</pre>`, '借还详情', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '关闭',
  })
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.records-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card :deep(.el-select) {
  width: 100%;
}
</style>
