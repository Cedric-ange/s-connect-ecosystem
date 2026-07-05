<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface Visit {
  id: string
  created_at: string
  outlet_name: string
  vendor_name: string
  purpose: string
  outcome: string
}

const visits = ref<Visit[]>([])
const loading = ref(true)

async function fetchVisits() {
  loading.value = true
  try {
    const response = await api.get('/analytics/visits') // Ajuste l'endpoint selon tes specs
    if (response && response.data) {
      visits.value = response.data
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des visites :", error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  fetchVisits()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Rapports de Visites</h1>
        <p class="text-sm text-gray-500">Suivi des activités de prospection et des visites d'outlets par tes commerciaux.</p>
      </div>
      <button @click="fetchVisits" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition">
        Rafraîchir
      </button>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div v-if="loading" class="p-12 text-center text-gray-500">Chargement du journal des visites...</div>
      <div v-else-if="visits.length === 0" class="p-12 text-center text-gray-500">Aucune visite enregistrée pour le moment.</div>
      
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <th class="p-4">Date & Heure</th>
            <th class="p-4">Point de Vente</th>
            <th class="p-4">Commercial</th>
            <th class="p-4">Motif de visite</th>
            <th class="p-4">Résultat</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 text-sm text-gray-700">
          <tr v-for="visit in visits" :key="visit.id" class="hover:bg-gray-50 transition">
            <td class="p-4 whitespace-nowrap text-gray-500">{{ formatDate(visit.created_at) }}</td>
            <td class="p-4 font-semibold text-gray-900">{{ visit.outlet_name }}</td>
            <td class="p-4">{{ visit.vendor_name }}</td>
            <td class="p-4 text-gray-600">{{ visit.purpose || 'Check-in de routine' }}</td>
            <td class="p-4">
              <span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                {{ visit.outcome || 'Complété' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>