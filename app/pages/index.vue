<script lang="ts" setup>
const authStore = useAuthStore();
</script>

<template>
  <div class="hero bg-base-300 h-full container mx-auto mt-4">
    <div class="hero-content text-center min-h-96">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">
          Truck Damages
        </h1>
        <p class="py-6">
          View damages already reported to your truck or create a new report to detail new damages.
        </p>
        <AppAuthButton v-if="!authStore.user" />
        <NuxtLink
          v-if="authStore.user"
          to="/dashboard"
          class="btn btn-secondary"
        >
          <Icon name="tabler:truck" size="24" />
          View Truck Damages
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
