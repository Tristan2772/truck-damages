<script lang="ts" setup>
import type { UserWithReportCount } from "~/lib/db/queries/users";

const { data: users, error, status, refresh } = await useFetch<UserWithReportCount[]>("/api/users/archive", {
  default: () => [],
});

const loading = computed(() => status.value === "pending");
const errorMessage = computed(() => error.value?.statusMessage || "");

onBeforeMount(() => {
  refresh();
});
</script>

<template>
  <div class="w-full p-4">
    <div class="flex flex-col gap-4">
      <h1 class="text-2xl font-bold">
        Archived Users
      </h1>

      <div v-if="loading" class="flex justify-center py-6">
        <span class="loading loading-spinner loading-xl" />
      </div>

      <div
        v-if="errorMessage && !loading"
        role="alert"
        class="alert alert-error"
      >
        <Icon name="tabler:square-rounded-letter-x-filled" size="24" />
        <span>{{ errorMessage }}</span>
      </div>

      <div v-if="!loading && !errorMessage && users.length === 0" class="alert alert-info">
        <span>There are no archived users.</span>
      </div>

      <ul v-if="!loading && !errorMessage && users.length" class="menu bg-base-100 rounded-box">
        <li v-for="user in users" :key="user.id">
          <NuxtLink :to="{ name: 'damages-users-id', params: { id: user.id } }">
            <span>{{ user.name }}</span>
            <span class="text-xs opacity-70">{{ user.email }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
