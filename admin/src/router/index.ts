import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'House' },
      },
      // 运营
      {
        path: 'shop-applications',
        name: 'ShopApplications',
        component: () => import('@/views/shop-applications/index.vue'),
        meta: { title: '入驻审核', icon: 'DocumentChecked', group: '运营' },
      },
      {
        path: 'shops',
        name: 'Shops',
        component: () => import('@/views/shops/index.vue'),
        meta: { title: '店家管理', icon: 'Shop', group: '运营' },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/index.vue'),
        meta: { title: '用户管理', icon: 'User', group: '运营' },
      },
      // 商品订单
      {
        path: 'products-review',
        name: 'ProductsReview',
        component: () => import('@/views/products-review/index.vue'),
        meta: { title: '商品审核', icon: 'Goods', group: '商品订单' },
      },
      {
        path: 'withdrawals',
        name: 'Withdrawals',
        component: () => import('@/views/withdrawals/index.vue'),
        meta: { title: '提现审核', icon: 'Money', group: '商品订单' },
      },
      // 客服
      {
        path: 'review-delete',
        name: 'ReviewDelete',
        component: () => import('@/views/review-delete/index.vue'),
        meta: { title: '评论删除', icon: 'ChatLineSquare', group: '客服' },
      },
      {
        path: 'complaints',
        name: 'Complaints',
        component: () => import('@/views/complaints/index.vue'),
        meta: { title: '投诉处理', icon: 'Warning', group: '客服' },
      },
      {
        path: 'refund-requests',
        name: 'RefundRequests',
        component: () => import('@/views/refund-requests/index.vue'),
        meta: { title: '退款仲裁', icon: 'Refresh', group: '客服' },
      },
      // 营销
      {
        path: 'activities',
        name: 'Activities',
        component: () => import('@/views/activities/index.vue'),
        meta: { title: '活动管理', icon: 'Present', group: '营销' },
      },
      {
        path: 'rules',
        name: 'Rules',
        component: () => import('@/views/rules/index.vue'),
        meta: { title: '规则管理', icon: 'SetUp', group: '营销' },
      },
      // 风控
      {
        path: 'restrictions',
        name: 'Restrictions',
        component: () => import('@/views/restrictions/index.vue'),
        meta: { title: '店家限制', icon: 'Lock', group: '风控' },
      },
      {
        path: 'level-applications',
        name: 'LevelApplications',
        component: () => import('@/views/level-applications/index.vue'),
        meta: { title: '等级申请', icon: 'Medal', group: '风控' },
      },
      {
        path: 'lifecycle-requests',
        name: 'LifecycleRequests',
        component: () => import('@/views/lifecycle-requests/index.vue'),
        meta: { title: '注销申请', icon: 'CircleClose', group: '风控' },
      },
      {
        path: 'sensitive-words',
        name: 'SensitiveWords',
        component: () => import('@/views/sensitive-words/index.vue'),
        meta: { title: '敏感词库', icon: 'Filter', group: '风控' },
      },
      // 财务
      {
        path: 'ledger',
        name: 'Ledger',
        component: () => import('@/views/ledger/index.vue'),
        meta: { title: '账本流水', icon: 'Notebook', group: '财务' },
      },
      // 系统
      {
        path: 'accounts',
        name: 'Accounts',
        component: () => import('@/views/accounts/index.vue'),
        meta: { title: '账号管理', icon: 'UserFilled', group: '系统' },
      },
      // 安全 (Sprint 4)
      {
        path: 'security/mfa',
        name: 'SecurityMfa',
        component: () => import('@/views/security/mfa/index.vue'),
        meta: { title: 'MFA 设置', icon: 'Key', group: '安全' },
      },
      {
        path: 'security/password',
        name: 'SecurityPassword',
        component: () => import('@/views/security/password/index.vue'),
        meta: { title: '修改密码', icon: 'Lock', group: '安全' },
      },
      {
        path: 'security/ip-whitelist',
        name: 'SecurityIpWhitelist',
        component: () => import('@/views/security/ip-whitelist/index.vue'),
        meta: { title: 'IP 白名单', icon: 'Coordinate', group: '安全' },
      },
      // 用户实名
      {
        path: 'users/kyc',
        name: 'UsersKyc',
        component: () => import('@/views/users/kyc/index.vue'),
        meta: { title: 'KYC 审核', icon: 'Postcard', group: '运营' },
      },
      // 审计
      {
        path: 'op-log',
        name: 'OpLog',
        component: () => import('@/views/op-log/index.vue'),
        meta: { title: '操作日志', icon: 'Document', group: '审计' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const user = useUserStore()
  const isPublic = to.meta?.public === true
  if (!user.token && !isPublic) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  if (user.token && to.path === '/login') {
    next({ path: '/' })
    return
  }
  if (to.meta?.title) {
    document.title = `${to.meta.title as string} - yw-mall 后台`
  }
  next()
})

export default router
