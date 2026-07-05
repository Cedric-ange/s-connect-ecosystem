<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SidebarNav from '@/components/layout/SidebarNav.vue'

const authStore = useAuthStore()
const router = useRouter()

// sidebarCollapsed gère l'état global contrôlé par le clic sur le bouton
const sidebarCollapsed = ref(false)

// isHovered gère l'état temporaire au survol de la souris
const isHovered = ref(false)

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-surface">
    
    <div 
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      class="h-full z-50 transition-all duration-300 ease-in-out shrink-0"
    >
      <SidebarNav 
        :collapsed="sidebarCollapsed && !isHovered" 
        @toggle="sidebarCollapsed = !sidebarCollapsed" 
      />
    </div>

    <div class="flex flex-1 flex-col overflow-hidden">
      <header class="flex h-14 items-center justify-between border-b border-border bg-white px-4">
        <button
          class="rounded-full p-2 text-text-secondary hover:bg-sidebar-hover"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div class="flex items-center gap-2">
          <button class="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-sidebar-hover">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.75.75 0 01-1.021-.268l-.011-.018a21.66 21.66 0 01-1.073-2.146m2.24-12.24c3.498.305 6.768 1.639 9.41 3.72v-.03c0 1.89-.7 3.617-1.855 4.93A18.865 18.865 0 0012.434 6.66m-2.094-.09a22.4 22.4 0 00-.339-.06" />
            </svg>
            Créer une publicité
          </button>
          
          <button class="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Créer une publication
          </button>

          <div class="ml-2 flex items-center gap-2 border-l border-border pl-3">
            <span class="text-sm font-medium text-text-primary">
              {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
            </span>
            <span class="rounded-full bg-meta-blue-light px-2 py-0.5 text-xs font-semibold text-primary">
              {{ authStore.user?.role }}
            </span>
            
            <button
              class="rounded-full p-1.5 text-text-secondary hover:bg-sidebar-hover hover:text-danger transition-colors"
              title="Se déconnecter"
              @click="handleLogout"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto bg-surface p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>