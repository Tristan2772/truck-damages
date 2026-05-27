<script lang="ts" setup>
import type { FetchError } from "ofetch";

const jarStore = useJarsStore();
const { currentJar: jar, currentJarError: error, currentJarStatus: status, hoveredId } = storeToRefs(jarStore);
const route = useRoute();
const isOpen = ref(false);

function openDialog() {
  isOpen.value = true;
  (document.activeElement as HTMLAnchorElement).blur();
}

const isDeleting = ref(false);
const loading = computed(() => status.value === "pending" || isDeleting.value);
const deleteError = ref("");
const errorMessage = computed(() => error.value?.statusMessage || deleteError.value);

async function confirmDelete() {
  try {
    isOpen.value = false;
    deleteError.value = "";
    isDeleting.value = true;
    await $fetch(`/api/jars/${route.params.slug}`, {
      method: "DELETE",
    });
    navigateTo("/dashboard");
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = error.data?.statusMessage || error.statusMessage || "An unknown error occurred";
  }
  isDeleting.value = false;
}

const sidebarStore = useSidebarStore();

onMounted(() => {
  window.addEventListener("resize", checkOverflow);
  setTimeout(() => {
    jarStore.currentJarRefresh();
    checkOverflow();
  }, 0);
});

onBeforeRouteUpdate((to) => {
  if (to.name === "dashboard-jars-slug") {
    setTimeout(() => {
      jarStore.currentJarRefresh();
      navigateTo({
        name: "dashboard-jars-slug",
        params: {
          slug: route.params.slug,
        },
      });
    }, 1);
  }
});

const descriptionRef = ref<HTMLParagraphElement | null>(null);
const isOverflowing = ref(false);
const isExpanded = ref(false);

function checkOverflow() {
  if (descriptionRef.value) {
    isOverflowing.value = descriptionRef.value.scrollHeight > descriptionRef.value.clientHeight;
  }
}

watch(jar, () => {
  isExpanded.value = false;
  nextTick(checkOverflow);
});

watch(isExpanded, (val) => {
  if (!val && descriptionRef.value) {
    descriptionRef.value.scrollTop = 0;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkOverflow);
});
</script>

<template>
  <div>
    <div v-if="loading">
      <span class="loading loading-spinner p-4 loading-xl" />
    </div>
    <div v-if="errorMessage && !loading">
      <div role="alert" class="alert alert-error">
        <Icon name="tabler:square-rounded-letter-x-filled" size="24" />
        <span>{{ errorMessage }}</span>
      </div>
    </div>
    <div v-if="route.name === 'dashboard-jars-slug' && jar && !loading">
      <div class="flex pb-40">
        <div class="flex flex-col gap-2 items-center text-center fixed bottom-0 z-10 pt-20 transition-all duration-300 pointer-events-none max-h-[80vh]" :class="{ 'left-16': !sidebarStore.isSidebarOpen, 'left-64': sidebarStore.isSidebarOpen, 'right-3': !isExpanded }">
          <div class="w-full pointer-events-auto flex flex-col gap-2 justify-center items-center pt-5 bg-linear-to-b from-transparent to-base-300" :class="isExpanded ? 'to-7%' : 'to-15%' ">
            <h2 class="text-2xl flex items-center gap-2 text-balance">
              <span :class="{ 'line-clamp-2': !isExpanded }">{{ jar.name }}</span>
              <!-- ------ expansion button ------- -->
              <button
                v-if="isOverflowing"
                class="btn btn-ghost hover:bg-base-100 p-2"
                @click="isExpanded = !isExpanded"
              >
                <Icon
                  v-if="!isExpanded"
                  size="18"
                  name="tabler:layout-bottombar-expand-filled"
                />
                <Icon
                  v-if="isExpanded"
                  size="18"
                  name="tabler:layout-navbar-expand-filled"
                />
              </button>
              <div class="dropdown dropdown-top dropdown-end">
                <div
                  tabindex="0"
                  role="button"
                  class="btn btn-sm btn-ghost hover:bg-base-100 p-2"
                >
                  <Icon name="tabler:dots-vertical" size="18" />
                </div>
                <ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm mb-2">
                  <li>
                    <NuxtLink
                      :to="{
                        name: 'dashboard-jars-slug-edit',
                        params: {
                          slug: route.params.slug,
                        },
                      }"
                    >
                      <AppJarSettingsIcon />
                      Edit
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="" @click="openDialog">
                      <Icon name="tabler:trash-x-filled" size="24" />
                      Delete
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </h2>
            <p
              ref="descriptionRef"
              class="text-sm mb-4 text-pretty"
              :class="isExpanded ? 'overflow-y-auto max-h-54' : 'max-h-20 line-clamp-4'"
            >
              {{ jar.description }}
            </p>
          </div>
        </div>
        <div class="p-4 flex w-full">
          <!-- ----------------if there are no notes for this jar ----------------------- -->
          <div v-if="!jar.jarNotes.length" class="zig-zag bg-base-100 h-35">
            <div class="card-body text-center flex flex-col items-center justify-center gap-4">
              <p class="text-lg max-h-fit">
                Add a note to get started.
              </p>
              <NuxtLink :to="{ name: 'dashboard-jars-slug-add', params: { slug: route.params.slug } }" class="btn btn-secondary w-40">
                Add Note
                <Icon name="tabler:plus" size="24" />
              </NuxtLink>
            </div>
          </div>

          <!-- ---------------------------- if there are notes ---------------------------- -->
          <div v-if="jar.jarNotes.length > 0" class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 w-full">
            <AppJarNote
              v-for="note in jar.jarNotes"
              :key="note.id"
              :note-id="note.id"
              :name="note.name"
              :description="note.description"
              :started-at="note.startedAt"
              :ended-at="note.endedAt"
              :is-hovered="hoveredId === `note-${note.id}`"
              class="zig-zag transition-all duration-300"
              :class="{ 'scale-105': hoveredId === `note-${note.id}` }"
              @mouseenter="hoveredId = `note-${note.id}`"
              @mouseleave="hoveredId = ''"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="route.name !== 'dashboard-jars-slug' && jar && status !== 'pending'">
      <NuxtPage />
    </div>
    <AppDialog
      :is-open="isOpen"
      title="Are you sure?"
      description="Deleting this jar will delete all associated notes. This cannot be undone. Are you sure you want to do this?"
      confirm-class="btn-error"
      confirm-label="Yes, Delete this Jar."
      @on-closed="isOpen = false"
      @on-confirmed="confirmDelete"
    />
  </div>
</template>

<style scoped>
.zig-zag {
  --a: 90deg;
  --s: 15px;
  mask: conic-gradient(from calc(var(--a) / -2) at bottom, #000 0 var(--a), #0000 0);
  mask-size: var(--s) 100%;
}
</style>
