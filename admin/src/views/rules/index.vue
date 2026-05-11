<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import { createRule, listRules, validateRule } from '@/api/rules'
import type { Rule } from '@/types/api'
import { formatTime } from '@/utils/format'

const loading = ref(false)
const list = ref<Rule[]>([])
const total = ref(0)
const query = reactive({ page: 1, page_size: 10 })

const dialogVisible = ref(false)
const form = reactive({ code: '', description: '', expression: '' })
const formRef = ref<FormInstance>()
const submitting = ref(false)
const validating = ref(false)
const rules: FormRules = {
  code: [{ required: true, message: '请输入规则编号', trigger: 'blur' }],
  expression: [{ required: true, message: '请输入表达式', trigger: 'blur' }],
}

async function fetchList() {
  loading.value = true
  try {
    const resp = await listRules({ page: query.page, page_size: query.page_size })
    list.value = resp.rules ?? []
    total.value = resp.total ?? 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  Object.assign(form, { code: '', description: '', expression: '' })
  dialogVisible.value = true
}

async function onValidate() {
  if (!form.expression) {
    ElMessage.warning('请先填写表达式')
    return
  }
  validating.value = true
  try {
    const resp = await validateRule(form.expression)
    if (resp.valid) ElMessage.success('表达式合法')
    else ElMessage.error(resp.message || '表达式不合法')
  } finally {
    validating.value = false
  }
}

async function submit() {
  if (!formRef.value) return
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return
  submitting.value = true
  try {
    await createRule({ ...form })
    ElMessage.success('已创建')
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

onMounted(fetchList)
</script>

<template>
  <PageContainer title="规则管理">
    <el-form inline>
      <el-form-item>
        <el-button type="primary" @click="fetchList">查询</el-button>
        <el-button type="success" @click="openCreate">新建规则</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="code" label="编号" />
      <el-table-column prop="description" label="说明" />
      <el-table-column prop="expression" label="表达式" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <StatusTag :status="row.status" :labels="{ 0: '禁用', 1: '启用' }" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
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

    <el-dialog v-model="dialogVisible" title="新建规则" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="编号" prop="code">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" />
        </el-form-item>
        <el-form-item label="表达式" prop="expression">
          <el-input v-model="form.expression" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :loading="validating" @click="onValidate">校验表达式</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">提交</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
