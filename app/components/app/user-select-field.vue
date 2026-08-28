<script lang="ts" setup>
import type { UserSearchResult } from "~/lib/db/queries/users";

const props = defineProps<{
  label: string;
  name: string;
  error?: string;
  disabled: boolean;
  initialUser?: UserSearchResult | null;
}>();

const { handleBlur, value, handleChange } = useField<number | null>(() => props.name);
const searchTerm = ref("");
const users = ref<UserSearchResult[]>([]);
const isSearching = ref(false);
const isOpen = ref(false);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const selectedUser = ref<UserSearchResult | null>(props.initialUser || null);
const selectedLabel = computed(() => selectedUser.value ? `${selectedUser.value.name} (${selectedUser.value.email})` : "");
const showNoUsersFound = computed(() => searchTerm.value.trim().length >= 2 && !isSearching.value && users.value.length === 0);

async function search() {
  const query = searchTerm.value.trim();

  if (query.length < 2) {
    users.value = [];
    return;
  }

  isSearching.value = true;
  try {
    users.value = await $fetch<UserSearchResult[]>("/api/users/search", {
      query: { q: query },
    });
  }
  finally {
    isSearching.value = false;
  }
}

function queueSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(search, 200);
}

function selectUser(user: UserSearchResult) {
  selectedUser.value = user;
  searchTerm.value = "";
  users.value = [];
  isOpen.value = false;
  handleChange(user.id);
}

function clearUser() {
  selectedUser.value = null;
  handleChange(null);
}

function handleInput(event: Event) {
  searchTerm.value = (event.target as HTMLInputElement).value;
  isOpen.value = true;
  queueSearch();
}

watch(value, (userId) => {
  if (userId === null || userId === undefined) {
    selectedUser.value = null;
  }
});

onBeforeUnmount(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ props.label }}
    </legend>
    <div class="relative">
      <input
        v-if="!selectedUser"
        type="text"
        class="input w-full"
        placeholder="Search by name or email"
        :disabled="props.disabled"
        :value="searchTerm"
        @input="handleInput"
        @focus="isOpen = true"
        @blur="handleBlur"
      >
      <div v-else class="flex items-center gap-2">
        <input
          type="text"
          class="input w-full"
          :value="selectedLabel"
          readonly
          :disabled="props.disabled"
        >
        <button
          type="button"
          class="btn btn-ghost btn-square"
          :disabled="props.disabled"
          aria-label="Clear assigned user"
          @click="clearUser"
        >
          <Icon name="tabler:x" size="20" />
        </button>
      </div>
      <ul
        v-if="isOpen && !selectedUser && (users.length || isSearching || showNoUsersFound)"
        class="absolute z-10 mt-1 w-full rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
      >
        <li v-if="isSearching" class="p-2 text-sm opacity-70">
          Searching...
        </li>
        <li v-else-if="showNoUsersFound" class="p-2 text-sm opacity-70">
          No users found
        </li>
        <li v-for="user in users" :key="user.id">
          <button
            type="button"
            class="w-full rounded p-2 text-left hover:bg-base-200"
            @mousedown.prevent="selectUser(user)"
          >
            <span class="block">{{ user.name }}</span>
            <span class="block text-sm opacity-70">{{ user.email }}</span>
          </button>
        </li>
      </ul>
    </div>
    <p v-if="props.error" class="fieldset-label text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>
