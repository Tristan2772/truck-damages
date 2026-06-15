<script lang="ts" setup>
const authStore = useAuthStore();
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
  <button
    v-if="!authStore.user"
    :disabled="authStore.loading"
    class="btn btn-secondary"
    @click="authStore.signIn"
  >
    Sign in with Google
    <span v-if="authStore.loading" class="loading loading-spinner loading-md" />
    <Icon
      v-if="!authStore.loading"
      name="tabler:brand-google"
      size="24"
    />
  </button>
</template>
