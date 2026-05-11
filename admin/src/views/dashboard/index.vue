<script setup lang="ts">
import PageContainer from '@/components/PageContainer.vue'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
</script>

<template>
  <PageContainer title="首页">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="用户名">{{ user.username || '-' }}</el-descriptions-item>
      <el-descriptions-item label="角色">{{ user.role || '-' }}</el-descriptions-item>
      <el-descriptions-item label="UID">{{ user.uid }}</el-descriptions-item>
      <el-descriptions-item label="店铺 ID">{{ user.shopId }}</el-descriptions-item>
      <el-descriptions-item label="权限" :span="2">
        <el-tag v-for="p in user.perms" :key="p" style="margin-right: 4px">{{ p }}</el-tag>
        <span v-if="!user.perms.length">{{ user.role === 'super_admin' ? '全部' : '无' }}</span>
      </el-descriptions-item>
    </el-descriptions>
    <el-alert
      style="margin-top: 16px"
      title="欢迎使用 yw-mall 后台管理系统"
      type="info"
      :closable="false"
      description="左侧菜单按业务分组：运营、商品订单、客服、营销、风控、系统。"
    />
  </PageContainer>
</template>
