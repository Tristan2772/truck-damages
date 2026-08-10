<script lang="ts" setup>
const authStore = useAuthStore();
</script>

<template>
  <div class="hero bg-base-300 h-full container mx-auto mt-4">
    <div class="hero-content text-center min-h-96">
      <div class="max-w-md flex flex-col items-center">
        <h1 class="text-3xl font-bold">
          MAKL Apps
        </h1>
        <p class="py-6">
          Welcome to MAKL Apps! View and add truck damages.
        </p>
        <div v-if="authStore.loading" class="flex justify-center">
          <span class="loading loading-spinner loading-lg" />
        </div>
        <AppAuthButton v-else-if="!authStore.user" />
        <div class="flex flex-col items-center gap-4">
          <NuxtLink
            v-if="authStore.user"
            to="/damages"
            class="btn btn-secondary w-54 flex justify-start gap-2"
          >
            <Icon name="tabler:truck" size="24" />
            View Truck Damages
          </NuxtLink>
          <NuxtLink
            v-if="authStore.user"
            to="/sign-out"
            class="btn btn-secondary w-54 flex justify-start gap-2"
          >
            <Icon
              name="tabler:logout-2"
              size="24"
            />
            Sign Out
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
