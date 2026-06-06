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
          <el-select v-model="filters.overdue_status" placeholder="逾期状态" clearable @change="loadRecords">
            <el-option label="正常" value="normal" />
            <el-option label="即将到期" value="upcoming" />
            <el-option label="已逾期" value="overdue" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input v-model="filters.prop_name" placeholder="道具名称" clearable @clear="loadRecords" @keyup.enter="loadRecords" />
        </el-col>
        <el-col :span="6">
          <el-input v-model="filters.borrower_name" placeholder="借用人" clearable @clear="loadRecords" @keyup.enter="loadRecords" />
        </el-col>
      </el-row>
      <el-row :gutter="16" class="mt-4">
        <el-col :span="24">
          <el-button type="primary" @click="loadRecords">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="hover">
      <el-table :data="recordsList" stripe style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="prop_name" label="道具名" width="140" />
        <el-table-column prop="borrower_name" label="借用人" width="100" />
        <el-table-column prop="purpose" label="用途" width="150" />
        <el-table-column prop="status" label="借还状态" width="100">
          <template #default="{ row }">
            <el-tag :type="recordStatusType(row.status)">{{ recordStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="逾期状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.overdue_status && row.overdue_status !== 'normal'" :type="overdueStatusType(row.overdue_status)" effect="dark">
              {{ overdueStatusLabel(row.overdue_status) }}
              <span v-if="row.overdue_days > 0">({{ row.overdue_days }}天)</span>
            </el-tag>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="borrowed_at" label="借出时间" width="170" />
        <el-table-column prop="expected_return_at" label="预计归还" width="170">
          <template #default="{ row }">
            <span :class="{ 'text-red-500 font-bold': row.overdue_status === 'overdue' }">
              {{ row.expected_return_at }}
            </span>
          </template>
        </el-table-column>
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
import { overdueStatusLabel, overdueStatusType, type OverdueStatus } from '@/lib/utils'

const filters = reactive({
  status: '',
  overdue_status: '',
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

function tableRowClassName({ row }: { row: any }) {
  if (row.overdue_status === 'overdue') {
    return 'overdue-row'
  }
  if (row.overdue_status === 'upcoming') {
    return 'upcoming-row'
  }
  return ''
}

function resetFilters() {
  filters.status = ''
  filters.overdue_status = ''
  filters.prop_name = ''
  filters.borrower_name = ''
  loadRecords()
}

async function loadRecords() {
  try {
    const params: Record<string, any> = {}
    if (filters.status) params.status = filters.status
    if (filters.overdue_status) params.overdue_status = filters.overdue_status
    if (filters.prop_name) params.prop_name = filters.prop_name
    if (filters.borrower_name) params.borrower_name = filters.borrower_name
    const res: any = await getRecords(params)
    recordsList.value = res.data?.list || res.list || res || []
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

:deep(.overdue-row) {
  background-color: rgba(245, 108, 108, 0.1) !important;
}

:deep(.upcoming-row) {
  background-color: rgba(230, 162, 60, 0.1) !important;
}

.mt-4 {
  margin-top: 16px;
}

.text-gray-400 {
  color: #909399;
}

.text-red-500 {
  color: #f56c6c;
}

.font-bold {
  font-weight: 700;
}
</style>
