<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { outletsService } from '@/services/outlets.service'
import type { Outlet } from '@/types'

const outlets = ref<Outlet[]>([])
const loading = ref(true)
const statusFilter = ref('')

// États pour la modale CRUD
const isModalOpen = ref(false)
const modalMode = ref<'view' | 'edit'>('view')
const activeTab = ref<'info' | 'map'>('info')
const selectedOutlet = ref<Partial<Outlet>>({})

// 🍞 Système de Toast Notification (Style Facebook)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
const showToast = ref(false)

function triggerToast(message: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = fal
  }, 4000)
}

onMounted(async () => {
  await fetchOutlets()
})

async function fetchOutlets() {
  loading.value = true
  try {
    const params: any = { page: 1, limit: 50 }
    if (statusFilter.value) params.status = statusFilter.value
    
    const response = await outletsService.getAll(params)
    
    if (Array.isArray(response)) {
      outlets.value = response
    } else if (response && Array.isArray(response.data)) {
      outlets.value = response.data
    } else {
      outlets.value = []
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des PDV:", error)
    outlets.value = []
  } finally {
    loading.value = false
  }
}

// Actions de Validation / Rejet
async function validateOutlet(id: string) {
  try {
    await outletsService.validate(id)
    triggerToast("Le point de vente a bien été validé !", "success")
    await fetchOutlets()
  } catch (error) {
    triggerToast("Impossible de valider ce point de vente.", "error")
  }
}

async function rejectOutlet(id: string) {
  const reason = prompt('Raison du rejet :')
  if (!reason) return
  try {
    await outletsService.reject(id, reason)
    triggerToast("Le point de vente a été rejeté.", "success")
    await fetchOutlets()
  } catch (error) {
    triggerToast("Une erreur est survenue lors du rejet.", "error")
  }
}

// Actions CRUD
function openDetails(outlet: Outlet) {
  selectedOutlet.value = { ...outlet }
  modalMode.value = 'view'
  activeTab.value = 'info'
  isModalOpen.value = true
}

function openEdit(outlet: Outlet) {
  selectedOutlet.value = { ...outlet }
  modalMode.value = 'edit'
  activeTab.value = 'info'
  isModalOpen.value = true
}

async function saveOutlet() {
  if (!selectedOutlet.value.id) return
  try {
    const updatedData: any = {
      name: selectedOutlet.value.name,
      channel: selectedOutlet.value.channel,
      address: selectedOutlet.value.address,
      phone: selectedOutlet.value.phone,
      latitude: selectedOutlet.value.latitude ? Number(selectedOutlet.value.latitude) : null,
      longitude: selectedOutlet.value.longitude ? Number(selectedOutlet.value.longitude) : null,
    }

    await outletsService.update(selectedOutlet.value.id, updatedData)
    
    isModalOpen.value = false
    triggerToast("Modifications enregistrées avec succès !", "success")
    await fetchOutlets()
  } catch (error) {
    triggerToast("Échec de la mise à jour des informations.", "error")
  }
}

async function deleteOutlet(id: string) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce point de vente ?")) return
  try {
    if ((outletsService as any).delete) {
      await (outletsService as any).delete(id)
    }
    triggerToast("Point de vente supprimé.", "success")
    await fetchOutlets()
  } catch (error) {
    triggerToast("Impossible de supprimer ce point de vente.", "error")
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'VALIDATED':
      return { label: 'Validé', class: 'bg-green-100 text-green-800' }
    case 'REJECTED':
      return { label: 'Rejeté', class: 'bg-red-100 text-red-800' }
    case 'PENDING':
    default:
      return { label: 'En attente', class: 'bg-yellow-100 text-yellow-800' }
  }
}

