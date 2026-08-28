<script lang="ts" setup>
import type { InsertTruckReport } from "~/lib/db/schema";

import { uploadTruckReportImage } from "~/utils/upload-truck-report-image";

const trucksStore = useTrucksStore();
const route = useRoute();

const { $csrfFetch } = useNuxtApp() as any;

type SelectedImage = {
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "uploaded" | "failed";
  error?: string;
};

const selectedImages = ref<SelectedImage[]>([]);
const retryingUploads = ref(false);
const inputRef = useTemplateRef("imageInput");
const hasFailedImages = computed(() => selectedImages.value.some(image => image.status === "failed"));

function selectImages(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files || []);

  selectedImages.value.push(...files.map(file => ({
    file,
    previewUrl: URL.createObjectURL(file),
    status: "pending" as const,
  })));

  if (inputRef.value) {
    inputRef.value.value = "";
  }
}

function removeImage(selectedImage: SelectedImage) {
  URL.revokeObjectURL(selectedImage.previewUrl);
  selectedImages.value = selectedImages.value.filter(image => image !== selectedImage);
}

function getUploadError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Upload failed. Please try again.";
}

async function uploadPendingImages() {
  const vin = route.params.vin?.toString();
  const reportId = Number(route.params.id);

  if (!vin || !reportId) {
    throw new Error("Report information is missing.");
  }

  for (const selectedImage of selectedImages.value) {
    if (selectedImage.status !== "pending" && selectedImage.status !== "failed") {
      continue;
    }

    selectedImage.status = "uploading";
    selectedImage.error = undefined;

    try {
      await uploadTruckReportImage(
        $csrfFetch,
        vin,
        reportId,
        selectedImage.file,
      );
      selectedImage.status = "uploaded";
    }
    catch (error) {
      selectedImage.status = "failed";
      selectedImage.error = getUploadError(error);
    }
  }
}

async function onSubmit(values: InsertTruckReport) {
  await $csrfFetch(`/api/trucks/${route.params.vin}/${route.params.id}`, {
    method: "put",
    body: values,
  });

  await uploadPendingImages();
};

function onSubmitComplete() {
  if (hasFailedImages.value) {
    return;
  }

  navigateTo({
    name: "damages-trucks-vin-reports-id",
    params: {
      vin: route.params.vin,
      id: route.params.id,
    },
  });
}

async function retryFailedImages() {
  retryingUploads.value = true;
  await uploadPendingImages();
  retryingUploads.value = false;

  if (!hasFailedImages.value) {
    onSubmitComplete();
  }
}

function continueToReport() {
  navigateTo({
    name: "damages-trucks-vin-reports-id",
    params: {
      vin: route.params.vin,
      id: route.params.id,
    },
  });
}

onBeforeUnmount(() => {
  selectedImages.value.forEach(image => URL.revokeObjectURL(image.previewUrl));
});
</script>

<template>
  <div class="container max-w-md mx-auto p-2">
    <div class="my-4">
      <h1 class="text-lg">
        Edit Report
      </h1>
    </div>
    <template v-if="trucksStore.currentReportStatus !== 'pending'">
      <AppTruckReportForm
        v-slot="{ loading }"
        :on-submit
        :initial-values="trucksStore.currentReport"
        :initial-assigned-user="trucksStore.currentReport?.assignedUser"
        :on-submit-complete
        submit-label="Update"
        submit-icon="ReportUpdateIcon"
      >
        <fieldset class="mt-4" :disabled="loading || retryingUploads">
          <legend class="mb-2 text-sm font-medium">
            Photos (optional)
          </legend>
          <p>Take photos in landscape mode for best results.</p>
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            multiple
            class="file-input w-full"
            @change="selectImages"
          >
        </fieldset>

        <ul v-if="selectedImages.length" class="mt-3 space-y-2">
          <li
            v-for="selectedImage in selectedImages"
            :key="selectedImage.previewUrl"
            class="flex items-center gap-2"
          >
            <img
              :src="selectedImage.previewUrl"
              alt="Selected report photo"
              class="size-16 object-cover"
            >
            <div class="min-w-0 flex-1 text-sm">
              <p class="truncate">
                {{ selectedImage.file.name }}
              </p>
              <p v-if="selectedImage.status === 'uploading'">
                Uploading...
              </p>
              <p v-else-if="selectedImage.status === 'uploaded'">
                Uploaded
              </p>
              <p v-else-if="selectedImage.status === 'failed'" class="text-error">
                {{ selectedImage.error }}
              </p>
            </div>
            <button
              v-if="selectedImage.status === 'pending'"
              type="button"
              class="btn btn-ghost btn-square btn-sm"
              aria-label="Remove selected photo"
              @click="removeImage(selectedImage)"
            >
              <Icon name="tabler:x" size="20" />
            </button>
          </li>
        </ul>

        <div v-if="hasFailedImages" class="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="retryingUploads"
            @click="retryFailedImages"
          >
            Retry Failed Photos
            <span v-if="retryingUploads" class="loading loading-spinner loading-sm" />
          </button>
          <button
            type="button"
            class="btn btn-outline"
            @click="continueToReport"
          >
            Continue to Report
          </button>
        </div>
      </AppTruckReportForm>
    </template>
  </div>
</template>
