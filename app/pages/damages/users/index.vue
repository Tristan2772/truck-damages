<script lang="ts" setup>
import type { UserWithReportCount } from "~/lib/db/queries/users";

import { getReportRecency } from "~/utils/report-recency";

const showAssigned = ref(false);
const mode = computed(() => showAssigned.value ? "assigned" : "created");

const { data: users, error, status, refresh } = await useFetch<UserWithReportCount[]>(() => `/api/users?mode=${mode.value}`, {
  default: () => [],
});
const { data: archivedUsers, refresh: refreshArchivedUsers } = await useFetch<UserWithReportCount[]>(() => `/api/users/archive?mode=${mode.value}`, {
  immediate: false,
  default: () => [],
});
const searchTerm = ref("");
const includeRepairs = ref(true);
const includeNoRepairs = ref(true);
const includeAssignedReports = ref(true);
const includeUnassignedReports = ref(true);
const archiveVisibility = ref<"hide" | "show">("hide");
const isActionsMenuOpen = ref(false);
const actionsMenu = ref<HTMLElement | null>(null);

const loading = computed(() => status.value === "pending");
const errorMessage = computed(() => error.value?.statusMessage || "");
const displayedUsers = computed(() => archiveVisibility.value === "show"
  ? [...users.value, ...archivedUsers.value]
  : users.value);
const filteredUsers = computed(() => {
  const search = searchTerm.value.trim().toLowerCase();

  return displayedUsers.value.filter((user) => {
    const hasRepairs = user.repairedReportCount > 0;
    const hasUnrepairedReports = user.unrepairedReportCount > 0;
    const hasAssignedReports = user.assignedReportCount > 0;
    const hasUnassignedReports = user.unassignedReportCount > 0;
    const matchesSearch = !search
      || user.name.toLowerCase().includes(search)
      || user.email.toLowerCase().includes(search);

    return matchesSearch
      && (!hasRepairs || includeRepairs.value)
      && (!hasUnrepairedReports || includeNoRepairs.value)
      && (!hasAssignedReports || includeAssignedReports.value)
      && (!hasUnassignedReports || includeUnassignedReports.value);
  });
});
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

const filtersAreSet = computed(() => !includeRepairs.value
  || !includeNoRepairs.value
  || !includeAssignedReports.value
  || !includeUnassignedReports.value
  || archiveVisibility.value === "show");

function clearFilters() {
  includeRepairs.value = true;
  includeNoRepairs.value = true;
  includeAssignedReports.value = true;
  includeUnassignedReports.value = true;
  archiveVisibility.value = "hide";
}

function setArchiveVisibility(visibility: "hide" | "show") {
  archiveVisibility.value = visibility;

  if (visibility === "show") {
    refreshArchivedUsers();
  }
}

function updateArchiveVisibility(visibility: "hide" | "show", event: Event) {
  const isChecked = (event.target as HTMLInputElement).checked;

  setArchiveVisibility(isChecked ? visibility : visibility === "show" ? "hide" : "show");
}

function closeActionsMenu() {
  isActionsMenuOpen.value = false;
}

function closeActionsMenuIfFocusLeaves(event: FocusEvent) {
  const relatedTarget = event.relatedTarget as Node | null;

  if (!relatedTarget || actionsMenu.value?.contains(relatedTarget)) {
    return;
  }

  closeActionsMenu();
}

function closeActionsMenuIfOutside(event: PointerEvent) {
  if (!actionsMenu.value?.contains(event.target as Node)) {
    closeActionsMenu();
  }
}

watch(mode, () => {
  if (archiveVisibility.value === "show") {
    refreshArchivedUsers();
  }
});

onBeforeMount(() => {
  refresh();
});

onMounted(() => {
  document.addEventListener("pointerdown", closeActionsMenuIfOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", closeActionsMenuIfOutside);
});
</script>

<template>
  <div class="w-full p-4">
    <div class="flex flex-col gap-4">
      <div class="grid grid-cols-3 gap-4">
        <div class="flex flex-col gap-4">
          <h1 class="text-2xl font-bold justify-self-start">
            All Users
          </h1>
          <label class="label cursor-pointer justify-self-start gap-2">
            <input
              v-model="showAssigned"
              type="checkbox"
              class="toggle toggle-error"
            >
            <span v-if="!showAssigned" class="label-text pr-3">Reports</span>
            <span v-if="showAssigned" class="label-text">Damages</span>
          </label>
        </div>
        <label class="input input-sm input-bordered flex w-full max-w-sm justify-self-end items-center gap-2">
          <Icon name="tabler:search" size="18" />
          <input
            v-model="searchTerm"
            type="search"
            class="grow"
            placeholder="Search..."
          >
        </label>
        <div class="flex gap-4 justify-end">
          <button
            v-if="filtersAreSet"
            class="btn btn-md btn-ghost"
            type="button"
            @click="clearFilters"
          >
            clear filters
          </button>
          <div
            ref="actionsMenu"
            class="dropdown dropdown-bottom dropdown-end"
            :class="{ 'dropdown-open': isActionsMenuOpen, 'dropdown-close': !isActionsMenuOpen }"
            @focusout="closeActionsMenuIfFocusLeaves"
          >
            <button
              tabindex="0"
              class="btn btn-md btn-ghost hover:bg-base-100 p-2"
              type="button"
              @click="isActionsMenuOpen = !isActionsMenuOpen"
            >
              filter
            </button>
            <button
              v-if="isActionsMenuOpen"
              tabindex="-1"
              class="fixed inset-0 z-20 cursor-default"
              type="button"
              aria-label="Close menu"
              @click="closeActionsMenu"
            />
            <div
              v-if="isActionsMenuOpen"
              tabindex="-1"
              class="dropdown-content bg-base-100 rounded-box z-100 mb-2 w-max shadow-sm border-2 border-secondary"
            >
              <ul class="menu">
                <li class="menu-title">
                  Repairs
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeRepairs"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>Has repairs</span>
                  </label>
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeNoRepairs"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>No repairs</span>
                  </label>
                </li>
                <li class="menu-title mt-2">
                  Damages
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeAssignedReports"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>Has Damages</span>
                  </label>
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeUnassignedReports"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>No Damages</span>
                  </label>
                </li>
                <li class="menu-title mt-2">
                  Archived Reports
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      :checked="archiveVisibility === 'show'"
                      @change="updateArchiveVisibility('show', $event)"
                    >
                    <span>Include archived</span>
                  </label>
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      :checked="archiveVisibility === 'hide'"
                      @change="updateArchiveVisibility('hide', $event)"
                    >
                    <span>Hide archived</span>
                  </label>
                </li>
              </ul>
            </div>
          </div>
        </div>
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

      <div v-if="!loading && !errorMessage && displayedUsers.length === 0" class="alert alert-info">
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
            :to="{
              name: 'damages-users-id',
              params: { id: userWithRecency.user.id },
              query: { mode },
            }"
            class="bg-base-300 hover:bg-base-100 rounded-xl p-4 flex justify-between"
          >
            <div class="flex flex-col truncate">
              <span>
                {{ userWithRecency.user.name }}
              </span>
            </div>
            <div v-if="userWithRecency.user.amount > 0" class="flex align-center justify-end gap-2 flex-nowrap">
              View {{ userWithRecency.user.amount }}
              <span v-if="mode === 'assigned'">Damage<span v-if="userWithRecency.user.amount !== 1">s</span></span>
              <span v-else>Report<span v-if="userWithRecency.user.amount !== 1">s</span></span>
              <Icon name="tabler:arrow-right" size="24" />
            </div>
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>
