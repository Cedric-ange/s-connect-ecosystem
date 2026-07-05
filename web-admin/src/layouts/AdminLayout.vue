<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SidebarNav from '@/components/layout/SidebarNav.vue'

const authStore = useAuthStore()
const router = useRouter()

const sidebarCollapsed = ref(true) // Cachée par défaut
const isHovered = ref(false)

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans antialiased">
    
    <div 
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      :class="[sidebarCollapsed && !isHovered ? 'w-16' : 'w-64 shadow-2xl']"
      class="absolute left-0 top-0 h-full z-50 bg-white transition-all duration-300 ease-in-out border-r border-gray-200"
    >
      <SidebarNav :collapsed="sidebarCollapsed && !isHovered" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    </div>

    <div class="flex flex-1 flex-col overflow-hidden pl-16">
      
      <header class="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 z-10">
        <div class="flex items-center gap-4">
          <button
            class="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 transition"
            @click="sidebarCollapsed = !sidebarCollapsed"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span class="text-sm font-bold text-gray-800">SalesConnect <span class="text-xs font-normal text-gray-400">Business Suite</span></span>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
              {{ authStore.user?.firstName || 'Vendeur' }} {{ authStore.user?.lastName || 'Test' }}
            </span>
            <span class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600 border border-blue-100">
              {{ authStore.user?.role || 'VAN_SELLER' }}
            </span>
          </div>
          <button 
            @click="handleLogout" 
            class="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition"
            title="Déconnexion"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-hidden">
        <router-view />
      </main>
    </div>
  </div>
</template>