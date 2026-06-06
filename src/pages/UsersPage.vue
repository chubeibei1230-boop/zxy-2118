<template>
  <div class="users-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="openCreateDialog">新增用户</el-button>
        </div>
      </template>
      <el-table :data="usersList" stripe style="width: 100%">
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="roleTagType(row.role)">{{ roleLabel(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled === 1 ? 'success' : 'info'">
              {{ row.enabled === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openEditDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="createVisible" title="新增用户" width="460px" destroy-on-close>
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="createForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="createForm.role" placeholder="请选择角色" style="width: 100%;">
            <el-option label="管理员" value="admin" />
            <el-option label="接待" value="reception" />
            <el-option label="仓库" value="warehouse" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogSaving" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editVisible" title="编辑用户" width="460px" destroy-on-close>
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" placeholder="请选择角色" style="width: 100%;">
            <el-option label="管理员" value="admin" />
            <el-option label="接待" value="reception" />
            <el-option label="仓库" value="warehouse" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-select v-model="editForm.enabled" placeholder="请选择状态" style="width: 100%;">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogSaving" @click="handleEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getUsers, createUser, updateUser } from '@/api/admin'
import { ElMessage } from 'element-plus'

const usersList = ref<any[]>([])
const createVisible = ref(false)
const editVisible = ref(false)
const dialogSaving = ref(false)
const editingId = ref<number | null>(null)

const createFormRef = ref()
const editFormRef = ref()

const createForm = reactive({
  username: '',
  password: '',
  name: '',
  role: '',
})

const editForm = reactive({
  name: '',
  role: '',
  enabled: 1 as number,
})

const createRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const editRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  enabled: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

function roleTagType(role: string) {
  const map: Record<string, string> = { admin: 'danger', reception: 'warning', warehouse: 'success' }
  return (map[role] || 'info') as any
}

function roleLabel(role: string) {
  const map: Record<string, string> = { admin: '管理员', reception: '接待', warehouse: '仓库' }
  return map[role] || role
}

function openCreateDialog() {
  createForm.username = ''
  createForm.password = ''
  createForm.name = ''
  createForm.role = ''
  createVisible.value = true
}

function openEditDialog(row: any) {
  editingId.value = row.id
  editForm.name = row.name || ''
  editForm.role = row.role || ''
  editForm.enabled = row.enabled ?? 1
  editVisible.value = true
}

async function loadUsers() {
  try {
    const res: any = await getUsers()
    usersList.value = res.list || res || []
  } catch {
    // silently fail
  }
}

async function handleCreate() {
  const valid = await createFormRef.value?.validate().catch(() => false)
  if (!valid) return

  dialogSaving.value = true
  try {
    await createUser(createForm)
    ElMessage.success('创建成功')
    createVisible.value = false
    loadUsers()
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '创建失败')
  } finally {
    dialogSaving.value = false
  }
}

async function handleEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false)
  if (!valid || !editingId.value) return

  dialogSaving.value = true
  try {
    await updateUser(editingId.value, {
      name: editForm.name,
      role: editForm.role,
      enabled: editForm.enabled,
    })
    ElMessage.success('更新成功')
    editVisible.value = false
    loadUsers()
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '更新失败')
  } finally {
    dialogSaving.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-page {
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
