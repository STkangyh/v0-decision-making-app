"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { useStore } from "@/lib/store";
import { hasBadWords } from "@/lib/filter";
import type { Category } from "@/lib/types";

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "옷", label: "옷", emoji: "👕" },
  { value: "음식", label: "음식", emoji: "🍔" },
  { value: "인간관계", label: "인간관계", emoji: "💬" },
  { value: "기타", label: "기타", emoji: "✨" },
];

const DURATIONS = [
  { value: 30, label: "30분" },
  { value: 60, label: "1시간" },
  { value: 180, label: "3시간" },
  { value: 360, label: "6시간" },
  { value: 1440, label: "24시간" },
];

export default function NewPostPage() {
  const router = useRouter();
  const addPost = useStore((s) => s.addPost);
  const hydrate = useStore((s) => s.hydrate);

  useEffect(() => { hydrate(); }, [hydrate]);

  const [category, setCategory] = useState<Category | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [duration, setDuration] = useState(60);
  const [badWordError, setBadWordError] = useState("");

  const canSubmit = category && title.trim() && optionA.trim() && optionB.trim() && !badWordError;

  useEffect(() => {
    const allText = [title, description, optionA, optionB].join(" ");
    if (hasBadWords(allText)) {
      setBadWordError("올바른 언어를 사용해주세요");
    } else {
      setBadWordError("");
    }
  }, [title, description, optionA, optionB]);

  async function handleSubmit() {
    if (!canSubmit) return;
    await addPost({
      category: category as Category,
      title: title.trim(),
      description: description.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      expiresAt: new Date(Date.now() + duration * 60 * 1000).toISOString(),
    });
    router.push("/feed");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/feed" className="text-white/60 hover:text-white text-xl">
            ←
          </Link>
          <h1 className="font-extrabold text-lg">고민 올리기</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* Gradient border card */}
          <div className="bg-gradient-to-r from-orange-400/80 via-amber-300/80 to-orange-500/80 rounded-2xl p-px">
            <div className="bg-gray-950 rounded-[15px] p-4 space-y-5">

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">
                  제목
                </label>
                <TextareaAutosize
                  placeholder="오늘 뭐 입지?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={50}
                  minRows={1}
                  className="w-full bg-transparent text-white placeholder:text-white/25 text-base font-medium resize-none outline-none"
                />
              </div>

              <div className="border-t border-white/8" />

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">
                  상황 설명 <span className="text-white/25 normal-case font-normal">(선택)</span>
                </label>
                <TextareaAutosize
                  placeholder="자세한 상황을 적어줘"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  minRows={2}
                  className="w-full bg-transparent text-white placeholder:text-white/25 text-sm resize-none outline-none"
                />
              </div>

              <div className="border-t border-white/8" />

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-blue-400 mb-1.5 block uppercase tracking-wider">
                    선택지 A
                  </label>
                  <TextareaAutosize
                    placeholder="이거!"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    maxLength={30}
                    minRows={1}
                    className="w-full bg-transparent text-white placeholder:text-blue-300/30 text-sm font-medium resize-none outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-red-400 mb-1.5 block uppercase tracking-wider">
                    선택지 B
                  </label>
                  <TextareaAutosize
                    placeholder="저거!"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    maxLength={30}
                    minRows={1}
                    className="w-full bg-transparent text-white placeholder:text-red-300/30 text-sm font-medium resize-none outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-white/8" />

              {/* Toolbar: category + duration + submit */}
              <div className="flex items-end justify-between gap-2">
                <div className="flex-1 space-y-3">
                  {/* Category */}
                  <div className="flex gap-1.5 flex-wrap">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          category === cat.value
                            ? "bg-orange-500 text-white scale-105"
                            : "bg-white/8 text-white/60 hover:bg-white/15"
                        }`}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Duration */}
                  <div className="flex gap-1.5 flex-wrap">
                    {DURATIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDuration(opt.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          duration === opt.value
                            ? "bg-orange-500 text-white scale-105"
                            : "bg-white/8 text-white/60 hover:bg-white/15"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="shrink-0 w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl font-bold transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-400"
                >
                  ↑
                </button>
              </div>

              {/* Bad word error */}
              {badWordError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 text-xs text-red-400 font-medium text-center">
                  {badWordError}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
