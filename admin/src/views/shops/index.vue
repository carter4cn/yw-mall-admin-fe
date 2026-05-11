<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import { listShops, updateShopCredit, updateShopStatus } from '@/api/shops'
import type { Shop } from '@/types/api'
import { formatTime } from '@/utils/format'

const loading = ref(false)
const list = ref<Shop[]>([])
const total = ref(0)
const query = reactive({ page: 1, page_size: 10 })

const statusDialog = ref(false)
const creditDialog = ref(false)
const current = ref<Shop | null>(null)
const statusForm = reactive({ status: 1, reason: '' })
const creditForm = reactive({ delta: 0, reason: '' })
const statusRef = ref<FormInstance>()
const creditRef = ref<FormInstance>()
const submitting = ref(false)

const statusRules: FormRules = {
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}
const creditRules: FormRules = {
  delta: [{ required: true, message: '请输入加减分数', trigger: 'blur' }],
}

async function fetchList() {
  loading.value = true
  try {
    const resp = await listShops({ page: query.page, page_size: query.page_size })
    list.value = resp.shops ?? []
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

function openStatus(row: Shop) {
  current.value = row
  Object.assign(statusForm, { status: row.status, reason: '' })
  statusDialog.value = true
}

function openCredit(row: Shop) {
  current.value = row
  Object.assign(creditForm, { delta: 0, reason: '' })
  creditDialog.value = true
}

async function submitStatus() {
  if (!current.value || !statusRef.value) return
  const ok = await statusRef.value.validate().catch(() => false)
  if (!ok) return
  submitting.value = true
  try {
    await updateShopStatus(current.value.id, { ...statusForm })
    ElMessage.success('已更新')
    statusDialog.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

async function submitCredit() {
  if (!current.value || !creditRef.value) return
  const ok = await creditRef.value.validate().catch(() => false)
  if (!ok) return
  submitting.value = true
  try {
    await updateShopCredit(current.value.id, { ...creditForm })
    ElMessage.success('已调整')
    creditDialog.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

onMounted(fetchList)
</script>

<template>
  <PageContainer title="店家管理">
    <el-form inline>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="店铺名" />
      <el-table-column prop="ownerUserId" label="店主 UID" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <StatusTag :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="level" label="等级" width="80" />
      <el-table-column prop="creditScore" label="信用分" width="100" />
      <el-table-column prop="productCount" label="商品数" width="100" />
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openStatus(row)">改状态</el-button>
          <el-button size="small" @click="openCredit(row)">加减分</el-button>
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

    <el-dialog v-model="statusDialog" title="修改店铺状态" width="420px">
      <el-form ref="statusRef" :model="statusForm" :rules="statusRules" label-width="80px">
        <el-form-item label="状态" prop="status">
          <el-select v-model="statusForm.status" style="width: 100%">
            <el-option label="正常" :value="1" />
            <el-option label="冻结" :value="2" />
            <el-option label="下架" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="statusForm.reason" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitStatus">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="creditDialog" title="信用分调整" width="420px">
      <el-form ref="creditRef" :model="creditForm" :rules="creditRules" label-width="80px">
        <el-form-item label="分数" prop="delta">
          <el-input-number v-model="creditForm.delta" :min="-100" :max="100" />
          <span style="margin-left: 8px; color: #909399">正数加分 / 负数减分</span>
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="creditForm.reason" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="creditDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitCredit">提交</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
