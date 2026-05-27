<script lang="ts" setup>
import { FetchError } from "ofetch";

const jarStore = useJarsStore();
const { currentNote: note } = storeToRefs(jarStore);

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

async function uploadImage() {
  if (!image.value || !previewUrl.value) {
    return;
  }

  errorMessage.value = "";
  loading.value = true;
  const previewImage = new Image();
  previewImage.addEventListener("load", async () => {
    try {
      const width = Math.min(1000, previewImage.width);
      const resized = await createImageBitmap(previewImage, {
        resizeWidth: width,
      });
      const canvas = new OffscreenCanvas(width, resized.height);
      canvas.getContext("bitmaprenderer")?.transferFromImageBitmap(resized);
      const blob = await canvas.convertToBlob({
        type: "image/jpeg",
        quality: 0.9,
      });

      const checksum = await getChecksum(blob);

      const { fields, key, url } = await $csrfFetch(`/api/jars/${route.params.slug}/${route.params.id}/sign-image`, {
        method: "POST",
        body: {
          contentLength: blob.size,
          checksum,
        },
      });

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", blob);

      await $fetch(url, {
        method: "POST",
        body: formData,
      });

      await $csrfFetch(`/api/jars/${route.params.slug}/${route.params.id}/image`, {
        method: "POST",
        body: {
          key,
        },
      });

      await jarStore.currentNoteRefresh();
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
  });
  previewImage.src = previewUrl.value;
}
</script>

<template>
  <div class="flex flex-col gap-2 p-2 items-start">
    <h2 class="text-lg text-center">
      Manage "{{ note?.name }}" Images
    </h2>
    <div class="flex flex-col gap-2 w-72 relative">
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
    <div v-if="note && note.images.length > 0" class="w-full">
      <AppImageList
        :images="note.images"
      />
    </div>
  </div>
</template>
