<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import { changePassword } from '@/api/security'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const rules: FormRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value: string, callback) => {
        if (value.length < 8) return callback(new Error('密码不能少于 8 位'))
        if (!/[a-zA-Z]/.test(value)) return callback(new Error('密码需包含至少 1 个字母'))
        if (!/\d/.test(value)) return callback(new Error('密码需包含至少 1 个数字'))
        callback()
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule, value: string, callback) => {
        if (value !== form.newPassword) return callback(new Error('两次输入的密码不一致'))
        callback()
      },
      trigger: 'blur',
    },
  ],
}

async function submit() {
  if (!formRef.value) return
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return
  submitting.value = true
  try {
    await changePassword(form.oldPassword, form.newPassword)
    ElMessage.success('密码已修改，请重新登录')
    userStore.clear()
    router.replace('/login')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <PageContainer title="修改密码">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      style="max-width: 480px"
    >
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input v-model="form.oldPassword" type="password" show-password placeholder="请输入旧密码" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="form.newPassword" type="password" show-password placeholder="至少 8 位，含字母和数字" />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
      </el-form-item>
      <el-form-item label-width="100px">
        <el-button type="primary" :loading="submitting" @click="submit">确认修改</el-button>
        <el-button @click="formRef?.resetFields()">重置</el-button>
      </el-form-item>
    </el-form>
  </PageContainer>
</template>