const mapIframeUrl = computed(() => {
  const lat = selectedOutlet.value?.latitude
  const lng = selectedOutlet.value?.longitude
  if (!lat || !lng) return ''
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.005}%2C${lat-0.005}%2C${lng+0.005}%2C${lat+0.005}&layer=mapnik&marker=${lat}%2C${lng}`
})
</script>

<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Points de Vente</h1>
        <p class="text-sm text-gray-500">Gérez, validez et géolocalisez les boutiques partenaires.</p>
      </div>
      
      <select 
        v-model="statusFilter" 
        @change="fetchOutlets"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-primary focus:outline-none"
      >
        <option value="">Tous les statuts</option>
        <option value="PENDING">En attente</option>
        <option value="VALIDATED">Validés</option>
        <option value="REJECTED">Rejetés</option>
      </select>
    </div>

    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table class="w-full border-collapse text-left">
        <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4">Nom</th>
            <th class="px-6 py-4">Adresse</th>
            <th class="px-6 py-4">Canal</th>
            <th class="px-6 py-4">Statut</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="outlet in outlets" :key="outlet.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ outlet.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ outlet.address || 'Non renseignée' }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ outlet.channel }}</td>
            <td class="px-6 py-4">
              <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="getStatusBadge(outlet.status).class">
                {{ getStatusBadge(outlet.status).label }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-3">
                <div v-if="outlet.status === 'PENDING'" class="flex gap-1.5 mr-2 border-r pr-3 border-gray-200">
                  <button @click="validateOutlet(outlet.id)" class="rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100">
                    Valider
                  </button>
                  <button @click="rejectOutlet(outlet.id)" class="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100">
                    Rejeter
                  </button>
                </div>

                <button @click="openDetails(outlet)" class="text-gray-500 hover:text-primary text-xs font-medium">Voir</button>
                <button @click="openEdit(outlet)" class="text-blue-600 hover:text-blue-800 text-xs font-medium">Modifier</button>
                <button @click="deleteOutlet(outlet.id)" class="text-red-600 hover:text-red-800 text-xs font-medium">Supprimer</button>
              </div>
            </td>
          </tr>
          <tr v-if="outlets.length === 0 && !loading">
            <td colspan="5" class="px-6 py-10 text-center text-sm text-gray-500">Aucun point de vente trouvé.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div class="w-full max-w-2xl rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        
        <div class="flex items-center justify-between border-b p-4">
          <h2 class="text-lg font-bold text-gray-900">
            {{ modalMode === 'edit' ? 'Modifier :' : 'Détails :' }} {{ selectedOutlet.name }}
          </h2>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div class="flex border-b bg-gray-50 px-4">
          <button @click="activeTab = 'info'" :class="activeTab === 'info' ? 'border-primary text-primary font-semibold' : 'border-transparent text-gray-600'" class="border-b-2 px-4 py-2.5 text-sm focus:outline-none">
            Informations Générales
          </button>
          <button @click="activeTab = 'map'" :class="activeTab === 'map' ? 'border-primary text-primary font-semibold' : 'border-transparent text-gray-600'" class="border-b-2 px-4 py-2.5 text-sm focus:outline-none">
            Géolocalisation & Carte
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1">
          <div v-if="activeTab === 'info'" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Nom de la boutique</label>
                <input v-model="selectedOutlet.name" :disabled="modalMode === 'view'" type="text" class="w-full rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Canal de distribution</label>
                <input v-model="selectedOutlet.channel" :disabled="modalMode === 'view'" type="text" class="w-full rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Adresse postale / Quartier</label>
              <input v-model="selectedOutlet.address" :disabled="modalMode === 'view'" type="text" class="w-full rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:border-primary" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Contact Téléphone</label>
                <input v-model="selectedOutlet.phone" :disabled="modalMode === 'view'" type="text" class="w-full rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:border-primary" placeholder="Non renseigné" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Statut Système</label>
                <input :value="selectedOutlet.status" disabled type="text" class="w-full rounded-lg border bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700" />
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'map'" class="space-y-4">
            <div class="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border">
              <div>
                <label class="block text-xs font-bold text-gray-500">Latitude</label>
                <input v-model.number="selectedOutlet.latitude" :disabled="modalMode === 'view'" type="number" step="any" class="w-full border-none bg-transparent font-mono text-sm focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500">Longitude</label>
                <input v-model.number="selectedOutlet.longitude" :disabled="modalMode === 'view'" type="number" step="any" class="w-full border-none bg-transparent font-mono text-sm focus:outline-none" />
              </div>
            </div>

            <div v-if="selectedOutlet.latitude && selectedOutlet.longitude" class="w-full h-64 rounded-lg overflow-hidden border shadow-inner">
              <iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" :src="mapIframeUrl"></iframe>
            </div>
            <div v-else class="py-12 text-center text-sm text-gray-400 bg-gray-50 rounded-lg border border-dashed">
              Coordonnées GPS absentes ou incorrectes pour charger la carte.
            </div>
          </div>
        </div>

        <div class="border-t p-4 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button @click="isModalOpen = false" class="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Fermer
          </button>
          <button v-if="modalMode === 'edit'" @click="saveOutlet" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="fixed bottom-5 right-5 z-50 flex max-w-md items-center gap-3 rounded-xl p-4 shadow-lg border transition-all duration-300 ease-out"
         :class="toastType === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'">
      
      <svg v-if="toastType === 'success'" class="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else class="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

      <span class="text-sm font-medium">{{ toastMessage }}</span>
    </div>

  </div>
</template>