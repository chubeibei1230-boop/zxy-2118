<template>
  <div class="prop-form-page">
    <el-card shadow="hover">
      <template #header>{{ isEdit ? '编辑道具' : '新增道具' }}</template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 600px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入道具名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择分类" style="width: 100%;">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" :max="9999" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入道具描述" />
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
import { getProp, createProp, updateProp } from '@/api/props'
import { getCategories } from '@/api/admin'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const formRef = ref()
const saving = ref(false)
const isEdit = ref(false)
const categories = ref<any[]>([])

const form = reactive({
  name: '',
  category_id: null as number | null,
  quantity: 1,
  description: '',
})

const rules = {
  name: [{ required: true, message: '请输入道具名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
}

async function loadCategories() {
  try {
    const res: any = await getCategories()
    categories.value = res.list || res || []
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
      category_id: form.category_id,
      description: form.description,
      quantity: form.quantity,
    }
    if (isEdit.value) {
      await updateProp(Number(route.params.id), payload)
      ElMessage.success('更新成功')
    } else {
      await createProp(payload)
      ElMessage.success('创建成功')
    }
    router.push('/props')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '操作失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loadCategories()
  if (route.params.id && route.query.edit === '1') {
    isEdit.value = true
    try {
      const res: any = await getProp(Number(route.params.id))
      Object.assign(form, {
        name: res.name,
        category_id: res.category_id,
        quantity: res.quantity,
        description: res.description || '',
      })
    } catch {
      ElMessage.error('获取道具信息失败')
    }
  }
})
</script>

<style scoped>
.prop-form-page {
  max-width: 800px;
}
</style>
