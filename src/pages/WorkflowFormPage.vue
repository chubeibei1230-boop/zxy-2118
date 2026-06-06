<template>
  <div class="workflow-form-page">
    <el-card shadow="hover">
      <template #header>{{ isEdit ? '编辑流程模板' : '新增流程模板' }}</template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 800px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="关联分类" prop="categories">
          <el-select v-model="form.categories" multiple placeholder="请选择关联分类" style="width: 100%;">
            <el-option v-for="c in categoryOptions" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="节点配置">
          <div class="nodes-area">
            <div v-for="(node, index) in form.nodes" :key="index" class="node-row">
              <el-input v-model="node.name" placeholder="节点名称" style="width: 160px;" />
              <el-select v-model="node.handler_role" placeholder="处理角色" style="width: 140px;">
                <el-option label="管理员" value="admin" />
                <el-option label="接待" value="reception" />
                <el-option label="仓库" value="warehouse" />
              </el-select>
              <el-input-number v-model="node.time_limit_hours" :min="0" placeholder="时限(小时)" style="width: 150px;" />
              <el-input-number v-model="node.sort_order" :min="0" placeholder="排序" style="width: 110px;" />
              <el-button type="danger" text @click="removeNode(index)">删除</el-button>
            </div>
            <el-button type="primary" text @click="addNode">+ 添加节点</el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTemplate, createTemplate, updateTemplate } from '@/api/workflow'
import { getCategories } from '@/api/admin'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const formRef = ref()
const saving = ref(false)
const isEdit = ref(false)
const categoryOptions = ref<any[]>([])

const form = reactive({
  name: '',
  description: '',
  categories: [] as number[],
  nodes: [] as { name: string; handler_role: string; time_limit_hours: number; sort_order: number }[],
})

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
}

function addNode() {
  form.nodes.push({
    name: '',
    handler_role: '',
    time_limit_hours: 0,
    sort_order: form.nodes.length,
  })
}

function removeNode(index: number) {
  form.nodes.splice(index, 1)
}

async function loadCategories() {
  try {
    const res: any = await getCategories()
    categoryOptions.value = res.list || res || []
  } catch {
    // silently fail
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const payload = {
      name: form.name,
      description: form.description,
      categories: form.categories,
      nodes: form.nodes.map(n => ({
        name: n.name,
        handler_role: n.handler_role,
        time_limit_hours: n.time_limit_hours,
        sort_order: n.sort_order,
      })),
    }
    if (isEdit.value) {
      await updateTemplate(Number(route.params.id), payload)
      ElMessage.success('更新成功')
    } else {
      await createTemplate(payload)
      ElMessage.success('创建成功')
    }
    router.push('/workflow')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '操作失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loadCategories()
  if (route.params.id) {
    isEdit.value = true
    try {
      const res: any = await getTemplate(Number(route.params.id))
      form.name = res.name
      form.description = res.description || ''
      form.categories = (res.categories || []).map((c: any) => c.id)
      form.nodes = (res.nodes || []).map((n: any) => ({
        name: n.name || '',
        handler_role: n.handler_role || '',
        time_limit_hours: n.time_limit_hours || 0,
        sort_order: n.sort_order || 0,
      }))
    } catch {
      ElMessage.error('获取模板信息失败')
    }
  }
})
</script>

<style scoped>
.workflow-form-page {
  max-width: 900px;
}

.nodes-area {
  width: 100%;
}

.node-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
