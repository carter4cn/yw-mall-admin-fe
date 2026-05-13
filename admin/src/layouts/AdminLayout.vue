<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

interface MenuItem {
  path: string
  title: string
  icon: string
}

const groups: { name: string; items: MenuItem[] }[] = [
  {
    name: '运营',
    items: [
      { path: '/shop-applications', title: '入驻审核', icon: 'DocumentChecked' },
      { path: '/shops', title: '店家管理', icon: 'Shop' },
      { path: '/users', title: '用户管理', icon: 'User' },
    ],
  },
  {
    name: '商品订单',
    items: [
      { path: '/products-review', title: '商品审核', icon: 'Goods' },
      { path: '/withdrawals', title: '提现审核', icon: 'Money' },
    ],
  },
  {
    name: '客服',
    items: [
      { path: '/review-delete', title: '评论删除', icon: 'ChatLineSquare' },
      { path: '/complaints', title: '投诉处理', icon: 'Warning' },
      { path: '/refund-requests', title: '退款仲裁', icon: 'Refresh' },
    ],
  },
  {
    name: '营销',
    items: [
      { path: '/activities', title: '活动管理', icon: 'Present' },
      { path: '/rules', title: '规则管理', icon: 'SetUp' },
    ],
  },
  {
    name: '风控',
    items: [
      { path: '/restrictions', title: '店家限制', icon: 'Lock' },
      { path: '/level-applications', title: '等级申请', icon: 'Medal' },
      { path: '/lifecycle-requests', title: '注销申请', icon: 'CircleClose' },
      { path: '/sensitive-words', title: '敏感词库', icon: 'Filter' },
    ],
  },
  {
    name: '系统',
    items: [{ path: '/accounts', title: '账号管理', icon: 'UserFilled' }],
  },
]

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => (route.meta?.title as string) ?? '')
const currentGroup = computed(() => (route.meta?.group as string) ?? '')

function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<template>
  <el-container class="layout-root">
    <el-aside width="240px" class="aside">
      <div class="logo">yw-mall 后台</div>
      <el-menu
        :default-active="activeMenu"
        router
        class="menu"
        background-color="#001529"
        text-color="#cbd5e1"
        active-text-color="#fff"
      >
        <template v-for="g in groups" :key="g.name">
          <el-menu-item-group :title="g.name">
            <el-menu-item v-for="m in g.items" :key="m.path" :index="m.path">
              <el-icon><component :is="m.icon" /></el-icon>
              <template #title>{{ m.title }}</template>
            </el-menu-item>
          </el-menu-item-group>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-if="currentGroup">{{ currentGroup }}</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="28">{{ (userStore.username || 'A').charAt(0).toUpperCase() }}</el-avatar>
            <span class="username">{{ userStore.username || '管理员' }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>角色: {{ userStore.role || '-' }}</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-root {
  height: 100vh;
}
.aside {
  background-color: #001529;
  color: #fff;
  overflow-y: auto;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  border-bottom: 1px solid #1a2a40;
}
.menu {
  border-right: 0;
}
.menu :deep(.el-menu-item.is-active) {
  background-color: #1a73e8;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
}
.user-info {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.username {
  font-size: 14px;
}
.main {
  background-color: #f5f7fa;
  padding: 16px;
}
</style>
