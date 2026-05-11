<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import { listUsers, updateUserStatus } from '@/api/users'
import type { UserItem } from '@/types/api'
import { formatTime } from '@/utils/format'

const loading = ref(false)
const list = ref<UserItem[]>([])
const total = ref(0)
const query = reactive({ page: 1, page_size: 10 })

const dialogVisible = ref(false)
const current = ref<UserItem | null>(null)
const form = reactive({ status: 1, reason: '' })
const formRef = ref<FormInstance>()
const submitting = ref(false)
const rules: FormRules = {
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

async function fetchList() {
  loading.value = true
  try {
    const resp = await listUsers({ page: query.page, page_size: query.page_size })
    list.value = resp.users ?? []
    total.value = resp.total ?? 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openEdit(row: UserItem) {
  current.value = row
  Object.assign(form, { status: row.status, reason: '' })
  dialogVisible.value = true
}

async function submit() {
  if (!current.value || !formRef.value) return
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return
  submitting.value = true
  try {
    await updateUserStatus(current.value.id, { ...form })
    ElMessage.success('已更新')
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

onMounted(fetchList)
</script>

<template>
  <PageContainer title="用户管理">
    <el-form inline>
      <el-form-item>
        <el-button type="primary" @click="fetchList">查询</el-button>
        <el-button @click="fetchList">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="phone" label="手机" />
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
          <el-button size="small" type="primary" @click="openEdit(row)">改状态</el-button>
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

    <el-dialog v-model="dialogVisible" title="修改用户状态" width="420px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="正常" :value="1" />
            <el-option label="冻结" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="form.reason" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">提交</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
