<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import {
  addShopRestriction,
  listShopRestrictions,
  removeShopRestriction,
} from '@/api/restrictions'
import type { Restriction } from '@/types/api'
import { formatTime } from '@/utils/format'

const queryShopId = ref<number | null>(null)
const loading = ref(false)
const list = ref<Restriction[]>([])

const dialogVisible = ref(false)
const form = reactive({ restriction: '', reason: '', expireTime: 0 })
const formRef = ref<FormInstance>()
const submitting = ref(false)
const rules: FormRules = {
  restriction: [{ required: true, message: '请输入限制类型', trigger: 'blur' }],
}

async function fetchList() {
  if (!queryShopId.value) {
    ElMessage.warning('请输入店铺 ID')
    return
  }
  loading.value = true
  try {
    const resp = await listShopRestrictions(queryShopId.value)
    list.value = resp.restrictions ?? []
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openAdd() {
  if (!queryShopId.value) {
    ElMessage.warning('请先输入店铺 ID')
    return
  }
  Object.assign(form, { restriction: '', reason: '', expireTime: 0 })
  dialogVisible.value = true
}

async function submit() {
  if (!queryShopId.value || !formRef.value) return
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return
  submitting.value = true
  try {
    await addShopRestriction(queryShopId.value, { ...form })
    ElMessage.success('已添加')
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

async function onRemove(row: Restriction) {
  if (!queryShopId.value) return
  try {
    await ElMessageBox.confirm(`确认删除限制 #${row.id}?`, '提示', { type: 'warning' })
  } catch {
    return
  }
  await removeShopRestriction(queryShopId.value, row.id)
  ElMessage.success('已删除')
  fetchList()
}
</script>

<template>
  <PageContainer title="店家限制">
    <el-form inline>
      <el-form-item label="店铺 ID">
        <el-input-number v-model="queryShopId" :min="1" placeholder="输入 ID" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchList">查询</el-button>
        <el-button type="success" @click="openAdd">新增限制</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="restriction" label="限制类型" />
      <el-table-column prop="reason" label="原因" />
      <el-table-column prop="operatorId" label="操作人" width="100" />
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="到期时间" width="180">
        <template #default="{ row }">{{ formatTime(row.expireTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="onRemove(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无数据" /></template>
    </el-table>

    <el-dialog v-model="dialogVisible" title="新增限制" width="480px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="限制类型" prop="restriction">
          <el-input v-model="form.restriction" placeholder="如 NO_NEW_PRODUCT" />
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="form.reason" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="到期(unix秒)">
          <el-input-number v-model="form.expireTime" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">提交</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
