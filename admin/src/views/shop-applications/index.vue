<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import { getShopApplication, listShopApplications, reviewShopApplication } from '@/api/shopApplications'
import type { ShopApplication } from '@/types/api'
import { formatTime } from '@/utils/format'

const loading = ref(false)
const list = ref<ShopApplication[]>([])
const total = ref(0)
const query = reactive({ page: 1, page_size: 10, status: undefined as number | undefined })

const dialogVisible = ref(false)
const detail = ref<ShopApplication | null>(null)
const reviewForm = reactive({ action: 1, remark: '' })
const reviewRef = ref<FormInstance>()
const reviewLoading = ref(false)

const rules: FormRules = {
  action: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
}

async function fetchList() {
  loading.value = true
  try {
    const resp = await listShopApplications({ ...query })
    list.value = resp.applications ?? []
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
  query.status = undefined
  query.page = 1
  fetchList()
}

async function openReview(row: ShopApplication) {
  try {
    detail.value = await getShopApplication(row.id)
  } catch {
    detail.value = row
  }
  Object.assign(reviewForm, { action: 1, remark: '' })
  dialogVisible.value = true
}

async function submitReview() {
  if (!detail.value || !reviewRef.value) return
  const ok = await reviewRef.value.validate().catch(() => false)
  if (!ok) return
  reviewLoading.value = true
  try {
    await reviewShopApplication(detail.value.id, { action: reviewForm.action, remark: reviewForm.remark })
    ElMessage.success('已提交')
    dialogVisible.value = false
    fetchList()
  } finally {
    reviewLoading.value = false
  }
}

onMounted(fetchList)
</script>

<template>
  <PageContainer title="入驻审核">
    <el-form inline>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
          <el-option label="待审核" :value="0" />
          <el-option label="通过" :value="1" />
          <el-option label="驳回" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="shopName" label="店铺名称" />
      <el-table-column prop="legalPerson" label="法人" />
      <el-table-column prop="contactPhone" label="联系电话" />
      <el-table-column prop="category" label="类目" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <StatusTag :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="提交时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openReview(row)">审核</el-button>
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

    <el-dialog v-model="dialogVisible" title="入驻审核" width="560px">
      <el-descriptions v-if="detail" :column="2" border size="small" style="margin-bottom: 12px">
        <el-descriptions-item label="店铺名称">{{ detail.shopName }}</el-descriptions-item>
        <el-descriptions-item label="法人">{{ detail.legalPerson }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detail.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="类目">{{ detail.category }}</el-descriptions-item>
        <el-descriptions-item label="提交时间" :span="2">{{ formatTime(detail.createTime) }}</el-descriptions-item>
      </el-descriptions>
      <el-form ref="reviewRef" :model="reviewForm" :rules="rules" label-width="80px">
        <el-form-item label="审核结果" prop="action">
          <el-radio-group v-model="reviewForm.action">
            <el-radio :value="1">通过</el-radio>
            <el-radio :value="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="reviewForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="reviewLoading" @click="submitReview">提交</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
