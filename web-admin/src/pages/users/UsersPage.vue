<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usersService } from '@/services/users.service'
import type { User } from '@/types'

const router = useRouter()
const users = ref<User[]>([])
const loading = ref(true)
const search = ref('')
const roleFilter = ref('')

onMounted(async () => {
  try {
    const response = await usersService.getAll({ page: 1, limit: 50 })
    users.value = response.data
  } catch {
    users.value = []
  } finally {
    loading.value = false
  }
})

const filteredUsers = () => {
  return users.value.filter((u) => {
    const matchSearch = !search.value || 
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.value.toLowerCase())
    const matchRole = !roleFilter.value || u.role === roleFilter.value
    return matchSearch && matchRole
  })
}

// Fonction corrigée et élargie pour englober les rôles réels de Supabase
function getRoleBadgeClass(role: string) {
  switch (role) {
    case 'SUP':
    case 'COMPANY_SUPERVISOR': 
      return 'bg-purple-100 text-purple-700'
    case 'ADMIN':
    case 'COMPANY_ADMIN':
    case 'SALESCONNECTED_ADMIN': 
      return 'bg-primary/10 text-primary'
    case 'REP':
    case 'VAN_SELLER': 
      return 'bg-secondary/10 text-secondary'
    default: 
      return 'bg-gray-100 text-gray-700'
  }
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <p class="text-sm text-gray-500">Gestion des comptes utilisateurs</p>
      </div>
      <button
        class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        @click="router.push('/users/create')"
      >
        + Nouvel Utilisateur
      </button>
    </div>

    <div class="mb-4 flex gap-3">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher..."
        class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <select
        v-model="roleFilter"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none"
      >
        <option value="">Tous les rôles</option>
        <option value="COMPANY_SUPERVISOR">SUP (Superviseur)</option>
        <option value="COMPANY_ADMIN">ADMIN (Administrateur)</option>
        <option value="VAN_SELLER">REP (Commercial)</option>
      </select>
    </div>

    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div v-if="loading" class="p-8 text-center text-gray-400">Chargement...</div>
      <table v-else class="w-full">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nom</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Rôle</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Statut</th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="user in filteredUsers()" :key="user.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {{ user.firstName?.[0] }}{{ user.lastName?.[0] }}
                </div>
                <span class="text-sm font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ user.email }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="getRoleBadgeClass(user.role)">
                {{ user.role }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1 text-xs"
                :class="user.isActive ? 'text-success' : 'text-gray-400'"
              >
                <span class="h-2 w-2 rounded-full" :class="user.isActive ? 'bg-success' : 'bg-gray-300'" />
                {{ user.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <button class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="filteredUsers().length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">Aucun utilisateur trouvé</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>