<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import { mfaStatus, mfaEnable, mfaConfirm, mfaDisable } from '@/api/security'
import type { MfaStatusResp, MfaEnableResp } from '@/api/security'
import { formatTime } from '@/utils/format'

// 0 = not enabled, 1 = setup (show QR + confirm), 2 = enabled
const step = ref(0)
const status = ref<MfaStatusResp>({ enabled: false, lastUsedAt: 0 })
const enableResp = ref<MfaEnableResp | null>(null)
const confirmCode = ref('')
const confirmLoading = ref(false)

const disableDialogVisible = ref(false)
const disableCode = ref('')
const disableLoading = ref(false)

async function fetchStatus() {
  try {
    status.value = await mfaStatus()
    step.value = status.value.enabled ? 2 : 0
  } catch {
    // error surfaced by request interceptor
  }
}

async function handleEnable() {
  try {
    enableResp.value = await mfaEnable()
    step.value = 1
  } catch {
    // ignore
  }
}

async function handleConfirm() {
  if (!confirmCode.value || confirmCode.value.length !== 6) {
    ElMessage.warning('请输入 6 位验证码')
    return
  }
  confirmLoading.value = true
  try {
    await mfaConfirm(confirmCode.value)
    ElMessage.success('MFA 已开启')
    confirmCode.value = ''
    await fetchStatus()
  } finally {
    confirmLoading.value = false
  }
}

function openDisableDialog() {
  disableCode.value = ''
  disableDialogVisible.value = true
}

async function handleDisable() {
  if (!disableCode.value || disableCode.value.length !== 6) {
    ElMessage.warning('请输入 6 位验证码')
    return
  }
  disableLoading.value = true
  try {
    await mfaDisable(disableCode.value)
    ElMessage.success('MFA 已禁用')
    disableDialogVisible.value = false
    await fetchStatus()
  } finally {
    disableLoading.value = false
  }
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => ElMessage.success('已复制'))
}

onMounted(fetchStatus)
</script>

<template>
  <PageContainer title="双因素认证 (MFA)">
    <!-- Step 0: not enabled -->
    <div v-if="step === 0" style="text-align: center; padding: 48px 0">
      <el-icon style="font-size: 64px; color: #909399; margin-bottom: 16px"><Lock /></el-icon>
      <p style="color: #606266; margin-bottom: 24px">当前未启用 MFA，启用后登录需额外验证身份</p>
      <el-button type="primary" size="large" @click="handleEnable">启用 MFA</el-button>
    </div>

    <!-- Step 1: setup — show secret + backup codes + confirm -->
    <div v-else-if="step === 1 && enableResp" style="max-width: 560px; margin: 0 auto">
      <el-steps :active="1" finish-status="success" style="margin-bottom: 32px">
        <el-step title="生成密钥" />
        <el-step title="绑定验证器" />
        <el-step title="完成" />
      </el-steps>

      <el-descriptions title="绑定信息" :column="1" border>
        <el-descriptions-item label="密钥 (Secret)">
          <span style="font-family: monospace; letter-spacing: 2px">{{ enableResp.totpSecret }}</span>
          <el-button link type="primary" style="margin-left: 8px" @click="copyText(enableResp!.totpSecret)">复制</el-button>
        </el-descriptions-item>
        <el-descriptions-item label="Auth URI">
          <a :href="enableResp.qrUrl" target="_blank" style="word-break: break-all; font-size: 12px">{{ enableResp.qrUrl }}</a>
        </el-descriptions-item>
      </el-descriptions>

      <el-alert
        title="备份码（请妥善保存，关闭页面后不再显示）"
        type="warning"
        :closable="false"
        style="margin-top: 20px"
      >
        <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px">
          <el-tag v-for="code in enableResp.backupCodes" :key="code" type="warning" style="font-family: monospace">
            {{ code }}
          </el-tag>
        </div>
      </el-alert>

      <el-form style="margin-top: 24px" @submit.prevent="handleConfirm">
        <el-form-item label="验证码" label-width="80px">
          <el-input
            v-model="confirmCode"
            maxlength="6"
            placeholder="请在验证器 App 中获取 6 位码"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label-width="80px">
          <el-button type="primary" :loading="confirmLoading" @click="handleConfirm">确认开启</el-button>
          <el-button @click="step = 0">取消</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Step 2: enabled -->
    <div v-else-if="step === 2" style="max-width: 480px; margin: 0 auto; padding: 32px 0">
      <el-result icon="success" title="MFA 已开启">
        <template #sub-title>
          <p v-if="status.lastUsedAt">上次使用：{{ formatTime(status.lastUsedAt) }}</p>
          <p v-else>尚未使用过</p>
        </template>
        <template #extra>
          <el-button type="danger" plain @click="openDisableDialog">禁用 MFA</el-button>
        </template>
      </el-result>
    </div>

    <!-- Disable dialog -->
    <el-dialog v-model="disableDialogVisible" title="禁用 MFA" width="400px">
      <p style="margin-bottom: 16px; color: #606266">请输入当前验证器中的 6 位验证码以确认禁用</p>
      <el-input
        v-model="disableCode"
        maxlength="6"
        placeholder="6 位验证码"
        style="width: 100%"
      />
      <template #footer>
        <el-button @click="disableDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="disableLoading" @click="handleDisable">确认禁用</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
