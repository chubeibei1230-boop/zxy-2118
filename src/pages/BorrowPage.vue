<template>
  <div class="borrow-page">
    <el-card shadow="hover">
      <template #header>借出登记</template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" style="max-width: 600px;">
        <el-form-item label="选择道具" prop="prop_id">
          <el-select v-model="form.prop_id" placeholder="请选择在库道具" filterable style="width: 100%;">
            <el-option v-for="p in propOptions" :key="p.id" :label="`${p.name} (库存:${p.quantity})`" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="用途" prop="purpose">
          <el-input v-model="form.purpose" type="textarea" :rows="3" placeholder="请输入借用用途" />
        </el-form-item>
        <el-form-item label="预计归还" prop="expected_return_at">
          <el-date-picker v-model="form.expected_return_at" type="datetime" placeholder="选择预计归还时间" style="width: 100%;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">确认借出</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProps } from '@/api/props'
import { borrowProp } from '@/api/borrow'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()
const submitting = ref(false)
const propOptions = ref<any[]>([])

const form = reactive({
  prop_id: null as number | null,
  purpose: '',
  expected_return_at: '' as any,
})

const rules = {
  prop_id: [{ required: true, message: '请选择道具', trigger: 'change' }],
  purpose: [{ required: true, message: '请输入用途', trigger: 'blur' }],
  expected_return_at: [{ required: true, message: '请选择预计归还时间', trigger: 'change' }],
}

async function loadInStockProps() {
  try {
    const res: any = await getProps({ status: 'in_stock' })
    propOptions.value = res.list || res || []
  } catch {
    // silently fail
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await borrowProp({
      prop_id: form.prop_id,
      purpose: form.purpose,
      expected_return_at: form.expected_return_at ? new Date(form.expected_return_at).toISOString() : '',
    })
    ElMessage.success('借出登记成功')
    router.push('/records')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadInStockProps()
})
</script>

<style scoped>
.borrow-page {
  max-width: 800px;
}
</style>
