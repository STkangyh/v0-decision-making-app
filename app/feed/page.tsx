"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { isRegistered } from "@/lib/user";
import { OnboardingModal } from "@/components/ui/onboarding-modal";
import { ProfileMenu } from "@/components/ui/profile-menu";
import type { Category } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const CATEGORIES: (Category | "전체")[] = [
  "전체",
  "옷",
  "음식",
  "인간관계",
  "기타",
];

const CATEGORY_EMOJI: Record<Category, string> = {
  옷: "👕",
  음식: "🍔",
  인간관계: "💬",
  기타: "✨",
};

function useServerTimeOffset() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    fetch("/api/servertime")
      .then((r) => r.json())
      .then((data) => {
        const serverNow = new Date(data.now).getTime();
        setOffset(serverNow - Date.now());
      })
      .catch(() => {});
  }, []);
  return offset;
}

function timeLeft(expiresAt: string, offset: number): string {
  const diff = new Date(expiresAt).getTime() - (Date.now() + offset);
  if (diff <= 0) return "마감됨";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}시간 ${m}분 남음`;
  return `${m}분 남음`;
}

export default function FeedPage() {
  const posts = useStore((s) => s.posts);
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);
  const [filter, setFilter] = useState<Category | "전체">("전체");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);
  const offset = useServerTimeOffset();

  useEffect(() => {
    setMounted(true);
    if (!isRegistered()) {
      setShowOnboarding(true);
    }
    hydrate();
  }, [hydrate]);

  if (!mounted || !hydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white/40">
        로딩 중...
      </div>
    );
  }

  const filtered =
    filter === "전체" ? posts : posts.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Onboarding */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => {
            setShowOnboarding(false);
            hydrate();
          }}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg">
            대신결정해줘
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/new"
              className="text-sm bg-white text-black font-bold px-4 py-2 rounded-full transition-transform active:scale-95"
            >
              + 고민 올리기
            </Link>
            <ProfileMenu />
          </div>
        </div>
      </header>

      {/* Category filter */}
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filter === cat
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Post grid */}
      <main className="max-w-5xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post) => {
            const total = post.votesA + post.votesB;
            const tl = timeLeft(post.expiresAt, offset);
            const expired = tl === "마감됨";
            return (
              <Link key={post.id} href={`/post/${post.id}`}>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-white/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
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
                      {tl}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-2 rounded-lg text-center truncate">
                      A. {post.optionA}
                    </div>
                    <div className="flex-1 bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-2 rounded-lg text-center truncate">
                      B. {post.optionB}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span>🗳 {total}표</span>
                    <span>💬 {post.comments.length}개</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-white/40 py-20">
            <p className="text-lg mb-2">아직 고민이 없어요</p>
            <Link
              href="/new"
              className="text-white underline underline-offset-4"
            >
              첫 번째 고민을 올려보세요
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
