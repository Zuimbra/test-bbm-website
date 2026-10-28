"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MILES_ACCEPT,
  makeMilesPath,
  removeMilesPhoto,
  signMilesPhoto,
  uploadMilesPhoto,
  validateMilesPhoto,
} from "@/lib/miles-media";

type Mile = {
  id: string;
  author_id: string;
  photo_path: string;
  location: string | null;
  distance_km: number | null;
  description: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
};

type GalleryMile = Mile & { photoUrl: string };

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const fieldClass =
  "w-full border border-neutral-600 bg-[#111111] px-4 py-3 " +
  "text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white";

export default function YourMiles({ userId }: { userId: string }) {
  const [supabase] = useState(createClient);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [gallery, setGallery] = useState<GalleryMile[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!photo) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();
      if (!active) return;
      setIsAdmin(!error && Boolean(data));
      setAdminError(error ? "NÃO FOI POSSÍVEL VERIFICAR AS PERMISSÕES DE ADMIN." : "");
    })();
    return () => { active = false; };
  }, [supabase, userId]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data, error } = await supabase
        .from("community_miles")
        .select(
          "id, author_id, photo_path, location, distance_km, description, status, created_at, reviewed_at"
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(60);

      if (!active) return;
      if (error) {
        setGallery([]);
        setLoadError(error.message);
        return;
      }

      const rows = (data ?? []) as Mile[];
      const signed = await Promise.all(rows.map(async (mile) => {
        try {
          const photoUrl = await signMilesPhoto(supabase, mile.photo_path);
          return { ...mile, photoUrl };
        } catch {
          // Esconde registros cujo upload não foi concluído.
          return null;
        }
      }));
      if (!active) return;

      setGallery(signed.filter((mile): mile is GalleryMile => mile !== null));
      setLoadError("");
    })();
    return () => { active = false; };
  }, [supabase, refreshVersion]);

  const reloadGallery = () => setRefreshVersion((version) => version + 1);

  function selectPhoto(file?: File) {
    if (!file) return;
    const invalid = validateMilesPhoto(file);
    if (invalid) {
      setNotice(invalid);
      return;
    }
    setNotice("");
    setPhoto(file);
  }

  async function submitMile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo || busyAction) return;

    const invalid = validateMilesPhoto(photo);
    if (invalid) { setNotice(invalid); return; }

    const parsedDistance = distance.trim()
      ? Number(distance.replace(",", "."))
      : null;
    if (parsedDistance !== null &&
        (!Number.isFinite(parsedDistance) || parsedDistance <= 0 || parsedDistance >= 10000)) {
      setNotice("DISTÂNCIA INVÁLIDA.");
      return;
    }

    const path = makeMilesPath(userId, photo.type);
    setBusyAction("upload");
    setUploadProgress(0);
    setNotice("");
    let insertedId: string | null = null;

    try {
      // O objeto ainda não existe: a linha permite o upload via Storage RLS.
      // A publicação já nasce aprovada; não existe aprovação humana.
      const { data, error: insertError } = await supabase
        .from("community_miles")
        .insert({
          author_id: userId,
          photo_path: path,
          status: "approved",
          location: location.trim() || null,
          distance_km: parsedDistance,
          description: description.trim() || null,
        })
        .select("id")
        .single();
      if (insertError || !data) {
        throw insertError ?? new Error("NÃO FOI POSSÍVEL CRIAR A PUBLICAÇÃO.");
      }
      insertedId = data.id as string;

      await uploadMilesPhoto(supabase, photo, path, setUploadProgress);

      setPhoto(null);
      setLocation("");
      setDistance("");
      setDescription("");
      setShowForm(false);
      setNotice("FOTO PUBLICADA NA COMUNIDADE.");
      reloadGallery();
    } catch (error) {
      // Rollback de melhor esforço se o upload falhar após o INSERT.
      if (insertedId) {
        try { await removeMilesPhoto(supabase, path); }
        catch { /* objeto possivelmente não foi criado */ }
        await supabase.from("community_miles").delete().eq("id", insertedId);
      }
      setNotice(
        `NÃO FOI POSSÍVEL PUBLICAR: ${error instanceof Error ? error.message : "ERRO DESCONHECIDO"}`
      );
    } finally {
      setBusyAction(null);
      setUploadProgress(0);
    }
  }

  async function toggleReviewed(mile: GalleryMile) {
    if (!isAdmin || busyAction) return;
    setBusyAction(`review-${mile.id}`);
    setNotice("");
    const reviewed = mile.reviewed_at !== null;
    try {
      const { error } = await supabase
        .from("community_miles")
        .update({
          reviewed_at: reviewed ? null : new Date().toISOString(),
          reviewed_by: reviewed ? null : userId,
        })
        .eq("id", mile.id);
      if (error) throw error;
      setGallery((previous) => previous?.map((item) => item.id === mile.id
        ? { ...item, reviewed_at: reviewed ? null : new Date().toISOString() }
        : item) ?? null);
      setNotice(reviewed ? "REVISÃO DESFEITA." : "FOTO MARCADA COMO REVISADA.");
    } catch (error) {
      setNotice(
        `ERRO AO REVISAR: ${error instanceof Error ? error.message : "ERRO DESCONHECIDO"}`
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function deleteMile(mile: GalleryMile) {
    if (!isAdmin || busyAction ||
        !window.confirm("Excluir esta foto da comunidade permanentemente?")) return;
    setBusyAction(`delete-${mile.id}`);
    setNotice("");
    try {
      // Storage primeiro: a política de SELECT do bucket precisa que a
      // linha no banco ainda exista para permitir a exclusão do objeto.
      await removeMilesPhoto(supabase, mile.photo_path);
      const { error } = await supabase
        .from("community_miles")
        .delete()
        .eq("id", mile.id);
      if (error) throw error;
      setGallery((previous) => previous?.filter((item) => item.id !== mile.id) ?? null);
      setNotice("PUBLICAÇÃO EXCLUÍDA.");
    } catch (error) {
      setNotice(
        `NÃO FOI POSSÍVEL EXCLUIR: ${error instanceof Error ? error.message : "ERRO DESCONHECIDO"}`
      );
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-700 pt-6">
        <p className="max-w-sm text-xs leading-relaxed text-neutral-400">
          Seus lugares, suas histórias, seus miles. Compartilhe um momento usando a BBM.
        </p>
        <button
          type="button"
          disabled={busyAction !== null}
          onClick={() => setShowForm((value) => !value)}
          className="border border-white bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-black transition hover:bg-transparent hover:text-white disabled:opacity-50"
        >
          {showForm ? "FECHAR ×" : "+ COMPARTILHAR FOTO"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitMile} className="mt-6 space-y-5 border border-neutral-600 bg-[#222222] p-5 md:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            NOVA PUBLICAÇÃO / YOUR MILES
          </p>
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">FOTOGRAFIA / OBRIGATÓRIA</p>
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-3 border border-white bg-white px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-black transition hover:bg-transparent hover:text-white focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white sm:w-auto">
              <input
                type="file"
                accept={MILES_ACCEPT}
                className="sr-only"
                disabled={busyAction !== null}
                onChange={(event) => {
                  selectPhoto(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <span className="text-lg leading-none" aria-hidden="true">+</span>
              <span>{photo ? "TROCAR FOTO" : "ESCOLHER FOTOGRAFIA"}</span>
            </label>
            <p className="break-all text-[10px] text-neutral-500">
              {photo ? photo.name : "JPG, PNG OU WEBP / ATÉ 15 MB"}
            </p>
            {previewUrl && (
              <div className="space-y-3">
                <img src={previewUrl} alt="Prévia da fotografia selecionada" className="max-h-[420px] w-full bg-black object-contain" />
                <button type="button" onClick={() => setPhoto(null)} className="text-[10px] uppercase text-neutral-400 hover:text-white">
                  REMOVER FOTO ×
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="miles-location" className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">LOCAL / OPCIONAL</label>
              <input id="miles-location" maxLength={120} value={location} disabled={busyAction !== null}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Ex.: Fortaleza, CE" className={fieldClass} />
            </div>
            <div className="space-y-2">
              <label htmlFor="miles-distance" className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">DISTÂNCIA EM KM / OPCIONAL</label>
              <input id="miles-distance" type="number" min="0.01" max="9999.99" step="0.01" value={distance}
                disabled={busyAction !== null} onChange={(event) => setDistance(event.target.value)}
                placeholder="Ex.: 5.00" className={fieldClass} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="miles-description" className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">SUA HISTÓRIA / OPCIONAL</label>
            <textarea id="miles-description" rows={4} maxLength={1200} value={description}
              disabled={busyAction !== null} onChange={(event) => setDescription(event.target.value)}
              placeholder="Conta um pouco sobre esse momento..." className={`${fieldClass} resize-y`} />
          </div>

          <p className="text-[10px] leading-relaxed text-neutral-500">
            Ao enviar, a foto será publicada imediatamente para os membros da comunidade.
            Envie apenas imagens que você tem autorização para compartilhar.
          </p>
          {busyAction === "upload" && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em]">ENVIANDO FOTO / {uploadProgress}%</p>
              <div className="h-1 w-full bg-neutral-700">
                <div className="h-full bg-white transition-[width]" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
          <button type="submit" disabled={!photo || busyAction !== null}
            className="bg-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-black transition hover:bg-neutral-300 disabled:opacity-40">
            {busyAction === "upload" ? "PUBLICANDO..." : "PUBLICAR FOTO ↗"}
          </button>
        </form>
      )}

      {adminError && <p role="alert" className="mt-5 text-xs text-amber-300">{adminError}</p>}
      {notice && <p role="status" className="mt-5 text-xs leading-relaxed text-neutral-300">{notice}</p>}
      {loadError && <p role="alert" className="mt-5 text-xs text-red-300">ERRO AO CARREGAR: {loadError}</p>}
      {gallery === null && <p className="py-14 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-500">CARREGANDO GALERIA...</p>}
      {gallery?.length === 0 && !loadError && (
        <div className="mt-8 border-t border-neutral-700 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">NENHUMA FOTO AINDA.</p>
          <p className="mt-3 text-sm text-neutral-400">O primeiro mile está esperando.</p>
        </div>
      )}

      
      <div className="mt-8 columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 lg:gap-5">
        {gallery?.map((mile) => (
          
        <article
          key={mile.id}
          className="
            mb-3 inline-block w-full
            break-inside-avoid
            overflow-hidden
            border border-neutral-700
            bg-[#111111]
            align-top
            sm:mb-4 lg:mb-5
          "
        >

            <div className="relative overflow-hidden bg-black">
              <img src={mile.photoUrl} alt={mile.description || "Fotografia da comunidade Built By Miles"}
                loading="lazy" className="aspect-[3/4] w-full object-cover" />
              {isAdmin && (
                <span className="absolute right-3 top-3 border border-white/10 bg-black/65 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-neutral-300">
                  {mile.reviewed_at ? "REVISADO" : "NÃO REVISADO"}
                </span>
              )}
            </div>

            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                <span>{mile.author_id === userId ? "VOCÊ" : `MEMBRO / ${mile.author_id.slice(0, 6).toUpperCase()}`}</span>
                <span>{formatDate(mile.created_at)}</span>
              </div>
              {(mile.location || mile.distance_km != null) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium uppercase tracking-wide text-neutral-200">
                  {mile.location && <span>{mile.location}</span>}
                  {mile.distance_km != null && <span>{mile.distance_km} KM</span>}
                </div>
              )}
              {mile.description && <p className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-400">{mile.description}</p>}

              {isAdmin && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800 pt-4">
                  <button type="button" disabled={busyAction !== null}
                    onClick={() => void toggleReviewed(mile)}
                    className="text-[10px] uppercase tracking-widest text-neutral-500 transition hover:text-white disabled:opacity-40">
                    {mile.reviewed_at ? "DESMARCAR REVISÃO" : "MARCAR REVISADO ✓"}
                  </button>
                  <button type="button" disabled={busyAction !== null}
                    onClick={() => void deleteMile(mile)}
                    className="text-[10px] uppercase tracking-widest text-neutral-600 transition hover:text-red-300 disabled:opacity-40">
                    EXCLUIR
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
