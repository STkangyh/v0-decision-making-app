"use client";

import { create } from "zustand";
import { supabase, getAnonId } from "./supabase";
import { getUser } from "./user";
import { generateNickname } from "./nickname";
import type { Post, Comment, Choice } from "./types";

interface StoreState {
  posts: Post[];
  votes: Record<string, Choice>;
  myNickname: string;
  hydrated: boolean;
  hydrate: () => void;
  fetchPosts: () => Promise<void>;
  addPost: (
    post: Omit<Post, "id" | "votesA" | "votesB" | "comments" | "createdAt">
  ) => Promise<string | null>;
  castVote: (postId: string, choice: Choice) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  getPost: (id: string) => Post | undefined;
  _upsertPost: (post: Post) => void;
  _updatePostVotes: (postId: string, votesA: number, votesB: number) => void;
  _appendComment: (comment: Comment) => void;
}

// Map Supabase row to app Post type
function mapPost(row: Record<string, unknown>, comments: Comment[] = []): Post {
  return {
    id: row.id as string,
    category: row.category as Post["category"],
    title: row.title as string,
    description: (row.description as string) || "",
    optionA: row.option_a as string,
    optionB: row.option_b as string,
    votesA: (row.votes_a as number) || 0,
    votesB: (row.votes_b as number) || 0,
    comments,
    expiresAt: row.expires_at as string,
    createdAt: row.created_at as string,
  };
}

function mapComment(row: Record<string, unknown>): Comment {
  return {
    id: row.id as string,
    postId: row.post_id as string,
    content: row.content as string,
    nickname: row.nickname as string,
    createdAt: row.created_at as string,
  };
}

