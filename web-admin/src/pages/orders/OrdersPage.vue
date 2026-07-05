<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface Order {
  id: string
  created_at: string
  outlet_name: string
  vendor_name: string
  total_amount: number
  status: string
}

const orders = ref<Order[]>([])
const loading = ref(true)

async function fetchOrders() {
  loading.value = true
  try {
    // Appel de ton API pour récupérer la liste des commandes
    const response = await api.get('/analytics/orders') // Ajuste l'endpoint si nécessaire
    if (response && response.data) {
      orders.value = response.data
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes :", error)
  } finally {
    loading.value = false
  }
}

function formatFCFA(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value) + ' XAF'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Historique des Commandes</h1>
        <p class="text-sm text-gray-500">Liste exhaustive de toutes les transactions effectuées sur le terrain.</p>
      </div>
      <button @click="fetchOrders" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition">
        Rafraîchir
      </button>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div v-if="loading" class="p-12 text-center text-gray-500">Chargement des transactions...</div>
      <div v-else-if="orders.length === 0" class="p-12 text-center text-gray-500">Aucune commande enregistrée pour le moment.</div>
      
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <th class="p-4">Date</th>
            <th class="p-4">Point de Vente</th>
            <th class="p-4">Vendeur</th>
            <th class="p-4">Montant</th>
            <th class="p-4">Statut</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 text-sm text-gray-700">
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 transition">
            <td class="p-4 whitespace-nowrap font-medium text-gray-500">{{ formatDate(order.created_at) }}</td>
            <td class="p-4 font-semibold text-gray-900">{{ order.outlet_name }}</td>
            <td class="p-4">{{ order.vendor_name }}</td>
            <td class="p-4 font-bold text-gray-900">{{ formatFCFA(order.total_amount) }}</td>
            <td class="p-4">
              <span :class="{
                'bg-green-100 text-green-800': order.status === 'DELIVERED' || order.status === 'APPROVED',
                'bg-amber-100 text-amber-800': order.status === 'PENDING',
              }" class="px-2.5 py-1 rounded-full text-xs font-medium uppercase">
                {{ order.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>