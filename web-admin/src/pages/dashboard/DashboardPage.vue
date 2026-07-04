<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api' // Ajuste le chemin selon ton instance Axios globale

// Structure alignée sur ta documentation technique
interface DashboardMetrics {
  totalSales: number
  totalOrders: number
  totalVisits: number
  averageOrderValue: number
  conversionRate: number
  activeOutlets: number
  activeVendors: number
  pendingOutlets?: number // Ajouté pour correspondre à ton UI actuelle
}

const metrics = ref<DashboardMetrics>({
  totalSales: 0,
  totalOrders: 0,
  totalVisits: 0,
  averageOrderValue: 0,
  conversionRate: 0,
  activeOutlets: 0,
  activeVendors: 0,
  pendingOutlets: 0
})

const loading = ref(true)
const periodFilter = ref('30d') // Période par défaut selon ta spec (7d, 30d, 90d, 1y)

async function fetchDashboardMetrics() {
  loading.value = true
  try {
    // Appel de l'endpoint exact documenté : GET /analytics/dashboard?period=...
    const response = await api.get('/analytics/dashboard', {
      params: { period: periodFilter.value }
    })
    
    if (response && response.data) {
      metrics.value = response.data
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des analytics :", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardMetrics()
})

// Utilitaire pour formater les devises proprement en FCFA
function formatFCFA(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value) + ' XAF'
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Accueil</h1>
        <p class="text-sm text-gray-500">Consultez les dernières activités et les indicateurs qui nécessitent votre attention.</p>
      </div>
      
      <select 
        v-model="periodFilter" 
        @change="fetchDashboardMetrics"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-primary focus:outline-none"
      >
        <option value="7d">7 derniers jours</option>
        <option value="30d">30 derniers jours</option>
        <option value="90d">30 derniers jours</option>
        <option value="1y">Cette année</option>
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px]">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Commandes</h3>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-2xl font-bold text-gray-900">{{ metrics.totalOrders }}</span>
              <span class="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">Totales</span>
            </div>
          </div>
          <div class="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
        </div>
        <div class="border-t pt-3 mt-4 text-xs text-gray-500 flex justify-between items-center">
          <span>Panier moyen : <strong>{{ formatFCFA(metrics.averageOrderValue) }}</strong></span>
          <a href="/orders" class="text-primary font-medium hover:underline">Voir tout</a>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px]">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Visites</h3>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-2xl font-bold text-gray-900">{{ metrics.totalVisits }}</span>
              <span class="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">Effectuées</span>
            </div>
          </div>
          <div class="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
        </div>
        <div class="border-t pt-3 mt-4 text-xs text-gray-500 flex justify-between items-center">
          <span>Taux de conversion : <strong>{{ metrics.conversionRate }}%</strong></span>
          <a href="/visits" class="text-primary font-medium hover:underline">Voir tout</a>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px]">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Centre d'équipe</h3>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-2xl font-bold text-gray-900">{{ metrics.activeVendors }}</span>
              <span class="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">Vendeurs actifs</span>
            </div>
          </div>
          <div class="p-3 bg-green-50 text-green-600 rounded-lg">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
        </div>
        <div class="border-t pt-3 mt-4 text-xs text-gray-500 flex justify-between items-center">
          <span>Points de vente suivis : <strong>{{ metrics.activeOutlets }}</strong></span>
          <a href="/users" class="text-primary font-medium hover:underline">Gérer</a>
        </div>
      </div>

    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <h4 class="text-sm font-medium text-gray-500 uppercase">Chiffre d'affaires total</h4>
          <div class="text-3xl font-black text-gray-900">{{ formatFCFA(metrics.totalSales) }}</div>
          <p class="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span>↑ 12,5%</span> <span class="text-gray-400 font-normal">vs semaine dernière</span>
          </p>
        </div>
        <div class="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <h4 class="text-sm font-medium text-gray-500 uppercase">Points de vente inscrits</h4>
          <div class="text-3xl font-black text-gray-900">{{ metrics.activeOutlets }}</div>
          <p class="text-xs text-amber-600 font-semibold flex items-center gap-1">
            <span>⚠ {{ metrics.pendingOutlets || 0 }} PDV</span> <span class="text-gray-400 font-normal">en attente d'approbation</span>
          </p>
        </div>
        <div class="p-4 bg-amber-50 text-amber-600 rounded-xl">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
      </div>

    </div>

  </div>
</template>