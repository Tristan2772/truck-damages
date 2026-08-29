<script lang="ts" setup>
import type { UserWithReportCount } from "~/lib/db/queries/users";

import { getReportRecency } from "~/utils/report-recency";

const { data: users, error, status, refresh } = await useFetch<UserWithReportCount[]>("/api/users", {
  default: () => [],
});
const searchTerm = ref("");

const filteredUsers = computed(() => {
  const search = searchTerm.value.trim().toLowerCase();

  if (!search) {
    return users.value;
  }

  return users.value.filter(user =>
    user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search),
  );
});

const loading = computed(() => status.value === "pending");
const errorMessage = computed(() => error.value?.statusMessage || "");
const usersWithRecency = computed(() => filteredUsers.value.map((user, index, users) => {
  const recency = user.latestReportAt === null ? null : getReportRecency(user.latestReportAt);
  const previousUser = users[index - 1];
  const previousRecency = previousUser?.latestReportAt === null || previousUser?.latestReportAt === undefined
    ? null
    : getReportRecency(previousUser.latestReportAt);

  return {
    user,
    recency,
    showRecency: recency !== null && (index === 0 || recency !== previousRecency),
  };
}));

onBeforeMount(() => {
  refresh();
});
</script>

<template>
  <div class="w-full p-4">
    <div class="flex flex-col gap-4">
      <div class="grid grid-cols-3 items-center gap-4">
        <h1 class="text-2xl font-bold justify-self-start">
          All Users
        </h1>
        <label class="input input-sm input-bordered flex w-full max-w-sm justify-self-end items-center gap-2">
          <Icon name="tabler:search" size="18" />
          <input
            v-model="searchTerm"
            type="search"
            class="grow"
            placeholder="Search users..."
          >
        </label>
      </div>

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
        <span>No users found.</span>
      </div>

      <div v-else-if="!loading && !errorMessage && filteredUsers.length === 0" class="alert alert-info">
        <span>No users match your search.</span>
      </div>

      <div
        v-if="!loading && !errorMessage && filteredUsers.length > 0"
        class="flex flex-col gap-2 w-full"
      >
        <template v-for="userWithRecency in usersWithRecency" :key="userWithRecency.user.id">
          <AppReportRecencyIndicator
            v-if="userWithRecency.showRecency"
            :recency="userWithRecency.recency!"
          />
          <NuxtLink
            :to="`/damages/users/${userWithRecency.user.id}`"
            class="bg-base-300 hover:bg-base-100 rounded-xl p-4 flex justify-between"
          >
            <div class="flex flex-col truncate">
              <span>
                {{ userWithRecency.user.name }}
              </span>
            </div>
            <div v-if="userWithRecency.user.amount > 0" class="flex align-center justify-end gap-2 flex-nowrap">
              View {{ userWithRecency.user.amount }}<span v-if="userWithRecency.user.amount === 1">Report</span><span v-else>Reports</span> <Icon name="tabler:arrow-right" size="24" />
            </div>
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>