export const useStore = create<StoreState>((set, get) => ({
  posts: [],
  votes: {},
  myNickname: "",
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;

    // Nickname from user profile or localStorage fallback
    const user = getUser();
    let nick = user?.nickname || "";
    if (!nick) {
      try {
        nick = localStorage.getItem("dfm-nickname") || "";
      } catch {}
    }
    if (!nick) {
      nick = generateNickname();
      localStorage.setItem("dfm-nickname", nick);
    }

    set({ myNickname: nick, hydrated: true });

    // Fetch initial data
    get().fetchPosts();

    // Load my votes
    const anonId = getAnonId();
    console.log("[hydrate] anonId:", anonId);
    supabase
      .from("votes")
      .select("post_id, choice")
      .eq("anon_id", anonId)
      .then(({ data, error }) => {
        console.log("[hydrate] my votes:", { data, error });
        if (data) {
          const votes: Record<string, Choice> = {};
          data.forEach((v) => {
            votes[v.post_id] = v.choice as Choice;
          });
          set({ votes });
        }
      });

    // Realtime: new posts
    supabase
      .channel("posts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const newPost = mapPost(payload.new);
          const existing = get().posts.find((p) => p.id === newPost.id);
          if (!existing) {
            set((s) => ({ posts: [newPost, ...s.posts] }));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts" },
        (payload) => {
          const updated = payload.new;
          set((s) => ({
            posts: s.posts.map((p) =>
              p.id === updated.id
                ? {
                    ...p,
                    votesA: (updated.votes_a as number) || 0,
                    votesB: (updated.votes_b as number) || 0,
                  }
                : p
            ),
          }));
        }
      )
      .subscribe();

    // Realtime: new comments
    supabase
      .channel("comments-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          const comment = mapComment(payload.new);
          get()._appendComment(comment);
        }
      )
      .subscribe();
  },

  fetchPosts: async () => {
    const { data: postsData, error: postsErr } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("[fetchPosts] result:", { count: postsData?.length, error: postsErr });
    if (postsData?.[0]) console.log("[fetchPosts] first post votes:", { votes_a: postsData[0].votes_a, votes_b: postsData[0].votes_b });
    if (!postsData) return;

    // Fetch all comments
    const postIds = postsData.map((p) => p.id);
    const { data: commentsData } = await supabase
      .from("comments")
      .select("*")
      .in("post_id", postIds)
      .order("created_at", { ascending: false });

    const commentsByPost: Record<string, Comment[]> = {};
    (commentsData || []).forEach((c) => {
      const comment = mapComment(c);
      if (!commentsByPost[comment.postId]) commentsByPost[comment.postId] = [];
      commentsByPost[comment.postId].push(comment);
    });

    const posts = postsData.map((row) =>
      mapPost(row, commentsByPost[row.id as string] || [])
    );
    set({ posts });
  },

  addPost: async (post) => {
    const anonId = getAnonId();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        category: post.category,
        title: post.title,
        description: post.description,
        option_a: post.optionA,
        option_b: post.optionB,
        expires_at: post.expiresAt,
        anon_id: anonId,
      })
      .select()
      .single();

    if (error || !data) return null;
    const newPost = mapPost(data);
    set((s) => ({ posts: [newPost, ...s.posts] }));
    return data.id as string;
  },

  castVote: async (postId, choice) => {
    const anonId = getAnonId();
    const prev = get().votes[postId];

    console.log("[vote] 시도:", { postId, choice, anonId, prev });

    // Optimistic update
    set((s) => {
      const posts = s.posts.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          votesA:
            p.votesA + (choice === "A" ? 1 : 0) - (prev === "A" ? 1 : 0),
          votesB:
            p.votesB + (choice === "B" ? 1 : 0) - (prev === "B" ? 1 : 0),
        };
      });
      return { posts, votes: { ...s.votes, [postId]: choice } };
    });

    // Step 1: Try upsert
    const { data: upsertData, error: upsertErr } = await supabase
      .from("votes")
      .upsert(
        { post_id: postId, anon_id: anonId, choice },
        { onConflict: "post_id,anon_id" }
      )
      .select();

    console.log("[vote] upsert result:", { data: upsertData, error: upsertErr });

    if (upsertErr) {
      console.error("[vote] upsert failed, trying delete+insert:", upsertErr.message);
      // Fallback: delete then insert
      const { error: delErr } = await supabase
        .from("votes")
        .delete()
        .eq("post_id", postId)
        .eq("anon_id", anonId);
      console.log("[vote] delete result:", { error: delErr });

      const { data: insData, error: insErr } = await supabase
        .from("votes")
        .insert({ post_id: postId, anon_id: anonId, choice })
        .select();
      console.log("[vote] insert fallback result:", { data: insData, error: insErr });

      if (insErr) {
        console.error("[vote] BOTH upsert and insert failed!", insErr.message);
      }
    }

    // Step 2: Directly count votes from votes table (don't rely on trigger)
    const [{ count: countA }, { count: countB }] = await Promise.all([
      supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId)
        .eq("choice", "A"),
      supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId)
        .eq("choice", "B"),
    ]);

    const votesA = countA ?? 0;
    const votesB = countB ?? 0;
    console.log("[vote] counted from votes table:", { votesA, votesB });

    // Step 3: Update posts table with correct counts
    await supabase
      .from("posts")
      .update({ votes_a: votesA, votes_b: votesB })
      .eq("id", postId);

    // Step 4: Update local state with DB truth
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId ? { ...p, votesA, votesB } : p
      ),
    }));
  },

  addComment: async (postId, content) => {
    const nickname = get().myNickname;
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, content, nickname })
      .select()
      .single();

    if (error || !data) return;
    const comment = mapComment(data);
    get()._appendComment(comment);
  },

  getPost: (id) => get().posts.find((p) => p.id === id),

  _upsertPost: (post) => {
    set((s) => {
      const exists = s.posts.find((p) => p.id === post.id);
      if (exists) {
        return {
          posts: s.posts.map((p) => (p.id === post.id ? post : p)),
        };
      }
      return { posts: [post, ...s.posts] };
    });
  },

  _updatePostVotes: (postId, votesA, votesB) => {
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId ? { ...p, votesA, votesB } : p
      ),
    }));
  },

  _appendComment: (comment) => {
    set((s) => ({
      posts: s.posts.map((p) => {
        if (p.id !== comment.postId) return p;
        const exists = p.comments.find((c) => c.id === comment.id);
        if (exists) return p;
        return { ...p, comments: [comment, ...p.comments] };
      }),
    }));
  },
}));
