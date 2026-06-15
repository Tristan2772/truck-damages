<script lang="ts" setup>
import type { Jar } from "~/lib/types";

const props = defineProps<{
  isFirstShelf?: boolean;
  jarsList?: Jar[];
  shelfId?: number;
}>();

const jarsStore = useJarsStore();
const shelvesStore = useShelvesStore();
const { shelves } = storeToRefs(shelvesStore);

const addJarTo = computed(() => {
  if (typeof props.shelfId !== "number") {
    return "/dashboard/add-jar";
  }

  const shelfExists = (shelves.value ?? []).some(shelf => shelf.id === props.shelfId);
  if (!shelfExists) {
    return "/dashboard/add-jar";
  }

  return {
    path: "/dashboard/add-jar",
    query: {
      shelf: props.shelfId.toString(),
    },
  };
});
</script>

<template>
  <!-- ----------------------------- if jars exist -------------------------------- -->
  <div
    v-if="jarsList && jarsList.length > 0"
    class="flex flex-col"
  >
    <div class="flex gap-4 p-4 overflow-x-auto overflow-y-hidden">
      <div
        v-for="jar in props.jarsList"
        :key="jar.id"
      >
        <NuxtLink
          :to="{
            name: 'dashboard-jars-slug',
            params: { slug: jar.slug },
          }"
          :aria-label="`link to ${jar.name}`"
          class="flex flex-col card-compact max-h-75 min-h-75 aspect-square rounded-full p-3 border-2 border-solid"
          :class="jarsStore.hoveredId === `jar-${jar.id}` ? 'border-primary bg-base-300' : 'bg-base-100' "
          @mouseenter="jarsStore.hoveredId = `jar-${jar.id}`"
          @mouseleave="jarsStore.hoveredId = ''"
        >
          <div class="flex flex-col pt-6 px-4 gap-2 text-center">
            <h3 class="text-xl line-clamp-2 text-pretty relative min-h-14 jar-header">
              {{ jar.name }}
            </h3>
            <p class="text-md line-clamp-4 text-pretty">
              {{ jar.description }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
    <AppShelfTitle :is-first-shelf :shelf-id>
      <slot />
    </AppShelfTitle>
  </div>

  <!-- ---------------------------------- if no jars on shelf ---------------------------------- -->
  <div v-if="jarsList && jarsList.length === 0">
    <div class="p-4">
      <div class="flex card-compact bg-base-100 max-h-75 min-h-75 aspect-square rounded-full p-3 border-2 border-dashed">
        <div class="card-body text-center flex flex-col items-center justify-center gap-4">
          <p class="text-lg max-h-fit text-pretty">
            Add a new jar to this shelf.
          </p>
          <NuxtLink
            :to="addJarTo"
            class="btn btn-secondary w-40"
          >
            Add Jar
            <Icon name="tabler:plus" size="24" />
          </NuxtLink>
        </div>
      </div>
    </div>
    <AppShelfTitle :shelf-id>
      <slot />
    </AppShelfTitle>
  </div>
</template>

<style scoped>
.jar-header::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 2px;
  height: 0.6rem;
  background: repeating-linear-gradient(to right, gray 0, gray 0.5rem, transparent 0.5rem, transparent 0.75rem);
  pointer-events: none;
}
</style>
