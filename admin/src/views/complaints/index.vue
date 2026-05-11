<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import { handleComplaint, listComplaints } from '@/api/complaints'
import type { Complaint } from '@/types/api'
import { formatTime } from '@/utils/format'

const loading = ref(false)
const list = ref<Complaint[]>([])
const total = ref(0)
const query = reactive({ page: 1, page_size: 10, status: undefined as number | undefined })

const dialogVisible = ref(false)
const current = ref<Complaint | null>(null)
const form = reactive({ action: 1, remark: '' })
const formRef = ref<FormInstance>()
const submitting = ref(false)
const rules: FormRules = {
  action: [{ required: true, message: '请选择处理结果', trigger: 'change' }],
}

async function fetchList() {
  loading.value = true
  try {
    const resp = await listComplaints({ ...query })
    list.value = resp.complaints ?? []
    total.value = resp.total ?? 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openHandle(row: Complaint) {
  current.value = row
  Object.assign(form, { action: 1, remark: '' })
  dialogVisible.value = true
}

async function submit() {
  if (!current.value || !formRef.value) return
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return
  submitting.value = true
  try {
    await handleComplaint(current.value.id, { ...form })
    ElMessage.success('已处理')
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

function onReset() {
  query.status = undefined
  query.page = 1
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <PageContainer title="投诉处理">
    <el-form inline>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
          <el-option label="待处理" :value="0" />
          <el-option label="已处理" :value="1" />
          <el-option label="已驳回" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchList">查询</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="complainantType" label="投诉方" />
      <el-table-column prop="targetId" label="目标 ID" width="100" />
      <el-table-column prop="type" label="类型" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <StatusTag :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openHandle(row)">处理</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无数据" /></template>
    </el-table>

    <div style="margin-top: 16px; text-align: right">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.page_size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="fetchList"
        @size-change="fetchList"
      />
    </div>

    <el-dialog v-model="dialogVisible" title="投诉处理" width="560px">
      <el-descriptions v-if="current" :column="2" border size="small" style="margin-bottom: 12px">
        <el-descriptions-item label="投诉方">{{ current.complainantType }}</el-descriptions-item>
        <el-descriptions-item label="目标 ID">{{ current.targetId }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ current.type }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ formatTime(current.createTime) }}</el-descriptions-item>
      </el-descriptions>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="处理结果" prop="action">
          <el-radio-group v-model="form.action">
            <el-radio :value="1">支持</el-radio>
            <el-radio :value="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">提交</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
