<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usersService } from '@/services/users.service'

const router = useRouter()
const loading = ref(false)
const error = ref('')

// Alignement des rôles par défaut sur le modèle de données de la base
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: 'VAN_SELLER' as any, // 🎯 Changé ici : "as any" au lieu de la liste de chaînes de caractères
  matricule: '', // Initialisé à vide pour la préparation
})

async function handleSubmit() {
  loading.value = true
  error.value = ''
  
  // 🎯 Génération automatique d'un matricule unique basé sur le temps (Ex: MAT-2026-1719624855)
  form.value.matricule = 'MAT-2026-' + Date.now();

  try {
    await usersService.create(form.value)
    router.push('/users')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur lors de la création'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-6">
      <button class="mb-2 text-sm text-gray-500 hover:text-gray-700" @click="router.push('/users')">
        &larr; Retour aux utilisateurs
      </button>
      <h1 class="text-2xl font-bold text-gray-900">Nouvel Utilisateur</h1>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div v-if="error" class="mb-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">{{ error }}</div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Prénom</label>
            <input v-model="form.firstName" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Nom</label>
            <input v-model="form.lastName" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input v-model="form.email" type="email" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Téléphone</label>
          <input v-model="form.phone" type="tel" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Mot de passe</label>
          <input v-model="form.password" type="password" required minlength="6" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Rôle</label>
          <select v-model="form.role" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
            <option value="VAN_SELLER">REP (Commercial terrain)</option>
            <option value="COMPANY_ADMIN">ADMIN (Responsable zone)</option>
            <option value="COMPANY_SUPERVISOR">SUP (Superviseur global)</option>
          </select>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            :disabled="loading"
            class="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-dark disabled:opacity-50"
          >
            {{ loading ? 'Création...' : 'Créer l\'utilisateur' }}
          </button>
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="router.push('/users')"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  </div>
</template>