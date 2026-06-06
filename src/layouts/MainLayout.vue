<template>
  <div class="layout">
    <aside class="layout-sidebar">
      <div class="sidebar-brand">道具管理系统</div>
      <el-menu
        :default-active="activeMenu"
        background-color="#1e3a5f"
        text-color="#b0c4de"
        active-text-color="#ffffff"
        router
      >
        <template v-for="item in menuItems" :key="item.path">
          <el-menu-item :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>
    <div class="layout-main">
      <header class="layout-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="item in breadcrumbs"
            :key="item.path"
            :to="item.path"
          >
            {{ item.label }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        <div class="header-right">
          <span class="header-user">{{ authStore.username }}</span>
          <el-tag size="small" :type="roleTagType">{{ roleLabel }}</el-tag>
          <el-button text @click="handleLogout">退出</el-button>
        </div>
      </header>
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Odometer,
  Box,
  Reading,
  RefreshRight,
  List,
  Warning,
  CircleCheck,
  DataBoard,
  SetUp,
  User,
  UserFilled,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const allMenuItems = [
  { path: '/dashboard', label: '工作台', icon: Odometer, roles: ['admin', 'reception', 'warehouse'] },
  { path: '/props', label: '道具管理', icon: Box, roles: ['admin', 'reception', 'warehouse'] },
  { path: '/borrow', label: '借出登记', icon: Reading, roles: ['reception', 'admin'] },
  { path: '/return', label: '回收登记', icon: RefreshRight, roles: ['reception', 'admin'] },
  { path: '/records', label: '借还记录', icon: List, roles: ['admin', 'reception', 'warehouse'] },
  { path: '/warehouse/missing', label: '缺件处理', icon: Warning, roles: ['warehouse', 'admin'] },
  { path: '/warehouse/placement', label: '归位确认', icon: CircleCheck, roles: ['warehouse', 'admin'] },
  { path: '/warehouse/inventory', label: '库存看板', icon: DataBoard, roles: ['admin', 'reception', 'warehouse'] },
  { path: '/workflow', label: '流程模板', icon: SetUp, roles: ['admin'] },
  { path: '/admin/users', label: '用户管理', icon: User, roles: ['admin'] },
  { path: '/admin/groups', label: '责任小组', icon: UserFilled, roles: ['admin'] },
]

const menuItems = computed(() => {
  const role = authStore.role
  return allMenuItems.filter((item) => item.roles.includes(role))
})

const activeMenu = computed(() => route.path)

const roleLabel = computed(() => {
  const map: Record<string, string> = { admin: '管理员', reception: '接待', warehouse: '仓库' }
  return map[authStore.role] || authStore.role
})

const roleTagType = computed(() => {
  const map: Record<string, string> = { admin: 'danger', reception: 'warning', warehouse: 'success' }
  return (map[authStore.role] || 'info') as any
})

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta && item.name)
  const items: { path: string; label: string }[] = []
  matched.forEach((item) => {
    if (item.name) {
      items.push({ path: item.path, label: item.name as string })
    }
  })
  if (items.length === 0) {
    items.push({ path: '/dashboard', label: '工作台' })
  }
  return items
})

function handleLogout() {
  authStore.clearAuth()
  router.push('/login')
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.layout-sidebar {
  width: var(--nav-width);
  background-color: var(--color-primary);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 100;
}

.sidebar-brand {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.layout-sidebar .el-menu {
  border-right: none;
}

.layout-main {
  margin-left: var(--nav-width);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-header {
  height: var(--header-height);
  background: var(--color-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 99;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-user {
  color: var(--color-text);
  font-size: 14px;
}

.layout-content {
  flex: 1;
  padding: 20px 24px;
  background-color: var(--color-bg);
}
</style>
