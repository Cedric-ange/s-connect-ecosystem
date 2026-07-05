<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('overview')

// Aligné sur l'interface Meta Business Suite reçue
const tabs = [
  { id: 'overview', name: "Vue d'ensemble" },
  { id: 'results', name: 'Résultats' },
  { id: 'audience', name: 'Audience & Équipes' },
  { id: 'field-activity', name: 'Activité Terrain (Visites & Commandes)' } // Notre remplacement stratégique
]
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div class="border-b border-gray-200">
      <nav class="flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium transition-colors'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <div v-if="activeTab === 'field-activity'" class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold text-gray-900">Rapports des Commandes</h3>
          <p class="text-sm text-gray-500 mt-1">Consultez l'historique complet des transactions et des volumes de vente en FCFA.</p>
        </div>
        <button @click="router.push('/orders')" class="mt-6 w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg text-sm transition hover:bg-blue-700">
          Ouvrir les commandes
        </button>
      </div>

      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold text-gray-900">Rapports des Visites</h3>
          <p class="text-sm text-gray-500 mt-1">Suivez les feuilles de route de vos commerciaux et les taux de conversion terrain.</p>
        </div>
        <button @click="router.push('/visits')" class="mt-6 w-full py-2.5 bg-amber-600 text-white font-medium rounded-lg text-sm transition hover:bg-amber-700">
          Ouvrir les visites
        </button>
      </div>
    </div>
  </div>
</template>