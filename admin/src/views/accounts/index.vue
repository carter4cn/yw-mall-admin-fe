<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import { createAccount, listAccounts } from '@/api/accounts'
import type { Account } from '@/types/api'
import { formatTime } from '@/utils/format'

const loading = ref(false)
const list = ref<Account[]>([])
const total = ref(0)
const query = reactive({ page: 1, page_size: 10 })

const dialogVisible = ref(false)
const createForm = reactive({ username: '', password: '', email: '', role: 'admin' })
const createFormRef = ref<FormInstance>()
const createLoading = ref(false)

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: '密码至少 6 位', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

async function fetchList() {
  loading.value = true
  try {
    const resp = await listAccounts({ page: query.page, page_size: query.page_size })
    list.value = resp.accounts ?? []
    total.value = resp.total ?? 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function onSearch() {
  query.page = 1
  fetchList()
}

function onReset() {
  query.page = 1
  fetchList()
}

function openCreate() {
  Object.assign(createForm, { username: '', password: '', email: '', role: 'admin' })
  dialogVisible.value = true
}

async function submitCreate() {
  if (!createFormRef.value) return
  const ok = await createFormRef.value.validate().catch(() => false)
  if (!ok) return
  createLoading.value = true
  try {
    await createAccount({ ...createForm })
    ElMessage.success('创建成功')
    dialogVisible.value = false
    fetchList()
  } finally {
    createLoading.value = false
  }
}

onMounted(fetchList)
</script>

<template>
  <PageContainer title="账号管理">
    <el-form inline>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">重置</el-button>
        <el-button type="success" @click="openCreate">新建账号</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色" />
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
          <el-button size="small" disabled>编辑（待补）</el-button>
          <template v-if="row" />
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
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

    <el-dialog v-model="dialogVisible" title="新建账号" width="480px">
      <el-form ref="createFormRef" :model="createForm" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="createForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="createForm.email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="createForm.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="客服" value="cs" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="submitCreate">提交</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
