<template>
  <div class="groups-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>责任小组</span>
          <el-button type="primary" @click="openDialog()">新增小组</el-button>
        </div>
      </template>
      <el-table :data="groupsList" stripe style="width: 100%">
        <el-table-column prop="name" label="小组名" width="180" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="member_count" label="成员数" width="100" />
        <el-table-column label="成员" width="220">
          <template #default="{ row }">
            <el-tag v-for="m in (row.members || [])" :key="m.id" size="small" style="margin-right: 4px;">{{ m.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button text type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑小组' : '新增小组'" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入小组名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="成员" prop="member_ids">
          <el-select v-model="form.member_ids" multiple placeholder="请选择成员" style="width: 100%;">
            <el-option v-for="u in usersList" :key="u.id" :label="u.name || u.username" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogSaving" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getGroups, createGroup, updateGroup, deleteGroup, getUsers } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const groupsList = ref<any[]>([])
const usersList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogSaving = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref()

const form = reactive({
  name: '',
  description: '',
  member_ids: [] as number[],
})

const rules = {
  name: [{ required: true, message: '请输入小组名称', trigger: 'blur' }],
}

function openDialog(row?: any) {
  if (row) {
    editingId.value = row.id
    form.name = row.name || ''
    form.description = row.description || ''
    form.member_ids = (row.members || []).map((m: any) => m.id)
  } else {
    editingId.value = null
    form.name = ''
    form.description = ''
    form.member_ids = []
  }
  dialogVisible.value = true
}

async function loadGroups() {
  try {
    const res: any = await getGroups()
    groupsList.value = res.list || res || []
  } catch {
    // silently fail
  }
}

async function loadUsers() {
  try {
    const res: any = await getUsers()
    usersList.value = res.list || res || []
  } catch {
    // silently fail
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  dialogSaving.value = true
  try {
    const payload = {
      name: form.name,
      description: form.description,
      member_ids: form.member_ids,
    }
    if (editingId.value) {
      await updateGroup(editingId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await createGroup(payload)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadGroups()
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '操作失败')
  } finally {
    dialogSaving.value = false
  }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确认删除该小组？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteGroup(row.id)
    ElMessage.success('删除成功')
    loadGroups()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  loadGroups()
  loadUsers()
})
</script>

<style scoped>
.groups-page {
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
