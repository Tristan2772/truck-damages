<script lang="ts" setup>
const authStore = useAuthStore();
</script>

<template>
  <div class="hero bg-base-300 h-full container mx-auto mt-4">
    <div class="hero-content text-center min-h-96">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">
          Grateful Truck
        </h1>
        <p class="py-6">
          Write out what you are grateful for and collect those memories in grateful Trucks. Come back to remind yourself that there is plenty to be grateful for!
        </p>
        <AppAuthButton v-if="!authStore.user" />
        <NuxtLink
          v-if="authStore.user"
          to="/dashboard"
          class="btn btn-secondary"
        >
          <AppJarsGroupIcon />
          View Trucks
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
