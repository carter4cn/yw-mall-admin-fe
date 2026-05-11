<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import {
  createActivity,
  listActivities,
  updateActivity,
  updateActivityStatus,
} from '@/api/activities'
import type { Activity } from '@/types/api'
import { formatTime } from '@/utils/format'

const loading = ref(false)
const list = ref<Activity[]>([])
const total = ref(0)
const query = reactive({ page: 1, page_size: 10 })

const dialogVisible = ref(false)
const editMode = ref(false)
const current = ref<Activity | null>(null)
const form = reactive({
  code: '',
  title: '',
  type: '',
  startTime: 0,
  endTime: 0,
})
const formRef = ref<FormInstance>()
const submitting = ref(false)
const rules: FormRules = {
  code: [{ required: true, message: '请输入活动编号', trigger: 'blur' }],
  title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
  type: [{ required: true, message: '请输入活动类型', trigger: 'blur' }],
}

async function fetchList() {
  loading.value = true
  try {
    const resp = await listActivities({ page: query.page, page_size: query.page_size })
    list.value = resp.activities ?? []
    total.value = resp.total ?? 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editMode.value = false
  current.value = null
  Object.assign(form, { code: '', title: '', type: '', startTime: 0, endTime: 0 })
  dialogVisible.value = true
}

function openEdit(row: Activity) {
  editMode.value = true
  current.value = row
  Object.assign(form, {
    code: row.code,
    title: row.title,
    type: row.type,
    startTime: row.startTime,
    endTime: row.endTime,
  })
  dialogVisible.value = true
}

async function submit() {
  if (!formRef.value) return
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return
  submitting.value = true
  try {
    if (editMode.value && current.value) {
      await updateActivity(current.value.id, { ...form })
    } else {
      await createActivity({ ...form })
    }
    ElMessage.success('已保存')
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

async function toggleStatus(row: Activity) {
  const next = row.status === 1 ? 0 : 1
  await updateActivityStatus(row.id, next)
  ElMessage.success(next === 1 ? '已上线' : '已下线')
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <PageContainer title="活动管理">
    <el-form inline>
      <el-form-item>
        <el-button type="primary" @click="fetchList">查询</el-button>
        <el-button type="success" @click="openCreate">新建活动</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="code" label="编号" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="type" label="类型" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <StatusTag :status="row.status" :labels="{ 0: '下线', 1: '在线' }" />
        </template>
      </el-table-column>
      <el-table-column label="开始" width="180">
        <template #default="{ row }">{{ formatTime(row.startTime) }}</template>
      </el-table-column>
      <el-table-column label="结束" width="180">
        <template #default="{ row }">{{ formatTime(row.endTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" :type="row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ row.status === 1 ? '下线' : '上线' }}
          </el-button>
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

    <el-dialog v-model="dialogVisible" :title="editMode ? '编辑活动' : '新建活动'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="编号" prop="code">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-input v-model="form.type" />
        </el-form-item>
        <el-form-item label="开始">
          <el-input-number v-model="form.startTime" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束">
          <el-input-number v-model="form.endTime" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">提交</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
