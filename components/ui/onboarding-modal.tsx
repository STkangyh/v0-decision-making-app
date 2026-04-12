"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { saveUser } from "@/lib/user";
import { supabase } from "@/lib/supabase";

interface Props {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: Props) {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요");
      return;
    }
    if (nickname.trim().length > 10) {
      setError("닉네임은 10자 이내로");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해주세요");
      return;
    }
    if (password.length > 20) {
      setError("비밀번호는 20자 이내로");
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      setError("비밀번호는 영문+숫자만 가능");
      return;
    }

    setLoading(true);
    setError("");

    const anonId = crypto.randomUUID();
    const user = { anonId, nickname: nickname.trim(), password };

    // Save to Supabase
    const { error: dbErr } = await supabase.from("users").insert({
      anon_id: anonId,
      nickname: nickname.trim(),
      password,
    });

    if (dbErr) {
      console.error("user insert error:", dbErr);
    }

    // Save locally
    saveUser(user);
    setLoading(false);
    onComplete();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 w-full max-w-sm">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-white mb-2">
            대신결정해줘
          </h2>
          <p className="text-white/50 text-sm">닉네임과 비밀번호를 설정하세요</p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/60 mb-1.5 block">
              닉네임 (최대 10자)
            </label>
            <Input
              placeholder="예: 졸린판다"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={10}
              className="bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/60 mb-1.5 block">
              비밀번호 (영문+숫자, 최대 20자)
            </label>
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={20}
              className="bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs mt-3 text-center">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 py-4 rounded-2xl bg-white text-black font-bold text-base transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "설정 중..." : "시작하기"}
        </button>
      </div>
    </div>
  );
}
