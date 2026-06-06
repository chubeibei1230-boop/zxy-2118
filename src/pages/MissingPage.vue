<template>
  <div class="missing-page">
    <el-row :gutter="20">
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>缺件列表</span>
              <el-button type="primary" size="small" @click="openReportDialog">新增缺件登记</el-button>
            </div>
          </template>
          <el-table :data="missingList" stripe style="width: 100%">
            <el-table-column prop="prop_name" label="道具名称" width="160" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'pending' ? 'danger' : row.status === 'processing' ? 'warning' : 'success'">
                  {{ missingStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="missing_parts" label="缺失部件" width="150" />
            <el-table-column prop="damage_desc" label="损坏描述" />
            <el-table-column prop="created_at" label="登记时间" width="170" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button v-if="row.status !== 'resolved'" text type="success" @click="handleResolve(row)">解决</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="hover" v-if="resolveVisible">
          <template #header>解决缺件</template>
          <el-form ref="resolveFormRef" :model="resolveForm" :rules="resolveRules" label-width="100px">
            <el-form-item label="处理结果" prop="resolution">
              <el-input v-model="resolveForm.resolution" type="textarea" :rows="3" placeholder="请输入处理结果" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="resolveSaving" @click="submitResolve">确认解决</el-button>
              <el-button @click="resolveVisible = false">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="reportVisible" title="新增缺件登记" width="520px" destroy-on-close>
      <el-form ref="reportFormRef" :model="reportForm" :rules="reportRules" label-width="100px">
        <el-form-item label="借还记录" prop="borrow_record_id">
          <el-select v-model="reportForm.borrow_record_id" placeholder="请选择借还记录" filterable style="width: 100%;">
            <el-option v-for="r in borrowRecords" :key="r.id" :label="`${r.prop_name || '道具'} - ${r.borrower_name || '借用人'} (${r.id})`" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="缺失部件" prop="missing_parts">
          <el-input v-model="reportForm.missing_parts" placeholder="请输入缺失部件" />
        </el-form-item>
        <el-form-item label="损坏描述" prop="damage_desc">
          <el-input v-model="reportForm.damage_desc" type="textarea" :rows="3" placeholder="请输入损坏描述" />
        </el-form-item>
        <el-form-item label="责任小组" prop="responsible_group_id">
          <el-select v-model="reportForm.responsible_group_id" placeholder="请选择责任小组" clearable style="width: 100%;">
            <el-option v-for="g in groups" :key="g.id" :label="g.name" :value="g.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reportVisible = false">取消</el-button>
        <el-button type="primary" :loading="reportSaving" @click="submitReport">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getMissingRecords, reportMissing, resolveMissing } from '@/api/warehouse'
import { getRecords } from '@/api/borrow'
import { getGroups } from '@/api/admin'
import { ElMessage } from 'element-plus'

const missingList = ref<any[]>([])
const borrowRecords = ref<any[]>([])
const groups = ref<any[]>([])

const reportVisible = ref(false)
const reportSaving = ref(false)
const reportFormRef = ref()

const resolveVisible = ref(false)
const resolveSaving = ref(false)
const resolveFormRef = ref()
const resolvingId = ref<number | null>(null)

const reportForm = reactive({
  borrow_record_id: null as number | null,
  missing_parts: '',
  damage_desc: '',
  responsible_group_id: null as number | null,
})

const resolveForm = reactive({
  resolution: '',
})

const reportRules = {
  borrow_record_id: [{ required: true, message: '请选择借还记录', trigger: 'change' }],
  missing_parts: [{ required: true, message: '请输入缺失部件', trigger: 'blur' }],
  damage_desc: [{ required: true, message: '请输入损坏描述', trigger: 'blur' }],
}

const resolveRules = {
  resolution: [{ required: true, message: '请输入处理结果', trigger: 'blur' }],
}

function missingStatusLabel(status: string) {
  const map: Record<string, string> = { pending: '待处理', processing: '处理中', resolved: '已解决' }
  return map[status] || status
}

function openReportDialog() {
  reportForm.borrow_record_id = null
  reportForm.missing_parts = ''
  reportForm.damage_desc = ''
  reportForm.responsible_group_id = null
  reportVisible.value = true
}

function handleResolve(row: any) {
  resolvingId.value = row.id
  resolveForm.resolution = ''
  resolveVisible.value = true
}

async function loadMissing() {
  try {
    const res: any = await getMissingRecords()
    missingList.value = res.list || res || []
  } catch {
    // silently fail
  }
}

async function loadBorrowRecords() {
  try {
    const res: any = await getRecords()
    borrowRecords.value = res.list || res || []
  } catch {
    // silently fail
  }
}

async function loadGroups() {
  try {
    const res: any = await getGroups()
    groups.value = res.list || res || []
  } catch {
    // silently fail
  }
}

async function submitReport() {
  const valid = await reportFormRef.value?.validate().catch(() => false)
  if (!valid) return

  reportSaving.value = true
  try {
    await reportMissing({
      borrow_record_id: reportForm.borrow_record_id,
      missing_parts: reportForm.missing_parts,
      damage_desc: reportForm.damage_desc,
      responsible_group_id: reportForm.responsible_group_id,
    })
    ElMessage.success('缺件登记成功')
    reportVisible.value = false
    loadMissing()
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '操作失败')
  } finally {
    reportSaving.value = false
  }
}

async function submitResolve() {
  const valid = await resolveFormRef.value?.validate().catch(() => false)
  if (!valid || !resolvingId.value) return

  resolveSaving.value = true
  try {
    await resolveMissing(resolvingId.value, { resolution: resolveForm.resolution })
    ElMessage.success('解决成功')
    resolveVisible.value = false
    loadMissing()
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '操作失败')
  } finally {
    resolveSaving.value = false
  }
}

onMounted(() => {
  loadMissing()
  loadBorrowRecords()
  loadGroups()
})
</script>

<style scoped>
.missing-page {
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
