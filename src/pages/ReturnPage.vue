<template>
  <div class="return-page">
    <el-row :gutter="20">
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>待回收道具</template>
          <el-table :data="borrowedList" stripe highlight-current-row @current-change="handleSelect" style="width: 100%">
            <el-table-column prop="prop_name" label="道具名称" />
            <el-table-column prop="borrower_name" label="借用人" width="100" />
            <el-table-column prop="borrowed_at" label="借出时间" width="170" />
            <el-table-column prop="expected_return_at" label="预计归还" width="170" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header>回收登记</template>
          <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" :disabled="!selectedRecord">
            <el-form-item label="道具">
              <el-input :model-value="selectedRecord?.prop_name || ''" disabled />
            </el-form-item>
            <el-form-item label="借用人">
              <el-input :model-value="selectedRecord?.borrower_name || ''" disabled />
            </el-form-item>
            <el-form-item label="回收状态" prop="return_status">
              <el-select v-model="form.return_status" placeholder="请选择" style="width: 100%;">
                <el-option label="完好" value="intact" />
                <el-option label="缺件" value="missing_parts" />
              </el-select>
            </el-form-item>
            <el-form-item label="缺失部件" v-if="form.return_status === 'missing_parts'" prop="missing_parts">
              <el-input v-model="form.missing_parts" placeholder="请输入缺失部件" />
            </el-form-item>
            <el-form-item label="损坏描述" v-if="form.return_status === 'missing_parts'" prop="damage_desc">
              <el-input v-model="form.damage_desc" type="textarea" :rows="3" placeholder="回收备注" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="handleSubmit">确认回收</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRecords, returnProp } from '@/api/borrow'
import { reportMissing } from '@/api/warehouse'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()
const submitting = ref(false)
const borrowedList = ref<any[]>([])
const selectedRecord = ref<any>(null)

const form = reactive({
  return_status: '',
  missing_parts: '',
  damage_desc: '',
})

const rules = {
  return_status: [{ required: true, message: '请选择回收状态', trigger: 'change' }],
}

function handleSelect(row: any) {
  selectedRecord.value = row
  form.return_status = ''
  form.missing_parts = ''
  form.damage_desc = ''
}

async function loadBorrowed() {
  try {
    const res: any = await getRecords({ status: 'borrowed' })
    borrowedList.value = res.list || res || []
  } catch {
    // silently fail
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !selectedRecord.value) return

  submitting.value = true
  try {
    await returnProp({ borrow_record_id: selectedRecord.value.id })
    if (form.return_status === 'missing_parts') {
      await reportMissing({
        borrow_record_id: selectedRecord.value.id,
        missing_parts: form.missing_parts,
        damage_desc: form.damage_desc,
      })
    }
    ElMessage.success('回收登记成功')
    router.push('/records')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadBorrowed()
})
</script>

<style scoped>
.return-page {
  height: calc(100vh - var(--header-height) - 40px);
}
</style>
