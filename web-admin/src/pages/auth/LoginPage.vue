<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)

async function handleLogin() {
  error.value = ''
  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Identifiants incorrects'
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Left: Branding -->
    <div class="hidden w-1/2 flex-col justify-center bg-white px-16 lg:flex">
      <!-- SConnect logo (Meta-style) -->
      <svg class="mb-6 h-12 w-12" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="#1877F2"/>
        <text x="24" y="32" text-anchor="middle" fill="white" font-size="24" font-weight="bold" font-family="Arial">S</text>
      </svg>
      <h1 class="text-5xl font-bold leading-tight text-text-primary">
        Gérez vos
        <br />activités
        <br />commerciales
        <br /><span class="text-primary">efficacement.</span>
      </h1>
      <p class="mt-6 max-w-md text-lg text-text-secondary">
        SalesConnect vous aide à suivre vos équipes, vos ventes et vos performances terrain en temps réel.
      </p>
    </div>

    <!-- Right: Login Form -->
    <div class="flex w-full items-center justify-center bg-surface px-6 lg:w-1/2">
      <div class="w-full max-w-md">
        <!-- Mobile logo -->
        <div class="mb-8 text-center lg:hidden">
          <svg class="mx-auto mb-4 h-10 w-10" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#1877F2"/>
            <text x="24" y="32" text-anchor="middle" fill="white" font-size="24" font-weight="bold" font-family="Arial">S</text>
          </svg>
        </div>

        <div class="rounded-lg bg-white p-8 shadow-md">
          <h2 class="mb-6 text-center text-xl font-semibold text-text-primary">
            Se connecter à SalesConnect
          </h2>

          <!-- Error -->
          <div v-if="error" class="mb-4 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
            {{ error }}
          </div>

          <form class="space-y-4" @submit.prevent="handleLogin">
            <!-- Email -->
            <input
              v-model="email"
              type="email"
              required
              placeholder="E-mail ou numéro de mobile"
              class="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary"
            />

            <!-- Password -->
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Mot de passe"
                class="w-full rounded-md border border-border bg-surface px-4 py-3 pr-12 text-base text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                @click="showPassword = !showPassword"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full rounded-md bg-primary py-3 text-lg font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span v-if="authStore.loading" class="flex items-center justify-center gap-2">
                <svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connexion...
              </span>
              <span v-else>Se connecter</span>
            </button>
          </form>

          <!-- Forgot password -->
          <div class="mt-4 text-center">
            <a href="#" class="text-sm text-primary hover:underline">Mot de passe oublié ?</a>
          </div>

          <!-- Divider -->
          <div class="my-5 border-t border-border" />

          <!-- Create account -->
          <div class="text-center">
            <button
              type="button"
              class="rounded-md border border-border bg-white px-6 py-2.5 text-base font-semibold text-primary transition-colors hover:bg-surface"
            >
              Créer un nouveau compte
            </button>
          </div>
        </div>

        <!-- Meta branding -->
        <div class="mt-6 text-center">
          <span class="text-xs text-text-secondary">Propulsé par</span>
          <p class="mt-1 text-sm font-semibold text-text-secondary">SalesConnect SFA</p>
        </div>
      </div>
    </div>
  </div>
</template>
