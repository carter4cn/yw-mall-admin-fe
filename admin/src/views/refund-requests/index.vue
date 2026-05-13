<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import {
  arbitrateRefund,
  listArbitrations,
  type RefundInfo,
} from '@/api/refundRequests'
import { formatAmount, formatTime } from '@/utils/format'

const loading = ref(false)
const list = ref<RefundInfo[]>([])
const total = ref(0)
const query = reactive({ page: 1, page_size: 10 })

const dialogVisible = ref(false)
const current = ref<RefundInfo | null>(null)
const form = reactive({ action: 1, remark: '' })
const formRef = ref<FormInstance>()
const submitting = ref(false)
const rules: FormRules = {
  action: [{ required: true, message: '请选择处理结果', trigger: 'change' }],
}

const STATUS_TEXT: Record<number, { text: string; type: 'info' | 'success' | 'danger' | 'warning' }> = {
  0: { text: '待处理', type: 'warning' },
  1: { text: '商家同意', type: 'success' },
  2: { text: '商家拒绝', type: 'danger' },
  3: { text: '仲裁中', type: 'warning' },
  4: { text: '已退款', type: 'success' },
  5: { text: '最终驳回', type: 'danger' },
}

function statusTag(s: number) {
  return STATUS_TEXT[s] ?? { text: String(s), type: 'info' as const }
}

async function fetchList() {
  loading.value = true
  try {
    const resp = await listArbitrations({ ...query })
    list.value = resp.requests ?? []
    total.value = resp.total ?? 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openHandle(row: RefundInfo) {
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
    await arbitrateRefund(current.value.id, { action: form.action, remark: form.remark })
    ElMessage.success('已处理')
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

onMounted(fetchList)
</script>

<template>
  <PageContainer title="退款仲裁">
    <el-alert
      type="info"
      :closable="false"
      title="仅展示已进入「平台仲裁」状态（status=3）的退款申请"
      style="margin-bottom: 12px"
    />

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="orderNo" label="订单号" min-width="160" show-overflow-tooltip />
      <el-table-column prop="userId" label="用户" width="80" />
      <el-table-column prop="shopId" label="店家" width="80" />
      <el-table-column label="金额" width="120">
        <template #default="{ row }">{{ formatAmount(row.amount) }}</template>
      </el-table-column>
      <el-table-column prop="reason" label="原因" show-overflow-tooltip min-width="160" />
      <el-table-column prop="appealReason" label="申诉理由" show-overflow-tooltip min-width="180" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status).type" disable-transitions>
            {{ statusTag(row.status).text }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openHandle(row)">仲裁</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无仲裁中退款" /></template>
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

    <el-dialog v-model="dialogVisible" title="退款仲裁" width="520px">
      <el-descriptions v-if="current" :column="2" border size="small">
        <el-descriptions-item label="订单号">{{ current.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="退款金额">{{ formatAmount(current.amount) }}</el-descriptions-item>
        <el-descriptions-item label="用户原因" :span="2">{{ current.reason }}</el-descriptions-item>
        <el-descriptions-item label="商家备注" :span="2">{{ current.merchantRemark || '—' }}</el-descriptions-item>
        <el-descriptions-item label="申诉理由" :span="2">{{ current.appealReason || '—' }}</el-descriptions-item>
      </el-descriptions>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="margin-top: 12px">
        <el-form-item label="处理结果" prop="action">
          <el-radio-group v-model="form.action">
            <el-radio :value="1">强制退款</el-radio>
            <el-radio :value="2">最终驳回</el-radio>
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
