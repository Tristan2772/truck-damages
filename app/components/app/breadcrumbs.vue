<script lang="ts" setup>
const route = useRoute();

function formatSegment(segment: string) {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function isReportIdSegment(segment: string | undefined) {
  if (!segment) {
    return false;
  }

  return !["add", "edit", "images"].includes(segment);
}

function getCrumbTarget(segments: string[], index: number, runningPath: string) {
  const segment = segments[index];

  if (segment === "trucks") {
    const vin = segments[index + 1];

    if (vin) {
      return `/damages/trucks/${vin}`;
    }
  }

  if (segment === "reports") {
    const trucksIndex = segments.indexOf("trucks");
    const vin = trucksIndex >= 0 ? segments[trucksIndex + 1] : undefined;
    const reportId = isReportIdSegment(segments[index + 1]) ? segments[index + 1] : undefined;

    if (vin && reportId) {
      return `/damages/trucks/${vin}/reports/${reportId}`;
    }

    if (vin) {
      return `/damages/trucks/${vin}`;
    }
  }

  return runningPath;
}

const crumbs = computed(() => {
  const rawPath = route.path.split("?")[0] || "/";
  const segments = rawPath.split("/").filter(Boolean);
  const items: { label: string; to: string }[] = [{
    label: "Home",
    to: "/",
  }];

  let runningPath = "";
  for (const [index, segment] of segments.entries()) {
    runningPath += `/${segment}`;
    items.push({
      label: formatSegment(segment),
      to: getCrumbTarget(segments, index, runningPath),
    });
  }

  return items;
});
</script>

<template>
  <nav class="bg-base-200 px-4 py-2 border-b border-base-content/10 overflow-x-auto" aria-label="Breadcrumb">
    <div class="text-sm">
      <div class="breadcrumbs">
        <ul>
          <li v-for="(crumb, index) in crumbs" :key="`${crumb.to}-${index}`">
            <span v-if="index === crumbs.length - 1" class="text-base-content/70">
              {{ crumb.label }}
            </span>
            <NuxtLink
              v-else
              :to="crumb.to"
              class="link link-hover"
            >
              {{ crumb.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
