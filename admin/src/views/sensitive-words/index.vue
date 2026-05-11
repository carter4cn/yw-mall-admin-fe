<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import {
  createSensitiveWord,
  deleteSensitiveWord,
  listSensitiveWords,
} from '@/api/sensitiveWords'
import type { SensitiveWord } from '@/types/api'
import { formatTime } from '@/utils/format'

const loading = ref(false)
const list = ref<SensitiveWord[]>([])
const total = ref(0)
const query = reactive({ page: 1, page_size: 10 })

const dialogVisible = ref(false)
const form = reactive({ word: '', category: '', action: 'BLOCK' })
const formRef = ref<FormInstance>()
const submitting = ref(false)
const rules: FormRules = {
  word: [{ required: true, message: '请输入敏感词', trigger: 'blur' }],
}

async function fetchList() {
  loading.value = true
  try {
    const resp = await listSensitiveWords({ page: query.page, page_size: query.page_size })
    list.value = resp.words ?? []
    total.value = resp.total ?? 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  Object.assign(form, { word: '', category: '', action: 'BLOCK' })
  dialogVisible.value = true
}

async function submit() {
  if (!formRef.value) return
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return
  submitting.value = true
  try {
    await createSensitiveWord({ ...form })
    ElMessage.success('已添加')
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

async function onDelete(row: SensitiveWord) {
  try {
    await ElMessageBox.confirm(`确认删除 "${row.word}"?`, '提示', { type: 'warning' })
  } catch {
    return
  }
  await deleteSensitiveWord(row.id)
  ElMessage.success('已删除')
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <PageContainer title="敏感词库">
    <el-form inline>
      <el-form-item>
        <el-button type="primary" @click="fetchList">查询</el-button>
        <el-button type="success" @click="openCreate">新增敏感词</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="word" label="词" />
      <el-table-column prop="category" label="类别" />
      <el-table-column prop="action" label="动作" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <StatusTag :status="row.status" :labels="{ 0: '禁用', 1: '启用' }" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="onDelete(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" title="新增敏感词" width="480px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="词" prop="word">
          <el-input v-model="form.word" />
        </el-form-item>
        <el-form-item label="类别">
          <el-input v-model="form.category" />
        </el-form-item>
        <el-form-item label="动作">
          <el-select v-model="form.action" style="width: 100%">
            <el-option label="BLOCK 拦截" value="BLOCK" />
            <el-option label="REPLACE 替换" value="REPLACE" />
            <el-option label="WARN 警告" value="WARN" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">提交</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
