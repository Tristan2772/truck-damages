type PresignedImageUpload = {
  fields: Record<string, string>;
  key: string;
  url: string;
};

type CsrfFetch = <T>(url: string, options: Record<string, unknown>) => Promise<T>;

async function getChecksum(blob: Blob): Promise<string | null> {
  const subtle = globalThis.crypto?.subtle;

  if (!subtle) {
    return null;
  }

  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await subtle.digest("SHA-256", arrayBuffer);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

async function prepareImageForUpload(file: File): Promise<Blob> {
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

    return blob || file;
  }
  catch {
    return file;
  }
  finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadTruckReportImage(
  csrfFetch: CsrfFetch,
  vin: string,
  reportId: number,
  file: File,
) {
  const preparedImage = await prepareImageForUpload(file);
  const uploadBlob = preparedImage.size > 0 ? preparedImage : file;
  const checksum = await getChecksum(uploadBlob);
  const upload = await csrfFetch<PresignedImageUpload>(`/api/trucks/${vin}/${reportId}/sign-image`, {
    method: "POST",
    body: {
      contentLength: uploadBlob.size,
      ...(checksum ? { checksum } : {}),
    },
  });

  const formData = new FormData();
  Object.entries(upload.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", uploadBlob);

  await $fetch(upload.url, {
    method: "POST",
    body: formData,
  });

  await csrfFetch(`/api/trucks/${vin}/${reportId}/image`, {
    method: "POST",
    body: {
      key: upload.key,
    },
  });
}
