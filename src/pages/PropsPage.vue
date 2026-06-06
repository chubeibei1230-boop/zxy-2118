<template>
  <div class="props-page">
    <el-card shadow="hover" class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :span="6">
          <el-select v-model="filters.category_id" placeholder="分类筛选" clearable @change="loadProps">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filters.status" placeholder="状态筛选" clearable @change="loadProps">
            <el-option label="在库" value="in_stock" />
            <el-option label="借出" value="borrowed" />
            <el-option label="检查中" value="checking" />
            <el-option label="缺件" value="missing_parts" />
            <el-option label="已删除" value="deleted" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-input v-model="filters.keyword" placeholder="搜索关键词" clearable @clear="loadProps" @keyup.enter="loadProps">
            <template #append>
              <el-button @click="loadProps">搜索</el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4" style="text-align: right;">
          <el-button type="primary" @click="$router.push('/props/create')">新增道具</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="hover">
      <el-table :data="propList" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column prop="category_name" label="分类" width="120" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="$router.push(`/props/${row.id}`)">查看</el-button>
            <el-button text type="warning" @click="$router.push(`/props/${row.id}?edit=1`)">编辑</el-button>
            <el-button text type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getProps, deleteProp } from '@/api/props'
import { getCategories } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const filters = reactive({
  category_id: null as number | null,
  status: '',
  keyword: '',
})

const categories = ref<any[]>([])
const propList = ref<any[]>([])

function statusTagType(status: string) {
  const map: Record<string, string> = {
    in_stock: 'success',
    borrowed: 'warning',
    checking: '',
    missing_parts: 'danger',
    deleted: 'info',
  }
  return map[status] || 'info'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    in_stock: '在库',
    borrowed: '借出',
    checking: '检查中',
    missing_parts: '缺件',
    deleted: '已删除',
  }
  return map[status] || status
}

async function loadCategories() {
  try {
    const res: any = await getCategories()
    categories.value = res.list || res || []
  } catch {
    // silently fail
  }
}

async function loadProps() {
  try {
    const params: Record<string, any> = {}
    if (filters.category_id) params.category_id = filters.category_id
    if (filters.status) params.status = filters.status
    if (filters.keyword) params.keyword = filters.keyword
    const res: any = await getProps(params)
    propList.value = res.list || res || []
  } catch {
    // silently fail
  }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确认删除该道具？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true,
    })
    await deleteProp(row.id)
    ElMessage.success('删除成功')
    loadProps()
  } catch (action: any) {
    if (action === 'cancel') {
      try {
        await ElMessageBox.confirm('该道具无流转记录，是否硬删除？', '硬删除', {
          confirmButtonText: '硬删除',
          cancelButtonText: '取消',
          type: 'error',
        })
        await deleteProp(row.id, true)
        ElMessage.success('硬删除成功')
        loadProps()
      } catch {
        // cancelled
      }
    }
  }
}

onMounted(() => {
  loadCategories()
  loadProps()
})
</script>

<style scoped>
.props-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card :deep(.el-select) {
  width: 100%;
}
</style>
