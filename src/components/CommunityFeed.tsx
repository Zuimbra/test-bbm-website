
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type FeedPost = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
};

type FeedComment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
};

type Props = {
  userId: string;
};

function formatDate(value: string) {
  return new Date(value)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

export default function CommunityFeed({ userId }: Props) {
  const [supabase] = useState(createClient);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");

  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);

  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);

  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const [editingId, setEditingId] = useState<string | null>(
    null
  );
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [commentDrafts, setCommentDrafts] = useState<
    Record<string, string>
  >({});

  const [busyAction, setBusyAction] = useState<string | null>(
    null
  );

  // CONFERE SE A CONTA É ADMINISTRADORA
  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setAdminError(
          "COULD NOT VERIFY ADMIN PERMISSIONS."
        );
        setIsAdmin(false);
        return;
      }

      setAdminError("");
      setIsAdmin(Boolean(data));
    }

    void checkAdmin();

    return () => {
      active = false;
    };
  }, [supabase, userId]);

  // CARREGA POSTS E COMENTÁRIOS
  useEffect(() => {
    let active = true;

    async function loadFeed() {
      const postResult = await supabase
        .from("feed_posts")
        .select("id, author_id, title, content, created_at")
        .order("created_at", { ascending: false })
        .limit(30);

      if (!active) return;

      if (postResult.error) {
        setLoadError(postResult.error.message);
        setPosts([]);
        return;
      }

      const nextPosts = (postResult.data ?? []) as FeedPost[];
      let nextComments: FeedComment[] = [];

      if (nextPosts.length > 0) {
        const commentResult = await supabase
          .from("feed_comments")
          .select(
            "id, post_id, author_id, content, created_at"
          )
          .in(
            "post_id",
            nextPosts.map((post) => post.id)
          )
          .order("created_at", { ascending: true })
          .limit(1000);

        if (!active) return;

        if (commentResult.error) {
          setLoadError(commentResult.error.message);
          setPosts(nextPosts);
          return;
        }

        nextComments =
          (commentResult.data ?? []) as FeedComment[];
      }

      if (!active) return;

      setPosts(nextPosts);
      setComments(nextComments);
      setLoadError("");
    }

    void loadFeed();

    return () => {
      active = false;
    };
  }, [supabase, refreshVersion]);

  function refreshFeed() {
    setRefreshVersion((previous) => previous + 1);
  }

  // ADMIN: CRIAR POST
  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newTitle.trim();
    const content = newContent.trim();

    if (!isAdmin || !title || !content || busyAction) return;

    setBusyAction("create");
    setNotice("");

    try {
      const { error } = await supabase
        .from("feed_posts")
        .insert({
          author_id: userId,
          title,
          content,
        });

      if (error) {
        setNotice(`COULD NOT PUBLISH: ${error.message}`);
        return;
      }

      setNewTitle("");
      setNewContent("");
      setShowNewPost(false);
      setNotice("POST PUBLISHED.");
      refreshFeed();
    } finally {
      setBusyAction(null);
    }
  }

  // ADMIN: INICIAR EDIÇÃO
  function startEditing(post: FeedPost) {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setNotice("");
  }

  // ADMIN: SALVAR EDIÇÃO
  async function saveEdit(
    event: FormEvent<HTMLFormElement>,
    postId: string
  ) {
    event.preventDefault();

    const title = editTitle.trim();
    const content = editContent.trim();

    if (!isAdmin || !title || !content || busyAction) return;

    setBusyAction(`edit-${postId}`);
    setNotice("");

    try {
      const { error } = await supabase
        .from("feed_posts")
        .update({ title, content })
        .eq("id", postId);

      if (error) {
        setNotice(`COULD NOT SAVE: ${error.message}`);
        return;
      }

      setEditingId(null);
      setNotice("POST UPDATED.");
      refreshFeed();
    } finally {
      setBusyAction(null);
    }
  }

  // ADMIN: EXCLUIR POST
  async function deletePost(postId: string) {
    if (!isAdmin || busyAction) return;

    if (
      !window.confirm(
        "Delete this post and all its comments?"
      )
    ) {
      return;
    }

    setBusyAction(`delete-post-${postId}`);
    setNotice("");

    try {
      const { error } = await supabase
        .from("feed_posts")
        .delete()
        .eq("id", postId);

      if (error) {
        setNotice(`COULD NOT DELETE: ${error.message}`);
        return;
      }

      setNotice("POST DELETED.");
      refreshFeed();
    } finally {
      setBusyAction(null);
    }
  }

  // MEMBROS: COMENTAR
  async function submitComment(postId: string) {
    const content = (commentDrafts[postId] ?? "").trim();

    if (!content || busyAction) return;

    setBusyAction(`comment-${postId}`);
    setNotice("");

    try {
      const { error } = await supabase
        .from("feed_comments")
        .insert({
          post_id: postId,
          author_id: userId,
          content,
        });

      if (error) {
        setNotice(`COULD NOT COMMENT: ${error.message}`);
        return;
      }

      setCommentDrafts((previous) => ({
        ...previous,
        [postId]: "",
      }));

      refreshFeed();
    } finally {
      setBusyAction(null);
    }
  }

  // EXCLUIR COMENTÁRIO PRÓPRIO OU MODERAR
  async function deleteComment(comment: FeedComment) {
    if (
      (comment.author_id !== userId && !isAdmin) ||
      busyAction
    ) {
      return;
    }

    if (!window.confirm("Delete this comment?")) return;

    setBusyAction(`delete-comment-${comment.id}`);
    setNotice("");

    try {
      const { error } = await supabase
        .from("feed_comments")
        .delete()
        .eq("id", comment.id);

      if (error) {
        setNotice(`COULD NOT DELETE: ${error.message}`);
        return;
      }

      refreshFeed();
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="mt-10">

      {/* BARRA ADMINISTRATIVA */}
      {isAdmin && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-700 pt-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            ADMIN ACCESS / ENABLED
          </p>

          <button
            type="button"
            onClick={() =>
              setShowNewPost((previous) => !previous)
            }
            className="bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#111111] transition hover:bg-neutral-300"
          >
            {showNewPost ? "CANCEL" : "+ NEW POST"}
          </button>
        </div>
      )}

      {adminError && (
        <p className="mb-5 text-xs text-amber-300">
          {adminError}
        </p>
      )}

      {/* FORMULÁRIO DE NOVO POST */}
      {isAdmin && showNewPost && (
        <form
          onSubmit={createPost}
          className="mb-8 space-y-4 border border-neutral-600 bg-[#222222] p-5"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            NEW OFFICIAL POST
          </p>

          <input
            type="text"
            required
            maxLength={120}
            value={newTitle}
            onChange={(event) =>
              setNewTitle(event.target.value)
            }
            placeholder="Post title"
            className="w-full border border-neutral-600 bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white"
          />

          <textarea
            required
            rows={5}
            maxLength={5000}
            value={newContent}
            onChange={(event) =>
              setNewContent(event.target.value)
            }
            placeholder="What's happening at BBM?"
            className="w-full resize-y border border-neutral-600 bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white"
          />

          <button
            type="submit"
            disabled={busyAction !== null}
            className="bg-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black transition hover:bg-neutral-300 disabled:opacity-50"
          >
            {busyAction === "create"
              ? "PUBLISHING..."
              : "PUBLISH POST ↗"}
          </button>
        </form>
      )}

      {/* MENSAGENS DE RESULTADO */}
      {notice && (
        <p
          role="status"
          className="mb-6 text-xs leading-relaxed text-neutral-300"
        >
          {notice}
        </p>
      )}

      {loadError && (
        <p role="alert" className="mb-6 text-xs text-red-300">
          UNABLE TO LOAD FEED: {loadError}
        </p>
      )}

      {/* CARREGAMENTO */}
      {posts === null && (
        <p className="py-12 text-center text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          LOADING THE FEED...
        </p>
      )}

      {/* FEED VAZIO */}
      {posts?.length === 0 && !loadError && (
        <div className="border-t border-neutral-700 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            NO POSTS YET.
          </p>

          <p className="mt-3 text-sm text-neutral-400">
            The first mile is coming.
          </p>
        </div>
      )}

      {/* PUBLICAÇÕES */}
      <div className="space-y-6">
        {posts?.map((post) => {
          const postComments = comments.filter(
            (comment) => comment.post_id === post.id
          );

          return (
            <article
              key={post.id}
              className="min-w-0 border border-neutral-700 bg-[#111111] p-5 md:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  BUILT BY MILES / OFFICIAL
                  <span className="ml-3 text-neutral-600">
                    {formatDate(post.created_at)}
                  </span>
                </p>

                {/* CONTROLES DE ADMIN */}
                {isAdmin && editingId !== post.id && (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => startEditing(post)}
                      className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-white disabled:opacity-40"
                    >
                      EDIT
                    </button>

                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => void deletePost(post.id)}
                      className="text-[10px] uppercase tracking-widest text-neutral-500 hover:text-red-300 disabled:opacity-40"
                    >
                      DELETE
                    </button>
                  </div>
                )}
              </div>

              {/* EDIÇÃO OU VISUALIZAÇÃO DO POST */}
              {editingId === post.id ? (
                <form
                  onSubmit={(event) =>
                    void saveEdit(event, post.id)
                  }
                  className="mt-6 space-y-4"
                >
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={editTitle}
                    onChange={(event) =>
                      setEditTitle(event.target.value)
                    }
                    className="w-full border border-neutral-600 bg-[#222222] px-4 py-3 text-sm text-white outline-none focus:border-white"
                  />

                  <textarea
                    required
                    rows={5}
                    maxLength={5000}
                    value={editContent}
                    onChange={(event) =>
                      setEditContent(event.target.value)
                    }
                    className="w-full resize-y border border-neutral-600 bg-[#222222] px-4 py-3 text-sm text-white outline-none focus:border-white"
                  />

                  <div className="flex gap-5">
                    <button
                      type="submit"
                      disabled={busyAction !== null}
                      className="text-xs font-bold uppercase text-white disabled:opacity-40"
                    >
                      SAVE CHANGES
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs uppercase text-neutral-500"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 className="mt-6 break-words text-2xl font-black uppercase tracking-tighter md:text-3xl">
                    {post.title}
                  </h3>

                  <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-neutral-300">
                    {post.content}
                  </p>
                </>
              )}

              {/* COMENTÁRIOS */}
              <div className="mt-10 border-t border-neutral-700 pt-6">
                <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                  COMMENTS / {postComments.length}
                </p>

                <div className="space-y-5">
                  {postComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-b border-neutral-800 pb-5 last:border-b-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                          {comment.author_id === userId
                            ? "YOU"
                            : `MEMBER / ${comment.author_id
                                .slice(0, 6)
                                .toUpperCase()}`}
                          <span className="ml-3 text-neutral-600">
                            {formatDate(comment.created_at)}
                          </span>
                        </p>

                        {(isAdmin ||
                          comment.author_id === userId) && (
                          <button
                            type="button"
                            disabled={busyAction !== null}
                            onClick={() =>
                              void deleteComment(comment)
                            }
                            className="text-[10px] uppercase tracking-widest text-neutral-600 hover:text-red-300 disabled:opacity-40"
                          >
                            DELETE
                          </button>
                        )}
                      </div>

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-300">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* NOVO COMENTÁRIO */}
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submitComment(post.id);
                  }}
                  className="mt-7 space-y-3"
                >
                  <label
                    htmlFor={`comment-${post.id}`}
                    className="block text-[10px] uppercase tracking-[0.2em] text-neutral-500"
                  >
                    JOIN THE CONVERSATION
                  </label>

                  <textarea
                    id={`comment-${post.id}`}
                    required
                    rows={3}
                    maxLength={1000}
                    placeholder="Write a comment..."
                    value={commentDrafts[post.id] ?? ""}
                    onChange={(event) =>
                      setCommentDrafts((previous) => ({
                        ...previous,
                        [post.id]: event.target.value,
                      }))
                    }
                    className="w-full resize-y border border-neutral-700 bg-[#1B1B1B] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white"
                  />

                  <button
                    type="submit"
                    disabled={busyAction !== null}
                    className="border border-white bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black transition hover:bg-transparent hover:text-white disabled:opacity-40"
                  >
                    {busyAction === `comment-${post.id}`
                      ? "POSTING..."
                      : "POST COMMENT ↗"}
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
