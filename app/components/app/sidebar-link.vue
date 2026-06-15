<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";

const props = defineProps<{
  linkId?: string;
  label: string;
  link?: string;
  to?: RouteLocationRaw;
  showLabel: boolean;
  isHoveredJar?: boolean;
  icon?: string;
  component?: "JarIcon" | "JarSettingsIcon" | "JarUpdateIcon" | "JarsGroupIcon" | "NoteSettingsIcon" | "NoteUpdateIcon";
}>();

const route = useRoute();
const router = useRouter();

const popoverRef = useTemplateRef<HTMLDivElement>("popover");
const supportsHover = ref(false);
const hoverMediaQuery = ref<MediaQueryList | null>(null);

function updateSupportsHover() {
  if (hoverMediaQuery.value) {
    supportsHover.value = hoverMediaQuery.value.matches;
  }
}

onMounted(() => {
  hoverMediaQuery.value = window.matchMedia("(hover: hover) and (pointer: fine)");
  updateSupportsHover();
  hoverMediaQuery.value.addEventListener("change", updateSupportsHover);
});

onBeforeUnmount(() => {
  hoverMediaQuery.value?.removeEventListener("change", updateSupportsHover);
});

function showPopover() {
  if (!props.showLabel && supportsHover.value) {
    popoverRef.value?.togglePopover(true);
  }
}

function hidePopover() {
  popoverRef.value?.togglePopover(false);
}
</script>

<template>
  <div @mouseenter="showPopover" @mouseleave="hidePopover">
    <NuxtLink
      :to="props.link || props.to"
      :aria-label="`link to ${props.label}`"
      class="btn btn-ghost gap-2 p-2 bg-base-100 hover:bg-base-300 w-full flex"
      :class="{ 'bg-base-200': route.path === props.link || (props.to ? route.path === router.resolve(props.to).path : false), 'bg-base-300': isHoveredJar, 'justify-center': !showLabel, 'justify-start': showLabel }"
      :style="`anchor-name:--anchor-${linkId}`"
    >
      <AppJarIcon v-if="(!props.icon && !props.component) || props.component === 'JarIcon'" class="shrink-0" />
      <AppJarSettingsIcon v-if="props.component === 'JarSettingsIcon'" class="shrink-0" />
      <AppJarUpdateIcon v-if="props.component === 'JarUpdateIcon'" class="shrink-0" />
      <AppJarsGroupIcon v-if="props.component === 'JarsGroupIcon'" class="shrink-0" />
      <AppNoteSettingsIcon v-if="props.component === 'NoteSettingsIcon'" class="shrink-0" />
      <AppNoteUpdateIcon v-if="props.component === 'NoteUpdateIcon'" class="shrink-0" />
      <Icon
        v-if="props.icon"
        :name="props.icon"
        class="shrink-0"
        size="24"
      />
      <Transition name="grow" class="truncate">
        <span v-if="props.showLabel">
          {{ props.label }}
        </span>
      </Transition>
    </NuxtLink>
    <div
      v-if="supportsHover"
      :id="`popover-${linkId}`"
      ref="popover"
      class="max-w-52 rounded-box shadow-sm p-2 text-sm text-gray-200"
      popover
      :style="`position-anchor:--anchor-${linkId};background-color:var(--color-neutral);`"
    >
      {{ props.label }}
    </div>
  </div>
</template>

<style scoped>
[popover] {
  position: fixed;
  inset: unset;
  top: anchor(center);
  left: anchor(right);
  translate: 0 -50%;
  margin-left: 0.5rem;
  border: none;
  overflow: visible;
}

[popover]::before {
  content: "";
  position: absolute;
  left: -0.3rem;
  top: 50%;
  translate: 0 -50%;
  border: 0.5rem solid transparent;
  border-right-color: var(--color-neutral);
  border-left: none;
}

.grow-enter-active {
  animation: grow 0.3s ease-in;
}
.grow-leave-active {
  animation: grow 0.1s ease-out reverse;
}
@keyframes grow {
  0% {
    scale: 0;
  }
  100% {
    scale: 1;
  }
}
</style>
