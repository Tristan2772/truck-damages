<script lang="ts" setup>
import type { ReportRecency } from "~/utils/report-recency";

defineProps<{
  recency: ReportRecency;
}>();
</script>

<template>
  <div class="flex items-center gap-3 py-1 text-xs font-semibold uppercase text-error">
    <span class="h-px flex-1 bg-error" />
    <span>
      {{
        recency === "today"
          ? "from today"
          : recency === "last-7-days"
            ? "from last 7 days"
            : "older than 7 days"
      }}
    </span>
    <span class="h-px flex-1 bg-error" />
  </div>
</template>
