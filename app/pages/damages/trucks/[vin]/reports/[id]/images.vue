<script lang="ts" setup>
import { FetchError } from "ofetch";

import type { SelectTruckReportImage } from "~/lib/db/schema";

import { isManagerEmail } from "~/utils/permissions";

const truckStore = useTrucksStore();
const { currentReport: report } = storeToRefs(truckStore);
const authStore = useAuthStore();

const isManager = computed(() => isManagerEmail(authStore.user?.email));
const canUploadImages = computed(() => {
  if (!report.value || !authStore.user) {
    return false;
  }

  return isManager.value || Number(authStore.user.id) === report.value.userId;
});

function canDeleteImage(image: SelectTruckReportImage) {
  if (!authStore.user) {
    return false;
  }

  return isManager.value || Number(authStore.user.id) === image.userId;
}

const { $csrfFetch } = useNuxtApp();
const route = useRoute();

const inputRef = useTemplateRef("imageInput");
const image = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const loading = ref(false);
const errorMessage = ref("");

function selectImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
    image.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
}

async function getChecksum(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

async function prepareImageForUpload(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Unable to read image file."));
      image.src = objectUrl;
    });

    const naturalWidth = imageElement.naturalWidth || imageElement.width;
    const naturalHeight = imageElement.naturalHeight || imageElement.height;
    const maxDimension = 1000;

    if (naturalWidth <= maxDimension && naturalHeight <= maxDimension) {
      return file;
    }

    const canvas = document.createElement("canvas");
    const width = Math.min(maxDimension, naturalWidth);
    const height = Math.min(maxDimension, naturalHeight);
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(imageElement, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });

    if (!blob) {
      return file;
    }

    return new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
      type: "image/jpeg",
    });
  }
  catch {
    return file;
  }
  finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function uploadImage() {
  if (!image.value || !previewUrl.value) {
    return;
  }

  errorMessage.value = "";
  loading.value = true;

  try {
    const uploadFile = await prepareImageForUpload(image.value);
    const checksum = await getChecksum(uploadFile);

    const { fields, key, url } = await $csrfFetch(`/api/trucks/${route.params.vin}/${route.params.id}/sign-image`, {
      method: "POST",
      body: {
        contentLength: uploadFile.size,
        checksum,
      },
    });

    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append("file", uploadFile);

    await $fetch(url, {
      method: "POST",
      body: formData,
    });

    await $csrfFetch(`/api/trucks/${route.params.vin}/${route.params.id}/image`, {
      method: "POST",
      body: {
        key,
      },
    });

    await truckStore.currentReportRefresh();
    image.value = null;
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = null;
    if (inputRef.value) {
      inputRef.value.value = "";
    }
  }
  catch (e) {
    if (e instanceof FetchError) {
      errorMessage.value = (e as FetchError).statusMessage || "Unknown Error";
    }
    else if (e instanceof Error) {
      errorMessage.value = (e as Error).message;
    }
    else {
      errorMessage.value = "Unknown Error";
    }
  }
  finally {
    loading.value = false;
  }
}

const isOpen = ref(false);
const deletingImage = ref<SelectTruckReportImage | null>(null);
const isDeleting = ref(false);

function onDialogClose() {
  deletingImage.value = null;
  isOpen.value = false;
}

function deleteImage(image: SelectTruckReportImage) {
  deletingImage.value = image;
  isOpen.value = true;
}

async function confirmDelete() {
  if (!deletingImage.value) {
    return;
  }
  isOpen.value = false;
  try {
    errorMessage.value = "";
    isDeleting.value = true;
    await $fetch(`/api/trucks/${route.params.vin}/${route.params.id}/image/${deletingImage.value?.id}`, {
      method: "DELETE",
    });
    await truckStore.currentReportRefresh();
  }
  catch (e) {
    const error = e as FetchError;
    errorMessage.value = getFetchErrorMessage(error);
  }
  isDeleting.value = false;
  deletingImage.value = null;
}
</script>

<template>
  <div class="flex flex-col gap-2 p-2 items-start">
    <h2 class="text-lg text-center">
      Manage "{{ formatDateYearLast(Number(report?.createdAt)) }}" Images
    </h2>
    <div v-if="canUploadImages" class="flex flex-col gap-2 w-72 relative">
      <div class="bg-gray-500 h-30 w-full flex justify-center items-center p-2">
        <p v-if="!previewUrl" class="text-center text-white">
          Select an image
        </p>
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt="Upload Preview"
          class="h-full object-cover"
        >
        <div v-if="loading || errorMessage" class="bottom-0 left-0 top-0 w-full absolute flex justify-center items-center bg-black opacity-50">
          <div v-if="loading && !errorMessage" class="loading loading-spinner loading-lg" />
          <div v-if="!loading && errorMessage" class="error">
            {{ errorMessage }}
          </div>
        </div>
      </div>
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        capture="environment"
        class="file-input"
        :disabled="loading"
        @change="selectImage"
      >
      <button
        :disabled="!image || loading"
        class="btn btn-secondary"
        @click="uploadImage"
      >
        Upload
        <Icon
          name="tabler:photo-share"
          size="24"
        />
      </button>
    </div>
    <div v-else class="alert alert-warning">
      <span>Only managers and the report owner can add or edit images for this report.</span>
    </div>
    <div v-if="report && report.images.length > 0" class="w-full">
      <AppImageList
        :images="report.images"
        :enable-lightbox="false"
      >
        <template #default="{ image: item }">
          <button
            v-if="canDeleteImage(item)"
            :disabled="deletingImage === item && isDeleting"
            class="btn btn-error btn-xs w-full"
            @click="deleteImage(item)"
          >
            Delete
            <div v-if="deletingImage === item && isDeleting" />
            <Icon
              v-if="!isDeleting && deletingImage !== item"
              name="tabler:trash-x-filled"
              size="18"
            />
          </button>
        </template>
      </AppImageList>
    </div>
    <AppDialog
      :is-open="isOpen"
      title="Are you sure?"
      description="Deleting this image cannot be undone. Are you sure you want to do this?"
      confirm-class="btn-error"
      confirm-label="Yes, Delete this Image."
      @on-closed="onDialogClose"
      @on-confirmed="confirmDelete"
    />
  </div>
</template>
