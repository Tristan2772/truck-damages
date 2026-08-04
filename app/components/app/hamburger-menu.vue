<script setup lang="ts">
import { isManagerEmail } from "~/utils/permissions";

const isOpen = ref(false);
const authStore = useAuthStore();

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
      class="absolute top-12 -right-2 menu menu-md bg-base-100 rounded-box z-10 w-screen p-2 shadow"
    >
      <li v-if="isManager">
        <NuxtLink to="/dashboard/add-truck" @click="closeMenu">
          Add Truck
        </NuxtLink>
      </li>
      <hr>
      <li>
        <NuxtLink to="/dashboard" @click="closeMenu">
          All Damages
        </NuxtLink>
      </li>
      <hr>
      <li>
        <NuxtLink to="/dashboard/my-reports" @click="closeMenu">
          My Reports
        </NuxtLink>
      </li>
      <hr>
      <li>
        <NuxtLink to="/sign-out" @click="closeMenu">
          Logout
        </NuxtLink>
      </li>
    </ul>
  </Teleport>
</template>
