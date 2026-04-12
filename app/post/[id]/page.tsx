"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { filterBadWords, hasBadWords } from "@/lib/filter";
import { useToast } from "@/components/ui/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Link2, Check } from "lucide-react";

const CATEGORY_EMOJI: Record<string, string> = {
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

function useTimeLeft(expiresAt: string, offset: number) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    function update() {
      const diff = new Date(expiresAt).getTime() - (Date.now() + offset);
      if (diff <= 0) {
        setTimeLeft("마감됨");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(h > 0 ? `${h}시간 ${m}분 ${s}초` : `${m}분 ${s}초`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt, offset]);
  return timeLeft;
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const post = useStore((s) => s.getPost(id));
  const votes = useStore((s) => s.votes);
  const castVote = useStore((s) => s.castVote);
  const addComment = useStore((s) => s.addComment);
  const myNickname = useStore((s) => s.myNickname);
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);
  const { show: showToast } = useToast();

  const [commentText, setCommentText] = useState("");
  const [changingVote, setChangingVote] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const serverOffset = useServerTimeOffset();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const mounted = hydrated;
  const timeLeft = useTimeLeft(post?.expiresAt ?? new Date().toISOString(), serverOffset);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white/40">
        로딩 중...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4">
        <p className="text-white/40">존재하지 않는 고민이에요</p>
        <Link href="/feed" className="text-white underline">
          피드로 돌아가기
        </Link>
      </div>
    );
  }

  const myVote = votes[post.id];
  const total = post.votesA + post.votesB;
  const pctA = total > 0 ? Math.round((post.votesA / total) * 100) : 50;
  const pctB = 100 - pctA;
  const expired = timeLeft === "마감됨";
  const commentOver = commentText.length > 300;

  async function handleVote(choice: "A" | "B") {
    if (expired) return;
    await castVote(post!.id, choice);
    setChangingVote(false);
  }

  async function handleComment() {
    if (!commentText.trim() || commentOver) return;
    const filtered = filterBadWords(commentText.trim());
    if (filtered !== commentText.trim()) {
      showToast("일부 표현이 순화되었습니다 🙏");
    }
    await addComment(post!.id, filtered);
    setCommentText("");
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    showToast("링크가 복사됐어요!");
    setTimeout(() => setLinkCopied(false), 1500);
  }

  const freshPost = useStore.getState().getPost(id);
  const comments = freshPost?.comments ?? post.comments;

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
          <span className="font-extrabold text-lg flex-1">상세</span>
          <button
            onClick={handleCopyLink}
            className="text-sm bg-white/10 p-2 rounded-full hover:bg-white/20 transition"
            title="링크 복사"
          >
            {linkCopied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Category + Timer */}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="bg-white/15 text-white/80 border-0"
          >
            {CATEGORY_EMOJI[post.category]} {post.category}
          </Badge>
          <span
            className={`text-sm font-semibold ${
              expired ? "text-red-400" : "text-green-400"
            }`}
          >
            {timeLeft}
          </span>
        </div>

        {/* Title + Description */}
        <div>
          <h1 className="text-2xl font-extrabold mb-2">{post.title}</h1>
          {post.description && (
            <p className="text-white/50 text-sm leading-relaxed">
              {post.description}
            </p>
          )}
        </div>

        {/* Vote buttons or results */}
        {(!myVote || changingVote) && !expired ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleVote("A")}
              className="bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500/40 rounded-2xl p-6 text-center transition-all active:scale-95"
            >
              <span className="text-blue-400 text-xs font-bold block mb-2">
                A
              </span>
              <span className="text-white font-bold text-base">
                {post.optionA}
              </span>
            </button>
            <button
              onClick={() => handleVote("B")}
              className="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/40 rounded-2xl p-6 text-center transition-all active:scale-95"
            >
              <span className="text-red-400 text-xs font-bold block mb-2">
                B
              </span>
              <span className="text-white font-bold text-base">
                {post.optionB}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Option A result */}
            <div className="relative bg-white/5 rounded-2xl p-4 overflow-hidden">
              <div
                className="absolute inset-0 bg-blue-500/20 rounded-2xl transition-all duration-700"
                style={{ width: `${pctA}%` }}
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {myVote === "A" && <span className="text-blue-400">✓</span>}
                  <span className="font-semibold">A. {post.optionA}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-400">{pctA}%</span>
                  <span className="text-white/40 text-xs ml-1">
                    ({post.votesA}명)
                  </span>
                </div>
              </div>
            </div>
            {/* Option B result */}
            <div className="relative bg-white/5 rounded-2xl p-4 overflow-hidden">
              <div
                className="absolute inset-0 bg-red-500/20 rounded-2xl transition-all duration-700"
                style={{ width: `${pctB}%` }}
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {myVote === "B" && <span className="text-red-400">✓</span>}
                  <span className="font-semibold">B. {post.optionB}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-red-400">{pctB}%</span>
                  <span className="text-white/40 text-xs ml-1">
                    ({post.votesB}명)
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center text-white/30 text-xs">
              총 {total}명 참여
            </p>
            {myVote && !expired && (
              <button
                onClick={() => setChangingVote(true)}
                className="w-full text-center text-white/40 hover:text-white/70 text-sm font-medium pt-1 transition-colors"
              >
                답변 바꾸기
              </button>
            )}
          </div>
        )}

        {/* Comments section */}
        <div className="border-t border-white/10 pt-5">
          <h2 className="font-bold text-sm mb-4 text-white/60">
            💬 댓글 {comments.length}개
          </h2>

          {/* Comment input */}
          <div className="mb-5">
            <div className="flex gap-2">
              <Textarea
                placeholder={`${myNickname}(으)로 댓글 달기`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
                maxLength={300}
                rows={2}
                className="bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-xl flex-1 resize-none text-sm"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || commentOver}
                className="bg-white text-black font-bold px-4 rounded-xl text-sm disabled:opacity-30 transition active:scale-95 self-end h-10"
              >
                전송
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs ${
                  commentOver ? "text-red-400" : "text-white/30"
                }`}
              >
                {commentText.length} / 300
              </span>
            </div>
          </div>

          {/* Comment list */}
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white/60">
                    {c.nickname}
                  </span>
                  <span className="text-xs text-white/30">
                    {formatTime(c.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-white/80">{c.content}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-white/20 text-sm py-6">
                아직 댓글이 없어요. 첫 댓글을 남겨보세요!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}
