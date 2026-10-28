import * as tus from "tus-js-client";
import type { SupabaseClient } from "@supabase/supabase-js";

export const MILES_BUCKET = "bbm-miles";
export const MAX_MILES_BYTES = 15 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MILES_ACCEPT = Object.keys(EXTENSIONS).join(",");

export function validateMilesPhoto(file: File): string | null {
  if (!(file.type in EXTENSIONS)) {
    return "FORMATO INVÁLIDO. ENVIE JPG, PNG OU WEBP.";
  }
  if (file.size <= 0) return "O ARQUIVO ESTÁ VAZIO.";
  if (file.size > MAX_MILES_BYTES) {
    return "A FOTO NÃO PODE ULTRAPASSAR 15 MB.";
  }
  return null;
}

export function makeMilesPath(userId: string, mimeType: string): string {
  const ext = EXTENSIONS[mimeType];
  if (!ext) throw new Error("TIPO DE IMAGEM NÃO SUPORTADO.");
  return `${userId}/${crypto.randomUUID()}.${ext}`;
}

export async function uploadMilesPhoto(
  supabase: SupabaseClient,
  file: File,
  path: string,
  onProgress: (percent: number) => void
): Promise<void> {
  const invalid = validateMilesPhoto(file);
  if (invalid) throw new Error(invalid);

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    throw new Error("SESSÃO EXPIRADA. ENTRE NOVAMENTE.");
  }

  const storageUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  storageUrl.hostname = storageUrl.hostname.replace(
    /\.supabase\.co$/, ".storage.supabase.co"
  );
  const endpoint = `${storageUrl.origin}/storage/v1/upload/resumable`;

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint,
      chunkSize: 6 * 1024 * 1024,
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      retryDelays: [0, 3000, 5000, 10000],
      headers: {
        authorization: `Bearer ${session.access_token}`,
        "x-upsert": "false",
      },
      metadata: {
        bucketName: MILES_BUCKET,
        objectName: path,
        contentType: file.type,
        cacheControl: "3600",
      },
      onProgress(uploaded, total) {
        onProgress(Math.round((uploaded / total) * 100));
      },
      onError(error) { reject(error); },
      onSuccess() { resolve(); },
    });
    upload.start();
  });
}

export async function signMilesPhoto(
  supabase: SupabaseClient,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(MILES_BUCKET)
    .createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) {
    throw error ?? new Error("FOTO INDISPONÍVEL.");
  }
  return data.signedUrl;
}

export async function removeMilesPhoto(
  supabase: SupabaseClient,
  path: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(MILES_BUCKET)
    .remove([path]);
  if (error) throw error;
}
