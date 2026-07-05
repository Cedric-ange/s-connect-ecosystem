import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/LoginPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/pages/dashboard/DashboardPage.vue'),
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/pages/notifications/NotificationsPage.vue'),
        },
        {
          path: 'campaigns',
          name: 'campaigns',
          component: () => import('@/pages/campaigns/CampaignsPage.vue'),
        },
        {
          path: 'agenda',
          name: 'agenda',
          component: () => import('@/pages/agenda/AgendaPage.vue'),
        },
        {
          path: 'content',
          name: 'content',
          component: () => import('@/pages/content/ContentPage.vue'),
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: () => import('@/pages/statistics/StatisticsPage.vue'),
        },
        {
          path: 'messages',
          name: 'messages',
          component: () => import('@/pages/messages/MessagesPage.vue'),
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/pages/users/UsersPage.vue'),
        },
        {
          path: 'users/create',
          name: 'users-create',
          component: () => import('@/pages/users/CreateUserPage.vue'),
        },
        {
          path: 'territories',
          name: 'territories',
          component: () => import('@/pages/territories/TerritoriesPage.vue'),
        },
        {
          path: 'outlets',
          name: 'outlets',
          component: () => import('@/pages/outlets/OutletsPage.vue'),
        },
        {
          path: 'routes',
          name: 'routes',
          component: () => import('@/pages/routes/RoutesPage.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/pages/settings/SettingsPage.vue'),
        },
        // 🛍️ Nouvelle route : Historique des commandes
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/pages/orders/OrdersPage.vue'),
        },
        // 📍 Nouvelle route : Rapports de visites
        {
          path: 'visits',
          name: 'visits',
          component: () => import('@/pages/Visite/VisitsPage.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    if (authStore.token) {
      await authStore.fetchProfile()
      if (!authStore.isAuthenticated) return { name: 'login' }
    } else {
      return { name: 'login' }
    }
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router