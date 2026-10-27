"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MEDIA_ACCEPT,
  validateFeedMedia,
  uploadFeedMedia,
  removeFeedMedia,
  signFeedMedia,
} from "@/lib/feed-media";

type FeedPost = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  media_path: string | null;
  media_type: string | null;
};

type FeedComment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }).toUpperCase();
}

function MediaPreview({
  file,
  url,
  type,
  alt,
}: {
  file?: File | null;
  url?: string | null;
  type?: string | null;
  alt: string;
}) {
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setLocalUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setLocalUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const src = file ? localUrl : url;
  if (!src) return null;
  const mediaType = file?.type ?? type ?? "";

  return mediaType.startsWith("video/") ? (
    <video
      key={src}
      src={src}
      controls
      playsInline
      preload="metadata"
      className="max-h-[560px] w-full bg-black object-contain"
    />
  ) : (
    <img
      src={src}
      alt={alt}
      className="max-h-[640px] w-full bg-black object-contain"
    />
  );
}

export default function CommunityFeed({ userId }: { userId: string }) {
  const [supabase] = useState(createClient);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [removeExistingMedia, setRemoveExistingMedia] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data, error } = await supabase.from("admin_users")
        .select("user_id").eq("user_id", userId).maybeSingle();
      if (!active) return;
      setIsAdmin(!error && Boolean(data));
      setAdminError(error ? "COULD NOT VERIFY ADMIN PERMISSIONS." : "");
    })();
    return () => { active = false; };
  }, [supabase, userId]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await supabase.from("feed_posts")
        .select("id, author_id, title, content, created_at, media_path, media_type")
        .order("created_at", { ascending: false }).limit(30);
      if (!active) return;
      if (result.error) {
        setLoadError(result.error.message);
        setPosts([]);
        return;
      }

      const nextPosts = (result.data ?? []) as FeedPost[];
      const ids = nextPosts.map((post) => post.id);
      let nextComments: FeedComment[] = [];
      if (ids.length) {
        const commentResult = await supabase.from("feed_comments")
          .select("id, post_id, author_id, content, created_at")
          .in("post_id", ids)
          .order("created_at", { ascending: true }).limit(1000);
        if (!active) return;
        if (commentResult.error) {
          setLoadError(commentResult.error.message);
          setPosts(nextPosts);
          return;
        }
        nextComments = (commentResult.data ?? []) as FeedComment[];
      }

      // Mídias privadas: uma URL temporária para cada publicação com arquivo.
      const signed = await Promise.all(nextPosts.map(async (post) => {
        if (!post.media_path) return [post.id, ""] as const;
        try {
          const url = await signFeedMedia(supabase, post.media_path);
          return [post.id, url] as const;
        } catch {
          return [post.id, ""] as const;
        }
      }));
      if (!active) return;
      setMediaUrls(Object.fromEntries(signed));
      setPosts(nextPosts);
      setComments(nextComments);
      setLoadError("");
    })();
    return () => { active = false; };
  }, [supabase, refreshVersion]);

  const refreshFeed = () => setRefreshVersion((value) => value + 1);

  function pickFile(file: File | undefined, setFile: (file: File | null) => void) {
    if (!file) return;
    const error = validateFeedMedia(file);
    if (error) { setNotice(error); setFile(null); return; }
    setNotice("");
    setFile(file);
  }

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    const content = newContent.trim();
    if (!isAdmin || !title || !content || busyAction) return;
    setBusyAction("create");
    setUploadProgress(0);
    setNotice("");
    let uploadedPath: string | null = null;
    try {
      let mediaType: string | null = null;
      if (newFile) {
        const uploaded = await uploadFeedMedia(supabase, newFile, userId, setUploadProgress);
        uploadedPath = uploaded.path;
        mediaType = uploaded.type;
      }
      const { error } = await supabase.from("feed_posts").insert({
        author_id: userId, title, content,
        media_path: uploadedPath,
        media_type: mediaType,
      });
      if (error) throw error;
      setNewTitle(""); setNewContent(""); setNewFile(null);
      setShowNewPost(false);
      setNotice("POST PUBLISHED.");
      refreshFeed();
    } catch (error) {
      if (uploadedPath) {
        try { await removeFeedMedia(supabase, uploadedPath); } catch { /* limpeza futura */ }
      }
      setNotice(`COULD NOT PUBLISH: ${error instanceof Error ? error.message : "UNKNOWN ERROR"}`);
    } finally {
      setBusyAction(null);
      setUploadProgress(0);
    }
  }

  function startEditing(post: FeedPost) {
    setEditingId(post.id); setEditTitle(post.title); setEditContent(post.content);
    setEditFile(null); setRemoveExistingMedia(false); setNotice("");
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault();
    const post = posts?.find((item) => item.id === postId);
    const title = editTitle.trim();
    const content = editContent.trim();
    if (!isAdmin || !post || !title || !content || busyAction) return;
    setBusyAction(`edit-${postId}`);
    setUploadProgress(0);
    setNotice("");
    let uploadedPath: string | null = null;
    try {
      let mediaPath = removeExistingMedia ? null : post.media_path;
      let mediaType = removeExistingMedia ? null : post.media_type;
      if (editFile) {
        const uploaded = await uploadFeedMedia(supabase, editFile, userId, setUploadProgress);
        uploadedPath = uploaded.path;
        mediaPath = uploaded.path;
        mediaType = uploaded.type;
      }
      const { error } = await supabase.from("feed_posts")
        .update({ title, content, media_path: mediaPath, media_type: mediaType })
        .eq("id", postId);
      if (error) throw error;

      // Apaga arquivo antigo APÓS atualizar o registro, evitando links quebrados.
      let cleanupFailed = false;
      if (post.media_path && post.media_path !== mediaPath) {
        try { await removeFeedMedia(supabase, post.media_path); }
        catch { cleanupFailed = true; }
      }
      setEditingId(null); setEditFile(null); setRemoveExistingMedia(false);
      setNotice(cleanupFailed ? "POST UPDATED. OLD FILE CLEANUP FAILED." : "POST UPDATED.");
      refreshFeed();
    } catch (error) {
      if (uploadedPath) {
        try { await removeFeedMedia(supabase, uploadedPath); } catch { /* limpeza futura */ }
      }
      setNotice(`COULD NOT SAVE: ${error instanceof Error ? error.message : "UNKNOWN ERROR"}`);
    } finally {
      setBusyAction(null);
      setUploadProgress(0);
    }
  }

  async function deletePost(post: FeedPost) {
    if (!isAdmin || busyAction ||
      !window.confirm("Delete this post and all its comments?")) return;
    setBusyAction(`delete-post-${post.id}`); setNotice("");
    try {
      const { error } = await supabase.from("feed_posts").delete().eq("id", post.id);
      if (error) throw error;
      let cleanupFailed = false;
      if (post.media_path) {
        try { await removeFeedMedia(supabase, post.media_path); }
        catch { cleanupFailed = true; }
      }
      setNotice(cleanupFailed ? "POST DELETED. MEDIA CLEANUP FAILED." : "POST DELETED.");
      refreshFeed();
    } catch (error) {
      setNotice(`COULD NOT DELETE: ${error instanceof Error ? error.message : "UNKNOWN ERROR"}`);
    } finally { setBusyAction(null); }
  }

  async function submitComment(postId: string) {
    const content = (commentDrafts[postId] ?? "").trim();
    if (!content || busyAction) return;
    setBusyAction(`comment-${postId}`); setNotice("");
    try {
      const { error } = await supabase.from("feed_comments").insert({
        post_id: postId, author_id: userId, content,
      });
      if (error) throw error;
      setCommentDrafts((old) => ({ ...old, [postId]: "" }));
      refreshFeed();
    } catch (error) {
      setNotice(`COULD NOT COMMENT: ${error instanceof Error ? error.message : "UNKNOWN ERROR"}`);
    } finally { setBusyAction(null); }
  }

  async function deleteComment(comment: FeedComment) {
    if ((comment.author_id !== userId && !isAdmin) || busyAction ||
      !window.confirm("Delete this comment?")) return;
    setBusyAction(`delete-comment-${comment.id}`); setNotice("");
    try {
      const { error } = await supabase.from("feed_comments").delete().eq("id", comment.id);
      if (error) throw error;
      refreshFeed();
    } catch (error) {
      setNotice(`COULD NOT DELETE: ${error instanceof Error ? error.message : "UNKNOWN ERROR"}`);
    } finally { setBusyAction(null); }
  }

  const fileInputClass = "block w-full text-xs text-neutral-400 file:mr-4 file:border-0 file:bg-white file:px-4 file:py-3 file:text-[10px] file:font-bold file:uppercase file:text-black";
  const fieldClass = "w-full border border-neutral-600 bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white";

  return (
    <div className="mt-10">
      {isAdmin && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-700 pt-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">ADMIN ACCESS / ENABLED</p>
          <button type="button" onClick={() => setShowNewPost((v) => !v)} disabled={busyAction !== null}
            className="bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black disabled:opacity-50">
            {showNewPost ? "CANCEL" : "+ NEW POST"}
          </button>
        </div>
      )}
      {adminError && <p className="mb-5 text-xs text-amber-300">{adminError}</p>}

      {isAdmin && showNewPost && (
        <form onSubmit={createPost} className="mb-8 space-y-4 border border-neutral-600 bg-[#222222] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">NEW OFFICIAL POST</p>
          <input required maxLength={120} value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Post title" className={fieldClass} />
          <textarea required rows={5} maxLength={5000} value={newContent} onChange={(e) => setNewContent(e.target.value)}
            placeholder="What's happening at BBM?" className={fieldClass} />

          {/* SELETOR DE MÍDIA */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              MÍDIA DA PUBLICAÇÃO / OPCIONAL
            </p>

            <label
              className={`
                inline-flex w-full cursor-pointer items-center
                justify-center gap-3
                border border-white bg-white
                px-6 py-4
                text-[11px] font-black uppercase
                tracking-[0.15em] text-[#111111]
                transition-all duration-300
                hover:bg-transparent hover:text-white
                focus-within:outline-2 focus-within:outline-offset-2
                focus-within:outline-white
                active:scale-[0.98]
                sm:w-auto
                ${busyAction !== null ? "pointer-events-none opacity-50" : ""}
              `}
            >
              <input
                type="file"
                accept={MEDIA_ACCEPT}
                disabled={busyAction !== null}
                className="sr-only"
                onChange={(e) => {
                  pickFile(e.target.files?.[0], setNewFile);
                  e.target.value = "";
                }}
              />

              <span className="text-lg leading-none" aria-hidden="true">+</span>

              <span>
                {newFile ? "TROCAR ARQUIVO" : "ADICIONAR FOTO OU VÍDEO"}
              </span>

              <span aria-hidden="true"></span>
            </label>

            <p className="break-all text-[10px] text-neutral-500">
              {newFile
                ? newFile.name
                : "JPG, PNG, WEBP, GIF, MP4, WEBM OU MOV — ATÉ 50 MB"}
            </p>
          </div>

          {newFile && (
            <div className="space-y-3">
              <MediaPreview file={newFile} alt="Prévia da publicação" />
              <button type="button" onClick={() => setNewFile(null)} className="text-xs uppercase text-neutral-400 hover:text-white">
                REMOVER ARQUIVO SELECIONADO ×
              </button>
            </div>
          )}
          {busyAction === "create" && newFile &&
            <p className="text-xs uppercase tracking-widest">UPLOADING / {uploadProgress}%</p>}
          <button disabled={busyAction !== null} type="submit"
            className="bg-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black disabled:opacity-50">
            {busyAction === "create" ? "PUBLISHING..." : "PUBLISH POST ↗"}
          </button>
        </form>
      )}

      {notice && <p role="status" className="mb-6 text-xs leading-relaxed text-neutral-300">{notice}</p>}
      {loadError && <p role="alert" className="mb-6 text-xs text-red-300">UNABLE TO LOAD FEED: {loadError}</p>}
      {posts === null && <p className="py-12 text-center text-xs uppercase text-neutral-500">LOADING THE FEED...</p>}
      {posts?.length === 0 && !loadError && (
        <div className="border-t border-neutral-700 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">NO POSTS YET.</p>
          <p className="mt-3 text-sm text-neutral-400">The first mile is coming.</p>
        </div>
      )}

      <div className="space-y-6">
        {posts?.map((post) => {
          const postComments = comments.filter((item) => item.post_id === post.id);
          return (
            <article key={post.id} className="min-w-0 border border-neutral-700 bg-[#111111] p-5 md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  BUILT BY MILES / OFFICIAL <span className="ml-3 text-neutral-600">{formatDate(post.created_at)}</span>
                </p>
                {isAdmin && editingId !== post.id && (
                  <div className="flex gap-4">
                    <button type="button" disabled={busyAction !== null} onClick={() => startEditing(post)}
                      className="text-[10px] uppercase text-neutral-400 hover:text-white disabled:opacity-40">EDIT</button>
                    <button type="button" disabled={busyAction !== null} onClick={() => void deletePost(post)}
                      className="text-[10px] uppercase text-neutral-500 hover:text-red-300 disabled:opacity-40">DELETE</button>
                  </div>
                )}
              </div>

              {editingId === post.id ? (
                <form onSubmit={(e) => void saveEdit(e, post.id)} className="mt-6 space-y-4">
                  <input required maxLength={120} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={fieldClass} />
                  <textarea required rows={5} maxLength={5000} value={editContent} onChange={(e) => setEditContent(e.target.value)} className={fieldClass} />
                  {!removeExistingMedia && !editFile && post.media_path && (
                    <div>
                      <p className="mb-3 text-[10px] uppercase text-neutral-500">CURRENT MEDIA</p>
                      <MediaPreview url={mediaUrls[post.id]} type={post.media_type} alt={post.title} />
                      <button type="button" onClick={() => setRemoveExistingMedia(true)}
                        className="mt-3 text-xs uppercase text-neutral-400 hover:text-white">REMOVE CURRENT MEDIA ×</button>
                    </div>
                  )}

              {/* SELETOR DE MÍDIA NA EDIÇÃO */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                  {post.media_path ? "SUBSTITUIR MÍDIA" : "ADICIONAR MÍDIA"}
                </p>

                <label
                  className={`
                    inline-flex w-full cursor-pointer items-center
                    justify-center gap-3
                    border border-white bg-white
                    px-6 py-4
                    text-[11px] font-black uppercase
                    tracking-[0.15em] text-[#111111]
                    transition-all duration-300
                    hover:bg-transparent hover:text-white
                    focus-within:outline-2 focus-within:outline-offset-2
                    focus-within:outline-white
                    active:scale-[0.98]
                    sm:w-auto
                    ${busyAction !== null ? "pointer-events-none opacity-50" : ""}
                  `}
                >
                  <input
                    type="file"
                    accept={MEDIA_ACCEPT}
                    disabled={busyAction !== null}
                    className="sr-only"
                    onChange={(e) => {
                      pickFile(e.target.files?.[0], setEditFile);
                      e.target.value = "";
                    }}
                  />

                  <span className="text-lg leading-none" aria-hidden="true">+</span>

                  <span>
                    {editFile ? "TROCAR ARQUIVO" : "ESCOLHER FOTO OU VÍDEO"}
                  </span>

                  <span aria-hidden="true">↗</span>
                </label>

                {editFile && (
                  <p className="break-all text-[10px] text-neutral-500">
                    {editFile.name}
                  </p>
                )}
              </div>

                  {editFile && (
                    <div className="space-y-3">
                      <MediaPreview file={editFile} alt="Prévia da nova mídia" />
                      <button type="button" onClick={() => setEditFile(null)} className="text-xs uppercase text-neutral-400">
                        CANCEL REPLACEMENT ×
                      </button>
                    </div>
                  )}
                  {busyAction === `edit-${post.id}` && editFile &&
                    <p className="text-xs uppercase tracking-widest">UPLOADING / {uploadProgress}%</p>}
                  <div className="flex gap-5">
                    <button type="submit" disabled={busyAction !== null} className="text-xs font-bold uppercase text-white disabled:opacity-40">
                      {busyAction === `edit-${post.id}` ? "SAVING..." : "SAVE CHANGES"}
                    </button>
                    <button type="button" disabled={busyAction !== null} onClick={() => { setEditingId(null); setEditFile(null); }}
                      className="text-xs uppercase text-neutral-500">CANCEL</button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 className="mt-6 break-words text-2xl font-black uppercase tracking-tighter md:text-3xl">{post.title}</h3>
                  <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-neutral-300">{post.content}</p>
                  {post.media_path && (
                    <div className="mt-7 overflow-hidden bg-black">
                      {mediaUrls[post.id] ?
                        <MediaPreview url={mediaUrls[post.id]} type={post.media_type} alt={post.title} /> :
                        <p className="p-5 text-xs uppercase text-neutral-500">MEDIA UNAVAILABLE. REFRESH TO RETRY.</p>}
                    </div>
                  )}
                </>
              )}

              <div className="mt-10 border-t border-neutral-700 pt-6">
                <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">COMMENTS / {postComments.length}</p>
                <div className="space-y-5">
                  {postComments.map((comment) => (
                    <div key={comment.id} className="border-b border-neutral-800 pb-5 last:border-b-0">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                          {comment.author_id === userId ? "YOU" : `MEMBER / ${comment.author_id.slice(0, 6).toUpperCase()}`}
                          <span className="ml-3 text-neutral-600">{formatDate(comment.created_at)}</span>
                        </p>
                        {(isAdmin || comment.author_id === userId) && (
                          <button type="button" disabled={busyAction !== null} onClick={() => void deleteComment(comment)}
                            className="text-[10px] uppercase text-neutral-600 hover:text-red-300 disabled:opacity-40">DELETE</button>
                        )}
                      </div>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-300">{comment.content}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); void submitComment(post.id); }} className="mt-7 space-y-3">
                  <label htmlFor={`comment-${post.id}`} className="block text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    JOIN THE CONVERSATION
                  </label>
                  <textarea id={`comment-${post.id}`} required rows={3} maxLength={1000} placeholder="Write a comment..."
                    value={commentDrafts[post.id] ?? ""}
                    onChange={(e) => setCommentDrafts((old) => ({ ...old, [post.id]: e.target.value }))}
                    className="w-full resize-y border border-neutral-700 bg-[#1B1B1B] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white" />
                  <button type="submit" disabled={busyAction !== null}
                    className="border border-white bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black hover:bg-transparent hover:text-white disabled:opacity-40">
                    {busyAction === `comment-${post.id}` ? "POSTING..." : "POST COMMENT ↗"}
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
