<script lang="ts" setup>
const { data: reports, error, status, refresh } = await useFetch("/api/reports/all", {
  default: () => [],
});
const searchTerm = ref("");

const users = computed(() => {
  const uniqueUsers = new Map<number, { id: number; email: string; name: string; amount: number }>();

  for (const report of reports.value) {
    if (report.user?.id && report.user.email) {
      const userId = Number(report.user.id);
      const existingUser = uniqueUsers.get(userId);

      if (existingUser) {
        existingUser.amount += 1;
      }
      else {
        uniqueUsers.set(userId, {
          id: userId,
          email: report.user.email,
          name: report.user.name,
          amount: 1,
        });
      }
    }
  }

  return [...uniqueUsers.values()].sort((firstUser, secondUser) =>
    firstUser.email.localeCompare(secondUser.email),
  );
});

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
        <span>No users have created any reports yet.</span>
      </div>

      <div v-else-if="!loading && !errorMessage && filteredUsers.length === 0" class="alert alert-info">
        <span>No users match your search.</span>
      </div>

      <div
        v-if="!loading && !errorMessage && filteredUsers.length > 0"
        class="flex flex-col gap-2 w-full"
      >
        <NuxtLink
          v-for="user in filteredUsers"
          :key="user.id"
          :to="`/damages/users/${user.id}`"
          class="bg-base-300 hover:bg-base-100 rounded-xl p-4 flex justify-between"
        >
          <div class="flex flex-col truncate">
            <span>
              {{ user.name }}
            </span>
          </div>
          <div v-if="user.amount > 0" class="flex align-center justify-end gap-2 flex-nowrap">
            View {{ user.amount }}<span v-if="user.amount === 1">Report</span><span v-else>Reports</span> <Icon name="tabler:arrow-right" size="24" />
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
