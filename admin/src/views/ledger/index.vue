<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import {
  getLedgerSummary,
  listLedger,
  runReconcile,
  type LedgerEntry,
  type LedgerSummary,
  type ReconcileReport,
} from '@/api/ledger'
import { formatAmount, formatTime } from '@/utils/format'

const loading = ref(false)
const list = ref<LedgerEntry[]>([])
const total = ref(0)
const summary = ref<LedgerSummary | null>(null)
const query = reactive({
  shopId: undefined as number | undefined,
  category: '',
  startTime: undefined as number | undefined,
  endTime: undefined as number | undefined,
  page: 1,
  pageSize: 20,
})

const reconcileLoading = ref(false)
const reconcileReport = ref<ReconcileReport | null>(null)
const reconcileShopId = ref<number | undefined>(undefined)

const categoryLabel: Record<string, string> = {
  order_income: '订单收入',
  refund: '退款',
  commission: '佣金',
  withdrawal: '提现',
  adjustment: '调整',
}

async function fetchList() {
  loading.value = true
  try {
    const resp = await listLedger({ ...query })
    list.value = resp.entries ?? []
    total.value = resp.total ?? 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

async function fetchSummary() {
  try {
    summary.value = await getLedgerSummary({
      shopId: query.shopId,
      startTime: query.startTime,
      endTime: query.endTime,
    })
  } catch {
    summary.value = null
  }
}

async function refresh() {
  await Promise.all([fetchList(), fetchSummary()])
}

async function reconcile() {
  reconcileLoading.value = true
  try {
    reconcileReport.value = await runReconcile({ shopId: reconcileShopId.value })
    ElMessage.success(`对账完成：${reconcileReport.value.passed}/${reconcileReport.value.totalChecked} 通过`)
  } finally {
    reconcileLoading.value = false
  }
}

function onReset() {
  query.shopId = undefined
  query.category = ''
  query.startTime = undefined
  query.endTime = undefined
  query.page = 1
  refresh()
}

onMounted(refresh)
</script>

<template>
  <PageContainer title="账本流水">
    <el-row :gutter="16" style="margin-bottom: 16px" v-if="summary">
      <el-col :span="5"><el-statistic title="订单收入" :value="summary.totalIncome / 100" :precision="2" /></el-col>
      <el-col :span="5"><el-statistic title="退款" :value="summary.totalRefund / 100" :precision="2" /></el-col>
      <el-col :span="4"><el-statistic title="佣金" :value="summary.totalCommission / 100" :precision="2" /></el-col>
      <el-col :span="5"><el-statistic title="提现" :value="summary.totalWithdrawal / 100" :precision="2" /></el-col>
      <el-col :span="5"><el-statistic title="净额" :value="summary.netBalance / 100" :precision="2" /></el-col>
    </el-row>

    <el-form inline>
      <el-form-item label="店铺 ID">
        <el-input-number v-model="query.shopId" :min="0" controls-position="right" style="width: 140px" />
      </el-form-item>
      <el-form-item label="类别">
        <el-select v-model="query.category" clearable placeholder="全部" style="width: 140px">
          <el-option label="订单收入" value="order_income" />
          <el-option label="退款" value="refund" />
          <el-option label="佣金" value="commission" />
          <el-option label="提现" value="withdrawal" />
          <el-option label="调整" value="adjustment" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="refresh">查询</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="shopId" label="店铺" width="80" />
      <el-table-column label="方向" width="80">
        <template #default="{ row }">
          <el-tag :type="row.direction === 1 ? 'success' : 'danger'">
            {{ row.direction === 1 ? '入账' : '出账' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="类别" width="110">
        <template #default="{ row }">{{ categoryLabel[row.category] || row.category }}</template>
      </el-table-column>
      <el-table-column label="金额" width="120">
        <template #default="{ row }">{{ formatAmount(row.amount) }}</template>
      </el-table-column>
      <el-table-column label="结余" width="120">
        <template #default="{ row }">{{ formatAmount(row.runningBalance) }}</template>
      </el-table-column>
      <el-table-column prop="refNo" label="单号" min-width="180" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column label="时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <template #empty><el-empty description="暂无数据" /></template>
    </el-table>

    <div style="margin-top: 16px; text-align: right">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @current-change="fetchList"
        @size-change="fetchList"
      />
    </div>

    <el-divider />

    <el-card>
      <template #header><span>对账</span></template>
      <el-form inline>
        <el-form-item label="店铺 ID (0=全部)">
          <el-input-number v-model="reconcileShopId" :min="0" controls-position="right" style="width: 140px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="reconcileLoading" @click="reconcile">执行对账</el-button>
        </el-form-item>
      </el-form>
      <div v-if="reconcileReport">
        <p>总计: {{ reconcileReport.totalChecked }} / 通过: {{ reconcileReport.passed }} / 失败: {{ reconcileReport.failed }}</p>
        <el-table :data="reconcileReport.results" border size="small">
          <el-table-column prop="shopId" label="店铺" width="80" />
          <el-table-column label="账本入账" width="120">
            <template #default="{ row }">{{ formatAmount(row.ledgerCredit) }}</template>
          </el-table-column>
          <el-table-column label="账本出账" width="120">
            <template #default="{ row }">{{ formatAmount(row.ledgerDebit) }}</template>
          </el-table-column>
          <el-table-column label="账本净额" width="120">
            <template #default="{ row }">{{ formatAmount(row.ledgerNet) }}</template>
          </el-table-column>
          <el-table-column label="钱包余额" width="120">
            <template #default="{ row }">{{ formatAmount(row.walletBalance) }}</template>
          </el-table-column>
          <el-table-column label="钱包冻结" width="120">
            <template #default="{ row }">{{ formatAmount(row.walletFrozen) }}</template>
          </el-table-column>
          <el-table-column label="钱包合计" width="120">
            <template #default="{ row }">{{ formatAmount(row.walletTotal) }}</template>
          </el-table-column>
          <el-table-column label="差额" width="100">
            <template #default="{ row }">{{ formatAmount(row.diff) }}</template>
          </el-table-column>
          <el-table-column label="结果" width="80">
            <template #default="{ row }">
              <el-tag :type="row.passed ? 'success' : 'danger'">
                {{ row.passed ? '通过' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </PageContainer>
</template>
