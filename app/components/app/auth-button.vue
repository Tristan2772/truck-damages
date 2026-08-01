<script lang="ts" setup>
const authStore = useAuthStore();
const activeTab = ref<"sign-in" | "sign-up">("sign-in");
</script>

<template>
  <div v-if="!authStore.loading && authStore.user" class="dropdown dropdown-end">
    <div
      tabindex="0"
      role="button"
      class="btn m-1"
    >
      <div v-if="authStore.user.image" class="avatar">
        <div class="w-8 rounded-full">
          <img :src="authStore.user.image" :alt="authStore.user.name">
        </div>
      </div>
      {{ authStore.user.name }}
    </div>
    <ul tabindex="-1" class="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow-sm border-2 border-secondary">
      <li>
        <NuxtLink to="/sign-out" aria-label="link to sign out">
          <Icon name="tabler:logout-2" size="24" />
          Sign out
        </NuxtLink>
      </li>
    </ul>
  </div>
  <div v-else class="card bg-base-200 border-2 border-secondary shadow-xl max-w-xl mx-auto">
    <div class="card-body gap-6">
      <div class="space-y-2">
        <h2 class="card-title text-3xl">
          Access your truck damage reports
        </h2>
        <p class="text-base-content/70">
          Sign in with your email and password, or create a new account to start tracking damage reports.
        </p>
      </div>

      <div class="tabs tabs-box w-full">
        <button
          class="tab flex-1"
          :class="{ 'tab-active': activeTab === 'sign-in' }"
          type="button"
          @click="activeTab = 'sign-in'"
        >
          Sign in
        </button>
        <button
          class="tab flex-1"
          :class="{ 'tab-active': activeTab === 'sign-up' }"
          type="button"
          @click="activeTab = 'sign-up'"
        >
          Sign up
        </button>
      </div>

      <AppAuthSignInForm v-if="activeTab === 'sign-in'" />
      <AppAuthSignUpForm v-else />

      <div class="divider text-xs uppercase tracking-[0.3em] text-base-content/50">
        Or continue with
      </div>

      <button
        :disabled="authStore.loading"
        class="btn btn-outline w-full"
        type="button"
        @click="authStore.signIn"
      >
        <span v-if="authStore.loading" class="loading loading-spinner loading-sm" />
        <Icon
          v-else
          name="tabler:brand-google"
          size="20"
        />
        Google
      </button>
    </div>
  </div>
</template>
