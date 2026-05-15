<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import { listPendingKyc, auditKyc, type KycPendingItemDTO } from '@/api/kyc'
import { formatTime } from '@/utils/format'

const loading = ref(false)
const list = ref<KycPendingItemDTO[]>([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 20 })

const dialogVisible = ref(false)
const current = ref<KycPendingItemDTO | null>(null)
const showFullId = ref(false)
const rejectMode = ref(false)
const rejectReason = ref('')
const submitting = ref(false)

function mask(idCardNo: string): string {
  if (!idCardNo || idCardNo.length < 10) return idCardNo
  return idCardNo.slice(0, 4) + '********' + idCardNo.slice(-4)
}

async function fetchList() {
  loading.value = true
  try {
    const resp = await listPendingKyc({ ...query })
    list.value = resp.items ?? []
    total.value = resp.total ?? 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openMaterial(row: KycPendingItemDTO) {
  current.value = row
  showFullId.value = false
  rejectMode.value = false
  rejectReason.value = ''
  dialogVisible.value = true
}

async function doAudit(pass: boolean) {
  if (!current.value) return
  if (!pass && !rejectReason.value.trim()) {
    ElMessage.warning('请填写驳回原因')
    return
  }
  submitting.value = true
  try {
    await auditKyc(current.value.userId, pass, pass ? undefined : rejectReason.value.trim())
    ElMessage.success(pass ? '已通过' : '已驳回')
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

onMounted(fetchList)
</script>

<template>
  <PageContainer title="KYC 审核">
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="userId" label="用户 ID" width="90" />
      <el-table-column prop="username" label="用户名" width="130" show-overflow-tooltip />
      <el-table-column prop="realName" label="真实姓名" width="110" />
      <el-table-column label="身份证号" width="220">
        <template #default="{ row }">
          <el-input :value="row.idCardNo" readonly style="width: 180px" />
        </template>
      </el-table-column>
      <el-table-column label="提交时间" width="180">
        <template #default="{ row }">{{ formatTime(row.submitTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openMaterial(row)">查看材料</el-button>
        </template>
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

    <el-dialog v-model="dialogVisible" title="KYC 材料审核" width="640px">
      <template v-if="current">
        <el-descriptions :column="2" border size="small" style="margin-bottom: 16px">
          <el-descriptions-item label="用户 ID">{{ current.userId }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ current.username }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ current.realName }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">
            <span>{{ showFullId ? current.idCardNo : mask(current.idCardNo) }}</span>
            <el-button link size="small" style="margin-left: 8px" @click="showFullId = !showFullId">
              {{ showFullId ? '隐藏' : '显示完整' }}
            </el-button>
          </el-descriptions-item>
        </el-descriptions>

        <el-row :gutter="12">
          <el-col :span="12">
            <div style="margin-bottom: 6px; font-size: 13px; color: #606266">身份证正面</div>
            <el-image
              :src="current.idCardFrontUrl"
              fit="contain"
              style="width: 100%; height: 180px; border: 1px solid #dcdfe6; border-radius: 4px"
              :preview-src-list="[current.idCardFrontUrl]"
            />
          </el-col>
          <el-col :span="12">
            <div style="margin-bottom: 6px; font-size: 13px; color: #606266">身份证背面</div>
            <el-image
              :src="current.idCardBackUrl"
              fit="contain"
              style="width: 100%; height: 180px; border: 1px solid #dcdfe6; border-radius: 4px"
              :preview-src-list="[current.idCardBackUrl]"
            />
          </el-col>
        </el-row>

        <template v-if="current.faceVideoUrl">
          <div style="margin-top: 12px; margin-bottom: 6px; font-size: 13px; color: #606266">人脸视频</div>
          <video
            :src="current.faceVideoUrl"
            controls
            style="width: 100%; max-height: 240px; border-radius: 4px; background: #000"
          />
        </template>

        <template v-if="rejectMode">
          <div style="margin-top: 16px">
            <el-input
              v-model="rejectReason"
              type="textarea"
              :rows="3"
              placeholder="请输入驳回原因（必填）"
            />
          </div>
        </template>
      </template>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <template v-if="!rejectMode">
          <el-button type="danger" @click="rejectMode = true">驳回</el-button>
          <el-button type="success" :loading="submitting" @click="doAudit(true)">通过</el-button>
        </template>
        <template v-else>
          <el-button @click="rejectMode = false">返回</el-button>
          <el-button type="danger" :loading="submitting" @click="doAudit(false)">确认驳回</el-button>
        </template>
      </template>
    </el-dialog>
  </PageContainer>
</template>
