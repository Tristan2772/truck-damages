<script setup lang="ts">
const isOpen = ref(false);

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
      <li>
        <NuxtLink to="/dashboard" @click="closeMenu">
          Dashboard
        </NuxtLink>
      </li>
      <hr>
      <!-- ---------------- TODO: make trucks link available only for managers -->
      <li>
        <NuxtLink to="/dashboard/trucks/add" @click="closeMenu">
          Add Truck
        </NuxtLink>
      </li>
      <hr>
      <li>
        <NuxtLink to="/dashboard/trucks/reports/add" @click="closeMenu">
          New Report
        </NuxtLink>
      </li>
      <hr>
      <li>
        <NuxtLink to="/my-reports" @click="closeMenu">
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
