<script setup lang="ts">
import { isManagerEmail } from "~/utils/permissions";

const isOpen = ref(false);
const authStore = useAuthStore();
const route = useRoute();

const isManager = computed(() => isManagerEmail(authStore.user?.email));

const menuRoot = useTemplateRef<HTMLDivElement>("menuRoot");

function closeIfClickedOutside(event: PointerEvent) {
  const target = event.target;

  if (!(target instanceof Node)) {
    return;
  }

  if (!menuRoot.value?.contains(target)) {
    closeMenu();
  }
}

function closeMenu() {
  isOpen.value = false;
}

watch(() => route.fullPath, closeMenu);

onMounted(() => {
  isOpen.value = false;
  document.addEventListener("pointerdown", closeIfClickedOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", closeIfClickedOutside);
});
</script>

<template>
  <div
    id="hamburger-menu"
    ref="menuRoot"
    class="relative"
  >
    <label class="swap swap-rotate mr-4">
      <input v-model="isOpen" type="checkbox">
      <Icon
        name="tabler:menu-2"
        size="24px"
        class="swap-off"
      />
      <Icon
        name="tabler:x"
        size="24px"
        class="swap-on"
      />
    </label>
  </div>
  <Teleport defer to="#hamburger-menu">
    <ul
      v-if="isOpen"
      class="absolute top-12 -right-2 menu menu-md bg-base-100 rounded-box z-10 w-screen p-2 shadow text-base-content"
    >
      <li>
        <NuxtLink to="/damages" @click="closeMenu">
          All Trucks
        </NuxtLink>
      </li>
      <hr>
      <li v-if="isManager">
        <NuxtLink to="/damages/all-reports" @click="closeMenu">
          All Reports
        </NuxtLink>
      </li>
      <hr v-if="isManager">
      <li v-if="isManager">
        <NuxtLink to="/damages/users" @click="closeMenu">
          All Users
        </NuxtLink>
      </li>
      <hr v-if="isManager">
      <li>
        <NuxtLink to="/damages/my-reports" @click="closeMenu">
          My Reports
        </NuxtLink>
      </li>
      <hr>
      <li v-if="isManager">
        <NuxtLink to="/damages/add-truck" @click="closeMenu">
          Add Truck
        </NuxtLink>
      </li>
      <hr v-if="isManager">
      <li>
        <NuxtLink to="/sign-out" @click="closeMenu">
          Logout
        </NuxtLink>
      </li>
    </ul>
  </Teleport>
</template>
