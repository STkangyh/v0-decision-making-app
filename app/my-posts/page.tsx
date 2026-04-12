"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, getAnonId } from "@/lib/supabase";
import { getUser } from "@/lib/user";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import type { Post, Category } from "@/lib/types";

const CATEGORY_EMOJI: Record<Category, string> = {
  옷: "👕",
  음식: "🍔",
  인간관계: "💬",
  기타: "✨",
};

function mapPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    category: row.category as Category,
    title: row.title as string,
    description: (row.description as string) || "",
    optionA: row.option_a as string,
    optionB: row.option_b as string,
    votesA: (row.votes_a as number) || 0,
    votesB: (row.votes_b as number) || 0,
    comments: [],
    expiresAt: row.expires_at as string,
    createdAt: row.created_at as string,
  };
}

export default function MyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePw, setDeletePw] = useState("");
  const [deleteErr, setDeleteErr] = useState("");
  const { show: showToast } = useToast();

  useEffect(() => {
    fetchMyPosts();
  }, []);

  async function fetchMyPosts() {
    const anonId = getAnonId();
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("anon_id", anonId)
      .order("created_at", { ascending: false });

    if (data) setPosts(data.map(mapPost));
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    const user = getUser();
    if (!user || deletePw !== user.password) {
      setDeleteErr("비밀번호가 틀립니다");
      return;
    }

    await supabase.from("posts").delete().eq("id", deleteId);
    setPosts((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    setDeletePw("");
    setDeleteErr("");
    showToast("게시물이 삭제되었습니다");
  }

  function timeInfo(expiresAt: string) {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return { text: "투표 종료", expired: true };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return {
      text: h > 0 ? `${h}시간 ${m}분 남음` : `${m}분 남음`,
      expired: false,
    };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white/40">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/feed"
            className="text-white/60 hover:text-white text-xl"
          >
            ←
          </Link>
          <h1 className="font-extrabold text-lg">내 게시물</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {posts.length === 0 ? (
          <div className="text-center text-white/40 py-20">
            <p className="text-4xl mb-4">📝</p>
            <p className="text-lg mb-2">아직 올린 고민이 없어요</p>
            <Link
              href="/new"
              className="text-white underline underline-offset-4 text-sm"
            >
              첫 번째 고민을 올려보세요
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const total = post.votesA + post.votesB;
              const { text: tl, expired } = timeInfo(post.expiresAt);
              const pctA =
                total > 0
                  ? Math.round((post.votesA / total) * 100)
                  : 50;
              const pctB = 100 - pctA;

              return (
                <div
                  key={post.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10"
                >
                  {/* Top */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant="secondary"
                      className="bg-white/15 text-white/80 border-0 text-xs"
                    >
                      {CATEGORY_EMOJI[post.category]} {post.category}
                    </Badge>
                    <span
                      className={`text-xs font-medium ${
                        expired ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {expired ? "투표 종료" : tl}
                    </span>
                  </div>

                  {/* Title link */}
                  <Link href={`/post/${post.id}`}>
                    <h3 className="font-bold text-base mb-3 hover:underline">
                      {post.title}
                    </h3>
                  </Link>

                  {/* Vote result bar */}
                  {total > 0 && (
                    <div className="mb-3">
                      <div className="flex w-full h-6 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500/60 flex items-center justify-center text-xs font-bold"
                          style={{ width: `${pctA}%` }}
                        >
                          A {pctA}%
                        </div>
                        <div
                          className="bg-red-500/60 flex items-center justify-center text-xs font-bold"
                          style={{ width: `${pctB}%` }}
                        >
                          B {pctB}%
                        </div>
                      </div>
                      <p className="text-xs text-white/30 text-center mt-1">
                        총 {total}명 참여
                      </p>
                    </div>
                  )}

                  {/* Options */}
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-2 rounded-lg text-center truncate">
                      A. {post.optionA}
                    </div>
                    <div className="flex-1 bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-2 rounded-lg text-center truncate">
                      B. {post.optionB}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      setDeleteId(post.id);
                      setDeletePw("");
                      setDeleteErr("");
                    }}
                    className="text-xs text-red-400/60 hover:text-red-400 transition"
                  >
                    삭제
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-white mb-2">
              게시물 삭제
            </h3>
            <p className="text-sm text-white/50 mb-4">
              본인 확인을 위해 비밀번호를 입력해주세요
            </p>
            <Input
              type="password"
              placeholder="비밀번호"
              value={deletePw}
              onChange={(e) => setDeletePw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDelete()}
              className="bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-xl h-11"
            />
            {deleteErr && (
              <p className="text-red-400 text-xs mt-2">{deleteErr}</p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white/70 text-sm font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
