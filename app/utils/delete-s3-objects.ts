import type { S3Client } from "@aws-sdk/client-s3";

import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

const S3_DELETE_BATCH_SIZE = 200;

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

export default async function deleteS3Objects(client: S3Client, bucket: string, keys: string[]) {
  const uniqueKeys = [...new Set(keys.filter(Boolean))];

  if (!uniqueKeys.length) {
    return;
  }

  for (const batch of chunk(uniqueKeys, S3_DELETE_BATCH_SIZE)) {
    const command = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: batch.map(key => ({ Key: key })),
        Quiet: true,
      },
    });

    const result = await client.send(command);

    if (result.Errors?.length) {
      const reasons = result.Errors.map(error => `${error.Key ?? "<unknown>"} (${error.Code ?? "UnknownCode"})`).join(", ");
      throw new Error(`Failed to delete one or more S3 objects: ${reasons}`);
    }
  }
}
