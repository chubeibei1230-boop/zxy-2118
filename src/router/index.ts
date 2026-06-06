import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
      },
      {
        path: 'props',
        name: 'Props',
        component: () => import('@/pages/PropsPage.vue'),
      },
      {
        path: 'props/create',
        name: 'PropCreate',
        component: () => import('@/pages/PropFormPage.vue'),
      },
      {
        path: 'props/:id',
        name: 'PropDetail',
        component: () => import('@/pages/PropDetailPage.vue'),
        props: true,
      },
      {
        path: 'borrow',
        name: 'Borrow',
        component: () => import('@/pages/BorrowPage.vue'),
        meta: { roles: ['reception', 'admin'] },
      },
      {
        path: 'return',
        name: 'Return',
        component: () => import('@/pages/ReturnPage.vue'),
        meta: { roles: ['reception', 'admin'] },
      },
      {
        path: 'records',
        name: 'Records',
        component: () => import('@/pages/RecordsPage.vue'),
      },
      {
        path: 'warehouse/missing',
        name: 'Missing',
        component: () => import('@/pages/MissingPage.vue'),
        meta: { roles: ['warehouse', 'admin'] },
      },
      {
        path: 'warehouse/placement',
        name: 'Placement',
        component: () => import('@/pages/PlacementPage.vue'),
        meta: { roles: ['warehouse', 'admin'] },
      },
      {
        path: 'warehouse/inventory',
        name: 'Inventory',
        component: () => import('@/pages/InventoryPage.vue'),
      },
      {
        path: 'workflow',
        name: 'Workflow',
        component: () => import('@/pages/WorkflowPage.vue'),
        meta: { roles: ['admin'] },
      },
      {
        path: 'workflow/create',
        name: 'WorkflowCreate',
        component: () => import('@/pages/WorkflowFormPage.vue'),
        meta: { roles: ['admin'] },
      },
      {
        path: 'workflow/:id',
        name: 'WorkflowEdit',
        component: () => import('@/pages/WorkflowFormPage.vue'),
        props: true,
        meta: { roles: ['admin'] },
      },
      {
        path: 'admin/users',
        name: 'Users',
        component: () => import('@/pages/UsersPage.vue'),
        meta: { roles: ['admin'] },
      },
      {
        path: 'admin/groups',
        name: 'Groups',
        component: () => import('@/pages/GroupsPage.vue'),
        meta: { roles: ['admin'] },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isLoggedIn) {
    if (to.path === '/login') {
      next()
    } else {
      next('/login')
    }
    return
  }

  if (!authStore.user) {
    await authStore.fetchProfile()
  }

  if (to.path === '/login') {
    next('/dashboard')
    return
  }

  const requiredRoles = to.meta?.roles as string[] | undefined
  if (requiredRoles && requiredRoles.length > 0) {
    if (!authStore.hasRole(requiredRoles)) {
      next('/dashboard')
      return
    }
  }

  next()
})

export default router
