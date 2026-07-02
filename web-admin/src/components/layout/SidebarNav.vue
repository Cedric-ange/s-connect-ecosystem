<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps<{ collapsed: boolean }>()
defineEmits<{ toggle: [] }>()

const route = useRoute()
const authStore = useAuthStore()

const navItems = [
  { name: 'Accueil', path: '/dashboard', icon: 'home' },
  { name: 'Notifications', path: '/notifications', icon: 'bell' },
  { name: 'Gestionnaire de pub...', path: '/campaigns', icon: 'megaphone' },
  { name: 'Agenda', path: '/agenda', icon: 'calendar' },
  { name: 'Contenu', path: '/content', icon: 'document' },
  { name: 'Statistiques', path: '/statistics', icon: 'chart' },
  { name: 'Messagerie', path: '/messages', icon: 'chat' },
  { name: 'Utilisateurs', path: '/users', icon: 'users' },
  { name: 'Points de Vente', path: '/outlets', icon: 'store' },
  { name: 'Territoires', path: '/territories', icon: 'map' },
]

const bottomItems = [
  { name: 'Rechercher', path: '/search', icon: 'search' },
  { name: 'Paramètres', path: '/settings', icon: 'settings' },
  { name: 'Aide', path: '/help', icon: 'help' },
]

function isActive(path: string) {
  return route.path === path || (path !== '/dashboard' && route.path.startsWith(path))
}
</script>

<template>
  <aside
    class="flex flex-col border-r border-border bg-white transition-all duration-300"
    :class="collapsed ? 'w-[60px]' : 'w-[240px]'"
  >
    <div class="flex h-14 items-center gap-2 px-3">
      <img 
        src="/logo-officiel.svg" 
        alt="SalesConnect" 
        class="h-8 w-8 shrink-0 object-contain" 
      />
      <div v-if="!collapsed" class="leading-tight">
        <span class="text-sm font-bold text-text-primary">SalesConnect</span>
        <span class="block text-[10px] text-text-secondary">Business Suite</span>
      </div>
    </div>

    <div v-if="!collapsed" class="mx-2 mb-1 flex items-center gap-2 rounded-md px-2 py-2 hover:bg-sidebar-hover">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
        {{ authStore.user?.firstName?.[0] || 'S' }}
      </div>
      <span class="truncate text-sm font-medium text-text-primary">
        {{ authStore.user?.firstName ? `${authStore.user.firstName} ${authStore.user.lastName}` : 'SalesConnect' }}
      </span>
      <svg class="ml-auto h-4 w-4 shrink-0 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <nav class="flex-1 overflow-y-auto px-2 py-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="group mb-0.5 flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors"
        :class="isActive(item.path)
          ? 'bg-sidebar-active text-white'
          : 'text-text-primary hover:bg-sidebar-hover'"
        :title="collapsed ? item.name : undefined"
      >
        <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path v-if="item.icon === 'home'" stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          <path v-else-if="item.icon === 'bell'" stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          <path v-else-if="item.icon === 'megaphone'" stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.75.75 0 01-1.021-.268l-.011-.018a21.66 21.66 0 01-1.073-2.146m2.24-12.24c3.498.305 6.768 1.639 9.41 3.72v-.03c0 1.89-.7 3.617-1.855 4.93A18.865 18.865 0 0012.434 6.66m-2.094-.09a22.4 22.4 0 00-.339-.06c-.264-.044-.532-.073-.803-.073" />
          <path v-else-if="item.icon === 'calendar'" stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          <path v-else-if="item.icon === 'document'" stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          <path v-else-if="item.icon === 'chart'" stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          <path v-else-if="item.icon === 'chat'" stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          <path v-else-if="item.icon === 'users'" stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          <path v-else-if="item.icon === 'store'" stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
          <path v-else-if="item.icon === 'map'" stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m0-8.25a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM9 6.75L9 3.507a48.025 48.025 0 016 0V6.75m-6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM15 6.75v8.25m0-8.25a1.5 1.5 0 110 3 1.5 1.5 0 010-3z M9 15l6-3" />
        </svg>
        <span v-if="!collapsed" class="truncate">{{ item.name }}</span>
      </router-link>
    </nav>

    <div class="border-t border-border px-2 py-2">
      <router-link
        v-for="item in bottomItems"
        :key="item.path"
        :to="item.path"
        class="mb-0.5 flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-sidebar-hover"
        :title="collapsed ? item.name : undefined"
      >
        <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path v-if="item.icon === 'search'" stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          <path v-else-if="item.icon === 'settings'" stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path v-else-if="item.icon === 'settings'" stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path v-else-if="item.icon === 'help'" stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
        <span v-if="!collapsed" class="truncate">{{ item.name }}</span>
      </router-link>
    </div>
  </aside>
</template>