<template>
  <div class="workflow-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>流程模板</span>
          <el-button type="primary" @click="$router.push('/workflow/create')">新增模板</el-button>
        </div>
      </template>
      <el-table :data="workflowList" stripe style="width: 100%">
        <el-table-column prop="name" label="模板名称" width="200" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="categories" label="关联分类" width="200">
          <template #default="{ row }">
            <el-tag v-for="c in (row.categories || [])" :key="c.id" size="small" style="margin-right: 4px;">{{ c.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled === 1 ? 'success' : 'info'">
              {{ row.enabled === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="$router.push(`/workflow/${row.id}`)">编辑</el-button>
            <el-button text :type="row.enabled === 1 ? 'warning' : 'success'" @click="handleToggle(row)">
              {{ row.enabled === 1 ? '停用' : '启用' }}
            </el-button>
            <el-button text type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTemplates, deleteTemplate, updateTemplate } from '@/api/workflow'
import { ElMessage, ElMessageBox } from 'element-plus'

const workflowList = ref<any[]>([])

async function loadWorkflows() {
  try {
    const res: any = await getTemplates()
    workflowList.value = res.list || res || []
  } catch {
    // silently fail
  }
}

async function handleToggle(row: any) {
  try {
    await updateTemplate(row.id, {
      name: row.name,
      enabled: row.enabled === 1 ? 0 : 1,
    })
    ElMessage.success('操作成功')
    loadWorkflows()
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '操作失败')
  }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确认删除该流程模板？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteTemplate(row.id)
    ElMessage.success('删除成功')
    loadWorkflows()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  loadWorkflows()
})
</script>

<style scoped>
.workflow-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
