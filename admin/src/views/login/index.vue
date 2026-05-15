<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { login as loginApi, mfaLogin, mfaSmsSend } from '@/api/auth'
import type { LoginResponse } from '@/types/api'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

type Mode = 'password' | 'mfa'
const mode = ref<Mode>('password')

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = ref({
  username: 'admin',
  password: 'admin123',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const challengeToken = ref('')
const mfaCode = ref('')
const smsLoading = ref(false)

function applySession(resp: LoginResponse) {
  userStore.setSession({
    accessToken: resp.token,
    refreshToken: resp.refreshToken,
    csrfToken: resp.csrfToken,
    expiresIn: resp.expiresIn,
    uid: resp.uid ?? resp.id ?? 0,
    role: resp.role,
    perms: resp.perms ?? resp.permissions ?? [],
    shopId: resp.shopId ?? 0,
    username: resp.username ?? form.value.username,
  })
}

async function onSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const resp = await loginApi({ username: form.value.username, password: form.value.password })
    if (resp.mfaRequired) {
      // Token/RefreshToken are empty here — switch to MFA stage and stash the challenge.
      challengeToken.value = resp.challengeToken ?? ''
      mode.value = 'mfa'
      mfaCode.value = ''
      ElMessage.info('请输入 MFA 验证码')
      return
    }
    applySession(resp)
    finishLogin(resp)
  } catch {
    // ElMessage handled in interceptor
  } finally {
    loading.value = false
  }
}

async function onMfaSubmit() {
  if (!challengeToken.value || mfaCode.value.length !== 6) {
    ElMessage.warning('请输入 6 位验证码')
    return
  }
  loading.value = true
  try {
    const resp = await mfaLogin({ challengeToken: challengeToken.value, code: mfaCode.value })
    applySession(resp)
    finishLogin(resp)
  } catch {
    // interceptor surfaces the message
  } finally {
    loading.value = false
  }
}

async function onRequestSms() {
  if (!challengeToken.value) return
  smsLoading.value = true
  try {
    await mfaSmsSend({ challengeToken: challengeToken.value })
    ElMessage.success('短信已发送（开发模式：查看 user-rpc 日志）')
  } finally {
    smsLoading.value = false
  }
}

function backToPassword() {
  // Returning here invalidates the in-flight challenge token (server is single-use
  // anyway), so just wipe state and let the user re-enter password.
  challengeToken.value = ''
  mfaCode.value = ''
  mode.value = 'password'
}

function finishLogin(resp: LoginResponse) {
  ElMessage.success('登录成功')
  if (resp.passwordExpired) {
    ElMessage.warning('密码已过期，请立即修改')
    router.replace('/security/password')
    return
  }
  const redirect = (route.query.redirect as string) || '/'
  router.replace(redirect)
}
</script>

<template>
  <div class="login-page">
    <el-card class="login-card" shadow="always">
      <div class="title">yw-mall 后台</div>
      <div class="subtitle">平台管理员登录</div>

      <el-form
        v-if="mode === 'password'"
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="onSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%" @click="onSubmit">
          登录
        </el-button>
      </el-form>

      <div v-else class="mfa-stage">
        <div class="mfa-hint">请输入 Authenticator 中的 6 位验证码</div>
        <el-input
          v-model="mfaCode"
          maxlength="6"
          placeholder="6 位验证码"
          @keyup.enter="onMfaSubmit"
        />
        <el-button type="primary" :loading="loading" style="width: 100%; margin-top: 12px" @click="onMfaSubmit">
          验证并登录
        </el-button>
        <div class="mfa-actions">
          <el-button link :loading="smsLoading" @click="onRequestSms">使用短信验证码</el-button>
          <el-button link @click="backToPassword">返回重新输入密码</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a73e8, #6ec1e4);
}
.login-card {
  width: 360px;
  border-radius: 8px;
}
.title {
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 6px;
}
.subtitle {
  text-align: center;
  color: #909399;
  font-size: 13px;
  margin-bottom: 16px;
}
.mfa-stage {
  display: flex;
  flex-direction: column;
}
.mfa-hint {
  text-align: center;
  color: #606266;
  font-size: 13px;
  margin-bottom: 12px;
}
.mfa-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}
</style>
