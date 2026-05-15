<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import { listIpWhitelist, addIpWhitelist, deleteIpWhitelist } from '@/api/security'
import type { IpWhitelistEntry } from '@/api/security'
import { formatTime } from '@/utils/format'

const loading = ref(false)
const list = ref<IpWhitelistEntry[]>([])

const dialogVisible = ref(false)
const submitting = ref(false)
const form = reactive({ cidr: '', note: '' })

async function fetchList() {
  loading.value = true
  try {
    const resp = await listIpWhitelist()
    list.value = resp.items ?? []
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openDialog() {
  form.cidr = ''
  form.note = ''
  dialogVisible.value = true
}

async function handleAdd() {
  if (!form.cidr.trim()) {
    ElMessage.warning('请输入 IP 或 CIDR')
    return
  }
  submitting.value = true
  try {
    await addIpWhitelist(form.cidr.trim(), form.note.trim() || undefined)
    ElMessage.success('已添加')
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await deleteIpWhitelist(id)
    ElMessage.success('已删除')
    fetchList()
  } catch {
    // error surfaced by request interceptor
  }
}

onMounted(fetchList)
</script>

<template>
  <PageContainer title="IP 白名单">
    <div style="margin-bottom: 16px">
      <el-button type="primary" @click="openDialog">新增</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="cidr" label="IP / CIDR" width="180" />
      <el-table-column prop="note" label="备注" show-overflow-tooltip />
      <el-table-column label="添加时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-popconfirm title="确认删除该条目？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button size="small" type="danger" plain>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="未设置白名单 = 不限制 IP" />
      </template>
    </el-table>

    <el-dialog v-model="dialogVisible" title="新增 IP 白名单" width="440px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="IP / CIDR" required>
          <el-input v-model="form.cidr" placeholder="如 1.2.3.4 或 10.0.0.0/24" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.note" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleAdd">确认</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
