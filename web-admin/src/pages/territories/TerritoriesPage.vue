<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface Territory {
  id: string
  name: string
  type: 'ZONE' | 'SECTEUR'
  potential?: number
  admin_name?: string
  parent_name?: string
}

const territories = ref<Territory[]>([])
const loading = ref(true)

async function fetchTerritories() {
  loading.value = true
  try {
    // Appel de ton endpoint NestJS mis à jour : GET /territories
    const response = await api.get('/territories')
    if (response && response.data && response.data.success) {
      territories.value = response.data.data
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des territoires :", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTerritories()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Structures Territoriales</h1>
        <p class="text-sm text-gray-500">Gérez la hiérarchie de vos Zones (SUP) et vos Secteurs opérationnels (ADMIN).</p>
      </div>
      <button @click="fetchTerritories" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition">
        Rafraîchir
      </button>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div v-if="loading" class="p-12 text-center text-gray-500">
        Chargement de la cartographie...
      </div>
      <div v-else-if="territories.length === 0" class="p-12 text-center text-gray-500">
        Aucun territoire ou secteur configuré pour le moment.
      </div>
      
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <th class="p-4">Nom de la structure</th>
            <th class="p-4">Niveau / Type</th>
            <th class="p-4">Responsable / Parent</th>
            <th class="p-4">Potentiel commercial</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 text-sm text-gray-700">
          <tr v-for="item in territories" :key="item.id" class="hover:bg-gray-50 transition">
            <td class="p-4 font-bold text-gray-900">{{ item.name }}</td>
            <td class="p-4">
              <span :class="[
                item.type === 'ZONE' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800',
                'px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider'
              ]">
                {{ item.type }}
              </span>
            </td>
            <td class="p-4 text-gray-600">
              {{ item.type === 'ZONE' ? item.admin_name || 'Aucun ADMIN assigné' : item.parent_name || 'Zone parente inconnue' }}
            </td>
            <td class="p-4 font-semibold">
              {{ item.potential ? new Intl.NumberFormat('fr-FR').format(item.potential) + ' FCFA' : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>