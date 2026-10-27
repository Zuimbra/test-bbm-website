import * as tus from "tus-js-client";
import type { SupabaseClient } from "@supabase/supabase-js";

export const FEED_BUCKET = "bbm-feed";
export const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

const FILE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export const MEDIA_ACCEPT = Object.keys(FILE_EXTENSIONS).join(",");

export function validateFeedMedia(file: File): string | null {
  if (!FILE_EXTENSIONS[file.type]) {
    return "FORMATO NÃO PERMITIDO. USE JPG, PNG, WEBP, GIF, MP4, WEBM OU MOV.";
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return "ARQUIVO MUITO GRANDE. LIMITE DE 50 MB.";
  }
  if (file.size === 0) return "O ARQUIVO ESTÁ VAZIO.";
  return null;
}

export async function uploadFeedMedia(
  supabase: SupabaseClient,
  file: File,
  userId: string,
  onProgress: (percent: number) => void
): Promise<{ path: string; type: string }> {
  const invalid = validateFeedMedia(file);
  if (invalid) throw new Error(invalid);

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    throw new Error("SESSÃO EXPIRADA. ENTRE NOVAMENTE NA COMUNIDADE.");
  }

  const path = `${userId}/${crypto.randomUUID()}.${FILE_EXTENSIONS[file.type]}`;

  const storageUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  storageUrl.hostname = storageUrl.hostname.replace(
    /\.supabase\.co$/,
    ".storage.supabase.co"
  );
  const endpoint = `${storageUrl.origin}/storage/v1/upload/resumable`;

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${session.access_token}`,
        "x-upsert": "false",
      },
      metadata: {
        bucketName: FEED_BUCKET,
        objectName: path,
        contentType: file.type,
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024,
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      onProgress(bytesUploaded, bytesTotal) {
        onProgress(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onError(error) {
        reject(error);
      },
      onSuccess() {
        resolve();
      },
    });

    // Paths são únicos a cada envio. Não reutilizar fingerprints de uploads
    // anteriores, porque isso poderia apontar para outro caminho no Storage.
    upload.start();
  });

  return { path, type: file.type };
}

export async function removeFeedMedia(
  supabase: SupabaseClient,
  path: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(FEED_BUCKET)
    .remove([path]);
  if (error) throw error;
}

export async function signFeedMedia(
  supabase: SupabaseClient,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(FEED_BUCKET)
    .createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) {
    throw error ?? new Error("Não foi possível obter a URL da mídia.");
  }
  return data.signedUrl;
}
