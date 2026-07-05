<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Les 4 points d'ancrage / sous-onglets inspirés de Meta
const activeTab = ref('overview')

const tabs = [
  { id: 'overview', name: "Vue d'ensemble" },
  { id: 'content', name: 'Contenu' },
  { id: 'audience', name: 'Audience (Équipe & PDV)' },
  { id: 'field-activity', name: 'Visites & Commandes' } // Remplace "Benchmark"
]
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Statistiques et Rapports</h1>
      <p class="text-sm text-gray-500">Analysez les performances globales, le contenu et l'activité de vos équipes sur le terrain.</p>
    </div>

    <div class="border-b border-gray-200">
      <nav class="flex space-x-8" aria-label="Tabs">
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

    <div class="mt-6">
      
      <div v-if="activeTab === 'overview'" class="space-y-6">
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-2">Résumé des performances</h3>
          <p class="text-sm text-gray-500 mb-4">Aperçu rapide des courbes de croissance et des KPIs principaux.</p>
          <div class="h-64 bg-gray-50 rounded-lg border border-dashed flex items-center justify-center text-gray-400">
            [ Graphique de tendance globale ]
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'content'" class="space-y-6">
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-2">Performance du contenu</h3>
          <p class="text-sm text-gray-500 mb-4">Statistiques liées aux campagnes, aux catalogues partagés et aux retours merchandising.</p>
          <div class="h-64 bg-gray-50 rounded-lg border border-dashed flex items-center justify-center text-gray-400">
            [ Tableau de performance des éléments de contenu ]
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'audience'" class="space-y-6">
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-2">Couverture de l'audience</h3>
          <p class="text-sm text-gray-500 mb-4">Analyse de la répartition de vos points de vente actifs et de l'engagement de vos vendeurs.</p>
          <div class="h-64 bg-gray-50 rounded-lg border border-dashed flex items-center justify-center text-gray-400">
            [ Données démographiques / Répartition par Territoire ]
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'field-activity'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 transition flex flex-col justify-between">
            <div>
              <div class="p-3 bg-blue-50 text-blue-600 rounded-lg w-fit mb-4">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">Rapports de Ventes complets</h3>
              <p class="text-sm text-gray-500 mt-1">Consultez l'historique complet des transactions, filtré par montant, date et statut de validation.</p>
            </div>
            <button @click="router.push('/orders')" class="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition shadow-sm">
              Accéder au module des commandes
            </button>
          </div>

          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 transition flex flex-col justify-between">
            <div>
              <div class="p-3 bg-amber-50 text-amber-600 rounded-lg w-fit mb-4">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">Analyses des Visites terrain</h3>
              <p class="text-sm text-gray-500 mt-1">Suivez les feuilles de route de vos commerciaux, les motifs de visite, et le taux de conversion de prospection.</p>
            </div>
            <button @click="router.push('/visits')" class="mt-6 w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm transition shadow-sm">
              Accéder au journal des visites
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>