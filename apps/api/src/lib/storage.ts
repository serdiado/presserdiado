// MinIO / S3-uyumlu object storage istemcisi. Kimlik bilgileri yalnızca config'ten
// (.env) gelir — koda gömülmez.
import { Client } from 'minio';
import { config } from '../config.js';

const endpoint = new URL(config.s3.endpoint);

export const storageClient = new Client({
  endPoint: endpoint.hostname,
  port: endpoint.port ? Number(endpoint.port) : endpoint.protocol === 'https:' ? 443 : 80,
  useSSL: endpoint.protocol === 'https:',
  accessKey: config.s3.accessKey,
  secretKey: config.s3.secretKey,
  region: config.s3.region,
});

// Bucket yoksa oluşturur (idempotent).
export async function ensureBucket(bucket: string): Promise<void> {
  const exists = await storageClient.bucketExists(bucket).catch(() => false);
  if (!exists) {
    await storageClient.makeBucket(bucket, config.s3.region);
  }
}

export async function putObject(
  bucket: string,
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  await storageClient.putObject(bucket, key, buffer, buffer.length, {
    'Content-Type': contentType,
  });
}

// Object'i stream olarak döndürür (örn. PDF indirme). key DAİMA sunucu tarafı
// kaynaktan (DB) gelmeli — kullanıcı girdisi key'e konkat edilmez (path traversal).
export async function getObject(
  bucket: string,
  key: string,
): Promise<NodeJS.ReadableStream> {
  return storageClient.getObject(bucket, key);
}
