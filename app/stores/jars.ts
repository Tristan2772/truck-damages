import type { SelectJarNoteWithImages, SelectJarWithNotes } from "~/lib/db/schema";

import { CURRENT_JAR_PAGES, CURRENT_NOTE_PAGES, DASHBOARD_PAGES } from "~/lib/constants";

export const useJarsStore = defineStore("useJarsStore", () => {
  const route = useRoute();
  const jarUrlWithSlug = computed(() => `/api/jars/${route.params.slug}`);
  const noteUrlWithSlugAndId = computed(() => `/api/jars/${route.params.slug}/${route.params.id}`);

  const { data: allJars, status: allJarsStatus, refresh: allJarsRefresh,
  } = useFetch("/api/jars", {
    lazy: true,
  });

  const { data: currentJar, status: currentJarStatus, error: currentJarError, refresh: currentJarRefresh } = useFetch<SelectJarWithNotes>(jarUrlWithSlug, {
    lazy: true,
    immediate: false,
    watch: false,
  });

  const { data: currentNote, status: currentNoteStatus, error: currentNoteError, refresh: currentNoteRefresh } = useFetch<SelectJarNoteWithImages>(noteUrlWithSlugAndId, {
    lazy: true,
    immediate: false,
    watch: false,
  });

  const sidebarStore = useSidebarStore();

  effect(() => {
    if (allJars.value && DASHBOARD_PAGES.has(route.name?.toString() || "")) {
      const sidebarItems: SidebarItem[] = [];
      sidebarStore.loading = false;

      allJars.value.forEach((jar) => {
        sidebarItems.push({
          id: `jar-${jar.id}`,
          label: jar.name,
          to: { name: "dashboard-jars-slug", params: { slug: jar.slug } },
        });
      });
      sidebarStore.sidebarItems = sidebarItems;
    }
    else if (currentJar.value && CURRENT_JAR_PAGES.has(route.name?.toString() || "")) {
      const sidebarItems: SidebarItem[] = [];
      sidebarStore.loading = false;

      currentJar.value.jarNotes.forEach((note) => {
        sidebarItems.push({
          id: `note-${note.id}`,
          label: note.name,
          icon: "tabler:file-text",
          to: { name: "dashboard-jars-slug-id", params: { slug: route.params.slug, id: note.id } },
        });
      });
      sidebarStore.sidebarItems = sidebarItems;
    }
    else if (currentNote.value && CURRENT_NOTE_PAGES.has(route.name?.toString() || "")) {
      const sidebarItems: SidebarItem[] = [];
      sidebarStore.loading = false;
      sidebarStore.sidebarItems = sidebarItems;
    }
    sidebarStore.loading = allJarsStatus.value === "pending" || currentJarStatus.value === "pending";
  });

  const hoveredId = ref<string>("");
  return {
    hoveredId,
    allJars,
    allJarsStatus,
    allJarsRefresh,
    currentJar,
    currentJarStatus,
    currentJarError,
    currentJarRefresh,
    currentNote,
    currentNoteStatus,
    currentNoteError,
    currentNoteRefresh,
  };
});
